import { boolean, integer, pgTable, text, uniqueIndex, uuid } from "drizzle-orm/pg-core";
import {
  id,
  notBlank,
  publication,
  publishedAtCheck,
  slugFormatCheck,
  timestamps,
} from "./common";
import { mediaAssets } from "./media";

export const expertises = pgTable("expertises", {
  id: id(),
  sortOrder: integer("sort_order").default(0).notNull(),
  /** Structural starting taxonomy (not a company metric); the panel warns before deleting. */
  isSeed: boolean("is_seed").default(false).notNull(),
  isDemo: boolean("is_demo").default(false).notNull(),
  coverAssetId: uuid("cover_asset_id").references(() => mediaAssets.id, { onDelete: "set null" }),
  ...timestamps(),
});

export const expertiseTranslations = pgTable(
  "expertise_translations",
  {
    id: id(),
    expertiseId: uuid("expertise_id")
      .notNull()
      .references(() => expertises.id, { onDelete: "cascade" }),
    slug: text("slug").notNull(),
    name: text("name").notNull(),
    summary: text("summary"),
    body: text("body"),
    ...publication(),
    ...timestamps(),
  },
  (t) => [
    uniqueIndex("expertise_translations_entity_locale").on(t.expertiseId, t.locale),
    uniqueIndex("expertise_translations_locale_slug").on(t.locale, t.slug),
    slugFormatCheck("expertise_translations", t.slug),
    publishedAtCheck("expertise_translations", t.status, t.publishedAt),
    notBlank("expertise_translations_name", t.name),
  ],
);
