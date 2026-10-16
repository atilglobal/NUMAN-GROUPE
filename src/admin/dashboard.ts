import { count, desc, eq, inArray } from "drizzle-orm";
import type { Database } from "../db/client";
import {
  auditLogs,
  expertises,
  inquiries,
  mediaAssets,
  officialVisits,
  pageContents,
  projects,
  teamMembers,
  users,
} from "../db/schema";

export type ContentCounts = {
  expertises: number;
  projects: number;
  visits: number;
  team: number;
  pages: number;
  media: number;
};

export async function getContentCounts(db: Database): Promise<ContentCounts> {
  const total = async (table: typeof expertises | typeof projects | typeof officialVisits | typeof teamMembers | typeof pageContents | typeof mediaAssets) => {
    const [row] = await db.select({ value: count() }).from(table);
    return Number(row?.value ?? 0);
  };
  const [e, p, v, t, pg, m] = await Promise.all([
    total(expertises),
    total(projects),
    total(officialVisits),
    total(teamMembers),
    total(pageContents),
    total(mediaAssets),
  ]);
  return { expertises: e, projects: p, visits: v, team: t, pages: pg, media: m };
}

/** Entity types an editor may see in the activity feed. */
export const contentEntityTypes = [
  "expertise",
  "project",
  "visit",
  "team_member",
  "page",
  "media",
  "settings",
  "home",
];

export type ActivityRow = {
  id: string;
  action: string;
  entityType: string;
  entityId: string;
  metadata: Record<string, unknown>;
  createdAt: Date;
  actorName: string | null;
};

export async function getRecentActivity(
  db: Database,
  options: { limit: number; contentOnly: boolean },
): Promise<ActivityRow[]> {
  const query = db
    .select({
      id: auditLogs.id,
      action: auditLogs.action,
      entityType: auditLogs.entityType,
      entityId: auditLogs.entityId,
      metadata: auditLogs.metadata,
      createdAt: auditLogs.createdAt,
      actorName: users.name,
    })
    .from(auditLogs)
    .leftJoin(users, eq(users.id, auditLogs.actorUserId))
    .orderBy(desc(auditLogs.createdAt))
    .limit(options.limit);
  return options.contentOnly ? query.where(inArray(auditLogs.entityType, contentEntityTypes)) : query;
}

export type InquiryRow = {
  id: string;
  type: "contact" | "project_request";
  fullName: string;
  organization: string | null;
  locale: string;
  createdAt: Date;
};

export async function getNewInquiries(db: Database, limit: number): Promise<{ total: number; rows: InquiryRow[] }> {
  const [totalRow] = await db.select({ value: count() }).from(inquiries).where(eq(inquiries.status, "new"));
  const rows = await db
    .select({
      id: inquiries.id,
      type: inquiries.type,
      fullName: inquiries.fullName,
      organization: inquiries.organization,
      locale: inquiries.locale,
      createdAt: inquiries.createdAt,
    })
    .from(inquiries)
    .where(eq(inquiries.status, "new"))
    .orderBy(desc(inquiries.createdAt))
    .limit(limit);
  return { total: Number(totalRow?.value ?? 0), rows };
}
