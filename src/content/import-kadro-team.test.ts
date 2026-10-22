import { mkdir, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import sharp from "sharp";
import { eq } from "drizzle-orm";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import type { Database } from "@/db/client";
import { mediaAssets, teamMembers, teamMemberTranslations } from "@/db/schema";
import { createTestDb, truncateAll } from "@/db/testing";
import { readObject } from "@/media/storage";
import { KADRO_ROSTER } from "./kadro-roster";
import { importKadroTeam } from "./import-kadro-team";

let db: Database;
let close: () => Promise<void>;

beforeAll(async () => {
  ({ db, close } = await createTestDb());
});
afterAll(() => close());
beforeEach(() => truncateAll(db));

async function writePhotos() {
  const dir = path.join(tmpdir(), `kadro-media-${crypto.randomUUID()}`);
  await mkdir(dir, { recursive: true });
  for (const member of KADRO_ROSTER) {
    const image = sharp({ create: { width: 16, height: 20, channels: 3, background: "#123456" } });
    const bytes = member.photo.endsWith(".png") ? await image.png().toBuffer() : await image.jpeg({ quality: 80 }).toBuffer();
    await writeFile(path.join(dir, member.photo), bytes);
  }
  return dir;
}

describe("importKadroTeam", () => {
  it("creates missing people once and fills empty fields on existing records", async () => {
    const dir = await writePhotos();
    const backupDir = await mkdir(path.join(tmpdir(), `kadro-backup-${crypto.randomUUID()}`), { recursive: true });
    const [existing] = await db
      .insert(teamMembers)
      .values({ fullName: "M. NUMAN HATIPOGLU", sortOrder: 1, isVisible: true })
      .returning({ id: teamMembers.id });
    await db.insert(teamMemberTranslations).values({
      memberId: existing.id,
      locale: "fr",
      roleTitle: "Unvan elle yazıldı",
      bio: "Biographie existante.",
      status: "published",
      publishedAt: new Date(),
    });

    const first = await importKadroTeam(db, { mediaDir: dir, backupDir });
    expect(first.created).toBeGreaterThan(0);
    expect(first.mediaCreated).toBe(11);

    const people = await db.select({ fullName: teamMembers.fullName, isDemo: teamMembers.isDemo }).from(teamMembers);
    expect(people).toHaveLength(11);
    expect(people.filter((row) => row.fullName === "M. NUMAN HATIPOGLU")).toHaveLength(1);
    expect(people.some((row) => row.fullName === "Numan Hatipoglu")).toBe(false);

    const [kept] = await db
      .select({ roleTitle: teamMemberTranslations.roleTitle, bio: teamMemberTranslations.bio, summary: teamMemberTranslations.summary })
      .from(teamMemberTranslations)
      .where(eq(teamMemberTranslations.memberId, existing.id));
    expect(kept?.roleTitle).toBe("Unvan elle yazıldı");
    expect(kept?.bio).toBe("Biographie existante.");
    expect(kept?.summary).toBeTruthy();

    const [photo] = await db.select().from(mediaAssets).where(eq(mediaAssets.originalFilename, "kadro-team/image1.jpeg"));
    const stored = await readObject(photo!.storageKey, db);
    expect(stored?.length).toBe(photo!.byteSize);

    const second = await importKadroTeam(db, { mediaDir: dir, backupDir });
    expect(second.mediaCreated).toBe(0);
    expect(second.mediaReused).toBe(11);
    expect((await db.select({ id: teamMembers.id }).from(teamMembers)).length).toBe(11);
  });
});
