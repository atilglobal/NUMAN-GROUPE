import { and, asc, count, desc, eq, ilike, inArray, or } from "drizzle-orm";
import type { Database } from "../db/client";
import {
  expertises,
  expertiseTranslations,
  projectGallery,
  projects,
  projectTranslations,
  type ProjectStatus,
  type PublicationStatus,
} from "../db/schema";
import { rememberSlugChange } from "@/content/slug-redirects";
import { locales, type Locale } from "../i18n/config";
import { ADMIN_PAGE_SIZE, clampPage } from "../lib/pagination";
import { writeAudit } from "./audit";
import { AdminRuleError } from "./users";
import type { ProjectRootInput, ProjectTranslationInput } from "./validation";

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
  return constraint === "project_translations_locale_slug";
}

export type ProjectListRow = {
  id: string;
  label: string | null;
  status: ProjectStatus;
  isFeatured: boolean;
  isDemo: boolean;
  expertiseLabel: string | null;
  countryCode: string | null;
  states: Record<Locale, PublicationStatus | "missing">;
};

export type ProjectListResult = {
  rows: ProjectListRow[];
  total: number;
  page: number;
  pageSize: number;
};

export async function listProjectsForAdmin(
  db: Database,
  filters: { q?: string; status?: ProjectStatus; expertiseId?: string; page: number },
): Promise<ProjectListResult> {
  const conditions = [
    filters.status ? eq(projects.status, filters.status) : undefined,
    filters.expertiseId ? eq(projects.expertiseId, filters.expertiseId) : undefined,
  ];

  if (filters.q) {
    const matches = await db
      .selectDistinct({ id: projectTranslations.projectId })
      .from(projectTranslations)
      .where(
        or(ilike(projectTranslations.title, `%${filters.q}%`), ilike(projectTranslations.slug, `%${filters.q}%`)),
      );
    const ids = matches.map((row) => row.id);
    if (ids.length === 0) return { rows: [], total: 0, page: 1, pageSize: ADMIN_PAGE_SIZE };
    conditions.push(inArray(projects.id, ids));
  }

  const where = and(...conditions);

  const [totalRow] = await db.select({ value: count() }).from(projects).where(where);
  const total = Number(totalRow?.value ?? 0);
  const page = clampPage(filters.page, total, ADMIN_PAGE_SIZE);

  const roots = await db
    .select({
      id: projects.id,
      status: projects.status,
      isFeatured: projects.isFeatured,
      isDemo: projects.isDemo,
      countryCode: projects.countryCode,
      expertiseId: projects.expertiseId,
    })
    .from(projects)
    .where(where)
    .orderBy(desc(projects.isFeatured), asc(projects.sortOrder), desc(projects.createdAt))
    .limit(ADMIN_PAGE_SIZE)
    .offset((page - 1) * ADMIN_PAGE_SIZE);

  if (roots.length === 0) return { rows: [], total, page, pageSize: ADMIN_PAGE_SIZE };

  const [translations, expertiseNames] = await Promise.all([
    db
      .select({
        projectId: projectTranslations.projectId,
        locale: projectTranslations.locale,
        status: projectTranslations.status,
        title: projectTranslations.title,
      })
      .from(projectTranslations)
      .where(inArray(projectTranslations.projectId, roots.map((r) => r.id))),
    db
      .select({ id: expertises.id, name: expertiseTranslations.name })
      .from(expertises)
      .leftJoin(
        expertiseTranslations,
        and(eq(expertiseTranslations.expertiseId, expertises.id), eq(expertiseTranslations.locale, "fr")),
      ),
  ]);

  const rows = roots.map((root) => {
    const own = translations.filter((row) => row.projectId === root.id);
    const states = Object.fromEntries(
      locales.map((locale) => [locale, own.find((row) => row.locale === locale)?.status ?? "missing"]),
    ) as ProjectListRow["states"];
    const label = own.find((row) => row.locale === "fr")?.title ?? own[0]?.title ?? null;
    return {
      id: root.id,
      label,
      status: root.status,
      isFeatured: root.isFeatured,
      isDemo: root.isDemo,
      countryCode: root.countryCode,
      expertiseLabel: expertiseNames.find((row) => row.id === root.expertiseId)?.name ?? null,
      states,
    };
  });

  return { rows, total, page, pageSize: ADMIN_PAGE_SIZE };
}

export type ProjectTranslationRow = ProjectTranslationInput & {
  locale: Locale;
  status: PublicationStatus;
  publishedAt: Date | null;
  updatedAt: Date;
};

export type ProjectEditor = {
  id: string;
  status: ProjectStatus;
  expertiseId: string | null;
  countryCode: string | null;
  startedOn: string | null;
  completedOn: string | null;
  videoUrl: string | null;
  progressPercent: number | null;
  isFeatured: boolean;
  sortOrder: number;
  isDemo: boolean;
  coverAssetId: string | null;
  gallery: string[];
  translations: Partial<Record<Locale, ProjectTranslationRow>>;
};

