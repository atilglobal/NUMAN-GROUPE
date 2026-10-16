import { sql } from "drizzle-orm";
import {
  check,
  pgEnum,
  text,
  timestamp,
  uuid,
  type AnyPgColumn,
} from "drizzle-orm/pg-core";
import { locales } from "../../i18n/config";

export const localeEnum = pgEnum("locale", locales);
export const publicationStatusEnum = pgEnum("publication_status", ["draft", "published"]);

export type PublicationStatus = (typeof publicationStatusEnum.enumValues)[number];

export const id = () => uuid("id").primaryKey().defaultRandom();

export const timestamps = () => ({
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

/** Columns shared by every per-language editorial row. */
export const publication = () => ({
  locale: localeEnum("locale").notNull(),
  status: publicationStatusEnum("status").default("draft").notNull(),
  publishedAt: timestamp("published_at", { withTimezone: true }),
  seoTitle: text("seo_title"),
  seoDescription: text("seo_description"),
});

export const SLUG_PATTERN = "^[a-z0-9]+(-[a-z0-9]+)*$";

export function slugFormatCheck(table: string, slug: AnyPgColumn) {
  return check(
    `${table}_slug_format`,
    sql`${slug} ~ ${sql.raw(`'${SLUG_PATTERN}'`)} and char_length(${slug}) <= 160`,
  );
}

/** A published row must carry its publication time; drafts may keep the last one. */
export function publishedAtCheck(
  table: string,
  status: AnyPgColumn,
  publishedAt: AnyPgColumn,
) {
  return check(
    `${table}_published_at`,
    sql`${status} = 'draft' or ${publishedAt} is not null`,
  );
}

export function notBlank(name: string, column: AnyPgColumn): ReturnType<typeof check> {
  return check(name, sql`char_length(btrim(${column})) > 0`);
}

export function httpsUrl(name: string, column: AnyPgColumn): ReturnType<typeof check> {
  return check(name, sql`${column} is null or ${column} ~ '^https://[^\\s]+$'`);
}

export function countryCodeCheck(name: string, column: AnyPgColumn): ReturnType<typeof check> {
  return check(name, sql`${column} is null or ${column} ~ '^[A-Z]{2}$'`);
}