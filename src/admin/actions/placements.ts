"use server";

import { refresh } from "next/cache";
import { authorizeAction, type ActionState } from "@/auth/session";
import { refreshPublicContent } from "@/content/revalidate";
import { getDb } from "@/db/client";
import { mediaPlacements } from "@/db/schema";
import { idSchema } from "@/admin/validation";
import { z } from "zod";

const payload = z.object({
  assetId: idSchema,
  context: z.string().trim().min(1).max(200),
  focalX: z.coerce.number().min(0).max(1),
  focalY: z.coerce.number().min(0).max(1),
  mobileAssetId: z.string().uuid().optional().or(z.literal("")),
});

export async function savePlacementAction(_previous: ActionState, formData: FormData): Promise<ActionState> {
  const auth = await authorizeAction("media:write");
  if (!auth.ok) return auth.state;
  const parsed = payload.safeParse({
    assetId: formData.get("assetId"),
    context: formData.get("context"),
    focalX: formData.get("focalX"),
    focalY: formData.get("focalY"),
    mobileAssetId: formData.get("mobileAssetId") ?? "",
  });
  if (!parsed.success) return { ok: false, message: "Odak noktası geçersiz." };
  await getDb()
    .insert(mediaPlacements)
    .values({
      assetId: parsed.data.assetId,
      context: parsed.data.context,
      focalX: parsed.data.focalX,
      focalY: parsed.data.focalY,
      mobileAssetId: parsed.data.mobileAssetId || null,
    })
    .onConflictDoUpdate({
      target: mediaPlacements.context,
      set: {
        assetId: parsed.data.assetId,
        focalX: parsed.data.focalX,
        focalY: parsed.data.focalY,
        mobileAssetId: parsed.data.mobileAssetId || null,
        updatedAt: new Date(),
      },
    });
  refreshPublicContent("media");
  refresh();
  return { ok: true, message: "Odak noktası kaydedildi." };
}
