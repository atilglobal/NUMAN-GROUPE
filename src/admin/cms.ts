import { and, eq } from "drizzle-orm";
import type { Database } from "@/db/client";
import {
  cmsPages,
  cmsPageTranslations,
  cmsBlockTypes,
  type CmsBlockCopy,
  type CmsLayoutBlock,
  type PublicationStatus,
} from "@/db/schema";
import { locales, type Locale } from "@/i18n/config";
import { isReservedCmsSlug } from "@/i18n/cms-slugs";
import { rememberSlugChange } from "@/content/slug-redirects";
import { writeAudit } from "./audit";
import { AdminRuleError } from "./users";
import { requireImageIds } from "@/media/store";

type Actor = { id: string; ip?: string | null };

export type CmsListRow = {
  id: string;
  title: string;
  states: Record<Locale, PublicationStatus | "missing">;
};

export async function listCmsPages(db: Database): Promise<CmsListRow[]> {
  const [roots, rows] = await Promise.all([
    db.select({ id: cmsPages.id }).from(cmsPages),
    db.select().from(cmsPageTranslations),
  ]);
  return roots.map((root) => {
    const own = rows.filter((row) => row.pageId === root.id);
    const states = Object.fromEntries(
      locales.map((locale) => [locale, own.find((row) => row.locale === locale)?.status ?? "missing"]),
    ) as CmsListRow["states"];
    const title = own.find((row) => row.locale === "fr")?.title ?? own[0]?.title ?? "Adsız sayfa";
    return { id: root.id, title, states };
  });
}

export type CmsEditor = {
  id: string;
  template: string;
  layout: CmsLayoutBlock[];
  coverAssetId: string | null;
  translations: Partial<
    Record<
      Locale,
      {
        slug: string;
        title: string;
        summary: string | null;
        seoTitle: string | null;
        seoDescription: string | null;
        ogTitle: string | null;
        ogDescription: string | null;
        ogImageAssetId: string | null;
        blocks: Record<string, CmsBlockCopy>;
        status: PublicationStatus;
      }
    >
  >;
};

export async function getCmsEditor(db: Database, id: string): Promise<CmsEditor | null> {
  const [root] = await db.select().from(cmsPages).where(eq(cmsPages.id, id));
  if (!root) return null;
  const rows = await db.select().from(cmsPageTranslations).where(eq(cmsPageTranslations.pageId, id));
  const translations: CmsEditor["translations"] = {};
  for (const row of rows) {
    translations[row.locale] = {
      slug: row.slug,
      title: row.title,
      summary: row.summary,
      seoTitle: row.seoTitle,
      seoDescription: row.seoDescription,
      ogTitle: row.ogTitle,
      ogDescription: row.ogDescription,
      ogImageAssetId: row.ogImageAssetId,
      blocks: row.blocks ?? {},
      status: row.status,
    };
  }
  return {
    id: root.id,
    template: root.template,
    layout: root.layout ?? [],
    coverAssetId: root.coverAssetId,
    translations,
  };
}

function parseLayout(raw: unknown): CmsLayoutBlock[] {
  if (!Array.isArray(raw)) throw new AdminRuleError("Sayfa yerleşimi geçersiz.");
  return raw.map((item, index) => {
    if (!item || typeof item !== "object") throw new AdminRuleError("Blok geçersiz.");
    const block = item as CmsLayoutBlock;
    if (!block.id || typeof block.id !== "string") throw new AdminRuleError(`Blok ${index + 1} kimliği yok.`);
    if (!cmsBlockTypes.includes(block.type)) throw new AdminRuleError("Desteklenmeyen blok türü.");
    return {
      id: block.id,
      type: block.type,
      imageAssetId: block.imageAssetId ?? null,
      imageByLocale: block.imageByLocale,
      mobileAssetId: block.mobileAssetId ?? null,
      galleryAssetIds: block.galleryAssetIds ?? [],
      placementContext: block.placementContext ?? `cms:${block.id}`,
    };
  });
}

export async function createCmsPage(db: Database, actor: Actor): Promise<string> {
  const id = crypto.randomUUID();
  const slugBase = `page-${id.slice(0, 8)}`;
  await db.transaction(async (tx) => {
    await tx.insert(cmsPages).values({ id, layout: [] });
    await tx.insert(cmsPageTranslations).values(
      locales.map((locale) => ({
        pageId: id,
        locale,
        slug: `${slugBase}-${locale}`,
        title: "Nouvelle page",
        status: "draft" as const,
        blocks: {},
      })),
    );
    await writeAudit(tx, {
      actorUserId: actor.id,
      action: "cms_page.create",
      entityType: "cms_page",
      entityId: id,
      ip: actor.ip,
    });
  });
  return id;
}

