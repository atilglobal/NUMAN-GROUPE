import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import type { Database } from "@/db/client";
import { cmsPageTranslations } from "@/db/schema";
import { createTestDb, truncateAll } from "@/db/testing";
import { createCmsPage, saveCmsTranslation } from "./cms";
import { setTranslationStatus } from "@/content/publishing";
import { findPublishedCmsPage } from "@/content/queries";
import { eq } from "drizzle-orm";
import { createUserWithPassword } from "./users";

vi.mock("next/cache", () => ({ updateTag: vi.fn() }));

let db: Database;
let close: () => Promise<void>;
let actor: { id: string };

beforeAll(async () => {
  ({ db, close } = await createTestDb());
});
afterAll(() => close());
beforeEach(async () => {
  await truncateAll(db);
  actor = {
    id: await createUserWithPassword(
      db,
      { name: "Editor", email: "editor@example.org", role: "editor", password: "editor password 1" },
      null,
    ),
  };
});

describe("cms pages", () => {
  it("publishes one language without exposing the others", async () => {
    const id = await createCmsPage(db, actor);
    await saveCmsTranslation(db, actor, id, "fr", {
      slug: "le-groupe",
      title: "Le Groupe",
      summary: "Présentation",
      seoTitle: null,
      seoDescription: null,
      ogTitle: null,
      ogDescription: null,
      ogImageAssetId: null,
      blocks: {},
    });
    await setTranslationStatus(db, {
      entity: "cms_page",
      entityId: id,
      locale: "fr",
      status: "published",
      actorUserId: actor.id,
    });

    expect(await findPublishedCmsPage(db, "fr", "le-groupe", { demo: false })).not.toBeNull();
    expect(await findPublishedCmsPage(db, "en", "le-groupe", { demo: false })).toBeNull();
    const en = await db.select().from(cmsPageTranslations).where(eq(cmsPageTranslations.pageId, id));
    expect(en.filter((row) => row.locale === "en")[0]?.status).toBe("draft");
  });
});
