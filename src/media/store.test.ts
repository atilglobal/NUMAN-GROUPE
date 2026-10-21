import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import type { Database } from "@/db/client";
import { expertises } from "@/db/schema";
import { createTestDb, truncateAll } from "@/db/testing";
import { deleteMediaAsset, MediaUploadError, saveUploadedImage, upsertMediaCopy } from "./store";
import { mediaAssetTranslations } from "@/db/schema";
import { eq } from "drizzle-orm";
import { listMediaUsage } from "./usage";

vi.mock("next/cache", () => ({ updateTag: vi.fn() }));

let db: Database;
let close: () => Promise<void>;
let dir: string;

beforeAll(async () => {
  ({ db, close } = await createTestDb());
});
afterAll(() => close());
beforeEach(async () => {
  await truncateAll(db);
  dir = await mkdtemp(path.join(tmpdir(), "numan-media-"));
  vi.stubEnv("MEDIA_STORAGE_DIR", dir);
});
afterEach(async () => {
  vi.unstubAllEnvs();
  await rm(dir, { recursive: true, force: true });
});

function pngFile(name: string, type = "image/png") {
  const buffer = Buffer.alloc(24);
  buffer[0] = 0x89;
  buffer[1] = 0x50;
  buffer[2] = 0x4e;
  buffer[3] = 0x47;
  buffer.writeUInt32BE(32, 16);
  buffer.writeUInt32BE(24, 20);
  return new File([buffer], name, { type });
}

describe("media library", () => {
  it("stores a sniffed PNG under a random key", async () => {
    const id = await saveUploadedImage(db, {
      file: pngFile("Cover.PNG"),
      alts: { fr: "Couverture" },
      actorUserId: null,
    });
    expect(id).toMatch(/^[0-9a-f-]{36}$/i);
  });

  it("rejects SVG even when the filename says png", async () => {
    const svg = new File(
      [Buffer.from('<?xml version="1.0"?><svg xmlns="http://www.w3.org/2000/svg"></svg>')],
      "icon.png",
      { type: "image/png" },
    );
    await expect(saveUploadedImage(db, { file: svg, alts: { fr: "Icone" }, actorUserId: null })).rejects.toBeInstanceOf(
      MediaUploadError,
    );
  });

  it("adds a missing locale alt without wiping the others", async () => {
    const id = await saveUploadedImage(db, {
      file: pngFile("cover.png"),
      alts: { fr: "Couverture" },
      actorUserId: null,
    });
    await upsertMediaCopy(db, [{ id, alts: { en: "Cover" }, captions: { fr: "Légende" } }]);
    const rows = await db
      .select()
      .from(mediaAssetTranslations)
      .where(eq(mediaAssetTranslations.assetId, id));
    expect(rows.find((row) => row.locale === "fr")).toMatchObject({ alt: "Couverture", caption: "Légende" });
    expect(rows.find((row) => row.locale === "en")).toMatchObject({ alt: "Cover" });
  });

  it("reports usage and allows a forced-style delete that clears the cover", async () => {
    const id = await saveUploadedImage(db, {
      file: pngFile("cover.png"),
      alts: { fr: "Couverture" },
      actorUserId: null,
    });
    await db.insert(expertises).values({ coverAssetId: id });
    const usages = await listMediaUsage(db, id);
    expect(usages.some((row) => row.kind === "Uzmanlık kapağı")).toBe(true);
    await deleteMediaAsset(db, id);
    const [expertise] = await db.select().from(expertises);
    expect(expertise.coverAssetId).toBeNull();
    expect(await listMediaUsage(db, id)).toEqual([]);
  });
});
