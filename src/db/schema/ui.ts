import { primaryKey, text } from "drizzle-orm/pg-core";
import { pgTable } from "drizzle-orm/pg-core";
import { localeEnum, notBlank, timestamps } from "./common";
import { users } from "./users";

/** Panel overrides for developer-defined UI dictionary keys. Missing row = JSON default. */
export const uiStringOverrides = pgTable(
  "ui_string_overrides",
  {
    key: text("key").notNull(),
    locale: localeEnum("locale").notNull(),
    value: text("value").notNull(),
    updatedById: text("updated_by_id").references(() => users.id, { onDelete: "set null" }),
    ...timestamps(),
  },
  (t) => [primaryKey({ columns: [t.key, t.locale] }), notBlank("ui_string_overrides_value", t.value)],
);
