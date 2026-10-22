import { and, asc, count, eq, ilike, inArray, or } from "drizzle-orm";
import type { Database } from "../db/client";
import { teamMemberLinks, teamMembers, teamMemberTranslations, type PublicationStatus } from "../db/schema";
import { locales, type Locale } from "../i18n/config";
import { ADMIN_PAGE_SIZE, clampPage } from "../lib/pagination";
import { writeAudit } from "./audit";
import { AdminRuleError } from "./users";
import type { TeamRootInput, TeamTranslationInput } from "./validation";

type Actor = { id: string; ip?: string | null };

export type TeamListRow = {
  id: string;
  fullName: string;
  roleTitle: string | null;
  sortOrder: number;
  isVisible: boolean;
  isDemo: boolean;
  states: Record<Locale, PublicationStatus | "missing">;
};

export async function listTeamForAdmin(
  db: Database,
  filters: { q?: string; page: number },
): Promise<{ rows: TeamListRow[]; total: number; page: number; pageSize: number }> {
  const conditions = [];
  if (filters.q) {
    const matches = await db
      .selectDistinct({ id: teamMembers.id })
      .from(teamMembers)
      .leftJoin(teamMemberTranslations, eq(teamMemberTranslations.memberId, teamMembers.id))
      .where(
        or(
          ilike(teamMembers.fullName, `%${filters.q}%`),
          ilike(teamMemberTranslations.roleTitle, `%${filters.q}%`),
        ),
      );
    const ids = matches.map((row) => row.id);
    if (ids.length === 0) return { rows: [], total: 0, page: 1, pageSize: ADMIN_PAGE_SIZE };
    conditions.push(inArray(teamMembers.id, ids));
  }
  const where = conditions.length ? and(...conditions) : undefined;
  const [totalRow] = await db.select({ value: count() }).from(teamMembers).where(where);
  const total = Number(totalRow?.value ?? 0);
  const page = clampPage(filters.page, total, ADMIN_PAGE_SIZE);

  const roots = await db
    .select({
      id: teamMembers.id,
      fullName: teamMembers.fullName,
      sortOrder: teamMembers.sortOrder,
      isVisible: teamMembers.isVisible,
      isDemo: teamMembers.isDemo,
    })
    .from(teamMembers)
    .where(where)
    .orderBy(asc(teamMembers.sortOrder), asc(teamMembers.fullName))
    .limit(ADMIN_PAGE_SIZE)
    .offset((page - 1) * ADMIN_PAGE_SIZE);

  const translations = await db.select().from(teamMemberTranslations);
  return {
    rows: roots.map((root) => {
      const own = translations.filter((row) => row.memberId === root.id);
      const states = Object.fromEntries(
        locales.map((locale) => [locale, own.find((row) => row.locale === locale)?.status ?? "missing"]),
      ) as TeamListRow["states"];
      const fr = own.find((row) => row.locale === "fr");
      return { ...root, roleTitle: fr?.roleTitle ?? own[0]?.roleTitle ?? null, states };
    }),
    total,
    page,
    pageSize: ADMIN_PAGE_SIZE,
  };
}

export type TeamEditor = {
  id: string;
  fullName: string;
  sortOrder: number;
  isVisible: boolean;
  isDemo: boolean;
  presentationGroup: string | null;
  photoAssetId: string | null;
  link: { label: string; url: string } | null;
  translations: Partial<
    Record<
      Locale,
      TeamTranslationInput & { locale: Locale; status: PublicationStatus; publishedAt: Date | null; updatedAt: Date }
    >
  >;
};

export async function getTeamMemberForEditor(db: Database, id: string): Promise<TeamEditor | null> {
  const [root] = await db.select().from(teamMembers).where(eq(teamMembers.id, id));
  if (!root) return null;
  const [rows, links] = await Promise.all([
    db.select().from(teamMemberTranslations).where(eq(teamMemberTranslations.memberId, id)),
    db
      .select()
      .from(teamMemberLinks)
      .where(eq(teamMemberLinks.memberId, id))
      .orderBy(asc(teamMemberLinks.sortOrder)),
  ]);
  const translations: TeamEditor["translations"] = {};
  for (const row of rows) {
    translations[row.locale] = {
      locale: row.locale,
      roleTitle: row.roleTitle,
      summary: row.summary,
      bio: row.bio,
      status: row.status,
      publishedAt: row.publishedAt,
      updatedAt: row.updatedAt,
    };
  }
  const link = links[0] ? { label: links[0].label, url: links[0].url } : null;
  return { ...root, link, translations };
}

