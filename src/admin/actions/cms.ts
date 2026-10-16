"use server";

import { refresh } from "next/cache";
import { redirect } from "next/navigation";
import {
  assertCmsPublishable,
  createCmsPage,
  deleteCmsPage,
  getCmsEditor,
  saveCmsLayout,
  saveCmsTranslation,
} from "@/admin/cms";
import { AdminRuleError } from "@/admin/users";
import { fieldErrors, idSchema, localeSchema, slugSchema } from "@/admin/validation";
import { authorizeAction, type ActionState } from "@/auth/session";
import { setTranslationStatus, TranslationNotFoundError } from "@/content/publishing";
import { refreshPublicContent } from "@/content/revalidate";
import { getDb } from "@/db/client";
import { localeLabels } from "@/admin/labels";
import type { CmsBlockCopy } from "@/db/schema";
import { z } from "zod";

const INVALID: ActionState = { ok: false, message: "Geçersiz istek." };

const copySchema = z.object({
  title: z.string().max(200).optional(),
  body: z.string().max(20000).optional(),
  ctaLabel: z.string().max(80).optional(),
  ctaHref: z.string().max(400).optional(),
  imageAlt: z.string().max(180).optional(),
  imageCaption: z.string().max(300).optional(),
});

export async function createCmsPageAction(): Promise<void> {
  const auth = await authorizeAction("content:write");
  if (!auth.ok) return;
  const id = await createCmsPage(getDb(), auth.actor);
  refreshPublicContent("cms_page");
  redirect(`/admin/icerik-sayfalari/${id}`);
}

export async function saveCmsLayoutAction(
  id: string,
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const auth = await authorizeAction("content:write");
  if (!auth.ok) return auth.state;
  if (!idSchema.safeParse(id).success) return INVALID;
  let layout: unknown;
  try {
    layout = JSON.parse(String(formData.get("layout") ?? "[]"));
  } catch {
    return { ok: false, message: "Yerleşim JSON olarak okunamadı." };
  }
  const cover = String(formData.get("coverAssetId") ?? "").trim() || null;
  try {
    await saveCmsLayout(getDb(), auth.actor, id, layout, cover);
  } catch (error) {
    if (error instanceof AdminRuleError) return { ok: false, message: error.message };
    throw error;
  }
  refreshPublicContent("cms_page");
  refresh();
  return { ok: true, message: "Yerleşim kaydedildi." };
}

export async function saveCmsTranslationAction(
  id: string,
  locale: string,
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const auth = await authorizeAction("content:write");
  if (!auth.ok) return auth.state;
  const parsedLocale = localeSchema.safeParse(locale);
  if (!idSchema.safeParse(id).success || !parsedLocale.success) return INVALID;
  const slug = slugSchema.safeParse(formData.get("slug"));
  const title = z.string().trim().min(1, "Başlık zorunludur.").max(180).safeParse(formData.get("title"));
  if (!slug.success) return { ok: false, fieldErrors: fieldErrors(slug.error) };
  if (!title.success) return { ok: false, fieldErrors: fieldErrors(title.error) };
  let blocks: Record<string, CmsBlockCopy> = {};
  try {
    const raw = JSON.parse(String(formData.get("blocks") ?? "{}")) as Record<string, unknown>;
    blocks = Object.fromEntries(
      Object.entries(raw).map(([key, value]) => [key, copySchema.parse(value ?? {})]),
    );
  } catch {
    return { ok: false, message: "Blok metinleri geçersiz." };
  }
  try {
    await saveCmsTranslation(getDb(), auth.actor, id, parsedLocale.data, {
      slug: slug.data,
      title: title.data,
      summary: String(formData.get("summary") ?? "").trim() || null,
      seoTitle: String(formData.get("seoTitle") ?? "").trim() || null,
      seoDescription: String(formData.get("seoDescription") ?? "").trim() || null,
      ogTitle: String(formData.get("ogTitle") ?? "").trim() || null,
      ogDescription: String(formData.get("ogDescription") ?? "").trim() || null,
      ogImageAssetId: String(formData.get("ogImageAssetId") ?? "").trim() || null,
      blocks,
    });
  } catch (error) {
    if (error instanceof AdminRuleError) return { ok: false, message: error.message };
    const message = error instanceof Error ? error.message : "";
    if (message.includes("cms_page_translations_locale_slug")) {
      return { ok: false, message: "Bu dilde bu bağlantı adı zaten kullanılıyor." };
    }
    throw error;
  }
  refreshPublicContent("cms_page");
  refresh();
  return { ok: true, message: `${localeLabels[parsedLocale.data]} içerik kaydedildi.` };
}

export async function setCmsStatusAction(id: string, locale: string, status: string): Promise<ActionState> {
  const auth = await authorizeAction("content:write");
  if (!auth.ok) return auth.state;
  const parsedLocale = localeSchema.safeParse(locale);
  if (!idSchema.safeParse(id).success || !parsedLocale.success) return INVALID;
  if (status !== "published" && status !== "draft") return INVALID;
  const editor = await getCmsEditor(getDb(), id);
  if (!editor) return { ok: false, message: "Sayfa bulunamadı." };
  const translation = editor.translations[parsedLocale.data];
  if (status === "published") {
    if (!translation) return { ok: false, message: "Önce bu dildeki içeriği kaydedin." };
    try {
      assertCmsPublishable(editor.layout, translation.blocks, translation.title, translation.slug);
    } catch (error) {
      if (error instanceof AdminRuleError) return { ok: false, message: error.message };
      throw error;
    }
  }
  try {
    await setTranslationStatus(getDb(), {
      entity: "cms_page",
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

export async function setCmsStatusFormAction(id: string, locale: string, status: string): Promise<void> {
  await setCmsStatusAction(id, locale, status);
}

export async function deleteCmsPageAction(id: string, _previous: ActionState, _formData: FormData): Promise<ActionState> {
  const auth = await authorizeAction("content:write");
  if (!auth.ok) return auth.state;
  if (!idSchema.safeParse(id).success) return INVALID;
  try {
    await deleteCmsPage(getDb(), auth.actor, id);
  } catch (error) {
    if (error instanceof AdminRuleError) return { ok: false, message: error.message };
    throw error;
  }
  refreshPublicContent("cms_page");
  redirect("/admin/icerik-sayfalari");
}
