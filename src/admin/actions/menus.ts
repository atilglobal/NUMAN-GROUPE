"use server";

import { refresh } from "next/cache";
import { replaceMenu, type MenuEditorItem } from "@/admin/menus";
import { AdminRuleError } from "@/admin/users";
import { authorizeAction, type ActionState } from "@/auth/session";
import { refreshPublicContent } from "@/content/revalidate";
import { getDb } from "@/db/client";
import { z } from "zod";

const locationSchema = z.enum(["header", "footer"]);

export async function saveMenuAction(
  location: string,
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const auth = await authorizeAction("content:write");
  if (!auth.ok) return auth.state;
  const parsedLocation = locationSchema.safeParse(location);
  if (!parsedLocation.success) return { ok: false, message: "Geçersiz menü." };
  let items: MenuEditorItem[];
  try {
    items = JSON.parse(String(formData.get("items") ?? "[]")) as MenuEditorItem[];
    if (!Array.isArray(items)) throw new Error("bad");
  } catch {
    return { ok: false, message: "Menü verisi okunamadı." };
  }
  try {
    await replaceMenu(getDb(), auth.actor, parsedLocation.data, items);
  } catch (error) {
    if (error instanceof AdminRuleError) return { ok: false, message: error.message };
    throw error;
  }
  refreshPublicContent("menu");
  refresh();
  return { ok: true, message: "Menü kaydedildi." };
}
