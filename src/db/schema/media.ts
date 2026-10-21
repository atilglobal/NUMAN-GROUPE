import { sql } from "drizzle-orm";
import {
  boolean,
  check,
  doublePrecision,
  integer,
  pgTable,
  primaryKey,
  text,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import { id, localeEnum, notBlank, timestamps } from "./common";
import { users } from "./users";

/** File metadata. Bytes live in S3, Postgres media_blobs, or local disk. */
export const mediaAssets = pgTable(
  "media_assets",
  {
    id: id(),
    storageKey: text("storage_key").notNull().unique(),
    mimeType: text("mime_type").notNull(),
    byteSize: integer("byte_size").notNull(),
    width: integer("width"),
    height: integer("height"),
    originalFilename: text("original_filename"),
    focalX: doublePrecision("focal_x").default(0.5).notNull(),
    focalY: doublePrecision("focal_y").default(0.5).notNull(),
    isDemo: boolean("is_demo").default(false).notNull(),
    createdById: text("created_by_id").references(() => users.id, { onDelete: "set null" }),
    ...timestamps(),
  },
  (t) => [
    check("media_assets_byte_size", sql`${t.byteSize} > 0`),
    check(
      "media_assets_dimensions",
      sql`(${t.width} is null or ${t.width} > 0) and (${t.height} is null or ${t.height} > 0)`,
    ),
    check("media_assets_focal", sql`${t.focalX} between 0 and 1 and ${t.focalY} between 0 and 1`),
  ],
);

/** Per-use crop / mobile stand-in; the same file can be framed differently in two slots. */
export const mediaPlacements = pgTable(
  "media_placements",
  {
    id: id(),
    assetId: uuid("asset_id")
      .notNull()
      .references(() => mediaAssets.id, { onDelete: "cascade" }),
    context: text("context").notNull(),
    focalX: doublePrecision("focal_x").default(0.5).notNull(),
    focalY: doublePrecision("focal_y").default(0.5).notNull(),
    mobileAssetId: uuid("mobile_asset_id").references(() => mediaAssets.id, { onDelete: "set null" }),
    decorative: boolean("decorative").default(false).notNull(),
    ...timestamps(),
  },
  (t) => [
    uniqueIndex("media_placements_context").on(t.context),
    check("media_placements_focal", sql`${t.focalX} between 0 and 1 and ${t.focalY} between 0 and 1`),
  ],
);

/** Alt text is per language; an image without alt in a language is not shown there. */
export const mediaAssetTranslations = pgTable(
  "media_asset_translations",
  {
    assetId: uuid("asset_id")
      .notNull()
      .references(() => mediaAssets.id, { onDelete: "cascade" }),
    locale: localeEnum("locale").notNull(),
    alt: text("alt").notNull(),
    caption: text("caption"),
  },
  (t) => [
    primaryKey({ columns: [t.assetId, t.locale] }),
    notBlank("media_asset_translations_alt", t.alt),
  ],
);
