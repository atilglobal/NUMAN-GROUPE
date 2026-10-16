"use server";

import { refresh } from "next/cache";
import { localeLabels } from "@/admin/labels";
import { saveHomeCopy, updateHomeVisuals, updateSiteSettings } from "@/admin/settings";
import {
  fieldErrors,
  homeCopySchema,
  homeVisualsSchema,
  localeSchema,
  siteSettingsSchema,
} from "@/admin/validation";
import { authorizeAction, type ActionState } from "@/auth/session";
import { HOME_SECTION_KEYS } from "@/content/home-layout";
import { setTranslationStatus, TranslationNotFoundError } from "@/content/publishing";
import { refreshPublicContent } from "@/content/revalidate";
import { getDb } from "@/db/client";
import { MediaUploadError, requireImageIds } from "@/media/store";

function socialFrom(formData: FormData) {
  const labels = formData.getAll("socialLabel").map((value) => String(value));
  const urls = formData.getAll("socialUrl").map((value) => String(value));
  const length = Math.max(labels.length, urls.length);
  return Array.from({ length }, (_, index) => ({
    label: labels[index] ?? "",
    url: urls[index] ?? "",
  }));
}

export async function updateSettingsAction(_previous: ActionState, formData: FormData): Promise<ActionState> {
  const auth = await authorizeAction("settings:manage");
  if (!auth.ok) return auth.state;

  const parsed = siteSettingsSchema.safeParse({
    companyName: formData.get("companyName") ?? "",
    contactEmail: formData.get("contactEmail") ?? "",
    contactPhone: formData.get("contactPhone") ?? "",
    postalAddress: formData.get("postalAddress") ?? "",
    whatsapp: formData.get("whatsapp") ?? "",
    logoAssetId: formData.get("logoAssetId") ?? "",
    faviconAssetId: formData.get("faviconAssetId") ?? "",
    socialLinks: socialFrom(formData),
  });
  if (!parsed.success) return { ok: false, fieldErrors: fieldErrors(parsed.error) };
  try {
    const ids = [parsed.data.logoAssetId, parsed.data.faviconAssetId].filter((id): id is string => Boolean(id));
    if (ids.length) await requireImageIds(getDb(), ids);
    await updateSiteSettings(getDb(), auth.actor, parsed.data);
  } catch (error) {
    if (error instanceof MediaUploadError) return { ok: false, message: error.message };
    throw error;
  }
  refreshPublicContent("settings");
  refresh();
  return { ok: true, message: "Site ayarları kaydedildi." };
}

export async function updateHomeVisualsAction(_previous: ActionState, formData: FormData): Promise<ActionState> {
  const auth = await authorizeAction("content:write");
  if (!auth.ok) return auth.state;
  const keys = formData.getAll("homeSection").map((value) => String(value));
  const visible = new Set(formData.getAll("homeVisible").map((value) => String(value)));
  const parsed = homeVisualsSchema.safeParse({
    heroImageAssetId: formData.get("heroImageAssetId") ?? formData.get("coverAssetId") ?? "",
    callToActionImageAssetId: formData.get("ctaImageAssetId") ?? "",
    heroVideoUrl: formData.get("heroVideoUrl") ?? "",
    homeSections: (keys.length ? keys : HOME_SECTION_KEYS).map((key) => ({
      key,
      visible: visible.has(key),
    })),
  });
  if (!parsed.success) return { ok: false, fieldErrors: fieldErrors(parsed.error) };
  try {
    const ids = [parsed.data.heroImageAssetId, parsed.data.callToActionImageAssetId].filter(
      (id): id is string => Boolean(id),
    );
    if (ids.length) await requireImageIds(getDb(), ids);
    await updateHomeVisuals(getDb(), auth.actor, parsed.data);
  } catch (error) {
    if (error instanceof MediaUploadError) return { ok: false, message: error.message };
    throw error;
  }
  refreshPublicContent("home");
  refresh();
  return { ok: true, message: "Ana sayfa düzeni kaydedildi." };
}

export async function saveHomeCopyAction(
  locale: string,
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const auth = await authorizeAction("content:write");
  if (!auth.ok) return auth.state;
  const parsedLocale = localeSchema.safeParse(locale);
  if (!parsedLocale.success) return { ok: false, message: "Geçersiz istek." };
  const parsed = homeCopySchema.safeParse({
    heroTitle: formData.get("heroTitle") ?? "",
    heroDescription: formData.get("heroDescription") ?? "",
    introTitle: formData.get("introTitle") ?? "",
    introBody: formData.get("introBody") ?? "",
    ctaTitle: formData.get("ctaTitle") ?? "",
    ctaDescription: formData.get("ctaDescription") ?? "",
    ctaLabel: formData.get("ctaLabel") ?? "",
    ctaHref: formData.get("ctaHref") ?? "",
    footerTagline: formData.get("footerTagline") ?? "",
    seoTitle: formData.get("seoTitle") ?? "",
    seoDescription: formData.get("seoDescription") ?? "",
  });
  if (!parsed.success) return { ok: false, fieldErrors: fieldErrors(parsed.error) };
  await saveHomeCopy(getDb(), auth.actor, parsedLocale.data, parsed.data);
  refreshPublicContent("home");
  refresh();
  return { ok: true, message: `${localeLabels[parsedLocale.data]} ana sayfa metni kaydedildi.` };
}

export async function setHomeCopyStatusAction(locale: string, status: string): Promise<ActionState> {
  const auth = await authorizeAction("content:write");
  if (!auth.ok) return auth.state;
  const parsedLocale = localeSchema.safeParse(locale);
  if (!parsedLocale.success || (status !== "published" && status !== "draft")) {
    return { ok: false, message: "Geçersiz istek." };
  }
  try {
    await setTranslationStatus(getDb(), {
      entity: "home",
      entityId: "1",
      locale: parsedLocale.data,
      status,
      actorUserId: auth.actor.id,
      ip: auth.actor.ip,
    });
  } catch (error) {
    if (error instanceof TranslationNotFoundError) {
      return { ok: false, message: "Önce bu dildeki metni kaydedin." };
    }
    throw error;
  }
  refresh();
  const label = localeLabels[parsedLocale.data];
  return {
    ok: true,
    message: status === "published" ? `${label} metin yayımlandı.` : `${label} metin yayından kaldırıldı.`,
  };
}
