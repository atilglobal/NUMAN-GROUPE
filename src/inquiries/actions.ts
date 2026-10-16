"use server";

import { requestIp, type ActionState } from "@/auth/session";
import { getDb } from "@/db/client";
import { isLocale } from "@/i18n/config";
import { submitInquiry } from "./submit";

export async function submitInquiryAction(
  locale: string,
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  if (!isLocale(locale)) return { ok: false, message: "Invalid request." };
  const result = await submitInquiry(getDb(), { locale, formData, ip: await requestIp() });
  if (result.ok) return { ok: true, message: result.message };
  return { ok: false, message: result.message, fieldErrors: result.fieldErrors };
}
