import { sql } from "drizzle-orm";
import { check, integer, pgEnum, pgTable, text, uniqueIndex, uuid, type AnyPgColumn } from "drizzle-orm/pg-core";
import { id, localeEnum, notBlank, timestamps } from "./common";
import { cmsPages } from "./cms";

export const menuLocationEnum = pgEnum("menu_location", ["header", "footer"]);
export const menuItemKindEnum = pgEnum("menu_item_kind", ["section", "cms_page", "url"]);

export const menus = pgTable("menus", {
  id: id(),
  location: menuLocationEnum("location").notNull().unique(),
  ...timestamps(),
});

export const menuItems = pgTable(
  "menu_items",
  {
    id: id(),
    menuId: uuid("menu_id")
      .notNull()
      .references(() => menus.id, { onDelete: "cascade" }),
    parentId: uuid("parent_id").references((): AnyPgColumn => menuItems.id, { onDelete: "cascade" }),
    sortOrder: integer("sort_order").default(0).notNull(),
    kind: menuItemKindEnum("kind").notNull(),
    sectionKey: text("section_key"),
    cmsPageId: uuid("cms_page_id").references(() => cmsPages.id, { onDelete: "cascade" }),
    externalUrl: text("external_url"),
    ...timestamps(),
  },
  (t) => [
    check(
      "menu_items_kind_payload",
      sql`(
        (${t.kind} = 'section' and ${t.sectionKey} is not null and ${t.cmsPageId} is null and ${t.externalUrl} is null)
        or (${t.kind} = 'cms_page' and ${t.cmsPageId} is not null and ${t.sectionKey} is null and ${t.externalUrl} is null)
        or (${t.kind} = 'url' and ${t.externalUrl} is not null and ${t.sectionKey} is null and ${t.cmsPageId} is null)
      )`,
    ),
    check(
      "menu_items_external_url",
      sql`${t.externalUrl} is null or ${t.externalUrl} ~ '^https://[^\\s]+$'`,
    ),
  ],
);

export const menuItemTranslations = pgTable(
  "menu_item_translations",
  {
    itemId: uuid("item_id")
      .notNull()
      .references(() => menuItems.id, { onDelete: "cascade" }),
    locale: localeEnum("locale").notNull(),
    label: text("label").notNull(),
  },
  (t) => [
    uniqueIndex("menu_item_translations_item_locale").on(t.itemId, t.locale),
    notBlank("menu_item_translations_label", t.label),
  ],
);
