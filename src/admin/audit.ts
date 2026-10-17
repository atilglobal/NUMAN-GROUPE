import type { Database } from "../db/client";
import { auditLogs } from "../db/schema";

export type AuditEntry = {
  actorUserId: string | null;
  action: string;
  entityType: string;
  /** Use "-" when the action has no single target (e.g. a failed sign-in). */
  entityId: string;
  /** Never put passwords, tokens or session data here. */
  metadata?: Record<string, unknown>;
  ip?: string | null;
};

export async function writeAudit(db: Pick<Database, "insert">, entry: AuditEntry): Promise<void> {
  await db.insert(auditLogs).values({
    actorUserId: entry.actorUserId,
    action: entry.action,
    entityType: entry.entityType,
    entityId: entry.entityId,
    metadata: entry.metadata ?? {},
    ip: entry.ip ?? null,
  });
}
