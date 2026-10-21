import { eq } from "drizzle-orm";
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import type { Database } from "@/db/client";
import { auditLogs, mediaAssets, mediaAssetTranslations, projects, projectTranslations } from "@/db/schema";
import { createTestDb, truncateAll } from "@/db/testing";
import { getMissingAltText, getTranslationCoverage, incompleteRows } from "./coverage";
import { setTranslationStatus, TranslationNotFoundError } from "./publishing";
import { listProjects } from "./queries";

const { updateTag } = vi.hoisted(() => ({ updateTag: vi.fn() }));
vi.mock("next/cache", () => ({ updateTag }));

let db: Database;
let close: () => Promise<void>;

beforeAll(async () => {
  ({ db, close } = await createTestDb());
});
afterAll(() => close());
beforeEach(async () => {
  await truncateAll(db);
  updateTag.mockClear();
});

async function draftProject() {
  const [project] = await db.insert(projects).values({ status: "in_progress" }).returning({ id: projects.id });
  await db.insert(projectTranslations).values([
    { projectId: project.id, locale: "fr", slug: "stade", title: "Stade" },
    { projectId: project.id, locale: "en", slug: "stadium", title: "Stadium" },
  ]);
  return project.id;
}

describe("setTranslationStatus", () => {
  it("publishes one language only, audits it and refreshes the public cache", async () => {
    const id = await draftProject();

    await setTranslationStatus(db, {
      entity: "project",
      entityId: id,
      locale: "fr",
      status: "published",
      actorUserId: null,
    });

    expect((await listProjects(db, "fr", { demo: false })).map((p) => p.title)).toEqual(["Stade"]);
    expect(await listProjects(db, "en", { demo: false })).toEqual([]);

    const [translation] = await db
      .select({ publishedAt: projectTranslations.publishedAt })
      .from(projectTranslations)
      .where(eq(projectTranslations.slug, "stade"));
    expect(translation.publishedAt).toBeInstanceOf(Date);

    const logs = await db.select().from(auditLogs);
    expect(logs).toHaveLength(1);
    expect(logs[0]).toMatchObject({
      action: "project.publish",
      entityType: "project",
      entityId: id,
      metadata: { locale: "fr" },
    });

    expect(updateTag).toHaveBeenCalledWith("content:projects:v2");
    expect(updateTag).toHaveBeenCalledWith("content:media:v2");
  });

  it("unpublishes back to draft and removes the entry from public reads", async () => {
    const id = await draftProject();
    const base = { entity: "project" as const, entityId: id, locale: "fr" as const, actorUserId: null };
    await setTranslationStatus(db, { ...base, status: "published" });
    await setTranslationStatus(db, { ...base, status: "draft" });

    expect(await listProjects(db, "fr", { demo: false })).toEqual([]);
    const actions = (await db.select({ action: auditLogs.action }).from(auditLogs)).map((r) => r.action);
    expect(actions.sort()).toEqual(["project.publish", "project.unpublish"]);
  });

  it("refuses a language that has no translation, without auditing or refreshing", async () => {
    const id = await draftProject();

    await expect(
      setTranslationStatus(db, {
        entity: "project",
        entityId: id,
        locale: "tr",
        status: "published",
        actorUserId: null,
      }),
    ).rejects.toBeInstanceOf(TranslationNotFoundError);

    expect(await db.select().from(auditLogs)).toEqual([]);
    expect(updateTag).not.toHaveBeenCalled();
  });
});

describe("translation coverage", () => {
  it("reports published, draft and missing languages per entry", async () => {
    const id = await draftProject();
    await setTranslationStatus(db, {
      entity: "project",
      entityId: id,
      locale: "fr",
      status: "published",
      actorUserId: null,
    });

    const rows = await getTranslationCoverage(db);
    const row = rows.find((r) => r.id === id);
    expect(row).toMatchObject({
      entity: "project",
      label: "Stade",
      locales: { fr: "published", en: "draft", tr: "missing" },
    });
    expect(incompleteRows(rows).map((r) => r.id)).toContain(id);
  });

  it("lists images whose alt text is missing in some languages", async () => {
    const [asset] = await db
      .insert(mediaAssets)
      .values({ storageKey: "a.jpg", mimeType: "image/jpeg", byteSize: 1 })
      .returning({ id: mediaAssets.id });
    await db.insert(mediaAssetTranslations).values({ assetId: asset.id, locale: "fr", alt: "Façade" });

    expect(await getMissingAltText(db)).toEqual([
      { id: asset.id, storageKey: "a.jpg", isDemo: false, missing: ["en", "tr"] },
    ]);
  });
});
