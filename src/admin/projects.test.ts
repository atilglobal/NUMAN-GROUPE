import { asc, eq } from "drizzle-orm";
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { findDetail, listProjects } from "@/content/queries";
import { setTranslationStatus } from "@/content/publishing";
import type { Database } from "@/db/client";
import { mediaAssets, projectGallery } from "@/db/schema";
import { createTestDb, truncateAll } from "@/db/testing";
import { createProject, deleteProject, getProjectForEditor, updateProjectRoot } from "./projects";
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

const translation = {
  title: "Stade national",
  slug: "stade-national",
  summary: "Résumé",
  body: null,
  city: "Dakar",
  seoTitle: null,
  seoDescription: null,
  technicalDetails: [{ label: "Capacité", value: "50 000" }],
};

const root = {
  status: "in_progress" as const,
  expertiseId: null,
  countryCode: "SN",
  startedOn: "2024-01-01",
  completedOn: null,
  videoUrl: null,
  progressPercent: null,
  isFeatured: true,
  sortOrder: 1,
  coverAssetId: null,
  gallery: [] as string[],
};

async function image(storageKey: string) {
  const [row] = await db
    .insert(mediaAssets)
    .values({ storageKey, mimeType: "image/jpeg", byteSize: 10 })
    .returning({ id: mediaAssets.id });
  return row.id;
}

describe("project editing", () => {
  it("publishes a draft only after an explicit status change", async () => {
    const id = await createProject(db, actor, { root, locale: "fr", translation });
    expect(await listProjects(db, "fr", { demo: false })).toEqual([]);

    await setTranslationStatus(db, {
      entity: "project",
      entityId: id,
      locale: "fr",
      status: "published",
      actorUserId: actor.id,
    });

    expect((await listProjects(db, "fr", { demo: false })).map((item) => item.slug)).toEqual(["stade-national"]);
    expect(await findDetail(db, "projects", "fr", "stade-national", { demo: false })).toMatchObject({
      title: "Stade national",
      facts: { progressPercent: null, place: "Dakar, Sénégal" },
    });
  });

  it("stores a verified progress figure and gallery order", async () => {
    const a = await image("a.jpg");
    const b = await image("b.jpg");
    const id = await createProject(db, actor, { root, locale: "fr", translation });
    await updateProjectRoot(db, actor, id, {
      ...root,
      progressPercent: 42,
      isFeatured: false,
      coverAssetId: a,
      gallery: [b, a],
    });

    const editor = await getProjectForEditor(db, id);
    expect(editor).toMatchObject({ progressPercent: 42, isFeatured: false, coverAssetId: a, gallery: [b, a] });
    const gallery = await db
      .select({ assetId: projectGallery.assetId, sortOrder: projectGallery.sortOrder })
      .from(projectGallery)
      .where(eq(projectGallery.projectId, id))
      .orderBy(asc(projectGallery.sortOrder));
    expect(gallery).toEqual([
      { assetId: b, sortOrder: 0 },
      { assetId: a, sortOrder: 1 },
    ]);
  });

  it("deletes the project and its gallery", async () => {
    const a = await image("cover.jpg");
    const id = await createProject(db, actor, { root: { ...root, gallery: [a] }, locale: "fr", translation });
    await deleteProject(db, actor, id);
    expect(await db.select().from(projectGallery)).toEqual([]);
  });
});
