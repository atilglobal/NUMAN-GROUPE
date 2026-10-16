import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { createProject, saveProjectTranslation } from "@/admin/projects";
import { createUserWithPassword } from "@/admin/users";
import { findDetail } from "@/content/queries";
import { setTranslationStatus } from "@/content/publishing";
import { resolveSlugRedirect } from "@/content/slug-redirects";
import type { Database } from "@/db/client";
import { createTestDb, truncateAll } from "@/db/testing";

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
  city: null,
  seoTitle: null,
  seoDescription: null,
  technicalDetails: [],
};

const root = {
  status: "in_progress" as const,
  expertiseId: null,
  countryCode: null,
  startedOn: null,
  completedOn: null,
  videoUrl: null,
  progressPercent: null,
  isFeatured: false,
  sortOrder: 1,
  coverAssetId: null,
  gallery: [] as string[],
};

describe("slug redirects", () => {
  it("points the previous slug at the current published URL", async () => {
    const id = await createProject(db, actor, { root, locale: "fr", translation });
    await setTranslationStatus(db, {
      entity: "project",
      entityId: id,
      locale: "fr",
      status: "published",
      actorUserId: actor.id,
    });
    await saveProjectTranslation(db, actor, id, "fr", { ...translation, slug: "stade-renove" });

    expect(await findDetail(db, "projects", "fr", "stade-national", { demo: false })).toBeNull();
    expect(await findDetail(db, "projects", "fr", "stade-renove", { demo: false })).toMatchObject({
      title: "Stade national",
    });
    expect(await resolveSlugRedirect(db, "projects", "fr", "stade-national", { demo: false })).toBe(
      "/fr/projets/stade-renove",
    );
  });

  it("does not redirect a draft after the slug changes", async () => {
    const id = await createProject(db, actor, { root, locale: "fr", translation });
    await saveProjectTranslation(db, actor, id, "fr", { ...translation, slug: "stade-renove" });
    expect(await resolveSlugRedirect(db, "projects", "fr", "stade-national", { demo: false })).toBeNull();
  });
});
