import { and, eq } from "drizzle-orm";
import type { Database } from "../db/client";
import {
  pageContents,
  pageContentTranslations,
  type PageKey,
  type PublicationStatus,
} from "../db/schema";
import { locales, type Locale } from "../i18n/config";
import { writeAudit } from "./audit";
import { AdminRuleError } from "./users";
import type { PageTranslationInput } from "./validation";

type Actor = { id: string; ip?: string | null };

export type PageListRow = {
  id: string;
  key: PageKey;
  title: string | null;
  states: Record<Locale, PublicationStatus | "missing">;
};

export async function listPagesForAdmin(db: Database): Promise<PageListRow[]> {
  const [roots, rows] = await Promise.all([
    db.select({ id: pageContents.id, key: pageContents.key }).from(pageContents),
    db
      .select({
        pageId: pageContentTranslations.pageId,
        locale: pageContentTranslations.locale,
        status: pageContentTranslations.status,
        title: pageContentTranslations.title,
      })
      .from(pageContentTranslations),
  ]);
  const order: PageKey[] = [
    "about",
    "mission",
    "approach",
    "quality",
    "certificates",
    "contact",
    "privacy",
    "legal",
    "cookies",
  ];
  return roots
    .map((root) => {
      const own = rows.filter((row) => row.pageId === root.id);
      const states = Object.fromEntries(
        locales.map((locale) => [locale, own.find((row) => row.locale === locale)?.status ?? "missing"]),
      ) as PageListRow["states"];
      const fr = own.find((row) => row.locale === "fr");
      return { ...root, title: fr?.title ?? own[0]?.title ?? null, states };
    })
    .sort((a, b) => order.indexOf(a.key) - order.indexOf(b.key));
}

export type PageEditor = {
  id: string;
  key: PageKey;
  translations: Partial<
    Record<
      Locale,
      PageTranslationInput & { locale: Locale; status: PublicationStatus; publishedAt: Date | null; updatedAt: Date }
    >
  >;
};

export async function getPageForEditor(db: Database, id: string): Promise<PageEditor | null> {
  const [root] = await db.select().from(pageContents).where(eq(pageContents.id, id));
  if (!root) return null;
  const rows = await db.select().from(pageContentTranslations).where(eq(pageContentTranslations.pageId, id));
  const translations: PageEditor["translations"] = {};
  for (const row of rows) {
    translations[row.locale] = {
      locale: row.locale,
      title: row.title,
      summary: row.summary,
      body: row.body,
      seoTitle: row.seoTitle,
      seoDescription: row.seoDescription,
      status: row.status,
      publishedAt: row.publishedAt,
      updatedAt: row.updatedAt,
    };
  }
  return { id: root.id, key: root.key, translations };
}

export async function savePageTranslation(
  db: Database,
  actor: Actor,
  id: string,
  locale: Locale,
  input: PageTranslationInput,
): Promise<void> {
  await db.transaction(async (tx) => {
    const [root] = await tx.select({ id: pageContents.id }).from(pageContents).where(eq(pageContents.id, id));
    if (!root) throw new AdminRuleError("Kayıt bulunamadı.");
    const [existing] = await tx
      .select({ id: pageContentTranslations.id })
      .from(pageContentTranslations)
      .where(and(eq(pageContentTranslations.pageId, id), eq(pageContentTranslations.locale, locale)));
    if (existing) {
      await tx.update(pageContentTranslations).set(input).where(eq(pageContentTranslations.id, existing.id));
    } else {
      await tx.insert(pageContentTranslations).values({ pageId: id, locale, ...input });
    }
    await writeAudit(tx, {
      actorUserId: actor.id,
      action: existing ? "page.translation_update" : "page.translation_create",
      entityType: "page",
      entityId: id,
      metadata: { locale },
      ip: actor.ip,
    });
  });
}
