import { eq } from "drizzle-orm";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import type { Database } from "../client";
import {
  expertises,
  expertiseTranslations,
  mediaAssets,
  officialVisits,
  pageContents,
  pageContentTranslations,
  projects,
  siteSettings,
  teamMembers,
} from "../schema";
import { createTestDb, truncateAll } from "../testing";
import { clearDemo, DemoContentDisabledError, seedBase, seedDemo } from "./run";

let db: Database;
let close: () => Promise<void>;

beforeAll(async () => {
  ({ db, close } = await createTestDb());
});
afterAll(() => close());
beforeEach(() => truncateAll(db));

const dev = { NODE_ENV: "development" };

describe("base seed", () => {
  it("creates the four expertises in three languages and nothing demo", async () => {
    await seedBase(db);

    expect(await db.select().from(expertises)).toHaveLength(4);
    expect(await db.select().from(expertiseTranslations)).toHaveLength(12);
    expect(await db.select().from(expertises).where(eq(expertises.isDemo, true))).toEqual([]);
    expect(await db.select().from(projects)).toEqual([]);
    expect(await db.select().from(officialVisits)).toEqual([]);
    expect(await db.select().from(teamMembers)).toEqual([]);
    expect(await db.select().from(mediaAssets)).toEqual([]);
  });

  it("creates page slots without inventing their text, and an empty settings row", async () => {
    await seedBase(db);

    expect(await db.select().from(pageContents)).toHaveLength(9);
    expect(await db.select().from(pageContentTranslations)).toEqual([]);
    const [settings] = await db.select().from(siteSettings);
    expect(settings).toMatchObject({ companyName: null, contactEmail: null, contactPhone: null });
  });

  it("is idempotent", async () => {
    await seedBase(db);
    const second = await seedBase(db);

    expect(second.expertisesCreated).toBe(0);
    expect(await db.select().from(expertises)).toHaveLength(4);
  });
});

describe("demo seed", () => {
  it("is refused whenever demo content is disabled", async () => {
    await seedBase(db);

    await expect(seedDemo(db, { SITE_ENV: "production", ALLOW_DEMO_CONTENT: "true" })).rejects.toBeInstanceOf(
      DemoContentDisabledError,
    );
    await expect(seedDemo(db, { ALLOW_DEMO_CONTENT: "false" })).rejects.toBeInstanceOf(
      DemoContentDisabledError,
    );
    expect(await db.select().from(projects)).toEqual([]);
  });

  it("flags every row it creates as demo and can run twice", async () => {
    await seedBase(db);
    await seedDemo(db, dev);
    await seedDemo(db, dev);

    const allProjects = await db.select().from(projects);
    expect(allProjects).toHaveLength(4);
    expect(allProjects.every((p) => p.isDemo)).toBe(true);
    expect((await db.select().from(officialVisits)).every((v) => v.isDemo)).toBe(true);
    expect((await db.select().from(teamMembers)).every((m) => m.isDemo)).toBe(true);
    expect((await db.select().from(mediaAssets)).every((a) => a.isDemo)).toBe(true);
  });

  it("is removed completely by clearDemo, leaving the base data intact", async () => {
    await seedBase(db);
    await seedDemo(db, dev);
    await clearDemo(db);

    expect(await db.select().from(projects)).toEqual([]);
    expect(await db.select().from(officialVisits)).toEqual([]);
    expect(await db.select().from(teamMembers)).toEqual([]);
    expect(await db.select().from(mediaAssets)).toEqual([]);

    const remaining = await db.select().from(expertises);
    expect(remaining).toHaveLength(4);
    expect(remaining.every((e) => e.coverAssetId === null)).toBe(true);
    const [settings] = await db.select().from(siteSettings);
    expect(settings.heroImageAssetId).toBeNull();
  });
});
