"use server";

import { refresh } from "next/cache";
import { redirect } from "next/navigation";
import {
  LocalePublishError,
  SlugTakenError,
  assertProjectLocalePublishable,
  createProject,
  deleteProject,
  saveProjectTranslation,
  updateProjectRoot,
} from "@/admin/projects";
import { localeLabels } from "@/admin/labels";
import { AdminRuleError } from "@/admin/users";
import {
  fieldErrors,
  idSchema,
  localeSchema,
  projectDraftTranslationSchema,
  projectRootSchema,
  type ProjectRootInput,
} from "@/admin/validation";
import { authorizeAction, type ActionState } from "@/auth/session";
import { setTranslationStatus, TranslationNotFoundError } from "@/content/publishing";
import { refreshPublicContent } from "@/content/revalidate";
import { getDb } from "@/db/client";
import { MediaUploadError, requireImageIds, upsertMediaCopy } from "@/media/store";
import type { Locale } from "@/i18n/config";

const INVALID: ActionState = { ok: false, message: "Geçersiz istek." };
const SAVE_FAILED: ActionState = {
  ok: false,
  message: "Kayıt başarısız oldu. Girdiğiniz metinler korundu; lütfen tekrar deneyin.",
};

function isRedirectError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "digest" in error &&
    typeof (error as { digest?: unknown }).digest === "string" &&
    (error as { digest: string }).digest.startsWith("NEXT_REDIRECT")
  );
}

function ruleError(error: unknown): ActionState {
  if (isRedirectError(error)) throw error;
  if (error instanceof LocalePublishError) {
    return { ok: false, message: error.message, fieldErrors: error.fieldErrors };
  }
  if (error instanceof SlugTakenError) return { ok: false, fieldErrors: { slug: error.message }, message: error.message };
  if (error instanceof AdminRuleError || error instanceof MediaUploadError) {
    return { ok: false, message: error.message };
  }
  console.error(error);
  return SAVE_FAILED;
}

function invalidFields(errors: Record<string, string>): ActionState {
  return {
    ok: false,
    message: "Kayıt tamamlanamadı. İşaretli alanları kontrol edin.",
    fieldErrors: errors,
  };
}

function translationFields(formData: FormData) {
  return projectDraftTranslationSchema.safeParse({
    title: formData.get("title"),
    slug: formData.get("slug") ?? "",
    summary: formData.get("summary") ?? "",
    body: formData.get("body") ?? "",
    seoTitle: formData.get("seoTitle") ?? "",
    seoDescription: formData.get("seoDescription") ?? "",
  });
}

function rootFields(formData: FormData) {
  const gallery = formData
    .getAll("gallery")
    .map((value) => String(value))
    .filter(Boolean);
  return projectRootSchema.safeParse({
    status: formData.get("status"),
    isFeatured: formData.get("isFeatured"),
    sortOrder: formData.get("sortOrder") || 0,
    coverAssetId: formData.get("coverAssetId") ?? "",
    gallery,
  });
}

function mediaCopyFrom(formData: FormData, assetIds: string[]) {
  return assetIds.map((id) => ({
    id,
    alts: {
      fr: String(formData.get(`alt-${id}-fr`) ?? ""),
      en: String(formData.get(`alt-${id}-en`) ?? ""),
      tr: String(formData.get(`alt-${id}-tr`) ?? ""),
    } as Partial<Record<Locale, string>>,
    captions: {
      fr: String(formData.get(`caption-${id}-fr`) ?? ""),
      en: String(formData.get(`caption-${id}-en`) ?? ""),
      tr: String(formData.get(`caption-${id}-tr`) ?? ""),
    } as Partial<Record<Locale, string>>,
  }));
}

async function persistMedia(root: ProjectRootInput, formData: FormData) {
  const ids = [...root.gallery, root.coverAssetId].filter((id): id is string => Boolean(id));
  await requireImageIds(getDb(), ids);
  await upsertMediaCopy(getDb(), mediaCopyFrom(formData, ids));
}

export async function createProjectAction(_previous: ActionState, formData: FormData): Promise<ActionState> {
  const auth = await authorizeAction("content:write");
  if (!auth.ok) return auth.state;

  const translation = translationFields(formData);
  const root = rootFields(formData);
  if (!translation.success || !root.success) {
    return invalidFields({
      ...(translation.success ? {} : fieldErrors(translation.error)),
      ...(root.success ? {} : fieldErrors(root.error)),
    });
  }

  let id: string;
  try {
    await persistMedia(root.data, formData);
    id = await createProject(getDb(), auth.actor, {
      root: root.data,
      locale: "fr",
      translation: translation.data,
    });
  } catch (error) {
    return ruleError(error);
  }
  refreshPublicContent("project");
  redirect(`/admin/projeler/${id}?bildirim=taslak`);
}

export async function updateProjectRootAction(
  id: string,
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const auth = await authorizeAction("content:write");
  if (!auth.ok) return auth.state;
  if (!idSchema.safeParse(id).success) return INVALID;
  const root = rootFields(formData);
  if (!root.success) return invalidFields(fieldErrors(root.error));
  try {
    await persistMedia(root.data, formData);
    await updateProjectRoot(getDb(), auth.actor, id, root.data);
  } catch (error) {
    return ruleError(error);
  }
  refreshPublicContent("project");
  refresh();
  return { ok: true, message: "Proje bilgileri kaydedildi." };
}

export async function saveProjectTranslationAction(
  id: string,
  locale: string,
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const auth = await authorizeAction("content:write");
  if (!auth.ok) return auth.state;
  const parsedLocale = localeSchema.safeParse(locale);
  if (!idSchema.safeParse(id).success || !parsedLocale.success) return INVALID;
  const translation = translationFields(formData);
  if (!translation.success) return invalidFields(fieldErrors(translation.error));
  try {
    await saveProjectTranslation(getDb(), auth.actor, id, parsedLocale.data, translation.data);
  } catch (error) {
    return ruleError(error);
  }
  refreshPublicContent("project");
  refresh();
  return { ok: true, message: `${localeLabels[parsedLocale.data]} taslak kaydedildi.` };
}

export async function setProjectStatusAction(id: string, locale: string, status: string): Promise<ActionState> {
  const auth = await authorizeAction("content:write");
  if (!auth.ok) return auth.state;
  const parsedLocale = localeSchema.safeParse(locale);
  if (!idSchema.safeParse(id).success || !parsedLocale.success) return INVALID;
  if (status !== "published" && status !== "draft") return INVALID;
  try {
    if (status === "published") {
      await assertProjectLocalePublishable(getDb(), id, parsedLocale.data);
    }
    await setTranslationStatus(getDb(), {
      entity: "project",
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
    return ruleError(error);
  }
  refreshPublicContent("project");
  refresh();
  const label = localeLabels[parsedLocale.data];
  return {
    ok: true,
    message: status === "published" ? `${label} içerik yayımlandı.` : `${label} içerik yayından kaldırıldı.`,
  };
}

export async function deleteProjectAction(id: string): Promise<ActionState> {
  const auth = await authorizeAction("content:write");
  if (!auth.ok) return auth.state;
  if (!idSchema.safeParse(id).success) return INVALID;
  try {
    await deleteProject(getDb(), auth.actor, id);
  } catch (error) {
    return ruleError(error);
  }
  refreshPublicContent("project");
  redirect("/admin/projeler");
}
