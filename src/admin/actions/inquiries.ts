"use server";

import { refresh } from "next/cache";
import { addInquiryNote, setInquiryStatus } from "@/admin/inquiries";
import { inquiryStatuses } from "@/db/schema";
import { authorizeAction, type ActionState } from "@/auth/session";
import { getDb } from "@/db/client";
import { idSchema } from "@/admin/validation";

export async function setInquiryStatusAction(
  id: string,
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const auth = await authorizeAction("inquiries:read");
  if (!auth.ok) return auth.state;
  if (!idSchema.safeParse(id).success) return { ok: false, message: "Geçersiz istek." };
  const status = String(formData.get("status") ?? "");
  if (!(inquiryStatuses as readonly string[]).includes(status)) {
    return { ok: false, message: "Geçersiz durum." };
  }
  const ok = await setInquiryStatus(getDb(), auth.actor, id, status as (typeof inquiryStatuses)[number]);
  if (!ok) return { ok: false, message: "Kayıt bulunamadı." };
  refresh();
  return { ok: true, message: "Durum güncellendi." };
}

export async function addInquiryNoteAction(
  id: string,
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const auth = await authorizeAction("inquiries:read");
  if (!auth.ok) return auth.state;
  if (!idSchema.safeParse(id).success) return { ok: false, message: "Geçersiz istek." };
  const body = String(formData.get("body") ?? "");
  const ok = await addInquiryNote(getDb(), auth.actor, id, body);
  if (!ok) return { ok: false, message: "Not boş olamaz." };
  refresh();
  return { ok: true, message: "Not eklendi." };
}
