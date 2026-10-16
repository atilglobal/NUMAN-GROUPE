"use server";

import { refresh } from "next/cache";
import { redirect } from "next/navigation";
import { localeLabels } from "@/admin/labels";
import { AdminRuleError } from "@/admin/users";
import {
  fieldErrors,
  idSchema,
  localeSchema,
  visitRootSchema,
  visitTranslationSchema,
  type VisitRootInput,
} from "@/admin/validation";
import { createVisit, deleteVisit, saveVisitTranslation, SlugTakenError, updateVisitRoot } from "@/admin/visits";
import { authorizeAction, type ActionState } from "@/auth/session";
import { setTranslationStatus, TranslationNotFoundError } from "@/content/publishing";
import { refreshPublicContent } from "@/content/revalidate";
import { getDb } from "@/db/client";
import { MediaUploadError, requireImageIds, updateMediaCaptions } from "@/media/store";
import type { Locale } from "@/i18n/config";

const INVALID: ActionState = { ok: false, message: "Geçersiz istek." };

function ruleError(error: unknown): ActionState {
  if (error instanceof SlugTakenError) return { ok: false, fieldErrors: { slug: error.message } };
  if (error instanceof AdminRuleError || error instanceof MediaUploadError) {
    return { ok: false, message: error.message };
  }
  throw error;
}

function translationFields(formData: FormData) {
  return visitTranslationSchema.safeParse({
    title: formData.get("title"),
    slug: formData.get("slug"),
    summary: formData.get("summary") ?? "",
    body: formData.get("body") ?? "",
    hostInstitution: formData.get("hostInstitution") ?? "",
    location: formData.get("location") ?? "",
    seoTitle: formData.get("seoTitle") ?? "",
    seoDescription: formData.get("seoDescription") ?? "",
  });
}

function participantsFrom(formData: FormData) {
  const names = formData.getAll("participantName").map((value) => String(value));
  const roleFr = formData.getAll("participantRoleFr").map((value) => String(value));
  const roleEn = formData.getAll("participantRoleEn").map((value) => String(value));
  const roleTr = formData.getAll("participantRoleTr").map((value) => String(value));
  const length = Math.max(names.length, roleFr.length, roleEn.length, roleTr.length);
  return Array.from({ length }, (_, index) => ({
    fullName: names[index] ?? "",
    roleFr: roleFr[index] ?? "",
    roleEn: roleEn[index] ?? "",
    roleTr: roleTr[index] ?? "",
  }));
}

function captionsFrom(formData: FormData, assetIds: string[]) {
  return assetIds.map((id) => ({
    id,
    captions: {
      fr: String(formData.get(`caption-${id}-fr`) ?? ""),
      en: String(formData.get(`caption-${id}-en`) ?? ""),
      tr: String(formData.get(`caption-${id}-tr`) ?? ""),
    } as Partial<Record<Locale, string>>,
  }));
}

function rootFields(formData: FormData) {
  const gallery = formData
    .getAll("gallery")
    .map((value) => String(value))
    .filter(Boolean);
  return visitRootSchema.safeParse({
    visitedOn: formData.get("visitedOn") ?? "",
    countryCode: formData.get("countryCode") ?? "",
    isFeatured: formData.get("isFeatured"),
    coverAssetId: formData.get("coverAssetId") ?? "",
    gallery,
    participants: participantsFrom(formData),
  });
}

async function persistMedia(root: VisitRootInput, formData: FormData) {
  const ids = [...root.gallery, root.coverAssetId].filter((id): id is string => Boolean(id));
  await requireImageIds(getDb(), ids);
  await updateMediaCaptions(getDb(), captionsFrom(formData, ids));
}

export async function createVisitAction(_previous: ActionState, formData: FormData): Promise<ActionState> {
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
    await persistMedia(root.data, formData);
    id = await createVisit(getDb(), auth.actor, {
      root: root.data,
      locale: "fr",
      translation: translation.data,
    });
  } catch (error) {
    return ruleError(error);
  }
  refreshPublicContent("visit");
  redirect(`/admin/ziyaretler/${id}`);
}

export async function updateVisitRootAction(
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
    await persistMedia(root.data, formData);
    await updateVisitRoot(getDb(), auth.actor, id, root.data);
  } catch (error) {
    return ruleError(error);
  }
  refreshPublicContent("visit");
  refresh();
  return { ok: true, message: "Ziyaret bilgileri kaydedildi." };
}

export async function saveVisitTranslationAction(
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
    await saveVisitTranslation(getDb(), auth.actor, id, parsedLocale.data, translation.data);
  } catch (error) {
    return ruleError(error);
  }
  refreshPublicContent("visit");
  refresh();
  return { ok: true, message: `${localeLabels[parsedLocale.data]} içerik kaydedildi.` };
}

export async function setVisitStatusAction(id: string, locale: string, status: string): Promise<ActionState> {
  const auth = await authorizeAction("content:write");
  if (!auth.ok) return auth.state;
  const parsedLocale = localeSchema.safeParse(locale);
  if (!idSchema.safeParse(id).success || !parsedLocale.success) return INVALID;
  if (status !== "published" && status !== "draft") return INVALID;
  try {
    await setTranslationStatus(getDb(), {
      entity: "visit",
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

export async function deleteVisitAction(id: string): Promise<ActionState> {
  const auth = await authorizeAction("content:write");
  if (!auth.ok) return auth.state;
  if (!idSchema.safeParse(id).success) return INVALID;
  try {
    await deleteVisit(getDb(), auth.actor, id);
  } catch (error) {
    return ruleError(error);
  }
  refreshPublicContent("visit");
  redirect("/admin/ziyaretler");
}