async function writeLink(tx: Database, memberId: string, input: TeamRootInput) {
  await tx.delete(teamMemberLinks).where(eq(teamMemberLinks.memberId, memberId));
  if (!input.linkUrl) return;
  await tx.insert(teamMemberLinks).values({
    memberId,
    label: input.linkLabel ?? "Profil",
    url: input.linkUrl,
    sortOrder: 0,
  });
}

export async function createTeamMember(
  db: Database,
  actor: Actor,
  input: { root: TeamRootInput; locale: Locale; translation: TeamTranslationInput },
): Promise<string> {
  return db.transaction(async (tx) => {
    const [row] = await tx
      .insert(teamMembers)
      .values({
        fullName: input.root.fullName,
        sortOrder: input.root.sortOrder,
        isVisible: input.root.isVisible,
        presentationGroup: input.root.presentationGroup,
        photoAssetId: input.root.photoAssetId,
      })
      .returning({ id: teamMembers.id });
    await tx.insert(teamMemberTranslations).values({
      memberId: row.id,
      locale: input.locale,
      ...input.translation,
    });
    await writeLink(tx, row.id, input.root);
    await writeAudit(tx, {
      actorUserId: actor.id,
      action: "team_member.create",
      entityType: "team_member",
      entityId: row.id,
      metadata: { locale: input.locale },
      ip: actor.ip,
    });
    return row.id;
  });
}

export async function updateTeamRoot(db: Database, actor: Actor, id: string, input: TeamRootInput): Promise<void> {
  await db.transaction(async (tx) => {
    const updated = await tx
      .update(teamMembers)
      .set({
        fullName: input.fullName,
        sortOrder: input.sortOrder,
        isVisible: input.isVisible,
        presentationGroup: input.presentationGroup,
        photoAssetId: input.photoAssetId,
      })
      .where(eq(teamMembers.id, id))
      .returning({ id: teamMembers.id });
    if (updated.length === 0) throw new AdminRuleError("Kayıt bulunamadı.");
    await writeLink(tx, id, input);
    await writeAudit(tx, {
      actorUserId: actor.id,
      action: "team_member.update",
      entityType: "team_member",
      entityId: id,
      ip: actor.ip,
    });
  });
}

export async function saveTeamTranslation(
  db: Database,
  actor: Actor,
  id: string,
  locale: Locale,
  input: TeamTranslationInput,
): Promise<void> {
  await db.transaction(async (tx) => {
    const [root] = await tx.select({ id: teamMembers.id }).from(teamMembers).where(eq(teamMembers.id, id));
    if (!root) throw new AdminRuleError("Kayıt bulunamadı.");
    const [existing] = await tx
      .select({ id: teamMemberTranslations.id })
      .from(teamMemberTranslations)
      .where(and(eq(teamMemberTranslations.memberId, id), eq(teamMemberTranslations.locale, locale)));
    if (existing) {
      await tx.update(teamMemberTranslations).set(input).where(eq(teamMemberTranslations.id, existing.id));
    } else {
      await tx.insert(teamMemberTranslations).values({ memberId: id, locale, ...input });
    }
    await writeAudit(tx, {
      actorUserId: actor.id,
      action: existing ? "team_member.translation_update" : "team_member.translation_create",
      entityType: "team_member",
      entityId: id,
      metadata: { locale },
      ip: actor.ip,
    });
  });
}

export async function deleteTeamMember(db: Database, actor: Actor, id: string): Promise<void> {
  await db.transaction(async (tx) => {
    const [row] = await tx.select({ fullName: teamMembers.fullName }).from(teamMembers).where(eq(teamMembers.id, id));
    const deleted = await tx.delete(teamMembers).where(eq(teamMembers.id, id)).returning({ id: teamMembers.id });
    if (deleted.length === 0) throw new AdminRuleError("Kayıt bulunamadı.");
    await writeAudit(tx, {
      actorUserId: actor.id,
      action: "team_member.delete",
      entityType: "team_member",
      entityId: id,
      metadata: row ? { name: row.fullName } : {},
      ip: actor.ip,
    });
  });
}
