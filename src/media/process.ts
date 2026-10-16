import sharp from "sharp";
import { mediaProfiles, type MediaFit, type MediaProfileId } from "./profiles";

export const MAX_PIXEL_EDGE = 12_000;
export const MAX_PIXEL_AREA = 40_000_000;

export class MediaProcessError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "MediaProcessError";
  }
}

export function assertSafeDimensions(width: number | null, height: number | null): void {
  if (!width || !height) return;
  if (width > MAX_PIXEL_EDGE || height > MAX_PIXEL_EDGE || width * height > MAX_PIXEL_AREA) {
    throw new MediaProcessError(
      `Görsel çok büyük (${width}×${height}). En fazla ${MAX_PIXEL_EDGE} px kenar ve ${MAX_PIXEL_AREA} piksel kabul edilir.`,
    );
  }
}

function cropWindow(
  srcW: number,
  srcH: number,
  aspect: number,
  focalX: number,
  focalY: number,
): { left: number; top: number; width: number; height: number } {
  const srcAspect = srcW / srcH;
  let width = srcW;
  let height = srcH;
  if (srcAspect > aspect) {
    width = Math.round(srcH * aspect);
    height = srcH;
  } else {
    width = srcW;
    height = Math.round(srcW / aspect);
  }
  const left = Math.min(Math.max(0, Math.round(focalX * srcW - width / 2)), srcW - width);
  const top = Math.min(Math.max(0, Math.round(focalY * srcH - height / 2)), srcH - height);
  return { left, top, width, height };
}

export async function inspectImage(buffer: Buffer): Promise<{ width: number; height: number; hasAlpha: boolean }> {
  const image = sharp(buffer, { failOn: "none" }).rotate();
  const info = await image.metadata();
  const width = info.width ?? 0;
  const height = info.height ?? 0;
  assertSafeDimensions(width, height);
  return { width, height, hasAlpha: Boolean(info.hasAlpha) };
}

/**
 * Public derivative: EXIF-rotated, GPS/metadata stripped, no upscale.
 * Original bytes stay untouched on disk.
 */
export async function renderDerivative(
  buffer: Buffer,
  input: {
    profile: MediaProfileId;
    width: number;
    focalX: number;
    focalY: number;
    mime: string;
  },
): Promise<{ bytes: Buffer; mime: string }> {
  const profile = mediaProfiles[input.profile];
  if (!profile.widths.includes(input.width)) {
    throw new MediaProcessError("Bu genişlik bu profil için üretilmez.");
  }

  let pipeline = sharp(buffer, { failOn: "none", animated: false }).rotate();
  const meta = await pipeline.metadata();
  const srcW = meta.width ?? 0;
  const srcH = meta.height ?? 0;
  if (!srcW || !srcH) throw new MediaProcessError("Görsel boyutları okunamadı.");
  assertSafeDimensions(srcW, srcH);

  const fit: MediaFit = profile.fit;
  if (fit === "cover") {
    const window = cropWindow(srcW, srcH, profile.aspect, input.focalX, input.focalY);
    pipeline = pipeline.extract(window);
    const outW = Math.min(input.width, window.width);
    const outH = Math.round(outW / profile.aspect);
    pipeline = pipeline.resize(outW, outH, { fit: "fill", withoutEnlargement: true });
  } else if (fit === "contain") {
    const outW = Math.min(input.width, srcW);
    const outH = Math.round(outW / profile.aspect);
    pipeline = pipeline.resize(outW, Math.min(outH, srcH), {
      fit: "contain",
      withoutEnlargement: true,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    });
  } else {
    pipeline = pipeline.resize(Math.min(input.width, srcW), Math.min(input.width, srcH), {
      fit: "inside",
      withoutEnlargement: true,
    });
  }

  pipeline = pipeline.withMetadata({});

  const keepAlpha = Boolean(meta.hasAlpha) || input.mime === "image/png" || input.profile === "logo";
  if (keepAlpha) {
    const bytes = await pipeline.png({ compressionLevel: input.profile === "logo" ? 6 : 8 }).toBuffer();
    return { bytes, mime: "image/png" };
  }
  if (input.mime === "image/webp") {
    const bytes = await pipeline.webp({ quality: 82 }).toBuffer();
    return { bytes, mime: "image/webp" };
  }
  const bytes = await pipeline.jpeg({ quality: 82, mozjpeg: true }).toBuffer();
  return { bytes, mime: "image/jpeg" };
}

export function variantStorageKey(
  assetId: string,
  profile: MediaProfileId,
  width: number,
  focalX: number,
  focalY: number,
  mime: string,
): string {
  const fx = Math.round(Math.min(1, Math.max(0, focalX)) * 1000);
  const fy = Math.round(Math.min(1, Math.max(0, focalY)) * 1000);
  const ext = mime === "image/png" ? "png" : mime === "image/webp" ? "webp" : "jpg";
  return `variants/${assetId}/${profile}/${width}/${fx}x${fy}.${ext}`;
}
