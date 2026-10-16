import { and, asc, count, desc, eq, ilike, inArray, or, sql } from "drizzle-orm";
import type { Database } from "../db/client";
import {
  officialVisitGallery,
  officialVisitParticipants,
  officialVisitParticipantTranslations,
  officialVisits,
  officialVisitTranslations,
  type PublicationStatus,
} from "../db/schema";
import { rememberSlugChange } from "@/content/slug-redirects";
import { locales, type Locale } from "../i18n/config";
import { ADMIN_PAGE_SIZE, clampPage } from "../lib/pagination";
import { writeAudit } from "./audit";
import { AdminRuleError } from "./users";
import type { VisitRootInput, VisitTranslationInput } from "./validation";

type Actor = { id: string; ip?: string | null };

export class SlugTakenError extends AdminRuleError {
  constructor() {
    super("Bu bağlantı adı bu dilde başka bir kayıtta kullanılıyor.");
    this.name = "SlugTakenError";
  }
}

function isSlugConflict(error: unknown): boolean {
  const constraint =
    (error as { cause?: { constraint?: string } }).cause?.constraint ??
    (error as { constraint?: string }).constraint;
  return constraint === "official_visit_translations_locale_slug";
}

export type VisitListRow = {
  id: string;
  label: string | null;
  visitedOn: string | null;
  host: string | null;
  isFeatured: boolean;
  isDemo: boolean;
  countryCode: string | null;
  states: Record<Locale, PublicationStatus | "missing">;
};

export type VisitListResult = {
  rows: VisitListRow[];
  total: number;
  page: number;
  pageSize: number;
};

export async function listVisitsForAdmin(
  db: Database,
  filters: { q?: string; year?: number; page: number },
): Promise<VisitListResult> {
  const conditions = [
    filters.year
      ? sql`date_part('year', ${officialVisits.visitedOn}::date) = ${filters.year}`
      : undefined,
  ];

  if (filters.q) {
    const matches = await db
      .selectDistinct({ id: officialVisitTranslations.visitId })
      .from(officialVisitTranslations)
      .where(
        or(
          ilike(officialVisitTranslations.title, `%${filters.q}%`),
          ilike(officialVisitTranslations.slug, `%${filters.q}%`),
          ilike(officialVisitTranslations.hostInstitution, `%${filters.q}%`),
        ),
      );
    const ids = matches.map((row) => row.id);
    if (ids.length === 0) return { rows: [], total: 0, page: 1, pageSize: ADMIN_PAGE_SIZE };
    conditions.push(inArray(officialVisits.id, ids));
  }

  const where = and(...conditions);
  const [totalRow] = await db.select({ value: count() }).from(officialVisits).where(where);
  const total = Number(totalRow?.value ?? 0);
  const page = clampPage(filters.page, total, ADMIN_PAGE_SIZE);

  const roots = await db
    .select({
      id: officialVisits.id,
      visitedOn: officialVisits.visitedOn,
      isFeatured: officialVisits.isFeatured,
      isDemo: officialVisits.isDemo,
      countryCode: officialVisits.countryCode,
    })
    .from(officialVisits)
    .where(where)
    .orderBy(sql`${officialVisits.visitedOn} desc nulls last`, desc(officialVisits.createdAt))
    .limit(ADMIN_PAGE_SIZE)
    .offset((page - 1) * ADMIN_PAGE_SIZE);

  if (roots.length === 0) return { rows: [], total, page, pageSize: ADMIN_PAGE_SIZE };

  const translations = await db
    .select({
      visitId: officialVisitTranslations.visitId,
      locale: officialVisitTranslations.locale,
      status: officialVisitTranslations.status,
      title: officialVisitTranslations.title,
      host: officialVisitTranslations.hostInstitution,
    })
    .from(officialVisitTranslations);

  return {
    rows: roots.map((root) => {
      const own = translations.filter((row) => row.visitId === root.id);
      const states = Object.fromEntries(
        locales.map((locale) => [locale, own.find((row) => row.locale === locale)?.status ?? "missing"]),
      ) as VisitListRow["states"];
      const fr = own.find((row) => row.locale === "fr");
      return {
        ...root,
        label: fr?.title ?? own[0]?.title ?? null,
        host: fr?.host ?? own[0]?.host ?? null,
        states,
      };
    }),
    total,
    page,
    pageSize: ADMIN_PAGE_SIZE,
  };
}

