import { sql } from "drizzle-orm";
import { boolean, check, pgEnum, pgTable, text, timestamp, uniqueIndex } from "drizzle-orm/pg-core";
import { timestamps } from "./common";

/** admin: everything incl. users and settings; editor: content and media only. */
export const userRoleEnum = pgEnum("user_role", ["admin", "editor"]);

export type UserRole = (typeof userRoleEnum.enumValues)[number];

/**
 * Panel users. Core columns follow Better Auth's user model. There is no
 * public sign-up: rows are created by `npm run admin:create` or by an admin.
 */
export const users = pgTable(
  "users",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    email: text("email").notNull(),
    emailVerified: boolean("email_verified").default(false).notNull(),
    image: text("image"),
    role: userRoleEnum("role").default("editor").notNull(),
    disabledAt: timestamp("disabled_at", { withTimezone: true }),
    ...timestamps(),
  },
  (t) => [
    uniqueIndex("users_email_unique").on(sql`lower(${t.email})`),
    // Better Auth looks users up by the lower-cased address.
    check("users_email_lowercase", sql`${t.email} = lower(${t.email})`),
  ],
);
