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
import { parseProjectForm, parseProjectRootForm, parseProjectTranslationForm } from "@/admin/project-form";
import { fieldErrors, idSchema, localeSchema, summarizeFieldErrors, type ProjectRootInput } from "@/admin/validation";
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
  const name = error instanceof Error ? error.name : typeof error;
  const detail = error instanceof Error ? error.message : String(error);
  console.error("[project.action] unexpected failure", { name, detail: detail.slice(0, 400) });
  return SAVE_FAILED;
}

function invalidFields(errors: Record<string, string>): ActionState {
  return {
    ok: false,
    message: summarizeFieldErrors(errors),
    fieldErrors: errors,
  };
}

function logValidation(scope: string, errors: Record<string, string>) {
  console.error(`[${scope}] validation failed`, { fields: Object.keys(errors), reasons: errors });
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

  const parsed = parseProjectForm(formData);
  if (!parsed.ok) {
    logValidation("project.create", parsed.fieldErrors);
    return { ok: false, message: parsed.message, fieldErrors: parsed.fieldErrors };
  }

  let id: string;
  try {
    await persistMedia(parsed.root, formData);
    id = await createProject(getDb(), auth.actor, {
      root: parsed.root,
      locale: "fr",
      translation: parsed.translation,
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
  const root = parseProjectRootForm(formData);
  if (!root.success) {
    const errors = fieldErrors(root.error);
    logValidation("project.root", errors);
    return invalidFields(errors);
  }
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
  const translation = parseProjectTranslationForm(formData);
  if (!translation.success) {
    const errors = fieldErrors(translation.error);
    logValidation("project.translation", errors);
    return invalidFields(errors);
  }
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
