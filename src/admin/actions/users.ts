"use server";

import { refresh } from "next/cache";
import {
  AdminRuleError,
  changeUserRole,
  createUserWithPassword,
  revokeUserSessions,
  setUserDisabled,
  setUserPassword,
} from "@/admin/users";
import { createUserSchema, fieldErrors, passwordSchema, roleSchema, userIdSchema } from "@/admin/validation";
import { authorizeAction, type ActionState } from "@/auth/session";
import { getDb } from "@/db/client";

const INVALID: ActionState = { ok: false, message: "Geçersiz istek." };

async function run(task: () => Promise<void>, message: string): Promise<ActionState> {
  try {
    await task();
  } catch (error) {
    if (error instanceof AdminRuleError) return { ok: false, message: error.message };
    throw error;
  }
  refresh();
  return { ok: true, message };
}

export async function createUserAction(_previous: ActionState, formData: FormData): Promise<ActionState> {
  const auth = await authorizeAction("users:manage");
  if (!auth.ok) return auth.state;

  const parsed = createUserSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    role: formData.get("role"),
    password: formData.get("password"),
  });
  if (!parsed.success) return { ok: false, fieldErrors: fieldErrors(parsed.error) };

  return run(
    async () => void (await createUserWithPassword(getDb(), parsed.data, auth.actor)),
    `${parsed.data.name} eklendi. Parolayı kendisine güvenli bir kanaldan iletin.`,
  );
}

export async function changeRoleAction(userId: string, _previous: ActionState, formData: FormData): Promise<ActionState> {
  const auth = await authorizeAction("users:manage");
  if (!auth.ok) return auth.state;
  const role = roleSchema.safeParse(formData.get("role"));
  if (!userIdSchema.safeParse(userId).success || !role.success) return INVALID;

  return run(() => changeUserRole(getDb(), auth.actor, userId, role.data), "Rol güncellendi; kullanıcının oturumları kapatıldı.");
}

export async function setDisabledAction(userId: string, disabled: boolean): Promise<ActionState> {
  const auth = await authorizeAction("users:manage");
  if (!auth.ok) return auth.state;
  if (!userIdSchema.safeParse(userId).success || typeof disabled !== "boolean") return INVALID;

  return run(
    () => setUserDisabled(getDb(), auth.actor, userId, disabled),
    disabled ? "Hesap devre dışı bırakıldı ve oturumları kapatıldı." : "Hesap yeniden etkinleştirildi.",
  );
}

export async function revokeSessionsAction(userId: string): Promise<ActionState> {
  const auth = await authorizeAction("users:manage");
  if (!auth.ok) return auth.state;
  if (!userIdSchema.safeParse(userId).success) return INVALID;

  return run(() => revokeUserSessions(getDb(), auth.actor, userId), "Kullanıcının tüm oturumları kapatıldı.");
}

export async function resetPasswordAction(userId: string, _previous: ActionState, formData: FormData): Promise<ActionState> {
  const auth = await authorizeAction("users:manage");
  if (!auth.ok) return auth.state;
  if (!userIdSchema.safeParse(userId).success) return INVALID;
  if (userId === auth.user.id) {
    return { ok: false, message: "Kendi parolanızı Hesabım sayfasından değiştirin." };
  }
  const password = passwordSchema.safeParse(formData.get("password"));
  if (!password.success) return { ok: false, fieldErrors: { password: password.error.issues[0].message } };

  return run(
    () => setUserPassword(getDb(), auth.actor, userId, password.data),
    "Parola değiştirildi; kullanıcının oturumları kapatıldı.",
  );
}
