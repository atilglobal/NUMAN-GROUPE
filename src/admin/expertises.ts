import { and, asc, count, eq, ilike, inArray, or } from "drizzle-orm";
import type { Database } from "../db/client";
import { expertises, expertiseTranslations, type PublicationStatus } from "../db/schema";
import { rememberSlugChange } from "@/content/slug-redirects";
import { locales, type Locale } from "../i18n/config";
import { ADMIN_PAGE_SIZE, clampPage } from "../lib/pagination";
import { writeAudit } from "./audit";
import { AdminRuleError } from "./users";
import type { ExpertiseTranslationInput } from "./validation";

type Actor = { id: string; ip?: string | null };

export type ExpertiseTranslationRow = ExpertiseTranslationInput & {
  locale: Locale;
  status: PublicationStatus;
  publishedAt: Date | null;
  updatedAt: Date;
};

export type ExpertiseEditor = {
  id: string;
  sortOrder: number;
  isSeed: boolean;
  isDemo: boolean;
  coverAssetId: string | null;
  translations: Partial<Record<Locale, ExpertiseTranslationRow>>;
};

/** Thrown when a slug is already used in that language; carries the field name. */
export class SlugTakenError extends AdminRuleError {
  constructor() {
    super("Bu bağlantı adı bu dilde başka bir kayıtta kullanılıyor.");
    this.name = "SlugTakenError";
  }
}

function isSlugConflict(error: unknown): boolean {
  const cause = (error as { cause?: { constraint?: string } }).cause;
  const constraint = cause?.constraint ?? (error as { constraint?: string }).constraint;
  return constraint === "expertise_translations_locale_slug";
}

export type ExpertiseListRow = {
  id: string;
  label: string | null;
  sortOrder: number;
  isSeed: boolean;
  isDemo: boolean;
  states: Record<Locale, PublicationStatus | "missing">;
};

export type ExpertiseListResult = {
  rows: ExpertiseListRow[];
  total: number;
  page: number;
  pageSize: number;
};

/** Every entry for the panel list, drafts included, in display order. */
export async function listExpertisesForAdmin(
  db: Database,
  filters: { q?: string; page: number } = { page: 1 },
): Promise<ExpertiseListResult> {
  const conditions = [];
  if (filters.q) {
    const matches = await db
      .selectDistinct({ id: expertiseTranslations.expertiseId })
      .from(expertiseTranslations)
      .where(
        or(ilike(expertiseTranslations.name, `%${filters.q}%`), ilike(expertiseTranslations.slug, `%${filters.q}%`)),
      );
    const ids = matches.map((row) => row.id);
    if (ids.length === 0) return { rows: [], total: 0, page: 1, pageSize: ADMIN_PAGE_SIZE };
    conditions.push(inArray(expertises.id, ids));
  }
  const where = conditions.length ? and(...conditions) : undefined;
  const [totalRow] = await db.select({ value: count() }).from(expertises).where(where);
  const total = Number(totalRow?.value ?? 0);
  const page = clampPage(filters.page, total, ADMIN_PAGE_SIZE);

  const [roots, rows] = await Promise.all([
    db
      .select({
        id: expertises.id,
        sortOrder: expertises.sortOrder,
        isSeed: expertises.isSeed,
        isDemo: expertises.isDemo,
      })
      .from(expertises)
      .where(where)
      .orderBy(asc(expertises.sortOrder), asc(expertises.createdAt))
      .limit(ADMIN_PAGE_SIZE)
      .offset((page - 1) * ADMIN_PAGE_SIZE),
    db.select({
      expertiseId: expertiseTranslations.expertiseId,
      locale: expertiseTranslations.locale,
      status: expertiseTranslations.status,
      name: expertiseTranslations.name,
    }).from(expertiseTranslations),
  ]);

  return {
    total,
    page,
    pageSize: ADMIN_PAGE_SIZE,
    rows: roots.map((root) => {
      const own = rows.filter((row) => row.expertiseId === root.id);
      const states = Object.fromEntries(
        locales.map((locale) => [locale, own.find((row) => row.locale === locale)?.status ?? "missing"]),
      ) as ExpertiseListRow["states"];
      const label = own.find((row) => row.locale === "fr")?.name ?? own[0]?.name ?? null;
      return { ...root, label, states };
    }),
  };
}

