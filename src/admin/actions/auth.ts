"use server";

import { APIError } from "better-auth/api";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { writeAudit } from "@/admin/audit";
import { changePasswordSchema, fieldErrors, signInSchema } from "@/admin/validation";
import { clientIpFrom } from "@/auth/client-ip";
import { SIGN_IN_ERROR, signInWithPassword } from "@/auth/sign-in";
import { authorizeAction, getAuth, getCurrentUser, LOGIN_PATH, type ActionState } from "@/auth/session";
import { getDb } from "@/db/client";

/*
 * Authentication runs only through these Server Actions. Next.js accepts a
 * Server Action only when its Origin matches the host, and the session
 * cookie is httpOnly + SameSite=Lax: together that is the CSRF protection.
 */

export async function signInAction(_previous: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = signInSchema.safeParse({ email: formData.get("email"), password: formData.get("password") });
  if (!parsed.success || !parsed.data.email || !parsed.data.password) {
    return { ok: false, message: SIGN_IN_ERROR };
  }

  const requestHeaders = await headers();
  const result = await signInWithPassword(getAuth(), getDb(), {
    email: parsed.data.email,
    password: parsed.data.password,
    ip: clientIpFrom(requestHeaders),
    headers: requestHeaders,
  });
  if (!result.ok) return { ok: false, message: result.error };
  redirect("/admin");
}

export async function signOutAction(): Promise<void> {
  const requestHeaders = await headers();
  const user = await getCurrentUser();
  try {
    await getAuth().api.signOut({ headers: requestHeaders });
  } catch (error) {
    if (!(error instanceof APIError)) throw error;
  }
  if (user) {
    await writeAudit(getDb(), {
      actorUserId: user.id,
      action: "auth.sign_out",
      entityType: "user",
      entityId: user.id,
      ip: clientIpFrom(requestHeaders),
    });
  }
  redirect(LOGIN_PATH);
}

export async function changePasswordAction(_previous: ActionState, formData: FormData): Promise<ActionState> {
  const auth = await authorizeAction(null);
  if (!auth.ok) return auth.state;

  const parsed = changePasswordSchema.safeParse({
    currentPassword: formData.get("currentPassword"),
    newPassword: formData.get("newPassword"),
    confirmPassword: formData.get("confirmPassword"),
  });
  if (!parsed.success) return { ok: false, fieldErrors: fieldErrors(parsed.error) };

  try {
    await getAuth().api.changePassword({
      body: {
        currentPassword: parsed.data.currentPassword,
        newPassword: parsed.data.newPassword,
        revokeOtherSessions: true,
      },
      headers: await headers(),
    });
  } catch (error) {
    if (!(error instanceof APIError)) throw error;
    return { ok: false, fieldErrors: { currentPassword: "Mevcut parola hatalı." } };
  }

  await writeAudit(getDb(), {
    actorUserId: auth.user.id,
    action: "user.password_change",
    entityType: "user",
    entityId: auth.user.id,
    ip: auth.actor.ip,
  });
  return { ok: true, message: "Parolanız değiştirildi. Diğer cihazlardaki oturumlarınız kapatıldı." };
}

export async function signOutOtherSessionsAction(): Promise<ActionState> {
  const auth = await authorizeAction(null);
  if (!auth.ok) return auth.state;

  await getAuth().api.revokeOtherSessions({ headers: await headers() });
  await writeAudit(getDb(), {
    actorUserId: auth.user.id,
    action: "user.sessions_revoke",
    entityType: "user",
    entityId: auth.user.id,
    metadata: { scope: "others" },
    ip: auth.actor.ip,
  });
  return { ok: true, message: "Diğer tüm oturumlarınız kapatıldı." };
}
