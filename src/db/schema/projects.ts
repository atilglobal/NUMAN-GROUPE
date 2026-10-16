import { sql } from "drizzle-orm";
import {
  boolean,
  char,
  check,
  date,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  primaryKey,
  smallint,
  text,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import {
  countryCodeCheck,
  httpsUrl,
  id,
  notBlank,
  publication,
  publishedAtCheck,
  slugFormatCheck,
  timestamps,
} from "./common";
import { expertises } from "./expertises";
import { mediaAssets } from "./media";

/** Construction progress of the work itself, independent of publication. */
export const projectStatusEnum = pgEnum("project_status", ["in_progress", "completed"]);

export type ProjectStatus = (typeof projectStatusEnum.enumValues)[number];

/** Optional label/value pairs; rows with an empty label or value are never shown publicly. */
export type TechnicalDetail = { label: string; value: string };

export const projects = pgTable(
  "projects",
  {
    id: id(),
    expertiseId: uuid("expertise_id").references(() => expertises.id, { onDelete: "set null" }),
    /** ISO 3166-1 alpha-2; displayed through Intl so it needs no translation. */
    countryCode: char("country_code", { length: 2 }),
    status: projectStatusEnum("status").notNull(),
    startedOn: date("started_on", { mode: "string" }),
    completedOn: date("completed_on", { mode: "string" }),
    coverAssetId: uuid("cover_asset_id").references(() => mediaAssets.id, { onDelete: "set null" }),
    videoUrl: text("video_url"),
    /**
     * Optional, only shown when the company entered a verified figure.
     * Never derived from dates.
     */
    progressPercent: smallint("progress_percent"),
    isFeatured: boolean("is_featured").default(false).notNull(),
    sortOrder: integer("sort_order").default(0).notNull(),
    isDemo: boolean("is_demo").default(false).notNull(),
    ...timestamps(),
  },
  (t) => [
    index("projects_listing").on(t.isFeatured, t.sortOrder),
    index("projects_expertise").on(t.expertiseId),
    countryCodeCheck("projects_country_code", t.countryCode),
    httpsUrl("projects_video_url", t.videoUrl),
    check(
      "projects_dates_order",
      sql`${t.startedOn} is null or ${t.completedOn} is null or ${t.completedOn} >= ${t.startedOn}`,
    ),
    check(
      "projects_progress_percent",
      sql`${t.progressPercent} is null or (${t.progressPercent} between 0 and 100)`,
    ),
  ],
);

export const projectTranslations = pgTable(
  "project_translations",
  {
    id: id(),
    projectId: uuid("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    slug: text("slug").notNull(),
    title: text("title").notNull(),
    summary: text("summary"),
    body: text("body"),
    city: text("city"),
    technicalDetails: jsonb("technical_details")
      .$type<TechnicalDetail[]>()
      .default(sql`'[]'::jsonb`)
      .notNull(),
    ...publication(),
    ...timestamps(),
  },
  (t) => [
    uniqueIndex("project_translations_entity_locale").on(t.projectId, t.locale),
    uniqueIndex("project_translations_locale_slug").on(t.locale, t.slug),
    index("project_translations_public").on(t.locale, t.status),
    slugFormatCheck("project_translations", t.slug),
    publishedAtCheck("project_translations", t.status, t.publishedAt),
    notBlank("project_translations_title", t.title),
    check(
      "project_translations_technical_details",
      sql`jsonb_typeof(${t.technicalDetails}) = 'array'`,
    ),
  ],
);

export const projectGallery = pgTable(
  "project_gallery",
  {
    projectId: uuid("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    assetId: uuid("asset_id")
      .notNull()
      .references(() => mediaAssets.id, { onDelete: "cascade" }),
    sortOrder: integer("sort_order").default(0).notNull(),
  },
  (t) => [primaryKey({ columns: [t.projectId, t.assetId] })],
);
