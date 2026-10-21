"use server";

import { refresh } from "next/cache";
import { localeLabels } from "@/admin/labels";
import { savePageTranslation } from "@/admin/pages";
import { updateGroupLayout } from "@/admin/settings";
import { AdminRuleError } from "@/admin/users";
import { fieldErrors, groupLayoutSchema, idSchema, localeSchema, pageTranslationSchema } from "@/admin/validation";
import { GROUP_SECTION_KEYS } from "@/content/group-layout";
import { authorizeAction, type ActionState } from "@/auth/session";
import { setTranslationStatus, TranslationNotFoundError } from "@/content/publishing";
import { refreshPublicContent } from "@/content/revalidate";
import { getDb } from "@/db/client";

const INVALID: ActionState = { ok: false, message: "Geçersiz istek." };

export async function savePageTranslationAction(
  id: string,
  locale: string,
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const auth = await authorizeAction("content:write");
  if (!auth.ok) return auth.state;
  const parsedLocale = localeSchema.safeParse(locale);
  if (!idSchema.safeParse(id).success || !parsedLocale.success) return INVALID;
  const translation = pageTranslationSchema.safeParse({
    title: formData.get("title"),
    summary: formData.get("summary") ?? "",
    body: formData.get("body") ?? "",
    seoTitle: formData.get("seoTitle") ?? "",
    seoDescription: formData.get("seoDescription") ?? "",
  });
  if (!translation.success) return { ok: false, fieldErrors: fieldErrors(translation.error) };
  try {
    await savePageTranslation(getDb(), auth.actor, id, parsedLocale.data, translation.data);
  } catch (error) {
    if (error instanceof AdminRuleError) return { ok: false, message: error.message };
    throw error;
  }
  refreshPublicContent("page");
  refresh();
  return { ok: true, message: `${localeLabels[parsedLocale.data]} içerik kaydedildi.` };
}

export async function setPageStatusAction(id: string, locale: string, status: string): Promise<ActionState> {
  const auth = await authorizeAction("content:write");
  if (!auth.ok) return auth.state;
  const parsedLocale = localeSchema.safeParse(locale);
  if (!idSchema.safeParse(id).success || !parsedLocale.success) return INVALID;
  if (status !== "published" && status !== "draft") return INVALID;
  try {
    await setTranslationStatus(getDb(), {
      entity: "page",
      entityId: id,
      locale: parsedLocale.data,
      status,
      actorUserId: auth.actor.id,
      ip: auth.actor.ip,
    });
  } catch (error) {
    if (error instanceof TranslationNotFoundError) {
      return { ok: false, message: "Önce bu dildeki içeriği kaydedin." };
    }
    throw error;
  }
  refresh();
  const label = localeLabels[parsedLocale.data];
  return {
    ok: true,
    message: status === "published" ? `${label} içerik yayımlandı.` : `${label} içerik yayından kaldırıldı.`,
  };
}

export async function updateGroupLayoutAction(_previous: ActionState, formData: FormData): Promise<ActionState> {
  const auth = await authorizeAction("content:write");
  if (!auth.ok) return auth.state;
  const keys = formData.getAll("groupSection").map((value) => String(value));
  const visible = new Set(formData.getAll("groupVisible").map((value) => String(value)));
  const parsed = groupLayoutSchema.safeParse({
    groupSections: (keys.length ? keys : GROUP_SECTION_KEYS).map((key) => ({
      key,
      visible: visible.has(key),
    })),
  });
  if (!parsed.success) return { ok: false, fieldErrors: fieldErrors(parsed.error) };
  await updateGroupLayout(getDb(), auth.actor, parsed.data);
  refreshPublicContent("page");
  refreshPublicContent("settings");
  refresh();
  return { ok: true, message: "Grup sayfası düzeni kaydedildi." };
}
