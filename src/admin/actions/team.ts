"use server";

import { refresh } from "next/cache";
import { redirect } from "next/navigation";
import { localeLabels } from "@/admin/labels";
import { createTeamMember, deleteTeamMember, saveTeamTranslation, updateTeamRoot } from "@/admin/team";
import { AdminRuleError } from "@/admin/users";
import { fieldErrors, idSchema, localeSchema, teamRootSchema, teamTranslationSchema } from "@/admin/validation";
import { authorizeAction, type ActionState } from "@/auth/session";
import { setTranslationStatus, TranslationNotFoundError } from "@/content/publishing";
import { refreshPublicContent } from "@/content/revalidate";
import { getDb } from "@/db/client";
import { MediaUploadError, requireImageIds } from "@/media/store";

const INVALID: ActionState = { ok: false, message: "Geçersiz istek." };

function ruleError(error: unknown): ActionState {
  if (error instanceof AdminRuleError || error instanceof MediaUploadError) {
    return { ok: false, message: error.message };
  }
  throw error;
}

function rootFields(formData: FormData) {
  return teamRootSchema.safeParse({
    fullName: formData.get("fullName"),
    sortOrder: formData.get("sortOrder") || 0,
    isVisible: formData.get("isVisible"),
    presentationGroup: formData.get("presentationGroup") ?? "",
    photoAssetId: formData.get("coverAssetId") ?? "",
    linkLabel: formData.get("linkLabel") ?? "",
    linkUrl: formData.get("linkUrl") ?? "",
  });
}

export async function createTeamMemberAction(_previous: ActionState, formData: FormData): Promise<ActionState> {
  const auth = await authorizeAction("content:write");
  if (!auth.ok) return auth.state;
  const translation = teamTranslationSchema.safeParse({
    roleTitle: formData.get("roleTitle"),
    summary: formData.get("summary") ?? "",
    bio: formData.get("bio") ?? "",
  });
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
    if (root.data.photoAssetId) await requireImageIds(getDb(), [root.data.photoAssetId]);
    id = await createTeamMember(getDb(), auth.actor, {
      root: root.data,
      locale: "fr",
      translation: translation.data,
    });
  } catch (error) {
    return ruleError(error);
  }
  refreshPublicContent("team_member");
  redirect(`/admin/kadro/${id}`);
}

export async function updateTeamRootAction(
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
    if (root.data.photoAssetId) await requireImageIds(getDb(), [root.data.photoAssetId]);
    await updateTeamRoot(getDb(), auth.actor, id, root.data);
  } catch (error) {
    return ruleError(error);
  }
  refreshPublicContent("team_member");
  refresh();
  return { ok: true, message: "Kişi bilgileri kaydedildi." };
}

export async function saveTeamTranslationAction(
  id: string,
  locale: string,
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const auth = await authorizeAction("content:write");
  if (!auth.ok) return auth.state;
  const parsedLocale = localeSchema.safeParse(locale);
  if (!idSchema.safeParse(id).success || !parsedLocale.success) return INVALID;
  const translation = teamTranslationSchema.safeParse({
    roleTitle: formData.get("roleTitle"),
    summary: formData.get("summary") ?? "",
    bio: formData.get("bio") ?? "",
  });
  if (!translation.success) return { ok: false, fieldErrors: fieldErrors(translation.error) };
  try {
    await saveTeamTranslation(getDb(), auth.actor, id, parsedLocale.data, translation.data);
  } catch (error) {
    return ruleError(error);
  }
  refreshPublicContent("team_member");
  refresh();
  return { ok: true, message: `${localeLabels[parsedLocale.data]} içerik kaydedildi.` };
}

export async function setTeamStatusAction(id: string, locale: string, status: string): Promise<ActionState> {
  const auth = await authorizeAction("content:write");
  if (!auth.ok) return auth.state;
  const parsedLocale = localeSchema.safeParse(locale);
  if (!idSchema.safeParse(id).success || !parsedLocale.success) return INVALID;
  if (status !== "published" && status !== "draft") return INVALID;
  try {
    await setTranslationStatus(getDb(), {
      entity: "team_member",
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

export async function deleteTeamMemberAction(id: string): Promise<ActionState> {
  const auth = await authorizeAction("content:write");
  if (!auth.ok) return auth.state;
  if (!idSchema.safeParse(id).success) return INVALID;
  try {
    await deleteTeamMember(getDb(), auth.actor, id);
  } catch (error) {
    return ruleError(error);
  }
  refreshPublicContent("team_member");
  redirect("/admin/kadro");
}
