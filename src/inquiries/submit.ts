import { eq } from "drizzle-orm";
import type { Database } from "@/db/client";
import { expertises, inquiries } from "@/db/schema";
import type { Locale } from "@/i18n/config";
import { dictionaries } from "@/i18n/dictionaries";
import { consumeInquiryQuota } from "@/auth/rate-limit";
import { notifyInquiry } from "./notify";

export type InquiryFieldErrors = Record<string, string>;

export type InquiryResult =
  | { ok: true; message: string; duplicate?: boolean }
  | { ok: false; message: string; fieldErrors?: InquiryFieldErrors };

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function filled(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value.trim() : "";
}

export async function submitInquiry(
  db: Database,
  input: { locale: Locale; formData: FormData; ip: string | null },
): Promise<InquiryResult> {
  const dict = dictionaries[input.locale].inquiry;
  const errors: InquiryFieldErrors = {};

  if (filled(input.formData.get("companyUrl"))) {
    return { ok: false, message: dict.errors.generic };
  }

  const idempotencyKey = filled(input.formData.get("idempotencyKey"));
  if (!UUID.test(idempotencyKey)) return { ok: false, message: dict.errors.generic };

  const [existing] = await db
    .select({ id: inquiries.id })
    .from(inquiries)
    .where(eq(inquiries.idempotencyKey, idempotencyKey));
  if (existing) return { ok: true, message: dict.success, duplicate: true };

  const localeField = filled(input.formData.get("locale"));
  if (localeField !== input.locale) return { ok: false, message: dict.errors.generic };

  const typeRaw = filled(input.formData.get("type"));
  const type = typeRaw === "project_request" ? "project_request" : typeRaw === "contact" ? "contact" : null;
  if (!type) errors.type = dict.errors.type;

  const fullName = filled(input.formData.get("fullName"));
  if (fullName.length < 2 || fullName.length > 160) errors.fullName = dict.errors.fullName;

  const organization = filled(input.formData.get("organization"));
  if (organization.length < 2 || organization.length > 160) errors.organization = dict.errors.organization;

  const email = filled(input.formData.get("email")).toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) errors.email = dict.errors.email;

  const phone = filled(input.formData.get("phone"));
  if (phone && (phone.length < 6 || phone.length > 40)) errors.phone = dict.errors.phone;

  const countryCode = filled(input.formData.get("countryCode")).toUpperCase();
  if (!/^[A-Z]{2}$/.test(countryCode)) errors.countryCode = dict.errors.country;

  const expertiseId = filled(input.formData.get("relatedExpertiseId"));
  if (type === "project_request" && !expertiseId) errors.relatedExpertiseId = dict.errors.projectType;
  if (expertiseId && !UUID.test(expertiseId)) errors.relatedExpertiseId = dict.errors.projectType;

  const message = filled(input.formData.get("message"));
  if (message.length < 20 || message.length > 4000) errors.message = dict.errors.message;

  if (filled(input.formData.get("privacyConsent")) !== "on") errors.privacyConsent = dict.errors.privacy;
  const preference = filled(input.formData.get("preferenceConsent")) === "on";

  if (Object.keys(errors).length > 0) {
    return { ok: false, message: dict.errors.invalid, fieldErrors: errors };
  }

  const allowed = await consumeInquiryQuota(db, { email, ip: input.ip });
  if (!allowed) return { ok: false, message: dict.errors.rateLimit };

  let relatedExpertiseId: string | null = expertiseId || null;
  if (relatedExpertiseId) {
    const [row] = await db.select({ id: expertises.id }).from(expertises).where(eq(expertises.id, relatedExpertiseId));
    if (!row) relatedExpertiseId = null;
  }

  const now = new Date();
  try {
    const [row] = await db
      .insert(inquiries)
      .values({
        type: type!,
        locale: input.locale,
        fullName,
        email,
        phone: phone || null,
        organization: organization || null,
        countryCode: countryCode || null,
        message,
        relatedExpertiseId,
        privacyConsentAt: now,
        preferenceConsentAt: preference ? now : null,
        idempotencyKey,
      })
      .returning({
        id: inquiries.id,
        type: inquiries.type,
        locale: inquiries.locale,
        fullName: inquiries.fullName,
        email: inquiries.email,
        message: inquiries.message,
      });
    await notifyInquiry(db, row);
    return { ok: true, message: dict.success };
  } catch (error) {
    const code = typeof error === "object" && error && "cause" in error ? (error as { cause?: { code?: string } }).cause?.code : undefined;
    const pgCode = typeof error === "object" && error && "code" in error ? (error as { code?: string }).code : code;
    if (pgCode === "23505") return { ok: true, message: dict.success, duplicate: true };
    throw error;
  }
}
