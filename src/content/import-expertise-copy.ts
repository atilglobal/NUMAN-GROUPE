import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { and, eq } from "drizzle-orm";
import type { Database } from "@/db/client";
import { expertises, expertiseTranslations, mediaAssetTranslations } from "@/db/schema";
import { locales, type Locale } from "@/i18n/config";
import { findExpertiseCopy } from "./expertise-copy";
import { refreshPublicContent } from "./revalidate";

function emptyText(value: string | null | undefined) {
  return !value?.trim();
}

export type ExpertiseImportResult = {
  filled: number;
  skipped: number;
  altsFilled: number;
  backupPath: string | null;
  publishedTouched: boolean;
};

export async function importExpertiseCopy(
  db: Database,
  options: { backupDir?: string; revalidate?: boolean } = {},
): Promise<ExpertiseImportResult> {
  const roots = await db
    .select({
      id: expertises.id,
      coverAssetId: expertises.coverAssetId,
      isDemo: expertises.isDemo,
    })
    .from(expertises);

  const translations = await db
    .select({
      id: expertiseTranslations.id,
      expertiseId: expertiseTranslations.expertiseId,
      locale: expertiseTranslations.locale,
      slug: expertiseTranslations.slug,
      name: expertiseTranslations.name,
      summary: expertiseTranslations.summary,
      body: expertiseTranslations.body,
      seoTitle: expertiseTranslations.seoTitle,
      seoDescription: expertiseTranslations.seoDescription,
      status: expertiseTranslations.status,
    })
    .from(expertiseTranslations);

  const byRoot = new Map<string, typeof translations>();
  for (const row of translations) {
    const list = byRoot.get(row.expertiseId) ?? [];
    list.push(row);
    byRoot.set(row.expertiseId, list);
  }

  const matched: {
    root: (typeof roots)[number];
    rows: typeof translations;
    copy: NonNullable<ReturnType<typeof findExpertiseCopy>>;
  }[] = [];

  for (const root of roots) {
    if (root.isDemo) continue;
    const rows = byRoot.get(root.id) ?? [];
    const copy = findExpertiseCopy(rows.map((row) => row.slug));
    if (!copy) continue;
    matched.push({ root, rows, copy });
  }

  const touched = matched.flatMap(({ rows }) =>
    rows.filter((row) => !emptyText(row.body) || !emptyText(row.seoTitle) || !emptyText(row.seoDescription)),
  );

  let backupPath: string | null = null;
  if (touched.length > 0) {
    const dir = options.backupDir ?? path.join(process.cwd(), "docs", "backups");
    await mkdir(dir, { recursive: true });
    backupPath = path.join(dir, `expertise-copy-${new Date().toISOString().slice(0, 10)}.json`);
    await writeFile(backupPath, `${JSON.stringify(touched, null, 2)}\n`, "utf8");
  }

  let filled = 0;
  let skipped = 0;
  let altsFilled = 0;
  let publishedTouched = false;

  await db.transaction(async (tx) => {
    for (const { root, rows, copy } of matched) {
      for (const locale of locales) {
        const text = copy.locales[locale];
        const row = rows.find((item) => item.locale === locale);
        if (!row) {
          skipped += 1;
          continue;
        }

        const patch: {
          body?: string;
          seoTitle?: string;
          seoDescription?: string;
        } = {};
        if (emptyText(row.body)) patch.body = text.body;
        const brandedSeo = `${row.name} | NUMAN GROUPE`;
        if (emptyText(row.seoTitle) || row.seoTitle === brandedSeo) patch.seoTitle = text.seoTitle;
        if (emptyText(row.seoDescription)) patch.seoDescription = text.seoDescription;

        if (Object.keys(patch).length === 0) {
          skipped += 1;
        } else {
          await tx.update(expertiseTranslations).set(patch).where(eq(expertiseTranslations.id, row.id));
          filled += 1;
          if (row.status === "published") publishedTouched = true;
        }

        if (root.coverAssetId) {
          const [alt] = await tx
            .select({ alt: mediaAssetTranslations.alt })
            .from(mediaAssetTranslations)
            .where(
              and(eq(mediaAssetTranslations.assetId, root.coverAssetId), eq(mediaAssetTranslations.locale, locale as Locale)),
            );
          if (!alt) {
            await tx.insert(mediaAssetTranslations).values({
              assetId: root.coverAssetId,
              locale,
              alt: text.coverAlt,
            });
            altsFilled += 1;
          }
        }
      }
    }
  });

  if (options.revalidate !== false && publishedTouched) {
    try {
      refreshPublicContent("expertise");
      refreshPublicContent("media");
    } catch {
      // Scripts outside Next still persist the rows; the next request rebuilds cache.
    }
  }

  return { filled, skipped, altsFilled, backupPath, publishedTouched };
}