export async function saveCmsLayout(
  db: Database,
  actor: Actor,
  id: string,
  layoutRaw: unknown,
  coverAssetId: string | null,
): Promise<void> {
  const layout = parseLayout(layoutRaw);
  const mediaIds = [
    coverAssetId,
    ...layout.flatMap((block) => [
      block.imageAssetId ?? null,
      block.mobileAssetId ?? null,
      ...(block.galleryAssetIds ?? []),
      ...Object.values(block.imageByLocale ?? {}),
    ]),
  ].filter((value): value is string => Boolean(value));
  await requireImageIds(db, mediaIds);
  const [root] = await db.select({ id: cmsPages.id }).from(cmsPages).where(eq(cmsPages.id, id));
  if (!root) throw new AdminRuleError("Sayfa bulunamadı.");
  await db.update(cmsPages).set({ layout, coverAssetId }).where(eq(cmsPages.id, id));
  await writeAudit(db, {
    actorUserId: actor.id,
    action: "cms_page.layout",
    entityType: "cms_page",
    entityId: id,
    ip: actor.ip,
  });
}

export async function saveCmsTranslation(
  db: Database,
  actor: Actor,
  id: string,
  locale: Locale,
  input: {
    slug: string;
    title: string;
    summary: string | null;
    seoTitle: string | null;
    seoDescription: string | null;
    ogTitle: string | null;
    ogDescription: string | null;
    ogImageAssetId: string | null;
    blocks: Record<string, CmsBlockCopy>;
  },
): Promise<void> {
  if (isReservedCmsSlug(locale, input.slug)) {
    throw new AdminRuleError("Bu bağlantı adı sistem rotasıyla çakışıyor.");
  }
  if (input.ogImageAssetId) await requireImageIds(db, [input.ogImageAssetId]);
  const [existing] = await db
    .select()
    .from(cmsPageTranslations)
    .where(and(eq(cmsPageTranslations.pageId, id), eq(cmsPageTranslations.locale, locale)));

  await db.transaction(async (tx) => {
    if (existing) {
      await rememberSlugChange(tx, {
        locale,
        section: "cms",
        entityId: id,
        previous: existing.slug,
        next: input.slug,
      });
      await tx
        .update(cmsPageTranslations)
        .set({
          slug: input.slug,
          title: input.title,
          summary: input.summary,
          seoTitle: input.seoTitle,
          seoDescription: input.seoDescription,
          ogTitle: input.ogTitle,
          ogDescription: input.ogDescription,
          ogImageAssetId: input.ogImageAssetId,
          blocks: input.blocks,
        })
        .where(and(eq(cmsPageTranslations.pageId, id), eq(cmsPageTranslations.locale, locale)));
    } else {
      await tx.insert(cmsPageTranslations).values({
        pageId: id,
        locale,
        ...input,
        status: "draft",
      });
    }
    await writeAudit(tx, {
      actorUserId: actor.id,
      action: existing ? "cms_page.translation_update" : "cms_page.translation_create",
      entityType: "cms_page",
      entityId: id,
      metadata: { locale },
      ip: actor.ip,
    });
  });
}

export function assertCmsPublishable(
  layout: CmsLayoutBlock[],
  copy: Record<string, CmsBlockCopy>,
  title: string,
  slug: string,
): void {
  if (!title.trim() || !slug.trim()) throw new AdminRuleError("Yayımlamak için başlık ve bağlantı adı gerekir.");
  for (const block of layout) {
    const texts = copy[block.id] ?? {};
    if (block.type === "hero" || block.type === "richtext" || block.type === "imageText" || block.type === "cta") {
      if (!texts.title?.trim() && !texts.body?.trim()) {
        throw new AdminRuleError("Metin gerektiren bloklar boşken yayımlanamaz.");
      }
    }
  }
}

export async function deleteCmsPage(db: Database, actor: Actor, id: string): Promise<void> {
  const [root] = await db.select({ id: cmsPages.id }).from(cmsPages).where(eq(cmsPages.id, id));
  if (!root) throw new AdminRuleError("Sayfa bulunamadı.");
  await db.delete(cmsPages).where(eq(cmsPages.id, id));
  await writeAudit(db, {
    actorUserId: actor.id,
    action: "cms_page.delete",
    entityType: "cms_page",
    entityId: id,
    ip: actor.ip,
  });
}
