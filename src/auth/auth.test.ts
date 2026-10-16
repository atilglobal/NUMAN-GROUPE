import { eq } from "drizzle-orm";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { createUserWithPassword, setUserDisabled } from "@/admin/users";
import type { Database } from "@/db/client";
import { auditLogs, sessions } from "@/db/schema";
import { createTestDb, truncateAll } from "@/db/testing";
import { createAuth, type Auth } from "./config";
import { LOGIN_BLOCK_MS, MAX_FAILURES_PER_EMAIL } from "./rate-limit";
import { SIGN_IN_ERROR, SIGN_IN_THROTTLED, signInWithPassword } from "./sign-in";

const SECRET = "test-secret-that-is-at-least-32-characters-long";
const PASSWORD = "correct horse battery";

let db: Database;
let close: () => Promise<void>;
let auth: Auth;

beforeAll(async () => {
  ({ db, close } = await createTestDb());
  auth = createAuth(db, [], { BETTER_AUTH_SECRET: SECRET, NODE_ENV: "test" });
});
afterAll(() => close());
beforeEach(() => truncateAll(db));

async function makeUser(email = "Admin@Example.org", role: "admin" | "editor" = "admin") {
  return createUserWithPassword(db, { name: "Test User", email, role, password: PASSWORD }, null);
}

function signIn(email: string, password: string, now?: Date) {
  return signInWithPassword(auth, db, { email, password, ip: "203.0.113.9", headers: new Headers() }, now);
}

/** Signs in through Better Auth and returns the Cookie header a browser would send back. */
async function browserSession(email: string): Promise<{ cookie: string; setCookie: string }> {
  const { headers } = await auth.api.signInEmail({
    body: { email, password: PASSWORD },
    returnHeaders: true,
  });
  const setCookie = headers.get("set-cookie") ?? "";
  return { cookie: setCookie.split(";")[0], setCookie };
}

describe("sign-in", () => {
  it("signs in with the right password, case-insensitively, and audits it", async () => {
    const userId = await makeUser();

    const result = await signIn("  admin@EXAMPLE.org ", PASSWORD);

    expect(result).toEqual({ ok: true, userId });
    expect(await db.select().from(sessions).where(eq(sessions.userId, userId))).toHaveLength(1);
    const [entry] = await db.select().from(auditLogs).where(eq(auditLogs.action, "auth.sign_in"));
    expect(entry).toMatchObject({ actorUserId: userId, ip: "203.0.113.9" });
  });

  it("gives the same answer for a wrong password, an unknown address and a disabled account", async () => {
    const adminId = await makeUser();
    const editorId = await makeUser("editor@example.org", "editor");
    await setUserDisabled(db, { id: adminId }, editorId, true);

    const wrongPassword = await signIn("admin@example.org", "wrong password here");
    const unknown = await signIn("nobody@example.org", PASSWORD);
    const disabled = await signIn("editor@example.org", PASSWORD);

    for (const result of [wrongPassword, unknown, disabled]) {
      expect(result).toEqual({ ok: false, error: SIGN_IN_ERROR });
    }
    expect(await db.select().from(sessions)).toHaveLength(0);
  });

  it("never writes the address or password to the audit log", async () => {
    await makeUser();
    await signIn("admin@example.org", "wrong password here");
    await signIn("admin@example.org", PASSWORD);

    const serialized = JSON.stringify(await db.select().from(auditLogs));
    expect(serialized).not.toContain("admin@example.org");
    expect(serialized).not.toContain("wrong password here");
    expect(serialized).not.toContain(PASSWORD);
  });

  it("blocks an address after repeated failures, even with the right password, until the block ends", async () => {
    await makeUser();
    const start = new Date("2026-01-01T10:00:00Z");

    for (let attempt = 0; attempt < MAX_FAILURES_PER_EMAIL; attempt++) {
      expect((await signIn("admin@example.org", "wrong password here", start)).ok).toBe(false);
    }

    expect(await signIn("admin@example.org", PASSWORD, start)).toEqual({ ok: false, error: SIGN_IN_THROTTLED });
    expect(await db.select().from(sessions)).toHaveLength(0);

    const later = new Date(start.getTime() + LOGIN_BLOCK_MS + 1000);
    expect((await signIn("admin@example.org", PASSWORD, later)).ok).toBe(true);
  });

  it("throttles unknown addresses the same way, so throttling reveals nothing", async () => {
    const now = new Date("2026-01-01T10:00:00Z");
    for (let attempt = 0; attempt < MAX_FAILURES_PER_EMAIL; attempt++) {
      await signIn("ghost@example.org", "whatever password", now);
    }
    expect(await signIn("ghost@example.org", "whatever password", now)).toEqual({
      ok: false,
      error: SIGN_IN_THROTTLED,
    });
  });

  it("does not offer public sign-up", async () => {
    await expect(
      auth.api.signUpEmail({ body: { name: "Intruder", email: "new@example.org", password: PASSWORD } }),
    ).rejects.toThrow();
  });
});

describe("session cookie and sign-out", () => {
  it("sets an httpOnly, SameSite=Lax cookie with a 12 hour lifetime", async () => {
    await makeUser();
    const { setCookie } = await browserSession("admin@example.org");

    expect(setCookie).toMatch(/HttpOnly/i);
    expect(setCookie).toMatch(/SameSite=Lax/i);
    expect(setCookie).toMatch(/Max-Age=43200/i);
  });

  it("marks the cookie Secure in production", async () => {
    await makeUser();
    const prodAuth = createAuth(db, [], { BETTER_AUTH_SECRET: SECRET, NODE_ENV: "production" });
    const { headers } = await prodAuth.api.signInEmail({
      body: { email: "admin@example.org", password: PASSWORD },
      returnHeaders: true,
    });
    const setCookie = headers.get("set-cookie") ?? "";
    expect(setCookie).toMatch(/^__Secure-/);
    expect(setCookie).toMatch(/; Secure/i);
  });

  it("ends the session on sign-out", async () => {
    await makeUser();
    const { cookie } = await browserSession("admin@example.org");
    const headers = new Headers({ cookie });

    expect(await auth.api.getSession({ headers })).not.toBeNull();
    await auth.api.signOut({ headers });
    expect(await auth.api.getSession({ headers })).toBeNull();
    expect(await db.select().from(sessions)).toHaveLength(0);
  });

  it("ends a disabled user's open sessions immediately", async () => {
    const adminId = await makeUser();
    const editorId = await makeUser("editor@example.org", "editor");
    const { cookie } = await browserSession("editor@example.org");
    const headers = new Headers({ cookie });
    expect(await auth.api.getSession({ headers })).not.toBeNull();

    await setUserDisabled(db, { id: adminId }, editorId, true);

    expect(await auth.api.getSession({ headers })).toBeNull();
  });

  it("rejects a forged session cookie", async () => {
    const headers = new Headers({ cookie: "better-auth.session_token=forged.value" });
    expect(await auth.api.getSession({ headers })).toBeNull();
  });
});
