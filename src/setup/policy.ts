import { resolveDatabaseUrl } from "@/db/url";

export const SETUP_KEY_MIN = 16;
export const SETUP_ADVISORY_NS = 881177;
export const SETUP_ADVISORY_KEY = 1;
export const SETUP_MAX_FAILURES = 5;
export const SETUP_WINDOW_MS = 15 * 60 * 1000;
export const SETUP_BLOCK_MS = 15 * 60 * 1000;

export function setupKeyFromEnv(env: Record<string, string | undefined> = process.env): string | null {
  const value = env.SETUP_KEY?.trim();
  if (!value || value.length < SETUP_KEY_MIN) return null;
  return value;
}

/** Preview never runs production first-time setup. */
export function isSetupRuntimeAllowed(env: Record<string, string | undefined> = process.env): boolean {
  if (env.VERCEL_ENV === "preview") return false;
  if (!setupKeyFromEnv(env)) return false;
  return Boolean(resolveDatabaseUrl(env));
}

export function isProductionMigrateEnv(env: Record<string, string | undefined> = process.env): boolean {
  return env.VERCEL_ENV === "production";
}
