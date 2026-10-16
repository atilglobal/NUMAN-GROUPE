import { verifyPassword } from "better-auth/crypto";
import { eq } from "drizzle-orm";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import type { Database } from "@/db/client";
import { accounts, auditLogs, sessions, users } from "@/db/schema";
import { createTestDb, truncateAll } from "@/db/testing";
import {
  AdminRuleError,
  changeUserRole,
  createUserWithPassword,
  hasAnyAdmin,
  listUsers,
  revokeUserSessions,
  setUserDisabled,
  setUserPassword,
} from "./users";

const PASSWORD = "first password 123";

let db: Database;
let close: () => Promise<void>;

beforeAll(async () => {
  ({ db, close } = await createTestDb());
});
afterAll(() => close());
beforeEach(() => truncateAll(db));

function create(email: string, role: "admin" | "editor", actorId: string | null = null) {
  return createUserWithPassword(db, { name: email.split("@")[0], email, role, password: PASSWORD }, actorId ? { id: actorId } : null);
}

async function addSession(userId: string) {
  await db.insert(sessions).values({
    id: crypto.randomUUID(),
    token: crypto.randomUUID(),
    userId,
    expiresAt: new Date(Date.now() + 3600_000),
  });
}

describe("createUserWithPassword", () => {
  it("stores a lowercase address and only a password hash", async () => {
    const id = await create("New.Editor@Example.org", "editor");

    const [user] = await db.select().from(users).where(eq(users.id, id));
    expect(user.email).toBe("new.editor@example.org");
    const [account] = await db.select().from(accounts).where(eq(accounts.userId, id));
    expect(account.providerId).toBe("credential");
    expect(account.password).not.toContain(PASSWORD);
    expect(await verifyPassword({ hash: account.password!, password: PASSWORD })).toBe(true);
  });

  it("refuses a second account for the same address", async () => {
    await create("a@example.org", "admin");
    await expect(create("A@example.org", "editor")).rejects.toBeInstanceOf(AdminRuleError);
  });

  it("audits creation without the password", async () => {
    const adminId = await create("a@example.org", "admin");
    await create("b@example.org", "editor", adminId);

    const entries = await db.select().from(auditLogs).where(eq(auditLogs.action, "user.create"));
    expect(entries).toHaveLength(2);
    expect(JSON.stringify(entries)).not.toContain(PASSWORD);
  });
});

describe("role and account rules", () => {
  it("does not let an admin change their own role or disable themselves", async () => {
    const adminId = await create("a@example.org", "admin");
    await expect(changeUserRole(db, { id: adminId }, adminId, "editor")).rejects.toThrow("Kendi rolünüzü");
    await expect(setUserDisabled(db, { id: adminId }, adminId, true)).rejects.toThrow("devre dışı");
  });

  it("always keeps one active administrator", async () => {
    const first = await create("a@example.org", "admin");
    const second = await create("b@example.org", "admin");
    await setUserDisabled(db, { id: first }, second, true);

    // `first` is now the only active admin; a disabled admin cannot act, but
    // the rule must hold for any actor.
    await expect(setUserDisabled(db, { id: second }, first, true)).rejects.toThrow("En az bir etkin yönetici");
    await expect(changeUserRole(db, { id: second }, first, "editor")).rejects.toThrow("En az bir etkin yönetici");
  });

  it("changes a role, ends that user's sessions and audits the change", async () => {
    const adminId = await create("a@example.org", "admin");
    const editorId = await create("e@example.org", "editor");
    await addSession(editorId);

    await changeUserRole(db, { id: adminId, ip: "198.51.100.4" }, editorId, "admin");

    const [user] = await db.select().from(users).where(eq(users.id, editorId));
    expect(user.role).toBe("admin");
    expect(await db.select().from(sessions).where(eq(sessions.userId, editorId))).toHaveLength(0);
    const [entry] = await db.select().from(auditLogs).where(eq(auditLogs.action, "user.role_change"));
    expect(entry).toMatchObject({ actorUserId: adminId, entityId: editorId, ip: "198.51.100.4" });
    expect(entry.metadata).toEqual({ from: "editor", to: "admin" });
  });

  it("disables and re-enables an account; disabling ends its sessions", async () => {
    const adminId = await create("a@example.org", "admin");
    const editorId = await create("e@example.org", "editor");
    await addSession(editorId);

    await setUserDisabled(db, { id: adminId }, editorId, true);
    expect((await listUsers(db)).find((u) => u.id === editorId)).toMatchObject({ activeSessions: 0 });
    expect((await db.select().from(users).where(eq(users.id, editorId)))[0].disabledAt).not.toBeNull();

    await setUserDisabled(db, { id: adminId }, editorId, false);
    expect((await db.select().from(users).where(eq(users.id, editorId)))[0].disabledAt).toBeNull();
  });

  it("resets a password: the old one stops working and sessions end", async () => {
    const adminId = await create("a@example.org", "admin");
    const editorId = await create("e@example.org", "editor");
    await addSession(editorId);

    await setUserPassword(db, { id: adminId }, editorId, "brand new password 456");

    const [account] = await db.select().from(accounts).where(eq(accounts.userId, editorId));
    expect(await verifyPassword({ hash: account.password!, password: PASSWORD })).toBe(false);
    expect(await verifyPassword({ hash: account.password!, password: "brand new password 456" })).toBe(true);
    expect(await db.select().from(sessions).where(eq(sessions.userId, editorId))).toHaveLength(0);
    const entries = await db.select().from(auditLogs).where(eq(auditLogs.action, "user.password_reset"));
    expect(JSON.stringify(entries)).not.toContain("brand new password 456");
  });

  it("signs a user out everywhere", async () => {
    const adminId = await create("a@example.org", "admin");
    await addSession(adminId);
    await addSession(adminId);
    await revokeUserSessions(db, { id: adminId }, adminId);
    expect(await db.select().from(sessions)).toHaveLength(0);
  });

  it("reports whether an administrator exists (first-admin setup guard)", async () => {
    expect(await hasAnyAdmin(db)).toBe(false);
    await create("e@example.org", "editor");
    expect(await hasAnyAdmin(db)).toBe(false);
    await create("a@example.org", "admin");
    expect(await hasAnyAdmin(db)).toBe(true);
  });
});
