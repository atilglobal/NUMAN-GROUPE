import { verifyPassword } from "better-auth/crypto";
import { count, eq } from "drizzle-orm";
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { createUserWithPassword } from "@/admin/users";
import type { Database } from "@/db/client";
import * as migrate from "@/db/migrate";
import { accounts, setupState, users } from "@/db/schema";
import { createTestDb, truncateAll } from "@/db/testing";
import { ADMIN_EXISTS, GENERIC_DENIED, GENERIC_KEY, completeSetup, publicSetupView, readSetupStatus } from "./run";

const KEY = "test-setup-key-16";
const env = {
  SETUP_KEY: KEY,
  DATABASE_URL: "postgres://user:pass@db.example:5432/numan",
  VERCEL_ENV: "production",
};

const valid = {
  setupKey: KEY,
  username: "admin",
  email: "ops@example.org",
  password: "ChosenPass9",
  confirmPassword: "ChosenPass9",
};

let db: Database;
let close: () => Promise<void>;

beforeAll(async () => {
  ({ db, close } = await createTestDb());
});
afterAll(() => close());
beforeEach(() => truncateAll(db));

async function adminCount() {
  const [row] = await db.select({ total: count() }).from(users).where(eq(users.role, "admin"));
  return Number(row?.total ?? 0);
}

describe("completeSetup", () => {
  it("does not migrate or create an admin when the key is missing or wrong", async () => {
    const missing = await completeSetup(db, valid, {
      ip: "1.1.1.1",
      env: { ...env, SETUP_KEY: undefined },
      skipMigrate: true,
    });
    expect(missing).toEqual({ ok: false, message: GENERIC_DENIED });
    expect(await adminCount()).toBe(0);

    const wrong = await completeSetup(db, { ...valid, setupKey: "wrong-setup-key-16" }, { ip: "1.1.1.1", env, skipMigrate: true });
    expect(wrong).toEqual({ ok: false, message: GENERIC_KEY });
    expect(await adminCount()).toBe(0);
    const [lock] = await db.select().from(setupState);
    expect(lock?.completedAt ?? null).toBeNull();
  });

  it("prepares the schema path and creates the first admin when the key is correct", async () => {
    const result = await completeSetup(db, valid, { ip: "2.2.2.2", env, skipMigrate: true });
    expect(result).toEqual({ ok: true, loginEmail: "admin@panel.local" });
    expect(await adminCount()).toBe(1);

    const [user] = await db.select().from(users).where(eq(users.email, "admin@panel.local"));
    expect(user.role).toBe("admin");
    expect(user.name).toBe("admin");
    const [account] = await db.select().from(accounts).where(eq(accounts.userId, user.id));
    expect(await verifyPassword({ hash: account.password!, password: valid.password })).toBe(true);
    expect(account.password).not.toContain(valid.password);

    const [lock] = await db.select().from(setupState).where(eq(setupState.id, 1));
    expect(lock.completedAt).toBeTruthy();
    expect(lock.completedByUserId).toBe(user.id);
  });

  it("does not add or change an admin when one already exists", async () => {
    const id = await createUserWithPassword(
      db,
      { name: "Existing", email: "keep@example.org", role: "admin", password: "KeepThisPass1" },
      null,
    );
    const result = await completeSetup(db, valid, { ip: "3.3.3.3", env, skipMigrate: true });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.message).toBe(ADMIN_EXISTS);
    expect(await adminCount()).toBe(1);
    const [user] = await db.select().from(users).where(eq(users.id, id));
    expect(user.email).toBe("keep@example.org");
    const [account] = await db.select().from(accounts).where(eq(accounts.userId, id));
    expect(await verifyPassword({ hash: account.password!, password: "KeepThisPass1" })).toBe(true);
  });

  it("creates only one administrator under concurrent requests", async () => {
    const [a, b] = await Promise.all([
      completeSetup(db, valid, { ip: "4.4.4.4", env, skipMigrate: true }),
      completeSetup(
        db,
        { ...valid, username: "chief", email: "chief@example.org" },
        { ip: "5.5.5.5", env, skipMigrate: true },
      ),
    ]);
    const oks = [a, b].filter((row) => row.ok);
    expect(oks).toHaveLength(1);
    expect(await adminCount()).toBe(1);
  });

  it("does not report success when migration fails and allows a later retry", async () => {
    const spy = vi
      .spyOn(migrate, "applyReviewedMigrations")
      .mockRejectedValueOnce(new Error("relation failed postgres://user:secret@db.example:5432/numan"));
    const failed = await completeSetup(db, valid, { ip: "6.6.6.6", env, skipMigrate: false });
    spy.mockRestore();
    expect(failed.ok).toBe(false);
    if (!failed.ok) {
      expect(failed.message).toMatch(/Veritabanı hazırlığı/);
      expect(failed.message).not.toContain("secret");
      expect(failed.message).not.toContain("postgres://");
    }
    expect(await adminCount()).toBe(0);

    const retry = await completeSetup(db, valid, { ip: "6.6.6.6", env, skipMigrate: true });
    expect(retry.ok).toBe(true);
    expect(await adminCount()).toBe(1);
  });

  it("refuses a direct call after setup is complete", async () => {
    await completeSetup(db, valid, { ip: "7.7.7.7", env, skipMigrate: true });
    const again = await completeSetup(
      db,
      { ...valid, username: "other", email: "other@example.org", password: "OtherPass99", confirmPassword: "OtherPass99" },
      { ip: "7.7.7.7", env, skipMigrate: true },
    );
    expect(again.ok).toBe(false);
    if (!again.ok) expect(again.message).toBe(ADMIN_EXISTS);
    expect(await adminCount()).toBe(1);
    expect(await readSetupStatus(db)).toEqual({ kind: "locked" });
  });

  it("keeps the lock after a simulated restart (same database)", async () => {
    await completeSetup(db, valid, { ip: "8.8.8.8", env, skipMigrate: true });
    expect(await publicSetupView(db, env)).toEqual({ kind: "locked" });
    expect(await publicSetupView(db, { ...env, SETUP_KEY: "rotated-setup-key-1" })).toEqual({ kind: "locked" });
  });

  it("closes Preview even with a valid key", async () => {
    const preview = { ...env, VERCEL_ENV: "preview" };
    expect(await publicSetupView(db, preview)).toEqual({ kind: "closed" });
    const result = await completeSetup(db, valid, { ip: "9.9.9.9", env: preview, skipMigrate: true });
    expect(result).toEqual({ ok: false, message: GENERIC_DENIED });
    expect(await adminCount()).toBe(0);
  });

  it("rejects invalid fields without writing an admin", async () => {
    const result = await completeSetup(
      db,
      { ...valid, username: "ab", confirmPassword: "mismatch" },
      { ip: "10.10.10.10", env, skipMigrate: true },
    );
    expect(result.ok).toBe(false);
    expect(await adminCount()).toBe(0);
    expect(await readSetupStatus(db)).toEqual({ kind: "open" });
  });
});