export type VisitTranslationRow = VisitTranslationInput & {
  locale: Locale;
  status: PublicationStatus;
  publishedAt: Date | null;
  updatedAt: Date;
};

export type VisitEditorParticipant = {
  fullName: string;
  roles: Partial<Record<Locale, string | null>>;
};

export type VisitEditor = {
  id: string;
  visitedOn: string | null;
  countryCode: string | null;
  isFeatured: boolean;
  isDemo: boolean;
  coverAssetId: string | null;
  gallery: string[];
  participants: VisitEditorParticipant[];
  translations: Partial<Record<Locale, VisitTranslationRow>>;
};

export async function getVisitForEditor(db: Database, id: string): Promise<VisitEditor | null> {
  const [root] = await db.select().from(officialVisits).where(eq(officialVisits.id, id));
  if (!root) return null;

  const [rows, gallery, people, roles] = await Promise.all([
    db.select().from(officialVisitTranslations).where(eq(officialVisitTranslations.visitId, id)),
    db
      .select({ assetId: officialVisitGallery.assetId })
      .from(officialVisitGallery)
      .where(eq(officialVisitGallery.visitId, id))
      .orderBy(asc(officialVisitGallery.sortOrder)),
    db
      .select()
      .from(officialVisitParticipants)
      .where(eq(officialVisitParticipants.visitId, id))
      .orderBy(asc(officialVisitParticipants.sortOrder), asc(officialVisitParticipants.fullName)),
    db.select().from(officialVisitParticipantTranslations),
  ]);

  const translations: VisitEditor["translations"] = {};
  for (const row of rows) {
    translations[row.locale] = {
      locale: row.locale,
      title: row.title,
      slug: row.slug,
      summary: row.summary,
      body: row.body,
      hostInstitution: row.hostInstitution,
      location: row.location,
      seoTitle: row.seoTitle,
      seoDescription: row.seoDescription,
      status: row.status,
      publishedAt: row.publishedAt,
      updatedAt: row.updatedAt,
    };
  }

  const participants = people.map((person) => {
    const own = roles.filter((row) => row.participantId === person.id);
    const roleMap: VisitEditorParticipant["roles"] = {};
    for (const locale of locales) {
      roleMap[locale] = own.find((row) => row.locale === locale)?.roleTitle ?? null;
    }
    return { fullName: person.fullName, roles: roleMap };
  });

  return { ...root, gallery: gallery.map((row) => row.assetId), participants, translations };
}

async function writeGallery(tx: Database, visitId: string, assetIds: string[]) {
  await tx.delete(officialVisitGallery).where(eq(officialVisitGallery.visitId, visitId));
  if (assetIds.length === 0) return;
  await tx.insert(officialVisitGallery).values(assetIds.map((assetId, index) => ({ visitId, assetId, sortOrder: index })));
}

async function writeParticipants(tx: Database, visitId: string, people: VisitRootInput["participants"]) {
  await tx.delete(officialVisitParticipants).where(eq(officialVisitParticipants.visitId, visitId));
  for (const [index, person] of people.entries()) {
    const [row] = await tx
      .insert(officialVisitParticipants)
      .values({ visitId, fullName: person.fullName, sortOrder: index })
      .returning({ id: officialVisitParticipants.id });
    const titles: { locale: Locale; roleTitle: string }[] = [];
    if (person.roleFr) titles.push({ locale: "fr", roleTitle: person.roleFr });
    if (person.roleEn) titles.push({ locale: "en", roleTitle: person.roleEn });
    if (person.roleTr) titles.push({ locale: "tr", roleTitle: person.roleTr });
    if (titles.length > 0) {
      await tx.insert(officialVisitParticipantTranslations).values(
        titles.map((title) => ({ participantId: row.id, ...title })),
      );
    }
  }
}

