"use server";

import { refresh } from "next/cache";
import { redirect } from "next/navigation";
import { mediaAltSchema } from "@/admin/validation";
import { writeAudit } from "@/admin/audit";
import { authorizeAction, type ActionState } from "@/auth/session";
import { refreshPublicContent } from "@/content/revalidate";
import { getDb } from "@/db/client";
import { locales, type Locale } from "@/i18n/config";
import { deleteMediaAsset, MediaUploadError, saveMediaText, saveUploadedImage } from "@/media/store";
import { listMediaUsage } from "@/media/usage";

function altsFrom(formData: FormData) {
  const parsed = mediaAltSchema.safeParse({
    altFr: formData.get("altFr") ?? "",
    altEn: formData.get("altEn") ?? "",
    altTr: formData.get("altTr") ?? "",
    captionFr: formData.get("captionFr") ?? "",
    captionEn: formData.get("captionEn") ?? "",
    captionTr: formData.get("captionTr") ?? "",
  });
  if (!parsed.success) return { ok: false as const };
  const alts: Partial<Record<Locale, string>> = {};
  const captions: Partial<Record<Locale, string>> = {};
  const altMap = { fr: parsed.data.altFr, en: parsed.data.altEn, tr: parsed.data.altTr };
  const captionMap = { fr: parsed.data.captionFr, en: parsed.data.captionEn, tr: parsed.data.captionTr };
  for (const locale of locales) {
    if (altMap[locale]) alts[locale] = altMap[locale]!;
    if (captionMap[locale]) captions[locale] = captionMap[locale]!;
  }
  return { ok: true as const, alts, captions };
}

export async function uploadImageAction(_previous: ActionState, formData: FormData): Promise<ActionState> {
  const auth = await authorizeAction("media:write");
  if (!auth.ok) return auth.state;

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { ok: false, fieldErrors: { file: "Bir görsel seçin." } };
  }

  const parsed = altsFrom(formData);
  if (!parsed.ok) return { ok: false, message: "Alternatif metinler geçersiz." };

  try {
    const id = await saveUploadedImage(getDb(), {
      file,
      alts: parsed.alts,
      captions: parsed.captions,
      actorUserId: auth.actor.id,
    });
    await writeAudit(getDb(), {
      actorUserId: auth.actor.id,
      action: "media.create",
      entityType: "media",
      entityId: id,
      ip: auth.actor.ip,
    });
    refreshPublicContent("media");
    refresh();
    return { ok: true, message: "Görsel yüklendi." };
  } catch (error) {
    if (error instanceof MediaUploadError) return { ok: false, message: error.message };
    throw error;
  }
}

export async function updateMediaTextAction(
  id: string,
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const auth = await authorizeAction("media:write");
  if (!auth.ok) return auth.state;
  const parsed = altsFrom(formData);
  if (!parsed.ok) return { ok: false, message: "Alternatif metinler geçersiz." };
  try {
    await saveMediaText(getDb(), id, parsed);
    await writeAudit(getDb(), {
      actorUserId: auth.actor.id,
      action: "media.update",
      entityType: "media",
      entityId: id,
      ip: auth.actor.ip,
    });
  } catch (error) {
    if (error instanceof MediaUploadError) return { ok: false, message: error.message };
    throw error;
  }
  refreshPublicContent("media");
  refresh();
  return { ok: true, message: "Metinler kaydedildi." };
}

export async function deleteMediaAction(
  id: string,
  _previous: ActionState,
  _formData: FormData,
): Promise<ActionState> {
  const auth = await authorizeAction("media:write");
  if (!auth.ok) return auth.state;
  const usages = await listMediaUsage(getDb(), id);
  if (usages.length > 0) {
    return {
      ok: false,
      message: `Bu dosya ${usages.length} yerde kullanılıyor. Kullanımdaki medya silinemez.`,
    };
  }
  try {
    await deleteMediaAsset(getDb(), id);
    await writeAudit(getDb(), {
      actorUserId: auth.actor.id,
      action: "media.delete",
      entityType: "media",
      entityId: id,
      metadata: { usageCount: usages.length },
      ip: auth.actor.ip,
    });
  } catch (error) {
    if (error instanceof MediaUploadError) return { ok: false, message: error.message };
    throw error;
  }
  refreshPublicContent("media");
  redirect("/admin/medya");
}
