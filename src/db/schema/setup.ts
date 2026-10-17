import { sql } from "drizzle-orm";
import { check, smallint, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { timestamps } from "./common";
import { users } from "./users";

/** Single-row lock: first-run setup completed in this database. */
export const setupState = pgTable(
  "setup_state",
  {
    id: smallint("id").primaryKey(),
    completedAt: timestamp("completed_at", { withTimezone: true }),
    completedByUserId: text("completed_by_user_id").references(() => users.id, { onDelete: "set null" }),
    ...timestamps(),
  },
  (t) => [check("setup_state_singleton", sql`${t.id} = 1`)],
);
