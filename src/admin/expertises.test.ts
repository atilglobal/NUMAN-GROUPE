import { eq } from "drizzle-orm";
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { listExpertises } from "@/content/queries";
import { setTranslationStatus } from "@/content/publishing";
import type { Database } from "@/db/client";
import { auditLogs, expertises, projects } from "@/db/schema";
import { createTestDb, truncateAll } from "@/db/testing";
import {
  createExpertise,
  deleteExpertise,
  getExpertiseForEditor,
  listExpertisesForAdmin,
  saveExpertiseTranslation,
  SlugTakenError,
  updateExpertiseRoot,
} from "./expertises";
import { createUserWithPassword } from "./users";

vi.mock("next/cache", () => ({ updateTag: vi.fn() }));

let db: Database;
let close: () => Promise<void>;
let actor: { id: string; ip: string };

beforeAll(async () => {
  ({ db, close } = await createTestDb());
});
afterAll(() => close());
beforeEach(async () => {
  await truncateAll(db);
  const id = await createUserWithPassword(
    db,
    { name: "Editor", email: "editor@example.org", role: "editor", password: "editor password 1" },
    null,
  );
  actor = { id, ip: "192.0.2.10" };
});

const text = (name: string, slug: string) => ({
  name,
  slug,
  summary: null,
  body: null,
  seoTitle: null,
  seoDescription: null,
});

async function actions() {
  const rows = await db.select().from(auditLogs).where(eq(auditLogs.actorUserId, actor.id));
  return rows.map((row) => row.action).sort();
}

describe("expertise editing", () => {
  it("searches the admin list by name", async () => {
    await createExpertise(db, actor, { sortOrder: 0, locale: "fr", translation: text("Stades", "stades") });
    await createExpertise(db, actor, { sortOrder: 1, locale: "fr", translation: text("Hôpitaux", "hopitaux") });
    const found = await listExpertisesForAdmin(db, { q: "hopit", page: 1 });
    expect(found.rows.map((row) => row.label)).toEqual(["Hôpitaux"]);
    expect(found.total).toBe(1);
  });

  it("creates an entry as an unpublished draft and audits it", async () => {
    const id = await createExpertise(db, actor, { sortOrder: 3, locale: "fr", translation: text("Stades", "stades") });

    const editor = await getExpertiseForEditor(db, id);
    expect(editor).toMatchObject({ sortOrder: 3, isSeed: false });
    expect(editor?.translations.fr).toMatchObject({ name: "Stades", status: "draft" });
    expect(await listExpertises(db, "fr", { demo: false })).toEqual([]);
    expect(await actions()).toEqual(["expertise.create"]);
  });

  it("adds and updates languages independently", async () => {
    const id = await createExpertise(db, actor, { sortOrder: 0, locale: "fr", translation: text("Hôpitaux", "hopitaux") });
    await saveExpertiseTranslation(db, actor, id, "tr", text("Hastaneler", "hastaneler"));
    await saveExpertiseTranslation(db, actor, id, "tr", { ...text("Hastaneler", "hastaneler"), summary: "Kısa" });
    await updateExpertiseRoot(db, actor, id, { sortOrder: 7, coverAssetId: null });

    const editor = await getExpertiseForEditor(db, id);
    expect(editor?.translations.tr?.summary).toBe("Kısa");
    expect(editor?.translations.en).toBeUndefined();
    expect(editor?.sortOrder).toBe(7);
    expect(await actions()).toEqual([
      "expertise.create",
      "expertise.translation_create",
      "expertise.translation_update",
      "expertise.update",
    ]);
  });

  it("keeps a published translation live when it is edited", async () => {
    const id = await createExpertise(db, actor, { sortOrder: 0, locale: "fr", translation: text("Stades", "stades") });
    await setTranslationStatus(db, { entity: "expertise", entityId: id, locale: "fr", status: "published", actorUserId: actor.id });
    await saveExpertiseTranslation(db, actor, id, "fr", text("Stades et arènes", "stades"));

    expect((await listExpertises(db, "fr", { demo: false })).map((e) => e.name)).toEqual(["Stades et arènes"]);
  });

  it("reports a slug already used in the same language as a field error", async () => {
    await createExpertise(db, actor, { sortOrder: 0, locale: "fr", translation: text("Stades", "stades") });
    const other = await createExpertise(db, actor, { sortOrder: 1, locale: "fr", translation: text("Hôpitaux", "hopitaux") });

    await expect(saveExpertiseTranslation(db, actor, other, "fr", text("Doublon", "stades"))).rejects.toBeInstanceOf(SlugTakenError);
    await expect(
      createExpertise(db, actor, { sortOrder: 2, locale: "fr", translation: text("Encore", "stades") }),
    ).rejects.toBeInstanceOf(SlugTakenError);
    // The same slug in another language is allowed.
    await saveExpertiseTranslation(db, actor, other, "en", text("Stadiums", "stades"));
  });

  it("deletes an entry with its translations and audits the name", async () => {
    const id = await createExpertise(db, actor, { sortOrder: 0, locale: "fr", translation: text("Stades", "stades") });
    await deleteExpertise(db, actor, id);

    expect(await db.select().from(expertises)).toEqual([]);
    const [entry] = await db.select().from(auditLogs).where(eq(auditLogs.action, "expertise.delete"));
    expect(entry).toMatchObject({ entityId: id, metadata: { name: "Stades" }, ip: "192.0.2.10" });
  });

  it("unlinks projects instead of deleting them when an expertise is removed", async () => {
    const id = await createExpertise(db, actor, { sortOrder: 0, locale: "fr", translation: text("Stades", "stades") });
    const [project] = await db
      .insert(projects)
      .values({ status: "completed", expertiseId: id })
      .returning({ id: projects.id });

    await deleteExpertise(db, actor, id);

    const [row] = await db.select().from(projects).where(eq(projects.id, project.id));
    expect(row).toMatchObject({ id: project.id, expertiseId: null });
  });

  it("fails cleanly for an entry that no longer exists", async () => {
    const missing = crypto.randomUUID();
    await expect(deleteExpertise(db, actor, missing)).rejects.toThrow("Kayıt bulunamadı.");
    await expect(saveExpertiseTranslation(db, actor, missing, "fr", text("X", "x"))).rejects.toThrow("Kayıt bulunamadı.");
  });
});
