/**
 * Hosting provider is not locked. These checks describe what this app needs
 * before a real HTTPS go-live; they do not imply a specific vendor.
 */

import { resolveDatabaseUrl } from "../db/url";
import { isObjectStorageConfigured } from "../media/object-store";

const SECRET_MIN = 32;

export type ProductionAssessment = {
  missing: string[];
  warnings: string[];
  /** True only when required secrets/URLs are set and SITE_ENV is production. */
  ready: boolean;
};

export function assessProductionEnv(
  env: Record<string, string | undefined> = process.env,
): ProductionAssessment {
  const missing: string[] = [];
  const warnings: string[] = [];

  if (!resolveDatabaseUrl(env)) missing.push("DATABASE_URL");

  const secret = env.BETTER_AUTH_SECRET ?? "";
  if (secret.length < SECRET_MIN) missing.push("BETTER_AUTH_SECRET");

  const siteUrl = env.SITE_URL?.trim() ?? "";
  if (!siteUrl) missing.push("SITE_URL");
  else if (!/^https:\/\//i.test(siteUrl)) {
    warnings.push("SITE_URL must use https for a public launch.");
  }

  if (env.SITE_ENV !== "production") {
    warnings.push("SITE_ENV is not production; demo rows stay hidden only if ALLOW_DEMO_CONTENT is false or NODE_ENV is production.");
  }

  if (isObjectStorageConfigured(env)) {
    /* durable object store; local MEDIA_STORAGE_DIR is unused */
  } else if (env.VERCEL === "1") {
    warnings.push(
      "Vercel disk is ephemeral; set MEDIA_S3_BUCKET, MEDIA_S3_ACCESS_KEY_ID and MEDIA_S3_SECRET_ACCESS_KEY (plus MEDIA_S3_ENDPOINT for R2/MinIO).",
    );
  } else if (!env.MEDIA_STORAGE_DIR?.trim()) {
    warnings.push(
      "MEDIA_STORAGE_DIR is unset; uploads default to .data/media and will be lost on an ephemeral filesystem.",
    );
  }

  if (!env.BETTER_AUTH_URL?.trim() && siteUrl) {
    warnings.push("BETTER_AUTH_URL is unset; the panel uses SITE_URL.");
  }

  if (!env.RESEND_API_KEY?.trim() || !env.INQUIRY_NOTIFY_FROM?.trim()) {
    warnings.push("Inquiry e-mail notification is not configured (Resend); submissions are still stored.");
  }

  if (!env.AUTH_IP_HEADER?.trim()) {
    warnings.push("AUTH_IP_HEADER is unset; sign-in throttling is per e-mail only, not per client IP.");
  }

  if (!env.SETUP_KEY?.trim()) {
    warnings.push("SETUP_KEY is unset; /setup stays closed. Add it only for the first Production administrator, then remove it.");
  }

  const ready =
    missing.length === 0 &&
    env.SITE_ENV === "production" &&
    /^https:\/\//i.test(siteUrl);

  return { missing, warnings, ready };
}
