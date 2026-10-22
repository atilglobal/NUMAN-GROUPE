import { mkdir, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import sharp from "sharp";
import { eq } from "drizzle-orm";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import type { Database } from "@/db/client";
import { mediaAssets, officialVisitTranslations, officialVisits } from "@/db/schema";
import { createTestDb, truncateAll } from "@/db/testing";
import { readObject } from "@/media/storage";
import { ALFA_EXPECTED_PHOTO_FILES, ALFA_VISITS } from "./alfa-visits";
import { importAlfaVisits } from "./import-alfa-visits";

let db: Database;
let close: () => Promise<void>;

beforeAll(async () => {
  ({ db, close } = await createTestDb());
});
afterAll(() => close());
beforeEach(() => truncateAll(db));

async function writeSourcePhotos() {
  const dir = path.join(tmpdir(), `alfa-media-${crypto.randomUUID()}`);
  await mkdir(dir, { recursive: true });
  const jpeg = await sharp({ create: { width: 12, height: 16, channels: 3, background: "#123456" } })
    .jpeg({ quality: 80 })
    .toBuffer();
  for (const file of ALFA_EXPECTED_PHOTO_FILES) {
    await writeFile(path.join(dir, file), jpeg);
  }
  return { dir, jpeg };
}

describe("importAlfaVisits", () => {
  it("imports photographs without re-encoding and is idempotent", { timeout: 20000 }, async () => {
    const { dir, jpeg } = await writeSourcePhotos();
    const first = await importAlfaVisits(db, { mediaDir: dir });
    expect(first.mediaCreated).toBe(41);
    expect(first.visitsCreated).toBe(ALFA_VISITS.length);
    expect(first.hqImported).toBe(true);
    expect(first.verifiedBytes).toBe(jpeg.length * 41);

    const [asset] = await db.select().from(mediaAssets).where(eq(mediaAssets.originalFilename, "alfa-visits/image1.jpeg"));
    expect(asset).toBeTruthy();
    const stored = await readObject(asset!.storageKey, db);
    expect(stored && Buffer.from(stored).equals(jpeg)).toBe(true);
    expect(asset!.byteSize).toBe(jpeg.length);
    expect(asset!.width).toBe(12);
    expect(asset!.height).toBe(16);

    const published = await db
      .select({ status: officialVisitTranslations.status })
      .from(officialVisitTranslations)
      .where(eq(officialVisitTranslations.slug, "rencontre-babalaye-ndaou"));
    expect(published.every((row) => row.status === "draft")).toBe(true);

    const dated = await db.select({ visitedOn: officialVisits.visitedOn }).from(officialVisits);
    expect(dated.every((row) => row.visitedOn === null)).toBe(true);

    const second = await importAlfaVisits(db, { mediaDir: dir });
    expect(second.mediaCreated).toBe(0);
    expect(second.mediaReused).toBe(41);
    expect(second.visitsCreated).toBe(0);
    expect(second.visitsSkipped).toBe(ALFA_VISITS.length);

    const visits = await db.select({ id: officialVisits.id }).from(officialVisits);
    expect(visits).toHaveLength(ALFA_VISITS.length);
  });

  it("does not overwrite a hand-edited French title", async () => {
    const { dir } = await writeSourcePhotos();
    await importAlfaVisits(db, { mediaDir: dir });
    await db
      .update(officialVisitTranslations)
      .set({ title: "Titre édité à la main" })
      .where(eq(officialVisitTranslations.slug, "bamako-premier-ministre-choguelle-maiga"));
    await importAlfaVisits(db, { mediaDir: dir });
    const [row] = await db
      .select({ title: officialVisitTranslations.title })
      .from(officialVisitTranslations)
      .where(eq(officialVisitTranslations.slug, "bamako-premier-ministre-choguelle-maiga"));
    expect(row?.title).toBe("Titre édité à la main");
  });
});
