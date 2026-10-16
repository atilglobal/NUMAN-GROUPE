"use server";

import { refresh } from "next/cache";
import { redirect } from "next/navigation";
import {
  createExpertise,
  deleteExpertise,
  saveExpertiseTranslation,
  SlugTakenError,
  updateExpertiseRoot,
} from "@/admin/expertises";
import { localeLabels } from "@/admin/labels";
import { AdminRuleError } from "@/admin/users";
import {
  expertiseTranslationSchema,
  fieldErrors,
  idSchema,
  localeSchema,
  optionalUuid,
  sortOrderSchema,
} from "@/admin/validation";
import { authorizeAction, type ActionState } from "@/auth/session";
import { setTranslationStatus, TranslationNotFoundError } from "@/content/publishing";
import { refreshPublicContent } from "@/content/revalidate";
import { getDb } from "@/db/client";

/** Bound arguments come back from the browser, so they are validated like form fields. */
const INVALID: ActionState = { ok: false, message: "Geçersiz istek." };

function translationFields(formData: FormData) {
  return expertiseTranslationSchema.safeParse({
    name: formData.get("name"),
    slug: formData.get("slug"),
    summary: formData.get("summary") ?? "",
    body: formData.get("body") ?? "",
    seoTitle: formData.get("seoTitle") ?? "",
    seoDescription: formData.get("seoDescription") ?? "",
  });
}

function ruleError(error: unknown): ActionState {
  if (error instanceof SlugTakenError) return { ok: false, fieldErrors: { slug: error.message } };
  if (error instanceof AdminRuleError) return { ok: false, message: error.message };
  throw error;
}

export async function createExpertiseAction(_previous: ActionState, formData: FormData): Promise<ActionState> {
  const auth = await authorizeAction("content:write");
  if (!auth.ok) return auth.state;

  const translation = translationFields(formData);
  const sortOrder = sortOrderSchema.safeParse(formData.get("sortOrder") || 0);
  if (!translation.success || !sortOrder.success) {
    return {
      ok: false,
      fieldErrors: {
        ...(translation.success ? {} : fieldErrors(translation.error)),
        ...(sortOrder.success ? {} : { sortOrder: sortOrder.error.issues[0].message }),
      },
    };
  }

  let id: string;
  try {
    id = await createExpertise(getDb(), auth.actor, {
      sortOrder: sortOrder.data,
      locale: "fr",
      translation: translation.data,
    });
  } catch (error) {
    return ruleError(error);
  }
  redirect(`/admin/uzmanliklar/${id}`);
}

export async function updateExpertiseRootAction(
  id: string,
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const auth = await authorizeAction("content:write");
  if (!auth.ok) return auth.state;
  if (!idSchema.safeParse(id).success) return INVALID;

  const sortOrder = sortOrderSchema.safeParse(formData.get("sortOrder"));
  const coverAssetId = optionalUuid.safeParse(formData.get("coverAssetId") ?? "");
  if (!sortOrder.success || !coverAssetId.success) {
    return {
      ok: false,
      fieldErrors: {
        ...(sortOrder.success ? {} : { sortOrder: sortOrder.error.issues[0].message }),
        ...(coverAssetId.success ? {} : { coverAssetId: coverAssetId.error.issues[0].message }),
      },
    };
  }

  try {
    await updateExpertiseRoot(getDb(), auth.actor, id, {
      sortOrder: sortOrder.data,
      coverAssetId: coverAssetId.data,
    });
  } catch (error) {
    return ruleError(error);
  }
  refreshPublicContent("expertise");
  refresh();
  return { ok: true, message: "Genel ayarlar kaydedildi." };
}

export async function saveExpertiseTranslationAction(
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
    await saveExpertiseTranslation(getDb(), auth.actor, id, parsedLocale.data, translation.data);
  } catch (error) {
    return ruleError(error);
  }
  refreshPublicContent("expertise");
  refresh();
  return { ok: true, message: `${localeLabels[parsedLocale.data]} içerik kaydedildi.` };
}

export async function setExpertiseStatusAction(
  id: string,
  locale: string,
  status: string,
): Promise<ActionState> {
  const auth = await authorizeAction("content:write");
  if (!auth.ok) return auth.state;
  const parsedLocale = localeSchema.safeParse(locale);
  if (!idSchema.safeParse(id).success || !parsedLocale.success) return INVALID;
  if (status !== "published" && status !== "draft") return INVALID;

  try {
    await setTranslationStatus(getDb(), {
      entity: "expertise",
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

export async function deleteExpertiseAction(id: string): Promise<ActionState> {
  const auth = await authorizeAction("content:write");
  if (!auth.ok) return auth.state;
  if (!idSchema.safeParse(id).success) return INVALID;

  try {
    await deleteExpertise(getDb(), auth.actor, id);
  } catch (error) {
    return ruleError(error);
  }
  refreshPublicContent("expertise");
  redirect("/admin/uzmanliklar");
}
