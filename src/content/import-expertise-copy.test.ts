import { mkdtemp } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { and, eq } from "drizzle-orm";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import type { Database } from "@/db/client";
import { expertises, expertiseTranslations } from "@/db/schema";
import { createTestDb, truncateAll } from "@/db/testing";
import { seedBase } from "@/db/seed/run";
import { introMarkdown, wordCount } from "./expertise-body";
import { expertiseDetailCopy } from "./expertise-copy";
import { importExpertiseCopy } from "./import-expertise-copy";

let db: Database;
let close: () => Promise<void>;

beforeAll(async () => {
  ({ db, close } = await createTestDb());
});
afterAll(() => close());
beforeEach(() => truncateAll(db));

describe("expertise detail copy", () => {
  it("keeps matching slugs and 300–450-word intros in every language", () => {
    expect(expertiseDetailCopy).toHaveLength(4);
    for (const pack of expertiseDetailCopy) {
      for (const locale of ["fr", "en", "tr"] as const) {
        const copy = pack.locales[locale];
        expect(copy.seoTitle.length).toBeGreaterThan(0);
        expect(copy.seoTitle.length).toBeLessThanOrEqual(70);
        expect(copy.seoDescription.length).toBeGreaterThan(0);
        expect(copy.seoDescription.length).toBeLessThanOrEqual(200);
        const words = wordCount(introMarkdown(copy.body));
        expect(words).toBeGreaterThanOrEqual(300);
        expect(words).toBeLessThanOrEqual(450);
        expect(copy.body).toMatch(/^## /m);
      }
    }
  });
});

describe("importExpertiseCopy", () => {
  it("fills empty body and SEO once without changing slugs, names or status", async () => {
    await seedBase(db);
    const backupDir = await mkdtemp(path.join(tmpdir(), "expertise-copy-"));

    const first = await importExpertiseCopy(db, { backupDir, revalidate: false });
    expect(first.filled).toBe(12);
    expect(first.skipped).toBe(0);

    const [stades] = await db
      .select()
      .from(expertiseTranslations)
      .where(and(eq(expertiseTranslations.locale, "fr"), eq(expertiseTranslations.slug, "stades")));
    expect(stades?.name).toBe("Stades");
    expect(stades?.status).toBe("published");
    expect(stades?.body?.startsWith("Les enceintes sportives")).toBe(true);
    expect(stades?.seoTitle).toBe("Stades et enceintes sportives");

    const second = await importExpertiseCopy(db, { backupDir, revalidate: false });
    expect(second.filled).toBe(0);
    expect(second.skipped).toBe(12);
    expect(second.backupPath).toBeTruthy();
  });

  it("does not overwrite a hand-edited body", async () => {
    await seedBase(db);
    await db
      .update(expertiseTranslations)
      .set({ body: "Texte édité à la main.", seoTitle: "Titre édité", seoDescription: "Description éditée." })
      .where(and(eq(expertiseTranslations.locale, "fr"), eq(expertiseTranslations.slug, "stades")));

    const backupDir = await mkdtemp(path.join(tmpdir(), "expertise-copy-"));
    const result = await importExpertiseCopy(db, { backupDir, revalidate: false });
    expect(result.filled).toBe(11);
    expect(result.skipped).toBe(1);

    const [stades] = await db
      .select()
      .from(expertiseTranslations)
      .where(and(eq(expertiseTranslations.locale, "fr"), eq(expertiseTranslations.slug, "stades")));
    expect(stades?.body).toBe("Texte édité à la main.");
    expect(stades?.seoTitle).toBe("Titre édité");
    expect(stades?.seoDescription).toBe("Description éditée.");
  });

  it("does not create a fifth expertise", async () => {
    await seedBase(db);
    await importExpertiseCopy(db, { revalidate: false });
    const roots = await db.select({ id: expertises.id }).from(expertises);
    expect(roots).toHaveLength(4);
  });
});
