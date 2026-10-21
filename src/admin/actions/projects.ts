"use server";

import { refresh } from "next/cache";
import { redirect } from "next/navigation";
import {
  createProject,
  deleteProject,
  saveProjectTranslation,
  SlugTakenError,
  updateProjectRoot,
} from "@/admin/projects";
import { localeLabels } from "@/admin/labels";
import { AdminRuleError } from "@/admin/users";
import {
  fieldErrors,
  idSchema,
  localeSchema,
  projectRootSchema,
  projectTranslationSchema,
  type ProjectRootInput,
} from "@/admin/validation";
import { authorizeAction, type ActionState } from "@/auth/session";
import { setTranslationStatus, TranslationNotFoundError } from "@/content/publishing";
import { refreshPublicContent } from "@/content/revalidate";
import { getDb } from "@/db/client";
import { MediaUploadError, requireImageIds } from "@/media/store";

const INVALID: ActionState = { ok: false, message: "Geçersiz istek." };

function ruleError(error: unknown): ActionState {
  if (error instanceof SlugTakenError) return { ok: false, fieldErrors: { slug: error.message } };
  if (error instanceof AdminRuleError || error instanceof MediaUploadError) {
    return { ok: false, message: error.message };
  }
  throw error;
}

function translationFields(formData: FormData) {
  return projectTranslationSchema.safeParse({
    title: formData.get("title"),
    slug: formData.get("slug"),
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

async function assertMedia(root: ProjectRootInput) {
  const ids = [...root.gallery, root.coverAssetId].filter((id): id is string => Boolean(id));
  await requireImageIds(getDb(), ids);
}

export async function createProjectAction(_previous: ActionState, formData: FormData): Promise<ActionState> {
  const auth = await authorizeAction("content:write");
  if (!auth.ok) return auth.state;

  const translation = translationFields(formData);
  const root = rootFields(formData);
  if (!translation.success || !root.success) {
    return {
      ok: false,
      fieldErrors: {
        ...(translation.success ? {} : fieldErrors(translation.error)),
        ...(root.success ? {} : fieldErrors(root.error)),
      },
    };
  }

  let id: string;
  try {
    await assertMedia(root.data);
    id = await createProject(getDb(), auth.actor, {
      root: root.data,
      locale: "fr",
      translation: translation.data,
    });
  } catch (error) {
    return ruleError(error);
  }
  refreshPublicContent("project");
  redirect(`/admin/projeler/${id}`);
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
  if (!root.success) return { ok: false, fieldErrors: fieldErrors(root.error) };
  try {
    await assertMedia(root.data);
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
  if (!translation.success) return { ok: false, fieldErrors: fieldErrors(translation.error) };
  try {
    await saveProjectTranslation(getDb(), auth.actor, id, parsedLocale.data, translation.data);
  } catch (error) {
    return ruleError(error);
  }
  refreshPublicContent("project");
  refresh();
  return { ok: true, message: `${localeLabels[parsedLocale.data]} içerik kaydedildi.` };
}

export async function setProjectStatusAction(id: string, locale: string, status: string): Promise<ActionState> {
  const auth = await authorizeAction("content:write");
  if (!auth.ok) return auth.state;
  const parsedLocale = localeSchema.safeParse(locale);
  if (!idSchema.safeParse(id).success || !parsedLocale.success) return INVALID;
  if (status !== "published" && status !== "draft") return INVALID;
  try {
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
    throw error;
  }
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
