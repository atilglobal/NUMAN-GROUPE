import { sql } from "drizzle-orm";
import { check, jsonb, pgEnum, pgTable, text, uniqueIndex, uuid } from "drizzle-orm/pg-core";
import {
  id,
  notBlank,
  publication,
  publishedAtCheck,
  slugFormatCheck,
  timestamps,
} from "./common";
import { mediaAssets } from "./media";

export const cmsTemplateEnum = pgEnum("cms_template", ["standard"]);

export const cmsBlockTypes = [
  "hero",
  "richtext",
  "imageText",
  "fullImage",
  "gallery",
  "expertises",
  "projects",
  "visits",
  "team",
  "cta",
] as const;

export type CmsBlockType = (typeof cmsBlockTypes)[number];

export type CmsLayoutBlock = {
  id: string;
  type: CmsBlockType;
  imageAssetId?: string | null;
  imageByLocale?: Partial<Record<"fr" | "en" | "tr", string>>;
  mobileAssetId?: string | null;
  galleryAssetIds?: string[];
  placementContext?: string;
};

export type CmsBlockCopy = {
  title?: string;
  body?: string;
  ctaLabel?: string;
  ctaHref?: string;
  imageAlt?: string;
  imageCaption?: string;
};

export const cmsPages = pgTable(
  "cms_pages",
  {
    id: id(),
    template: cmsTemplateEnum("template").default("standard").notNull(),
    layout: jsonb("layout").$type<CmsLayoutBlock[]>().default([]).notNull(),
    coverAssetId: uuid("cover_asset_id").references(() => mediaAssets.id, { onDelete: "set null" }),
    ...timestamps(),
  },
  (t) => [check("cms_pages_layout_array", sql`jsonb_typeof(${t.layout}) = 'array'`)],
);

export const cmsPageTranslations = pgTable(
  "cms_page_translations",
  {
    id: id(),
    pageId: uuid("page_id")
      .notNull()
      .references(() => cmsPages.id, { onDelete: "cascade" }),
    slug: text("slug").notNull(),
    title: text("title").notNull(),
    summary: text("summary"),
    ogTitle: text("og_title"),
    ogDescription: text("og_description"),
    ogImageAssetId: uuid("og_image_asset_id").references(() => mediaAssets.id, { onDelete: "set null" }),
    blocks: jsonb("blocks").$type<Record<string, CmsBlockCopy>>().default({}).notNull(),
    ...publication(),
    ...timestamps(),
  },
  (t) => [
    uniqueIndex("cms_page_translations_entity_locale").on(t.pageId, t.locale),
    uniqueIndex("cms_page_translations_locale_slug").on(t.locale, t.slug),
    slugFormatCheck("cms_page_translations", t.slug),
    publishedAtCheck("cms_page_translations", t.status, t.publishedAt),
    notBlank("cms_page_translations_title", t.title),
  ],
);
