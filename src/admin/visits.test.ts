import { asc, eq } from "drizzle-orm";
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { findDetail, listVisits } from "@/content/queries";
import { setTranslationStatus } from "@/content/publishing";
import type { Database } from "@/db/client";
import { mediaAssets, officialVisitGallery } from "@/db/schema";
import { createTestDb, truncateAll } from "@/db/testing";
import { createUserWithPassword } from "./users";
import { createVisit, deleteVisit, getVisitForEditor, updateVisitRoot } from "./visits";

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
  title: "Rencontre institutionnelle",
  slug: "rencontre-institutionnelle",
  summary: "Présentation du groupe.",
  body: null,
  hostInstitution: "Institution (exemple)",
  location: "Paris",
  seoTitle: null,
  seoDescription: null,
};

const root = {
  visitedOn: "2024-11-18",
  countryCode: "FR",
  isFeatured: true,
  coverAssetId: null,
  gallery: [] as string[],
  participants: [{ fullName: "Personne A", roleFr: "Directeur", roleEn: null, roleTr: null }],
};

async function image(storageKey: string) {
  const [row] = await db
    .insert(mediaAssets)
    .values({ storageKey, mimeType: "image/jpeg", byteSize: 10 })
    .returning({ id: mediaAssets.id });
  return row.id;
}

describe("visit editing", () => {
  it("publishes a draft only after an explicit status change", async () => {
    const id = await createVisit(db, actor, { root, locale: "fr", translation });
    expect(await listVisits(db, "fr", { demo: false })).toEqual([]);

    await setTranslationStatus(db, {
      entity: "visit",
      entityId: id,
      locale: "fr",
      status: "published",
      actorUserId: actor.id,
    });

    expect((await listVisits(db, "fr", { demo: false })).map((item) => item.slug)).toEqual([
      "rencontre-institutionnelle",
    ]);
    expect(await findDetail(db, "visits", "fr", "rencontre-institutionnelle", { demo: false })).toMatchObject({
      title: "Rencontre institutionnelle",
      facts: { kind: "visit", host: "Institution (exemple)", place: "Paris, France", countryCode: "FR" },
    });
  });

  it("stores featured flag, gallery order and participants", async () => {
    const a = await image("a.jpg");
    const b = await image("b.jpg");
    const id = await createVisit(db, actor, { root, locale: "fr", translation });
    await updateVisitRoot(db, actor, id, {
      ...root,
      isFeatured: false,
      coverAssetId: a,
      gallery: [b, a],
      participants: [
        { fullName: "Personne A", roleFr: "Directeur", roleEn: "Director", roleTr: null },
        { fullName: "Personne B", roleFr: null, roleEn: null, roleTr: null },
      ],
    });

    const editor = await getVisitForEditor(db, id);
    expect(editor).toMatchObject({ isFeatured: false, coverAssetId: a, gallery: [b, a] });
    expect(editor?.participants.map((person) => person.fullName)).toEqual(["Personne A", "Personne B"]);
    const gallery = await db
      .select({ assetId: officialVisitGallery.assetId, sortOrder: officialVisitGallery.sortOrder })
      .from(officialVisitGallery)
      .where(eq(officialVisitGallery.visitId, id))
      .orderBy(asc(officialVisitGallery.sortOrder));
    expect(gallery).toEqual([
      { assetId: b, sortOrder: 0 },
      { assetId: a, sortOrder: 1 },
    ]);
  });

  it("deletes the visit and its gallery", async () => {
    const a = await image("cover.jpg");
    const id = await createVisit(db, actor, { root: { ...root, gallery: [a] }, locale: "fr", translation });
    await deleteVisit(db, actor, id);
    expect(await db.select().from(officialVisitGallery)).toEqual([]);
  });
});
