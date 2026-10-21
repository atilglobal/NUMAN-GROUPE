import { mkdtemp, readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { eq } from "drizzle-orm";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import type { Database } from "@/db/client";
import { pageContents, pageContentTranslations } from "@/db/schema";
import { createTestDb, truncateAll } from "@/db/testing";
import { seedBase } from "@/db/seed/run";
import { groupPageCopy } from "./group-copy";
import { importGroupCopy } from "./import-group-copy";

let db: Database;
let close: () => Promise<void>;

beforeAll(async () => {
  ({ db, close } = await createTestDb());
});
afterAll(() => close());
beforeEach(() => truncateAll(db));

describe("importGroupCopy", () => {
  it("fills empty slots once and skips existing titles on rerun", async () => {
    await seedBase(db);
    const backupDir = await mkdtemp(path.join(tmpdir(), "group-copy-"));

    const first = await importGroupCopy(db, { backupDir });
    expect(first.created).toBe(Object.keys(groupPageCopy).length * 3);
    expect(first.filled).toBe(0);
    expect(first.skipped).toBe(0);
    expect(first.backupPath).toBeNull();

    const second = await importGroupCopy(db, { backupDir });
    expect(second.created).toBe(0);
    expect(second.filled).toBe(0);
    expect(second.skipped).toBe(first.created);
    expect(second.backupPath).toBeTruthy();
    const backup = JSON.parse(await readFile(second.backupPath!, "utf8")) as { title: string }[];
    expect(backup.length).toBeGreaterThan(0);
    expect(backup[0]?.title).toBeTruthy();
  });

  it("does not overwrite a hand-edited translation", async () => {
    await seedBase(db);
    const [about] = await db.select().from(pageContents).where(eq(pageContents.key, "about"));
    await db.insert(pageContentTranslations).values({
      pageId: about!.id,
      locale: "fr",
      title: "Texte édité",
      summary: "Résumé existant",
      body: "Corps existant",
      status: "published",
      publishedAt: new Date(),
    });

    const backupDir = await mkdtemp(path.join(tmpdir(), "group-copy-"));
    const result = await importGroupCopy(db, { backupDir });
    expect(result.skipped).toBe(1);
    expect(result.created).toBe(Object.keys(groupPageCopy).length * 3 - 1);
    expect(result.backupPath).toBeTruthy();

    const [row] = await db
      .select()
      .from(pageContentTranslations)
      .where(eq(pageContentTranslations.pageId, about!.id));
    expect(row?.title).toBe("Texte édité");
    expect(row?.body).toBe("Corps existant");
  });
});
