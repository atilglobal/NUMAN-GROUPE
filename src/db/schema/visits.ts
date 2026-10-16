import {
  boolean,
  char,
  date,
  foreignKey,
  index,
  integer,
  pgTable,
  primaryKey,
  text,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import {
  countryCodeCheck,
  id,
  localeEnum,
  notBlank,
  publication,
  publishedAtCheck,
  slugFormatCheck,
  timestamps,
} from "./common";
import { mediaAssets } from "./media";

/**
 * A visit is recorded as a visit: nothing here models sponsorship, state
 * support or partnership.
 */
export const officialVisits = pgTable(
  "official_visits",
  {
    id: id(),
    visitedOn: date("visited_on", { mode: "string" }),
    countryCode: char("country_code", { length: 2 }),
    coverAssetId: uuid("cover_asset_id").references(() => mediaAssets.id, { onDelete: "set null" }),
    isFeatured: boolean("is_featured").default(false).notNull(),
    isDemo: boolean("is_demo").default(false).notNull(),
    ...timestamps(),
  },
  (t) => [
    index("official_visits_listing").on(t.isFeatured, t.visitedOn),
    countryCodeCheck("official_visits_country_code", t.countryCode),
  ],
);

export const officialVisitTranslations = pgTable(
  "official_visit_translations",
  {
    id: id(),
    visitId: uuid("visit_id")
      .notNull()
      .references(() => officialVisits.id, { onDelete: "cascade" }),
    slug: text("slug").notNull(),
    title: text("title").notNull(),
    hostInstitution: text("host_institution"),
    location: text("location"),
    summary: text("summary"),
    body: text("body"),
    ...publication(),
    ...timestamps(),
  },
  (t) => [
    uniqueIndex("official_visit_translations_entity_locale").on(t.visitId, t.locale),
    uniqueIndex("official_visit_translations_locale_slug").on(t.locale, t.slug),
    index("official_visit_translations_public").on(t.locale, t.status),
    slugFormatCheck("official_visit_translations", t.slug),
    publishedAtCheck("official_visit_translations", t.status, t.publishedAt),
    notBlank("official_visit_translations_title", t.title),
  ],
);

/** Only participants that were actually provided; names are not translated. */
export const officialVisitParticipants = pgTable(
  "official_visit_participants",
  {
    id: id(),
    visitId: uuid("visit_id")
      .notNull()
      .references(() => officialVisits.id, { onDelete: "cascade" }),
    fullName: text("full_name").notNull(),
    sortOrder: integer("sort_order").default(0).notNull(),
  },
  (t) => [
    index("official_visit_participants_visit").on(t.visitId),
    notBlank("official_visit_participants_name", t.fullName),
  ],
);

/** Role titles per language; a missing row means the title was not provided. */
export const officialVisitParticipantTranslations = pgTable(
  "official_visit_participant_translations",
  {
    participantId: uuid("participant_id").notNull(),
    locale: localeEnum("locale").notNull(),
    roleTitle: text("role_title").notNull(),
  },
  (t) => [
    primaryKey({ name: "visit_participant_translations_pk", columns: [t.participantId, t.locale] }),
    foreignKey({
      name: "visit_participant_translations_participant_fk",
      columns: [t.participantId],
      foreignColumns: [officialVisitParticipants.id],
    }).onDelete("cascade"),
    notBlank("official_visit_participant_translations_role", t.roleTitle),
  ],
);

export const officialVisitGallery = pgTable(
  "official_visit_gallery",
  {
    visitId: uuid("visit_id")
      .notNull()
      .references(() => officialVisits.id, { onDelete: "cascade" }),
    assetId: uuid("asset_id")
      .notNull()
      .references(() => mediaAssets.id, { onDelete: "cascade" }),
    sortOrder: integer("sort_order").default(0).notNull(),
  },
  (t) => [primaryKey({ columns: [t.visitId, t.assetId] })],
);
