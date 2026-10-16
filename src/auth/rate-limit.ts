import { createHash } from "node:crypto";
import { and, eq, gt, inArray, sql } from "drizzle-orm";
import type { Database } from "../db/client";
import { authRateLimits } from "../db/schema";

/*
 * Failed sign-in throttling. Counters exist for any submitted address,
 * whether or not an account uses it, so throttling reveals nothing about
 * which accounts exist.
 */

export const LOGIN_WINDOW_MS = 15 * 60 * 1000;
export const LOGIN_BLOCK_MS = 15 * 60 * 1000;
export const MAX_FAILURES_PER_EMAIL = 5;
export const MAX_FAILURES_PER_IP = 20;

export type LoginKeys = { email: string; ip: string | null };

function emailKey(email: string): string {
  return `email:${createHash("sha256").update(email.trim().toLowerCase()).digest("hex")}`;
}

function keyLimits({ email, ip }: LoginKeys): { key: string; max: number }[] {
  const keys = [{ key: emailKey(email), max: MAX_FAILURES_PER_EMAIL }];
  if (ip) keys.push({ key: `ip:${ip}`, max: MAX_FAILURES_PER_IP });
  return keys;
}

export async function isLoginBlocked(db: Database, keys: LoginKeys, now = new Date()): Promise<boolean> {
  const rows = await db
    .select({ key: authRateLimits.key })
    .from(authRateLimits)
    .where(
      and(
        inArray(
          authRateLimits.key,
          keyLimits(keys).map((k) => k.key),
        ),
        gt(authRateLimits.blockedUntil, now),
      ),
    );
  return rows.length > 0;
}

export async function recordLoginFailure(db: Database, keys: LoginKeys, now = new Date()): Promise<void> {
  const windowStart = new Date(now.getTime() - LOGIN_WINDOW_MS);
  const blockUntil = new Date(now.getTime() + LOGIN_BLOCK_MS);

  for (const { key, max } of keyLimits(keys)) {
    const t = authRateLimits;
    const expired = sql`${t.windowStartedAt} < ${windowStart.toISOString()}::timestamptz`;
    const nextFailures = sql`case when ${expired} then 1 else ${t.failures} + 1 end`;
    await db
      .insert(t)
      .values({ key, failures: 1, windowStartedAt: now, blockedUntil: max <= 1 ? blockUntil : null })
      .onConflictDoUpdate({
        target: t.key,
        set: {
          failures: nextFailures,
          windowStartedAt: sql`case when ${expired} then ${now.toISOString()}::timestamptz else ${t.windowStartedAt} end`,
          blockedUntil: sql`case when ${nextFailures} >= ${max} then ${blockUntil.toISOString()}::timestamptz else ${t.blockedUntil} end`,
        },
      });
  }
}

/** After a successful sign-in the address starts fresh; the IP counter is kept. */
export async function clearLoginFailures(db: Database, email: string): Promise<void> {
  await db.delete(authRateLimits).where(eq(authRateLimits.key, emailKey(email)));
}

export const INQUIRY_WINDOW_MS = 15 * 60 * 1000;
export const INQUIRY_MAX_PER_EMAIL = 5;
export const INQUIRY_MAX_PER_IP = 10;

/** Counts every attempt (success or not) so a valid form cannot be used to flood. */
export async function consumeInquiryQuota(
  db: Database,
  keys: { email: string; ip: string | null },
  now = new Date(),
): Promise<boolean> {
  const windowStart = new Date(now.getTime() - INQUIRY_WINDOW_MS);
  const limits = [{ key: `inquiry-email:${createHash("sha256").update(keys.email.trim().toLowerCase()).digest("hex")}`, max: INQUIRY_MAX_PER_EMAIL }];
  if (keys.ip) limits.push({ key: `inquiry-ip:${keys.ip}`, max: INQUIRY_MAX_PER_IP });

  for (const { key, max } of limits) {
    const t = authRateLimits;
    const expired = sql`${t.windowStartedAt} < ${windowStart.toISOString()}::timestamptz`;
    const nextFailures = sql`case when ${expired} then 1 else ${t.failures} + 1 end`;
    const [row] = await db
      .insert(t)
      .values({ key, failures: 1, windowStartedAt: now, blockedUntil: null })
      .onConflictDoUpdate({
        target: t.key,
        set: {
          failures: nextFailures,
          windowStartedAt: sql`case when ${expired} then ${now.toISOString()}::timestamptz else ${t.windowStartedAt} end`,
        },
      })
      .returning({ failures: t.failures });
    if ((row?.failures ?? 1) > max) return false;
  }
  return true;
}
