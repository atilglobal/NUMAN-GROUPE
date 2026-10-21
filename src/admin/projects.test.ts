import { asc, eq } from "drizzle-orm";
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { findDetail, listProjects } from "@/content/queries";
import { setTranslationStatus } from "@/content/publishing";
import type { Database } from "@/db/client";
import { mediaAssets, projectGallery, projectTranslations } from "@/db/schema";
import { createTestDb, truncateAll } from "@/db/testing";
import {
  SlugTakenError,
  assertProjectLocalePublishable,
  createProject,
  deleteProject,
  getProjectForEditor,
  saveProjectTranslation,
  updateProjectRoot,
} from "./projects";
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
  seoTitle: null,
  seoDescription: null,
};

const root = {
  status: "planned" as const,
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

async function publish(id: string, locale: "fr" | "en" | "tr" = "fr") {
  await setTranslationStatus(db, {
    entity: "project",
    entityId: id,
    locale,
    status: "published",
    actorUserId: actor.id,
  });
}

describe("project editing", () => {
  it("creates a project without country or expertise and publishes a planned one", async () => {
    const id = await createProject(db, actor, { root, locale: "fr", translation });
    expect(await listProjects(db, "fr", { demo: false })).toEqual([]);

    const editor = await getProjectForEditor(db, id);
    expect(editor).toMatchObject({ status: "planned", expertiseId: null, countryCode: null });

    await publish(id);
    expect((await listProjects(db, "fr", { demo: false })).map((item) => item.slug)).toEqual(["stade-national"]);
    expect(await findDetail(db, "projects", "fr", "stade-national", { demo: false })).toMatchObject({
      title: "Stade national",
      facts: { kind: "project", status: "planned" },
    });
  });

  it("round-trips the three showcase statuses and keeps gallery order", async () => {
    const a = await image("a.jpg");
    const b = await image("b.jpg");
    const id = await createProject(db, actor, { root, locale: "fr", translation });

    for (const status of ["in_progress", "completed", "planned"] as const) {
      await updateProjectRoot(db, actor, id, {
        ...root,
        status,
        isFeatured: false,
        coverAssetId: a,
        gallery: [b, a],
      });
      expect((await getProjectForEditor(db, id))?.status).toBe(status);
    }

    const editor = await getProjectForEditor(db, id);
    expect(editor).toMatchObject({ isFeatured: false, coverAssetId: a, gallery: [b, a] });
    const gallery = await db
      .select({ assetId: projectGallery.assetId, sortOrder: projectGallery.sortOrder })
      .from(projectGallery)
      .where(eq(projectGallery.projectId, id))
      .orderBy(asc(projectGallery.sortOrder));
    expect(gallery).toEqual([
      { assetId: b, sortOrder: 0 },
      { assetId: a, sortOrder: 1 },
    ]);

    await publish(id);
    const detail = await findDetail(db, "projects", "fr", "stade-national", { demo: false });
    expect(detail?.image?.assetId).toBe(a);
    expect(detail?.gallery.map((item) => item.assetId)).toEqual([b, a]);
  });

  it("creates a French draft from title only and generates a unique slug", async () => {
    const first = await createProject(db, actor, {
      root,
      locale: "fr",
      translation: { title: "Stade d'été", slug: "", summary: null, body: null, seoTitle: null, seoDescription: null },
    });
    const second = await createProject(db, actor, {
      root,
      locale: "fr",
      translation: { title: "Stade d'été", slug: "", summary: null, body: null, seoTitle: null, seoDescription: null },
    });

    const firstEditor = await getProjectForEditor(db, first);
    const secondEditor = await getProjectForEditor(db, second);
    expect(firstEditor?.translations.fr).toMatchObject({ title: "Stade d'été", slug: "stade-d-ete", status: "draft" });
    expect(secondEditor?.translations.fr).toMatchObject({ slug: "stade-d-ete-2", status: "draft" });
    expect(firstEditor?.translations.en).toBeUndefined();
    expect(firstEditor?.translations.tr).toBeUndefined();
    expect(await listProjects(db, "fr", { demo: false })).toEqual([]);
  });

  it("saves EN and TR separately and publishes only the requested locale", async () => {
    const id = await createProject(db, actor, {
      root,
      locale: "fr",
      translation: { title: "Stade", slug: "", summary: null, body: null, seoTitle: null, seoDescription: null },
    });
    await saveProjectTranslation(db, actor, id, "en", {
      title: "Stadium",
      slug: "",
      summary: null,
      body: null,
      seoTitle: null,
      seoDescription: null,
    });
    await saveProjectTranslation(db, actor, id, "tr", {
      title: "Stadyum",
      slug: "",
      summary: null,
      body: null,
      seoTitle: null,
      seoDescription: null,
    });

    await publish(id, "fr");
    expect((await listProjects(db, "fr", { demo: false })).map((item) => item.slug)).toEqual(["stade"]);
    expect(await listProjects(db, "en", { demo: false })).toEqual([]);
    expect(await listProjects(db, "tr", { demo: false })).toEqual([]);

    await publish(id, "en");
    expect((await listProjects(db, "en", { demo: false })).map((item) => item.slug)).toEqual(["stadium"]);
    expect(await findDetail(db, "projects", "en", "stadium", { demo: false })).toMatchObject({ title: "Stadium" });
    expect(await findDetail(db, "projects", "tr", "stadyum", { demo: false })).toBeNull();

    const editor = await getProjectForEditor(db, id);
    expect(editor?.translations.fr?.status).toBe("published");
    expect(editor?.translations.en?.status).toBe("published");
    expect(editor?.translations.tr?.status).toBe("draft");
  });

  it("rejects a taken slug and publish of a missing locale", async () => {
    await createProject(db, actor, { root, locale: "fr", translation });
    await expect(createProject(db, actor, { root, locale: "fr", translation })).rejects.toBeInstanceOf(SlugTakenError);

    const other = await createProject(db, actor, {
      root,
      locale: "fr",
      translation: { ...translation, slug: "autre-stade" },
    });
    await expect(assertProjectLocalePublishable(db, other, "en")).rejects.toThrow("Önce bu dildeki içeriği kaydedin.");
    await expect(assertProjectLocalePublishable(db, other, "fr")).resolves.toBeUndefined();
  });

  it("does not overwrite another language when saving a translation", async () => {
    const id = await createProject(db, actor, { root, locale: "fr", translation });
    await saveProjectTranslation(db, actor, id, "en", {
      title: "National stadium",
      slug: "national-stadium",
      summary: "Summary",
      body: null,
      seoTitle: null,
      seoDescription: null,
    });
    await saveProjectTranslation(db, actor, id, "tr", {
      title: "Ulusal stadyum",
      slug: "ulusal-stadyum",
      summary: "Özet",
      body: null,
      seoTitle: null,
      seoDescription: null,
    });

    const rows = await db.select().from(projectTranslations).where(eq(projectTranslations.projectId, id));
    expect(rows.find((row) => row.locale === "fr")?.title).toBe("Stade national");
    expect(rows.find((row) => row.locale === "en")?.title).toBe("National stadium");
    expect(rows.find((row) => row.locale === "tr")?.title).toBe("Ulusal stadyum");
  });

  it("deletes the project and its gallery", async () => {
    const a = await image("cover.jpg");
    const id = await createProject(db, actor, { root: { ...root, gallery: [a] }, locale: "fr", translation });
    await deleteProject(db, actor, id);
    expect(await db.select().from(projectGallery)).toEqual([]);
  });
});
