import { hashPassword } from "better-auth/crypto";
import { and, asc, count, eq, isNull, ne, sql } from "drizzle-orm";
import type { Database } from "../db/client";
import { accounts, sessions, users, type UserRole } from "../db/schema";
import { writeAudit } from "./audit";

/** A rule violation with a message that can be shown to the panel user as is. */
export class AdminRuleError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AdminRuleError";
  }
}

type Actor = { id: string; ip?: string | null };

export type UserRow = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  disabledAt: Date | null;
  createdAt: Date;
  activeSessions: number;
};

export async function listUsers(db: Database): Promise<UserRow[]> {
  const sessionCounts = db
    .select({ userId: sessions.userId, total: count().as("total") })
    .from(sessions)
    .where(sql`${sessions.expiresAt} > now()`)
    .groupBy(sessions.userId)
    .as("session_counts");

  const rows = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
      disabledAt: users.disabledAt,
      createdAt: users.createdAt,
      activeSessions: sessionCounts.total,
    })
    .from(users)
    .leftJoin(sessionCounts, eq(sessionCounts.userId, users.id))
    .orderBy(asc(users.name));
  return rows.map((row) => ({ ...row, activeSessions: Number(row.activeSessions ?? 0) }));
}

/** Creates a panel user with a credential account. Used by the setup command and by admins. */
export async function createUserWithPassword(
  db: Database,
  input: { name: string; email: string; role: UserRole; password: string },
  actor: Actor | null,
): Promise<string> {
  const email = input.email.trim().toLowerCase();
  const [existing] = await db.select({ id: users.id }).from(users).where(eq(users.email, email));
  if (existing) throw new AdminRuleError("Bu e-posta adresiyle kayıtlı bir kullanıcı zaten var.");

  const passwordHash = await hashPassword(input.password);
  const id = crypto.randomUUID();

  await db.transaction(async (tx) => {
    await tx.insert(users).values({ id, name: input.name.trim(), email, role: input.role, emailVerified: true });
    await tx.insert(accounts).values({
      id: crypto.randomUUID(),
      accountId: id,
      providerId: "credential",
      userId: id,
      password: passwordHash,
    });
    await writeAudit(tx, {
      actorUserId: actor?.id ?? null,
      action: "user.create",
      entityType: "user",
      entityId: id,
      metadata: { role: input.role },
      ip: actor?.ip,
    });
  });
  return id;
}

async function otherActiveAdmins(db: Database, excludeUserId: string): Promise<number> {
  const [row] = await db
    .select({ total: count() })
    .from(users)
    .where(and(eq(users.role, "admin"), isNull(users.disabledAt), ne(users.id, excludeUserId)));
  return Number(row?.total ?? 0);
}

async function requireUser(db: Database, userId: string) {
  const [user] = await db
    .select({ id: users.id, role: users.role, disabledAt: users.disabledAt })
    .from(users)
    .where(eq(users.id, userId));
  if (!user) throw new AdminRuleError("Kullanıcı bulunamadı.");
  return user;
}

export async function changeUserRole(db: Database, actor: Actor, userId: string, role: UserRole): Promise<void> {
  if (userId === actor.id) throw new AdminRuleError("Kendi rolünüzü değiştiremezsiniz.");
  const user = await requireUser(db, userId);
  if (user.role === role) return;
  if (user.role === "admin" && (await otherActiveAdmins(db, userId)) === 0) {
    throw new AdminRuleError("En az bir etkin yönetici kalmalıdır.");
  }

  await db.transaction(async (tx) => {
    await tx.update(users).set({ role }).where(eq(users.id, userId));
    // Permissions change immediately: the user signs in again with the new role.
    await tx.delete(sessions).where(eq(sessions.userId, userId));
    await writeAudit(tx, {
      actorUserId: actor.id,
      action: "user.role_change",
      entityType: "user",
      entityId: userId,
      metadata: { from: user.role, to: role },
      ip: actor.ip,
    });
  });
}

export async function setUserDisabled(db: Database, actor: Actor, userId: string, disabled: boolean): Promise<void> {
  if (userId === actor.id) throw new AdminRuleError("Kendi hesabınızı devre dışı bırakamazsınız.");
  const user = await requireUser(db, userId);
  if (disabled && user.role === "admin" && (await otherActiveAdmins(db, userId)) === 0) {
    throw new AdminRuleError("En az bir etkin yönetici kalmalıdır.");
  }

  await db.transaction(async (tx) => {
    await tx
      .update(users)
      .set({ disabledAt: disabled ? new Date() : null })
      .where(eq(users.id, userId));
    if (disabled) await tx.delete(sessions).where(eq(sessions.userId, userId));
    await writeAudit(tx, {
      actorUserId: actor.id,
      action: disabled ? "user.disable" : "user.enable",
      entityType: "user",
      entityId: userId,
      ip: actor.ip,
    });
  });
}

export async function revokeUserSessions(db: Database, actor: Actor, userId: string): Promise<void> {
  await requireUser(db, userId);
  await db.transaction(async (tx) => {
    await tx.delete(sessions).where(eq(sessions.userId, userId));
    await writeAudit(tx, {
      actorUserId: actor.id,
      action: "user.sessions_revoke",
      entityType: "user",
      entityId: userId,
      ip: actor.ip,
    });
  });
}

/** Admin-set password; every session of that user ends. */
export async function setUserPassword(db: Database, actor: Actor, userId: string, password: string): Promise<void> {
  await requireUser(db, userId);
  const passwordHash = await hashPassword(password);
  await db.transaction(async (tx) => {
    const updated = await tx
      .update(accounts)
      .set({ password: passwordHash, updatedAt: new Date() })
      .where(and(eq(accounts.userId, userId), eq(accounts.providerId, "credential")))
      .returning({ id: accounts.id });
    if (updated.length === 0) throw new AdminRuleError("Bu kullanıcının parola hesabı yok.");
    await tx.delete(sessions).where(eq(sessions.userId, userId));
    await writeAudit(tx, {
      actorUserId: actor.id,
      action: "user.password_reset",
      entityType: "user",
      entityId: userId,
      ip: actor.ip,
    });
  });
}

export async function hasAnyAdmin(db: Database): Promise<boolean> {
  const [row] = await db.select({ total: count() }).from(users).where(eq(users.role, "admin"));
  return Number(row?.total ?? 0) > 0;
}
