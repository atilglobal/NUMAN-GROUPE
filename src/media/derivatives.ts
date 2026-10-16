import { eq } from "drizzle-orm";
import type { Database } from "@/db/client";
import { mediaAssets } from "@/db/schema";
import { isMediaProfileId, type MediaProfileId } from "./profiles";
import { MediaProcessError, renderDerivative, variantStorageKey } from "./process";
import { putObject, readObject } from "./storage";
import { derivedMediaPath } from "./url";

export async function ensureDerivative(
  db: Database,
  input: {
    assetId: string;
    profile: string;
    width: number;
    focalX: number;
    focalY: number;
  },
): Promise<{ bytes: Buffer; mime: string } | null> {
  if (!isMediaProfileId(input.profile)) return null;
  const [asset] = await db.select().from(mediaAssets).where(eq(mediaAssets.id, input.assetId));
  if (!asset) return null;
  if (asset.mimeType === "image/gif") {
    const original = await readObject(asset.storageKey);
    return original ? { bytes: original, mime: asset.mimeType } : null;
  }

  const guessKey = (mime: string) =>
    variantStorageKey(
      input.assetId,
      input.profile as MediaProfileId,
      input.width,
      input.focalX,
      input.focalY,
      mime,
    );
  for (const mime of ["image/jpeg", "image/png", "image/webp"]) {
    const cached = await readObject(guessKey(mime));
    if (cached) return { bytes: cached, mime };
  }

  const original = await readObject(asset.storageKey);
  if (!original) return null;

  let rendered: { bytes: Buffer; mime: string };
  try {
    rendered = await renderDerivative(original, {
      profile: input.profile as MediaProfileId,
      width: input.width,
      focalX: input.focalX,
      focalY: input.focalY,
      mime: asset.mimeType,
    });
  } catch (error) {
    if (error instanceof MediaProcessError) throw error;
    throw new MediaProcessError("Görsel işlenemedi. Yeniden deneyin.");
  }

  await putObject(guessKey(rendered.mime), rendered.bytes);
  return rendered;
}

export function derivedPath(
  assetId: string,
  profile: MediaProfileId,
  width: number,
  focalX: number,
  focalY: number,
): string {
  return derivedMediaPath(assetId, profile, width, focalX, focalY);
}