export async function getExpertiseForEditor(db: Database, id: string): Promise<ExpertiseEditor | null> {
  const [root] = await db
    .select({
      id: expertises.id,
      sortOrder: expertises.sortOrder,
      isSeed: expertises.isSeed,
      isDemo: expertises.isDemo,
      coverAssetId: expertises.coverAssetId,
    })
    .from(expertises)
    .where(eq(expertises.id, id));
  if (!root) return null;

  const rows = await db
    .select()
    .from(expertiseTranslations)
    .where(eq(expertiseTranslations.expertiseId, id))
    .orderBy(asc(expertiseTranslations.locale));

  const translations: ExpertiseEditor["translations"] = {};
  for (const row of rows) {
    translations[row.locale] = {
      locale: row.locale,
      name: row.name,
      slug: row.slug,
      summary: row.summary,
      body: row.body,
      seoTitle: row.seoTitle,
      seoDescription: row.seoDescription,
      status: row.status,
      publishedAt: row.publishedAt,
      updatedAt: row.updatedAt,
    };
  }
  return { ...root, translations };
}

/** Creates the entry with its first translation as a draft. */
export async function createExpertise(
  db: Database,
  actor: Actor,
  input: { sortOrder: number; locale: Locale; translation: ExpertiseTranslationInput },
): Promise<string> {
  try {
    return await db.transaction(async (tx) => {
      const [row] = await tx
        .insert(expertises)
        .values({ sortOrder: input.sortOrder })
        .returning({ id: expertises.id });
      await tx.insert(expertiseTranslations).values({
        expertiseId: row.id,
        locale: input.locale,
        ...input.translation,
      });
      await writeAudit(tx, {
        actorUserId: actor.id,
        action: "expertise.create",
        entityType: "expertise",
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

export async function updateExpertiseRoot(
  db: Database,
  actor: Actor,
  id: string,
  input: { sortOrder: number; coverAssetId: string | null },
): Promise<void> {
  await db.transaction(async (tx) => {
    const updated = await tx
      .update(expertises)
      .set({ sortOrder: input.sortOrder, coverAssetId: input.coverAssetId })
      .where(eq(expertises.id, id))
      .returning({ id: expertises.id });
    if (updated.length === 0) throw new AdminRuleError("Kayıt bulunamadı.");
    await writeAudit(tx, {
      actorUserId: actor.id,
      action: "expertise.update",
      entityType: "expertise",
      entityId: id,
      metadata: { fields: ["sortOrder", "coverAssetId"] },
      ip: actor.ip,
    });
  });
}

/**
 * Saves one language. A new translation starts as a draft; an existing one
 * keeps its publication status, so edits to a published text go live.
 */
export async function saveExpertiseTranslation(
  db: Database,
  actor: Actor,
  id: string,
  locale: Locale,
  input: ExpertiseTranslationInput,
): Promise<void> {
  try {
    await db.transaction(async (tx) => {
      const [root] = await tx.select({ id: expertises.id }).from(expertises).where(eq(expertises.id, id));
      if (!root) throw new AdminRuleError("Kayıt bulunamadı.");

      const [existing] = await tx
        .select({ id: expertiseTranslations.id, slug: expertiseTranslations.slug })
        .from(expertiseTranslations)
        .where(and(eq(expertiseTranslations.expertiseId, id), eq(expertiseTranslations.locale, locale)));

      if (existing) {
        await rememberSlugChange(tx, {
          locale,
          section: "expertises",
          entityId: id,
          previous: existing.slug,
          next: input.slug,
        });
        await tx.update(expertiseTranslations).set(input).where(eq(expertiseTranslations.id, existing.id));
      } else {
        await tx.insert(expertiseTranslations).values({ expertiseId: id, locale, ...input });
      }

      await writeAudit(tx, {
        actorUserId: actor.id,
        action: existing ? "expertise.translation_update" : "expertise.translation_create",
        entityType: "expertise",
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

export async function deleteExpertise(db: Database, actor: Actor, id: string): Promise<void> {
  await db.transaction(async (tx) => {
    const [fr] = await tx
      .select({ name: expertiseTranslations.name })
      .from(expertiseTranslations)
      .where(and(eq(expertiseTranslations.expertiseId, id), eq(expertiseTranslations.locale, "fr")));
    const deleted = await tx.delete(expertises).where(eq(expertises.id, id)).returning({ id: expertises.id });
    if (deleted.length === 0) throw new AdminRuleError("Kayıt bulunamadı.");
    await writeAudit(tx, {
      actorUserId: actor.id,
      action: "expertise.delete",
      entityType: "expertise",
      entityId: id,
      metadata: fr ? { name: fr.name } : {},
      ip: actor.ip,
    });
  });
}
