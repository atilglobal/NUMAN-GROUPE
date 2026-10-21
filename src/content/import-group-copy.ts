import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { and, eq } from "drizzle-orm";
import type { Database } from "@/db/client";
import { pageContents, pageContentTranslations, type PageKey } from "@/db/schema";
import { locales } from "@/i18n/config";
import { groupPageCopy } from "./group-copy";

function published() {
  const now = new Date();
  return { status: "published" as const, publishedAt: now };
}

function emptyText(value: string | null | undefined) {
  return !value?.trim();
}

export type GroupImportResult = {
  created: number;
  filled: number;
  skipped: number;
  backupPath: string | null;
};

export async function importGroupCopy(
  db: Database,
  options: { backupDir?: string } = {},
): Promise<GroupImportResult> {
  const existing = await db
    .select({
      key: pageContents.key,
      locale: pageContentTranslations.locale,
      title: pageContentTranslations.title,
      summary: pageContentTranslations.summary,
      body: pageContentTranslations.body,
      seoTitle: pageContentTranslations.seoTitle,
      seoDescription: pageContentTranslations.seoDescription,
    })
    .from(pageContents)
    .leftJoin(pageContentTranslations, eq(pageContentTranslations.pageId, pageContents.id));

  const touched = existing.filter(
    (row) => row.locale && Object.prototype.hasOwnProperty.call(groupPageCopy, row.key) && !emptyText(row.title),
  );

  let backupPath: string | null = null;
  if (touched.length > 0) {
    const dir = options.backupDir ?? path.join(process.cwd(), "docs", "backups");
    await mkdir(dir, { recursive: true });
    backupPath = path.join(dir, `group-pages-${new Date().toISOString().slice(0, 10)}.json`);
    await writeFile(backupPath, `${JSON.stringify(touched, null, 2)}\n`, "utf8");
  }

  let created = 0;
  let filled = 0;
  let skipped = 0;

  await db.transaction(async (tx) => {
    for (const key of Object.keys(groupPageCopy) as PageKey[]) {
      await tx.insert(pageContents).values({ key }).onConflictDoNothing();
      const [page] = await tx.select({ id: pageContents.id }).from(pageContents).where(eq(pageContents.key, key));
      if (!page) continue;
      const copy = groupPageCopy[key];
      if (!copy) continue;

      for (const locale of locales) {
        const text = copy[locale];
        const [row] = await tx
          .select({
            id: pageContentTranslations.id,
            title: pageContentTranslations.title,
            summary: pageContentTranslations.summary,
            body: pageContentTranslations.body,
          })
          .from(pageContentTranslations)
          .where(and(eq(pageContentTranslations.pageId, page.id), eq(pageContentTranslations.locale, locale)));

        if (!row) {
          await tx.insert(pageContentTranslations).values({
            pageId: page.id,
            locale,
            title: text.title,
            summary: text.summary,
            body: text.body,
            seoTitle: text.seoTitle,
            seoDescription: text.seoDescription,
            ...published(),
          });
          created += 1;
          continue;
        }

        if (emptyText(row.title) && emptyText(row.summary) && emptyText(row.body)) {
          await tx
            .update(pageContentTranslations)
            .set({
              title: text.title,
              summary: text.summary,
              body: text.body,
              seoTitle: text.seoTitle,
              seoDescription: text.seoDescription,
              ...published(),
            })
            .where(eq(pageContentTranslations.id, row.id));
          filled += 1;
          continue;
        }

        skipped += 1;
      }
    }
  });

  return { created, filled, skipped, backupPath };
}
