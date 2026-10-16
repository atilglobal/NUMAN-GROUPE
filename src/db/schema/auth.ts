import { index, integer, pgTable, text, timestamp, uniqueIndex } from "drizzle-orm/pg-core";
import { users } from "./users";

/*
 * Better Auth storage (session, credential account, verification). Field
 * names follow Better Auth's model; the password hash lives in
 * `accounts.password` and is never read by application code.
 */

const tz = (name: string) => timestamp(name, { withTimezone: true });

export const sessions = pgTable(
  "sessions",
  {
    id: text("id").primaryKey(),
    token: text("token").notNull().unique(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    expiresAt: tz("expires_at").notNull(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    createdAt: tz("created_at").defaultNow().notNull(),
    updatedAt: tz("updated_at").defaultNow().notNull(),
  },
  (t) => [index("sessions_user").on(t.userId)],
);

export const accounts = pgTable(
  "accounts",
  {
    id: text("id").primaryKey(),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: tz("access_token_expires_at"),
    refreshTokenExpiresAt: tz("refresh_token_expires_at"),
    scope: text("scope"),
    password: text("password"),
    createdAt: tz("created_at").defaultNow().notNull(),
    updatedAt: tz("updated_at").defaultNow().notNull(),
  },
  (t) => [
    index("accounts_user").on(t.userId),
    uniqueIndex("accounts_provider_account").on(t.providerId, t.accountId),
  ],
);

export const verifications = pgTable(
  "verifications",
  {
    id: text("id").primaryKey(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: tz("expires_at").notNull(),
    createdAt: tz("created_at").defaultNow().notNull(),
    updatedAt: tz("updated_at").defaultNow().notNull(),
  },
  (t) => [index("verifications_identifier").on(t.identifier)],
);

/** Failed sign-in counters per client IP and per (hashed) e-mail address. */
export const authRateLimits = pgTable("auth_rate_limits", {
  key: text("key").primaryKey(),
  failures: integer("failures").default(0).notNull(),
  windowStartedAt: tz("window_started_at").defaultNow().notNull(),
  blockedUntil: tz("blocked_until"),
});
