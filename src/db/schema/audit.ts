import { sql } from "drizzle-orm";
import { index, jsonb, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { id } from "./common";
import { users } from "./users";

/** Who changed what. Metadata stays minimal: no message bodies or other personal data. */
export const auditLogs = pgTable(
  "audit_logs",
  {
    id: id(),
    actorUserId: text("actor_user_id").references(() => users.id, { onDelete: "set null" }),
    action: text("action").notNull(),
    entityType: text("entity_type").notNull(),
    entityId: text("entity_id").notNull(),
    metadata: jsonb("metadata")
      .$type<Record<string, unknown>>()
      .default(sql`'{}'::jsonb`)
      .notNull(),
    ip: text("ip"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [
    index("audit_logs_created_at").on(t.createdAt),
    index("audit_logs_entity").on(t.entityType, t.entityId),
  ],
);
