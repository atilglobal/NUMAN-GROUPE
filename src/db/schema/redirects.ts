import { sql } from "drizzle-orm";
import { check, pgTable, text, uniqueIndex, uuid } from "drizzle-orm/pg-core";
import { id, localeEnum, slugFormatCheck, timestamps } from "./common";

/** Previous public slugs; resolved to the current published slug of the same entry. */
export const contentSlugRedirects = pgTable(
  "content_slug_redirects",
  {
    id: id(),
    locale: localeEnum("locale").notNull(),
    section: text("section").notNull(),
    oldSlug: text("old_slug").notNull(),
    entityId: uuid("entity_id").notNull(),
    ...timestamps(),
  },
  (t) => [
    uniqueIndex("content_slug_redirects_lookup").on(t.locale, t.section, t.oldSlug),
    slugFormatCheck("content_slug_redirects", t.oldSlug),
    check(
      "content_slug_redirects_section",
      sql`${t.section} in ('projects','expertises','visits','cms')`,
    ),
  ],
);