export async function createVisit(
  db: Database,
  actor: Actor,
  input: { root: VisitRootInput; locale: Locale; translation: VisitTranslationInput },
): Promise<string> {
  try {
    return await db.transaction(async (tx) => {
      const [row] = await tx
        .insert(officialVisits)
        .values({
          visitedOn: input.root.visitedOn,
          countryCode: input.root.countryCode,
          isFeatured: input.root.isFeatured,
          coverAssetId: input.root.coverAssetId,
        })
        .returning({ id: officialVisits.id });
      await tx.insert(officialVisitTranslations).values({
        visitId: row.id,
        locale: input.locale,
        ...input.translation,
      });
      await writeGallery(tx, row.id, input.root.gallery);
      await writeParticipants(tx, row.id, input.root.participants);
      await writeAudit(tx, {
        actorUserId: actor.id,
        action: "visit.create",
        entityType: "visit",
        entityId: row.id,
        metadata: { locale: input.locale },
        ip: actor.ip,
      });
      return row.id;
    });
  } catch (error) {
    if (isSlugConflict(error)) throw new SlugTakenError();
    throw error;
  }
}

export async function updateVisitRoot(db: Database, actor: Actor, id: string, input: VisitRootInput): Promise<void> {
  await db.transaction(async (tx) => {
    const updated = await tx
      .update(officialVisits)
      .set({
        visitedOn: input.visitedOn,
        countryCode: input.countryCode,
        isFeatured: input.isFeatured,
        coverAssetId: input.coverAssetId,
      })
      .where(eq(officialVisits.id, id))
      .returning({ id: officialVisits.id });
    if (updated.length === 0) throw new AdminRuleError("Kayıt bulunamadı.");
    await writeGallery(tx, id, input.gallery);
    await writeParticipants(tx, id, input.participants);
    await writeAudit(tx, {
      actorUserId: actor.id,
      action: "visit.update",
      entityType: "visit",
      entityId: id,
      ip: actor.ip,
    });
  });
}

export async function saveVisitTranslation(
  db: Database,
  actor: Actor,
  id: string,
  locale: Locale,
  input: VisitTranslationInput,
): Promise<void> {
  try {
    await db.transaction(async (tx) => {
      const [root] = await tx.select({ id: officialVisits.id }).from(officialVisits).where(eq(officialVisits.id, id));
      if (!root) throw new AdminRuleError("Kayıt bulunamadı.");
      const [existing] = await tx
        .select({ id: officialVisitTranslations.id, slug: officialVisitTranslations.slug })
        .from(officialVisitTranslations)
        .where(and(eq(officialVisitTranslations.visitId, id), eq(officialVisitTranslations.locale, locale)));
      if (existing) {
        await rememberSlugChange(tx, {
          locale,
          section: "visits",
          entityId: id,
          previous: existing.slug,
          next: input.slug,
        });
        await tx.update(officialVisitTranslations).set(input).where(eq(officialVisitTranslations.id, existing.id));
      } else {
        await tx.insert(officialVisitTranslations).values({ visitId: id, locale, ...input });
      }
      await writeAudit(tx, {
        actorUserId: actor.id,
        action: existing ? "visit.translation_update" : "visit.translation_create",
        entityType: "visit",
        entityId: id,
        metadata: { locale },
        ip: actor.ip,
      });
    });
  } catch (error) {
    if (isSlugConflict(error)) throw new SlugTakenError();
    throw error;
  }
}

export async function deleteVisit(db: Database, actor: Actor, id: string): Promise<void> {
  await db.transaction(async (tx) => {
    const [fr] = await tx
      .select({ title: officialVisitTranslations.title })
      .from(officialVisitTranslations)
      .where(and(eq(officialVisitTranslations.visitId, id), eq(officialVisitTranslations.locale, "fr")));
    const deleted = await tx.delete(officialVisits).where(eq(officialVisits.id, id)).returning({ id: officialVisits.id });
    if (deleted.length === 0) throw new AdminRuleError("Kayıt bulunamadı.");
    await writeAudit(tx, {
      actorUserId: actor.id,
      action: "visit.delete",
      entityType: "visit",
      entityId: id,
      metadata: fr ? { name: fr.title } : {},
      ip: actor.ip,
    });
  });
}
