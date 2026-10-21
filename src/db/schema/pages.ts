import { pgEnum, pgTable, text, uniqueIndex, uuid } from "drizzle-orm/pg-core";
import { id, notBlank, publication, publishedAtCheck, timestamps } from "./common";

/** Fixed institutional pages; their URLs are the localized slugs in `i18n/routes.ts`. */
export const pageKeyEnum = pgEnum("page_key", [
  "about",
  "mission",
  "vision",
  "history",
  "approach",
  "principles",
  "finance",
  "regions",
  "organization",
  "future",
  "quality",
  "certificates",
  "contact",
  "privacy",
  "legal",
  "cookies",
]);

/** Editorial blocks composed on the public Group page when published. */
export const aboutSectionKeys = [
  "history",
  "mission",
  "vision",
  "approach",
  "principles",
  "finance",
  "regions",
  "organization",
  "future",
  "quality",
  "certificates",
] as const;
export type AboutSectionKey = (typeof aboutSectionKeys)[number];

export type PageKey = (typeof pageKeyEnum.enumValues)[number];

export const pageContents = pgTable("page_contents", {
  id: id(),
  key: pageKeyEnum("key").notNull().unique(),
  ...timestamps(),
});

export const pageContentTranslations = pgTable(
  "page_content_translations",
  {
    id: id(),
    pageId: uuid("page_id")
      .notNull()
      .references(() => pageContents.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    summary: text("summary"),
    body: text("body"),
    ...publication(),
    ...timestamps(),
  },
  (t) => [
    uniqueIndex("page_content_translations_entity_locale").on(t.pageId, t.locale),
    publishedAtCheck("page_content_translations", t.status, t.publishedAt),
    notBlank("page_content_translations_title", t.title),
  ],
);
