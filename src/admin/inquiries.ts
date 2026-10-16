import { and, count, desc, eq, ilike, or } from "drizzle-orm";
import type { Database } from "@/db/client";
import { inquiryNotes, inquiries, inquiryStatuses, type InquiryStatus } from "@/db/schema";
import { ADMIN_PAGE_SIZE, clampPage } from "@/lib/pagination";
import { writeAudit } from "./audit";

type Actor = { id: string; ip?: string | null };

export function normalizeInquiryStatus(status: string): InquiryStatus {
  if (status === "read") return "reviewing";
  if ((inquiryStatuses as readonly string[]).includes(status)) return status as InquiryStatus;
  return "new";
}

export async function listInquiries(
  db: Database,
  filters: { q?: string; status?: string; page: number },
) {
  const conditions = [];
  if (filters.status && filters.status !== "all") {
    const status = normalizeInquiryStatus(filters.status);
    if (status === "reviewing") {
      conditions.push(or(eq(inquiries.status, "reviewing"), eq(inquiries.status, "read")));
    } else {
      conditions.push(eq(inquiries.status, status));
    }
  }
  if (filters.q) {
    conditions.push(
      or(
        ilike(inquiries.fullName, `%${filters.q}%`),
        ilike(inquiries.email, `%${filters.q}%`),
        ilike(inquiries.organization, `%${filters.q}%`),
      ),
    );
  }
  const where = conditions.length ? and(...conditions) : undefined;
  const [totalRow] = await db.select({ value: count() }).from(inquiries).where(where);
  const total = Number(totalRow?.value ?? 0);
  const page = clampPage(filters.page, total, ADMIN_PAGE_SIZE);
  const rows = await db
    .select()
    .from(inquiries)
    .where(where)
    .orderBy(desc(inquiries.createdAt))
    .limit(ADMIN_PAGE_SIZE)
    .offset((page - 1) * ADMIN_PAGE_SIZE);
  return { rows: rows.map((row) => ({ ...row, status: normalizeInquiryStatus(row.status) })), total, page, pageSize: ADMIN_PAGE_SIZE };
}

export async function getInquiry(db: Database, id: string) {
  const [row] = await db.select().from(inquiries).where(eq(inquiries.id, id));
  if (!row) return null;
  const notes = await db
    .select()
    .from(inquiryNotes)
    .where(eq(inquiryNotes.inquiryId, id))
    .orderBy(desc(inquiryNotes.createdAt));
  return { ...row, status: normalizeInquiryStatus(row.status), notes };
}

export async function setInquiryStatus(db: Database, actor: Actor, id: string, status: InquiryStatus) {
  const handled = status === "new" ? { handledById: null, handledAt: null } : { handledById: actor.id, handledAt: new Date() };
  const updated = await db
    .update(inquiries)
    .set({ status, ...handled })
    .where(eq(inquiries.id, id))
    .returning({ id: inquiries.id });
  if (updated.length === 0) return false;
  await writeAudit(db, {
    actorUserId: actor.id,
    action: "inquiry.status",
    entityType: "inquiry",
    entityId: id,
    metadata: { status },
    ip: actor.ip,
  });
  return true;
}

export async function addInquiryNote(db: Database, actor: Actor, id: string, body: string) {
  const text = body.trim();
  if (!text) return false;
  const [root] = await db.select({ id: inquiries.id }).from(inquiries).where(eq(inquiries.id, id));
  if (!root) return false;
  await db.insert(inquiryNotes).values({ inquiryId: id, authorId: actor.id, body: text.slice(0, 4000) });
  await writeAudit(db, {
    actorUserId: actor.id,
    action: "inquiry.note",
    entityType: "inquiry",
    entityId: id,
    ip: actor.ip,
  });
  return true;
}