export async function getProjectForEditor(db: Database, id: string): Promise<ProjectEditor | null> {
  const [root] = await db.select().from(projects).where(eq(projects.id, id));
  if (!root) return null;
  const [rows, gallery] = await Promise.all([
    db.select().from(projectTranslations).where(eq(projectTranslations.projectId, id)),
    db
      .select({ assetId: projectGallery.assetId })
      .from(projectGallery)
      .where(eq(projectGallery.projectId, id))
      .orderBy(asc(projectGallery.sortOrder)),
  ]);
  const translations: ProjectEditor["translations"] = {};
  for (const row of rows) {
    translations[row.locale] = {
      locale: row.locale,
      title: row.title,
      slug: row.slug,
      summary: row.summary,
      body: row.body,
      city: row.city,
      seoTitle: row.seoTitle,
      seoDescription: row.seoDescription,
      technicalDetails: row.technicalDetails,
      status: row.status,
      publishedAt: row.publishedAt,
      updatedAt: row.updatedAt,
    };
  }
  return { ...root, gallery: gallery.map((row) => row.assetId), translations };
}

async function writeGallery(tx: Database, projectId: string, assetIds: string[]) {
  await tx.delete(projectGallery).where(eq(projectGallery.projectId, projectId));
  if (assetIds.length === 0) return;
  await tx.insert(projectGallery).values(assetIds.map((assetId, index) => ({ projectId, assetId, sortOrder: index })));
}

export async function createProject(
  db: Database,
  actor: Actor,
  input: { root: ProjectRootInput; locale: Locale; translation: ProjectTranslationInput },
): Promise<string> {
  try {
    return await db.transaction(async (tx) => {
      const [row] = await tx
        .insert(projects)
        .values({
          status: input.root.status,
          expertiseId: input.root.expertiseId,
          countryCode: input.root.countryCode,
          startedOn: input.root.startedOn,
          completedOn: input.root.completedOn,
          videoUrl: input.root.videoUrl,
          progressPercent: input.root.progressPercent,
          isFeatured: input.root.isFeatured,
          sortOrder: input.root.sortOrder,
          coverAssetId: input.root.coverAssetId,
        })
        .returning({ id: projects.id });
      await tx.insert(projectTranslations).values({
        projectId: row.id,
        locale: input.locale,
        ...input.translation,
      });
      await writeGallery(tx, row.id, input.root.gallery);
      await writeAudit(tx, {
        actorUserId: actor.id,
        action: "project.create",
        entityType: "project",
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

export async function updateProjectRoot(db: Database, actor: Actor, id: string, input: ProjectRootInput): Promise<void> {
  await db.transaction(async (tx) => {
    const updated = await tx
      .update(projects)
      .set({
        status: input.status,
        expertiseId: input.expertiseId,
        countryCode: input.countryCode,
        startedOn: input.startedOn,
        completedOn: input.completedOn,
        videoUrl: input.videoUrl,
        progressPercent: input.progressPercent,
        isFeatured: input.isFeatured,
        sortOrder: input.sortOrder,
        coverAssetId: input.coverAssetId,
      })
      .where(eq(projects.id, id))
      .returning({ id: projects.id });
    if (updated.length === 0) throw new AdminRuleError("Kayıt bulunamadı.");
    await writeGallery(tx, id, input.gallery);
    await writeAudit(tx, {
      actorUserId: actor.id,
      action: "project.update",
      entityType: "project",
      entityId: id,
      ip: actor.ip,
    });
  });
}

export async function saveProjectTranslation(
  db: Database,
  actor: Actor,
  id: string,
  locale: Locale,
  input: ProjectTranslationInput,
): Promise<void> {
  try {
    await db.transaction(async (tx) => {
      const [root] = await tx.select({ id: projects.id }).from(projects).where(eq(projects.id, id));
      if (!root) throw new AdminRuleError("Kayıt bulunamadı.");
      const [existing] = await tx
        .select({ id: projectTranslations.id, slug: projectTranslations.slug })
        .from(projectTranslations)
        .where(and(eq(projectTranslations.projectId, id), eq(projectTranslations.locale, locale)));
      if (existing) {
        await rememberSlugChange(tx, {
          locale,
          section: "projects",
          entityId: id,
          previous: existing.slug,
          next: input.slug,
        });
        await tx.update(projectTranslations).set(input).where(eq(projectTranslations.id, existing.id));
      } else {
        await tx.insert(projectTranslations).values({ projectId: id, locale, ...input });
      }
      await writeAudit(tx, {
        actorUserId: actor.id,
        action: existing ? "project.translation_update" : "project.translation_create",
        entityType: "project",
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

export async function deleteProject(db: Database, actor: Actor, id: string): Promise<void> {
  await db.transaction(async (tx) => {
    const [fr] = await tx
      .select({ title: projectTranslations.title })
      .from(projectTranslations)
      .where(and(eq(projectTranslations.projectId, id), eq(projectTranslations.locale, "fr")));
    const deleted = await tx.delete(projects).where(eq(projects.id, id)).returning({ id: projects.id });
    if (deleted.length === 0) throw new AdminRuleError("Kayıt bulunamadı.");
    await writeAudit(tx, {
      actorUserId: actor.id,
      action: "project.delete",
      entityType: "project",
      entityId: id,
      metadata: fr ? { name: fr.title } : {},
      ip: actor.ip,
    });
  });
}

export async function listExpertiseOptions(db: Database): Promise<{ id: string; label: string }[]> {
  const rows = await db
    .select({
      id: expertises.id,
      name: expertiseTranslations.name,
      sortOrder: expertises.sortOrder,
    })
    .from(expertises)
    .leftJoin(
      expertiseTranslations,
      and(eq(expertiseTranslations.expertiseId, expertises.id), eq(expertiseTranslations.locale, "fr")),
    )
    .orderBy(asc(expertises.sortOrder), asc(expertiseTranslations.name));
  return rows.map((row) => ({ id: row.id, label: row.name ?? "(adsız uzmanlık)" }));
}
