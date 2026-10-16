import { nextCookies } from "better-auth/next-js";
import { and, eq, isNull } from "drizzle-orm";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import { getDb, isDatabaseConfigured } from "@/db/client";
import { users, type UserRole } from "@/db/schema";
import { clientIpFrom } from "./client-ip";
import { createAuth, type Auth } from "./config";
import { can, type Permission } from "./permissions";

/*
 * Data access layer for the panel: every page and every Server Action
 * resolves the user here, on the server, before touching data. Hiding a
 * link in the UI is never the check.
 */

export const LOGIN_PATH = "/admin/giris";
export const FORBIDDEN_PATH = "/admin/yetkisiz";

const globalForAuth = globalThis as unknown as { numanAuth?: Auth };

export function getAuth(): Auth {
  globalForAuth.numanAuth ??= createAuth(getDb(), [nextCookies()]);
  return globalForAuth.numanAuth;
}

export type PanelUser = { id: string; name: string; email: string; role: UserRole };

/** Session plus a fresh users row, so role changes and disabling apply at once. */
export const getCurrentUser = cache(async (): Promise<PanelUser | null> => {
  const requestHeaders = await headers();
  if (!isDatabaseConfigured()) return null;
  const session = await getAuth().api.getSession({ headers: requestHeaders });
  if (!session) return null;
  const [user] = await getDb()
    .select({ id: users.id, name: users.name, email: users.email, role: users.role })
    .from(users)
    .where(and(eq(users.id, session.user.id), isNull(users.disabledAt)));
  return user ?? null;
});

export async function requireUser(): Promise<PanelUser> {
  const user = await getCurrentUser();
  if (!user) redirect(LOGIN_PATH);
  return user;
}

export async function requirePermission(permission: Permission): Promise<PanelUser> {
  const user = await requireUser();
  if (!can(user.role, permission)) redirect(FORBIDDEN_PATH);
  return user;
}

export async function requestIp(): Promise<string | null> {
  return clientIpFrom(await headers());
}

export type ActionState = {
  ok: boolean;
  message?: string;
  fieldErrors?: Record<string, string>;
};

export const FORBIDDEN_ACTION: ActionState = { ok: false, message: "Bu işlem için yetkiniz yok." };

/**
 * Guard for Server Actions: without a session the user is sent to sign in;
 * a missing permission returns an error state instead of running anything.
 */
export async function authorizeAction(
  permission: Permission | null,
): Promise<{ ok: true; user: PanelUser; actor: { id: string; ip: string | null } } | { ok: false; state: ActionState }> {
  const user = await getCurrentUser();
  if (!user) redirect(LOGIN_PATH);
  if (permission && !can(user.role, permission)) return { ok: false, state: FORBIDDEN_ACTION };
  return { ok: true, user, actor: { id: user.id, ip: await requestIp() } };
}
