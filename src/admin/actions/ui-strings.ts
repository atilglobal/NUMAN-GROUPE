"use server";

import { refresh } from "next/cache";
import { restoreUiString, saveUiString } from "@/admin/ui-strings";
import { AdminRuleError } from "@/admin/users";
import { localeSchema } from "@/admin/validation";
import { authorizeAction, type ActionState } from "@/auth/session";
import { refreshPublicContent } from "@/content/revalidate";
import { getDb } from "@/db/client";
import { isUiStringKey } from "@/i18n/catalog";

const INVALID: ActionState = { ok: false, message: "Geçersiz istek." };

export async function saveUiStringAction(_previous: ActionState, formData: FormData): Promise<ActionState> {
  const auth = await authorizeAction("content:write");
  if (!auth.ok) return auth.state;
  const key = String(formData.get("key") ?? "");
  const locale = localeSchema.safeParse(formData.get("locale"));
  const value = String(formData.get("value") ?? "");
  if (!isUiStringKey(key) || !locale.success) return INVALID;
  try {
    await saveUiString(getDb(), auth.actor, key, locale.data, value);
  } catch (error) {
    if (error instanceof AdminRuleError) return { ok: false, message: error.message };
    throw error;
  }
  refreshPublicContent("ui");
  refresh();
  return { ok: true, message: "Çeviri kaydedildi." };
}

export async function restoreUiStringAction(_previous: ActionState, formData: FormData): Promise<ActionState> {
  const auth = await authorizeAction("content:write");
  if (!auth.ok) return auth.state;
  const key = String(formData.get("key") ?? "");
  const locale = localeSchema.safeParse(formData.get("locale"));
  if (!isUiStringKey(key) || !locale.success) return INVALID;
  try {
    await restoreUiString(getDb(), auth.actor, key, locale.data);
  } catch (error) {
    if (error instanceof AdminRuleError) return { ok: false, message: error.message };
    throw error;
  }
  refreshPublicContent("ui");
  refresh();
  return { ok: true, message: "Varsayılan metin geri yüklendi." };
}
