import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { addInquiryNote, listInquiries, setInquiryStatus } from "@/admin/inquiries";
import { createUserWithPassword } from "@/admin/users";
import type { Database } from "@/db/client";
import { expertises, inquiries } from "@/db/schema";
import { createTestDb, truncateAll } from "@/db/testing";
import { submitInquiry } from "./submit";

vi.mock("next/cache", () => ({ updateTag: vi.fn() }));

let db: Database;
let close: () => Promise<void>;
let actor: { id: string; ip: string };

beforeAll(async () => {
  ({ db, close } = await createTestDb());
});
afterAll(() => close());
beforeEach(() => truncateAll(db));
afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

function form(overrides: Record<string, string> = {}) {
  const data = new FormData();
  data.set("idempotencyKey", crypto.randomUUID());
  data.set("locale", "fr");
  data.set("type", "contact");
  data.set("fullName", "Marie Dupont");
  data.set("organization", "Atelier");
  data.set("email", "marie@example.org");
  data.set("countryCode", "FR");
  data.set("message", "Nous souhaitons discuter d'un projet hospitalier avec votre équipe.");
  data.set("privacyConsent", "on");
  for (const [key, value] of Object.entries(overrides)) data.set(key, value);
  return data;
}

describe("submitInquiry", () => {
  it("does not insert when validation fails", async () => {
    const result = await submitInquiry(db, { locale: "fr", formData: form({ message: "trop court" }), ip: "192.0.2.1" });
    expect(result.ok).toBe(false);
    expect(await db.select({ id: inquiries.id }).from(inquiries)).toEqual([]);
  });

  it("rejects a filled honeypot without pretending success", async () => {
    const result = await submitInquiry(db, {
      locale: "fr",
      formData: form({ companyUrl: "https://spam.example" }),
      ip: "192.0.2.1",
    });
    expect(result).toMatchObject({ ok: false });
    expect(await db.select({ id: inquiries.id }).from(inquiries)).toEqual([]);
  });

  it("inserts once and replays the same token as success", async () => {
    const data = form();
    const first = await submitInquiry(db, { locale: "fr", formData: data, ip: "192.0.2.1" });
    expect(first.ok).toBe(true);
    const second = await submitInquiry(db, { locale: "fr", formData: data, ip: "192.0.2.1" });
    expect(second).toMatchObject({ ok: true, duplicate: true });
    expect(await db.select({ id: inquiries.id }).from(inquiries)).toHaveLength(1);
  });

  it("keeps the row when notification delivery fails", async () => {
    vi.stubEnv("RESEND_API_KEY", "re_test");
    vi.stubEnv("INQUIRY_NOTIFY_TO", "inbox@example.org");
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => {
        throw new Error("network down");
      }),
    );
    const result = await submitInquiry(db, { locale: "fr", formData: form(), ip: "192.0.2.1" });
    expect(result.ok).toBe(true);
    const [row] = await db.select().from(inquiries);
    expect(row.notifyStatus).toBe("failed");
    expect(row.notifyError).toContain("network down");
  });

  it("enforces the per-email quota", async () => {
    for (let i = 0; i < 5; i += 1) {
      const result = await submitInquiry(db, { locale: "fr", formData: form(), ip: `198.51.100.${i}` });
      expect(result.ok).toBe(true);
    }
    const blocked = await submitInquiry(db, { locale: "fr", formData: form(), ip: "203.0.113.9" });
    expect(blocked).toMatchObject({ ok: false });
    expect(await db.select({ id: inquiries.id }).from(inquiries)).toHaveLength(5);
  });

  it("requires an expertise for a project request", async () => {
    const [expertise] = await db.insert(expertises).values({}).returning({ id: expertises.id });
    const missing = await submitInquiry(db, {
      locale: "fr",
      formData: form({ type: "project_request" }),
      ip: "192.0.2.1",
    });
    expect(missing.ok).toBe(false);

    const ok = await submitInquiry(db, {
      locale: "fr",
      formData: form({ type: "project_request", relatedExpertiseId: expertise.id }),
      ip: "192.0.2.1",
    });
    expect(ok.ok).toBe(true);
  });
});

describe("inquiry panel", () => {
  beforeEach(async () => {
    const id = await createUserWithPassword(
      db,
      { name: "Admin", email: "admin@example.org", role: "admin", password: "admin password 1" },
      null,
    );
    actor = { id, ip: "192.0.2.10" };
  });

  it("updates status and stores an internal note", async () => {
    await submitInquiry(db, { locale: "fr", formData: form(), ip: "192.0.2.1" });
    const { rows } = await listInquiries(db, { page: 1 });
    const id = rows[0].id;
    expect(await setInquiryStatus(db, actor, id, "reviewing")).toBe(true);
    expect(await addInquiryNote(db, actor, id, "Appelé le 16 oct.")).toBe(true);
    const listed = await listInquiries(db, { status: "reviewing", page: 1 });
    expect(listed.rows[0].id).toBe(id);
  });
});
