import { and, asc, count, desc, eq, inArray, ne, sql, type SQL } from "drizzle-orm";
import type { AnyPgColumn } from "drizzle-orm/pg-core";
import type { Database } from "@/db/client";
import {
  expertises,
  expertiseTranslations,
  mediaAssets,
  mediaAssetTranslations,
  officialVisitGallery,
  officialVisitParticipants,
  officialVisitParticipantTranslations,
  officialVisits,
  officialVisitTranslations,
  pageContents,
  pageContentTranslations,
  aboutSectionKeys,
  projectGallery,
  projects,
  projectTranslations,
  siteSettings,
  siteSettingTranslations,
  teamMemberLinks,
  teamMembers,
  teamMemberTranslations,
  cmsPages,
  cmsPageTranslations,
  menus,
  menuItems,
  menuItemTranslations,
  uiStringOverrides,
  type CmsBlockCopy,
  type CmsLayoutBlock,
  type PageKey,
} from "@/db/schema";
import type { Locale } from "@/i18n/config";
import { cmsPagePath, sectionPath, type DetailSection, type Section } from "@/i18n/routes";
import { formatPlace } from "@/lib/place";
import { normalizeGroupLayout } from "./group-layout";
import { normalizeHomeLayout } from "./home-layout";
import { mediaUrl } from "@/media/url";
import { clampPage, PUBLIC_PAGE_SIZE, VISIT_PAGE_SIZE } from "@/lib/pagination";
import type {
  DetailEntry,
  ExpertiseView,
  AboutSectionView,
  HomeCopyView,
  HomeVisuals,
  LocaleSlugs,
  PageView,
  SiteChrome,
  ProjectListFilters,
  ProjectListResult,
  ProjectView,
  PublishedEntry,
  ResolvedImage,
  TeamMemberView,
  VisitListFilters,
  VisitListResult,
  VisitView,
} from "./types";

/*
 * Public read model. Every query returns only rows published in the requested
 * language: a missing or draft translation is absent, never replaced by
 * another language. Demo rows and demo images drop out unless `demo` is on.
 */

export type ReadOptions = { demo: boolean };

const published = (status: AnyPgColumn) => eq(status, "published");

function visible(isDemo: AnyPgColumn, { demo }: ReadOptions): SQL | undefined {
  return demo ? undefined : eq(isDemo, false);
}

function pickLocaleCopy(
  rows: { locale: Locale; alt: string; caption: string | null }[],
  locale: Locale,
  fallback: string,
): { alt: string; caption: string | null } {
  const exact = rows.find((row) => row.locale === locale);
  const any = rows.find((row) => row.alt.trim());
  return {
    alt: exact?.alt.trim() || any?.alt.trim() || fallback,
    caption: exact?.caption ?? null,
  };
}

async function loadImages(
  db: Database,
  ids: (string | null)[],
  locale: Locale,
  options: ReadOptions,
): Promise<Map<string, ResolvedImage>> {
  const wanted = [...new Set(ids.filter((id): id is string => Boolean(id)))];
  if (wanted.length === 0) return new Map();

  const [assets, translations] = await Promise.all([
    db
      .select({
        id: mediaAssets.id,
        storageKey: mediaAssets.storageKey,
        width: mediaAssets.width,
        height: mediaAssets.height,
        focalX: mediaAssets.focalX,
        focalY: mediaAssets.focalY,
        isDemo: mediaAssets.isDemo,
        originalFilename: mediaAssets.originalFilename,
      })
      .from(mediaAssets)
      .where(and(inArray(mediaAssets.id, wanted), visible(mediaAssets.isDemo, options))),
    db
      .select({
        assetId: mediaAssetTranslations.assetId,
        locale: mediaAssetTranslations.locale,
        alt: mediaAssetTranslations.alt,
        caption: mediaAssetTranslations.caption,
      })
      .from(mediaAssetTranslations)
      .where(inArray(mediaAssetTranslations.assetId, wanted)),
  ]);

  return new Map(
    assets.map((asset) => {
      const copy = pickLocaleCopy(
        translations.filter((row) => row.assetId === asset.id),
        locale,
        asset.originalFilename?.trim() || asset.storageKey,
      );
      return [
        asset.id,
        {
          src: mediaUrl(asset.storageKey),
          width: asset.width,
          height: asset.height,
          alt: copy.alt,
          caption: copy.caption,
          isDemo: asset.isDemo,
          assetId: asset.id,
          focalX: asset.focalX,
          focalY: asset.focalY,
        },
      ];
    }),
  );
}

export async function listExpertises(
  db: Database,
  locale: Locale,
  options: ReadOptions,
): Promise<ExpertiseView[]> {
  const rows = await db
    .select({
      id: expertises.id,
      coverAssetId: expertises.coverAssetId,
      slug: expertiseTranslations.slug,
      name: expertiseTranslations.name,
      summary: expertiseTranslations.summary,
    })
    .from(expertises)
    .innerJoin(
      expertiseTranslations,
      and(
        eq(expertiseTranslations.expertiseId, expertises.id),
        eq(expertiseTranslations.locale, locale),
        published(expertiseTranslations.status),
      ),
    )
    .where(visible(expertises.isDemo, options))
    .orderBy(asc(expertises.sortOrder), asc(expertiseTranslations.name));

  const images = await loadImages(db, rows.map((r) => r.coverAssetId), locale, options);
  return rows.map(({ coverAssetId, ...row }) => ({
    ...row,
    image: (coverAssetId && images.get(coverAssetId)) || null,
  }));
}

export async function listProjects(
  db: Database,
  locale: Locale,
  options: ReadOptions & { limit?: number; featuredOnly?: boolean },
): Promise<ProjectView[]> {
  const query = db
    .select({
      id: projects.id,
      status: projects.status,
      coverAssetId: projects.coverAssetId,
      isDemo: projects.isDemo,
      slug: projectTranslations.slug,
      title: projectTranslations.title,
      summary: projectTranslations.summary,
    })
    .from(projects)
    .innerJoin(
      projectTranslations,
      and(
        eq(projectTranslations.projectId, projects.id),
        eq(projectTranslations.locale, locale),
        published(projectTranslations.status),
      ),
    )
    .where(
      and(visible(projects.isDemo, options), options.featuredOnly ? eq(projects.isFeatured, true) : undefined),
    )
    .orderBy(desc(projects.isFeatured), asc(projects.sortOrder), desc(projects.createdAt));

  const rows = options.limit ? await query.limit(options.limit) : await query;
  return hydrateProjects(db, locale, options, rows);
}

function projectWhere(
  options: ReadOptions,
  filters: Pick<ProjectListFilters, "status">,
): SQL | undefined {
  return and(
    visible(projects.isDemo, options),
    filters.status ? eq(projects.status, filters.status) : undefined,
  );
}

async function hydrateProjects(
  db: Database,
  locale: Locale,
  options: ReadOptions,
  rows: {
    id: string;
    status: ProjectView["status"];
    coverAssetId: string | null;
    isDemo: boolean;
    slug: string;
    title: string;
    summary: string | null;
  }[],
): Promise<ProjectView[]> {
  const images = await loadImages(db, rows.map((r) => r.coverAssetId), locale, options);
  return rows.map(({ coverAssetId, ...row }) => ({
    ...row,
    image: (coverAssetId && images.get(coverAssetId)) || null,
  }));
}

const projectSelect = {
  id: projects.id,
  status: projects.status,
  coverAssetId: projects.coverAssetId,
  isDemo: projects.isDemo,
  slug: projectTranslations.slug,
  title: projectTranslations.title,
  summary: projectTranslations.summary,
};

function projectJoins(db: Database, locale: Locale) {
  return db
    .select(projectSelect)
    .from(projects)
    .innerJoin(
      projectTranslations,
      and(
        eq(projectTranslations.projectId, projects.id),
        eq(projectTranslations.locale, locale),
        published(projectTranslations.status),
      ),
    );
}

export async function listProjectsPage(
  db: Database,
  locale: Locale,
  options: ReadOptions,
  filters: ProjectListFilters,
): Promise<ProjectListResult> {
  const where = projectWhere(options, filters);
  const [totalRow] = await db
    .select({ value: count() })
    .from(projects)
    .innerJoin(
      projectTranslations,
      and(
        eq(projectTranslations.projectId, projects.id),
        eq(projectTranslations.locale, locale),
        published(projectTranslations.status),
      ),
    )
    .where(where);
  const total = Number(totalRow?.value ?? 0);
  const page = clampPage(filters.page, total, PUBLIC_PAGE_SIZE);
  const offset = (page - 1) * PUBLIC_PAGE_SIZE;

  const rows = await projectJoins(db, locale)
    .where(where)
    .orderBy(desc(projects.isFeatured), asc(projects.sortOrder), desc(projects.createdAt))
    .limit(PUBLIC_PAGE_SIZE)
    .offset(offset);

  return {
    items: await hydrateProjects(db, locale, options, rows),
    total,
    page,
    pageSize: PUBLIC_PAGE_SIZE,
  };
}

export async function listRelatedProjects(
  db: Database,
  locale: Locale,
  options: ReadOptions,
  input: { projectId: string; limit?: number },
): Promise<ProjectView[]> {
  const rows = await projectJoins(db, locale)
    .where(and(visible(projects.isDemo, options), ne(projects.id, input.projectId)))
    .orderBy(desc(projects.isFeatured), asc(projects.sortOrder), desc(projects.createdAt))
    .limit(input.limit ?? 3);
  return hydrateProjects(db, locale, options, rows);
}

export async function listProjectsForExpertise(
  db: Database,
  locale: Locale,
  options: ReadOptions,
  expertiseId: string,
  limit = 6,
): Promise<ProjectView[]> {
  const rows = await projectJoins(db, locale)
    .where(and(visible(projects.isDemo, options), eq(projects.expertiseId, expertiseId)))
    .orderBy(desc(projects.isFeatured), asc(projects.sortOrder), desc(projects.createdAt))
    .limit(limit);
  return hydrateProjects(db, locale, options, rows);
}

function visitWhere(
  _locale: Locale,
  options: ReadOptions,
  filters: { country?: string; year?: number; featuredOnly?: boolean } = {},
): SQL | undefined {
  return and(
    visible(officialVisits.isDemo, options),
    filters.country ? eq(officialVisits.countryCode, filters.country) : undefined,
    filters.year
      ? sql`date_part('year', ${officialVisits.visitedOn}::date) = ${filters.year}`
      : undefined,
    filters.featuredOnly ? eq(officialVisits.isFeatured, true) : undefined,
  );
}

function visitJoins(db: Database, locale: Locale) {
  return db
    .select({
      id: officialVisits.id,
      visitedOn: officialVisits.visitedOn,
      coverAssetId: officialVisits.coverAssetId,
      isDemo: officialVisits.isDemo,
      slug: officialVisitTranslations.slug,
      title: officialVisitTranslations.title,
      summary: officialVisitTranslations.summary,
      host: officialVisitTranslations.hostInstitution,
      location: officialVisitTranslations.location,
      countryCode: officialVisits.countryCode,
    })
    .from(officialVisits)
    .innerJoin(
      officialVisitTranslations,
      and(
        eq(officialVisitTranslations.visitId, officialVisits.id),
        eq(officialVisitTranslations.locale, locale),
        published(officialVisitTranslations.status),
      ),
    );
}

async function hydrateVisits(
  db: Database,
  locale: Locale,
  options: ReadOptions,
  rows: {
    id: string;
    visitedOn: string | null;
    coverAssetId: string | null;
    isDemo: boolean;
    slug: string;
    title: string;
    summary: string | null;
    host: string | null;
    location: string | null;
    countryCode: string | null;
  }[],
): Promise<VisitView[]> {
  const images = await loadImages(db, rows.map((r) => r.coverAssetId), locale, options);
  return rows.map(({ coverAssetId, location, ...row }) => ({
    ...row,
    place: formatPlace(locale, location, row.countryCode),
    image: (coverAssetId && images.get(coverAssetId)) || null,
  }));
}

export async function listVisits(
  db: Database,
  locale: Locale,
  options: ReadOptions & { limit?: number; featuredOnly?: boolean },
): Promise<VisitView[]> {
  const query = visitJoins(db, locale)
    .where(visitWhere(locale, options, { featuredOnly: options.featuredOnly }))
    .orderBy(sql`${officialVisits.visitedOn} desc nulls last`, desc(officialVisits.createdAt));
  const rows = options.limit ? await query.limit(options.limit) : await query;
  return hydrateVisits(db, locale, options, rows);
}

export async function listVisitsPage(
  db: Database,
  locale: Locale,
  options: ReadOptions,
  filters: VisitListFilters,
): Promise<VisitListResult> {
  const where = visitWhere(locale, options, filters);
  const [totalRow] = await db
    .select({ value: count() })
    .from(officialVisits)
    .innerJoin(
      officialVisitTranslations,
      and(
        eq(officialVisitTranslations.visitId, officialVisits.id),
        eq(officialVisitTranslations.locale, locale),
        published(officialVisitTranslations.status),
      ),
    )
    .where(where);
  const total = Number(totalRow?.value ?? 0);
  const page = clampPage(filters.page, total, VISIT_PAGE_SIZE);

  const [rows, countryRows, yearRows] = await Promise.all([
    visitJoins(db, locale)
      .where(where)
      .orderBy(sql`${officialVisits.visitedOn} desc nulls last`, desc(officialVisits.createdAt))
      .limit(VISIT_PAGE_SIZE)
      .offset((page - 1) * VISIT_PAGE_SIZE),
    db
      .selectDistinct({ code: officialVisits.countryCode })
      .from(officialVisits)
      .innerJoin(
        officialVisitTranslations,
        and(
          eq(officialVisitTranslations.visitId, officialVisits.id),
          eq(officialVisitTranslations.locale, locale),
          published(officialVisitTranslations.status),
        ),
      )
      .where(and(visible(officialVisits.isDemo, options), sql`${officialVisits.countryCode} is not null`))
      .orderBy(asc(officialVisits.countryCode)),
    db
      .selectDistinct({ year: sql<number>`date_part('year', ${officialVisits.visitedOn}::date)`.as("year") })
      .from(officialVisits)
      .innerJoin(
        officialVisitTranslations,
        and(
          eq(officialVisitTranslations.visitId, officialVisits.id),
          eq(officialVisitTranslations.locale, locale),
          published(officialVisitTranslations.status),
        ),
      )
      .where(and(visible(officialVisits.isDemo, options), sql`${officialVisits.visitedOn} is not null`))
      .orderBy(sql`year desc`),
  ]);

  return {
    items: await hydrateVisits(db, locale, options, rows),
    total,
    page,
    pageSize: VISIT_PAGE_SIZE,
    countries: countryRows.filter((row): row is { code: string } => Boolean(row.code)),
    years: yearRows.map((row) => Number(row.year)).filter((year) => Number.isFinite(year)),
  };
}

export async function listRelatedVisits(
  db: Database,
  locale: Locale,
  options: ReadOptions,
  input: { visitId: string; countryCode: string | null; limit?: number },
): Promise<VisitView[]> {
  if (!input.countryCode) return [];
  const rows = await visitJoins(db, locale)
    .where(
      and(
        visible(officialVisits.isDemo, options),
        ne(officialVisits.id, input.visitId),
        eq(officialVisits.countryCode, input.countryCode),
      ),
    )
    .orderBy(sql`${officialVisits.visitedOn} desc nulls last`, desc(officialVisits.createdAt))
    .limit(input.limit ?? 3);
  return hydrateVisits(db, locale, options, rows);
}

export async function listTeam(
  db: Database,
  locale: Locale,
  options: ReadOptions & { limit?: number },
): Promise<TeamMemberView[]> {
  const query = db
    .select({
      id: teamMembers.id,
      fullName: teamMembers.fullName,
      photoAssetId: teamMembers.photoAssetId,
      presentationGroup: teamMembers.presentationGroup,
      isDemo: teamMembers.isDemo,
      roleTitle: teamMemberTranslations.roleTitle,
      summary: teamMemberTranslations.summary,
      bio: teamMemberTranslations.bio,
    })
    .from(teamMembers)
    .innerJoin(
      teamMemberTranslations,
      and(
        eq(teamMemberTranslations.memberId, teamMembers.id),
        eq(teamMemberTranslations.locale, locale),
        published(teamMemberTranslations.status),
      ),
    )
    .where(and(eq(teamMembers.isVisible, true), visible(teamMembers.isDemo, options)))
    .orderBy(asc(teamMembers.sortOrder), asc(teamMembers.fullName));

  const rows = options.limit ? await query.limit(options.limit) : await query;
  if (rows.length === 0) return [];

  const [images, links] = await Promise.all([
    loadImages(db, rows.map((r) => r.photoAssetId), locale, options),
    db
      .select({
        memberId: teamMemberLinks.memberId,
        label: teamMemberLinks.label,
        url: teamMemberLinks.url,
      })
      .from(teamMemberLinks)
      .where(inArray(teamMemberLinks.memberId, rows.map((r) => r.id)))
      .orderBy(asc(teamMemberLinks.sortOrder)),
  ]);

  return rows.map(({ photoAssetId, presentationGroup, ...row }) => ({
    ...row,
    presentationGroup:
      presentationGroup === "leadership" ||
      presentationGroup === "international" ||
      presentationGroup === "technical" ||
      presentationGroup === "legal" ||
      presentationGroup === "finance"
        ? presentationGroup
        : null,
    photo: (photoAssetId && images.get(photoAssetId)) || null,
    links: links
      .filter((link) => link.memberId === row.id && link.url.startsWith("https://") && link.label.trim())
      .map(({ label, url }) => ({ label, url })),
  }));
}

type DetailRow = Omit<DetailEntry, "slugs" | "image" | "gallery"> & { coverAssetId: string | null };

const isFilled = (value: string | null | undefined) => Boolean(value?.trim());
type SlugRow = { id: string; locale: Locale; slug: string; updatedAt: Date };

type DetailLookup = { slug: string } | { id: string };

async function detailRow(
  db: Database,
  section: DetailSection,
  locale: Locale,
  lookup: DetailLookup,
  options: ReadOptions,
  publishedOnly: boolean,
): Promise<DetailRow | undefined> {
  switch (section) {
    case "expertises": {
      const t = expertiseTranslations;
      const [row] = await db
        .select({
          id: expertises.id,
          title: t.name,
          summary: t.summary,
          body: t.body,
          seoTitle: t.seoTitle,
          seoDescription: t.seoDescription,
          isDemo: expertises.isDemo,
          coverAssetId: expertises.coverAssetId,
        })
        .from(t)
        .innerJoin(expertises, eq(expertises.id, t.expertiseId))
        .where(
          and(
            eq(t.locale, locale),
            "slug" in lookup ? eq(t.slug, lookup.slug) : eq(t.expertiseId, lookup.id),
            publishedOnly ? published(t.status) : undefined,
            publishedOnly ? visible(expertises.isDemo, options) : undefined,
          ),
        );
      return row && { ...row, facts: { kind: "expertise" } };
    }
    case "projects": {
      const t = projectTranslations;
      const [row] = await db
        .select({
          id: projects.id,
          title: t.title,
          summary: t.summary,
          body: t.body,
          seoTitle: t.seoTitle,
          seoDescription: t.seoDescription,
          isDemo: projects.isDemo,
          coverAssetId: projects.coverAssetId,
          status: projects.status,
        })
        .from(t)
        .innerJoin(projects, eq(projects.id, t.projectId))
        .where(
          and(
            eq(t.locale, locale),
            "slug" in lookup ? eq(t.slug, lookup.slug) : eq(t.projectId, lookup.id),
            publishedOnly ? published(t.status) : undefined,
            publishedOnly ? visible(projects.isDemo, options) : undefined,
          ),
        );
      if (!row) return undefined;
      const { status, ...base } = row;
      return {
        ...base,
        facts: {
          kind: "project",
          status,
        },
      };
    }
    case "visits": {
      const t = officialVisitTranslations;
      const [row] = await db
        .select({
          id: officialVisits.id,
          title: t.title,
          summary: t.summary,
          body: t.body,
          seoTitle: t.seoTitle,
          seoDescription: t.seoDescription,
          isDemo: officialVisits.isDemo,
          coverAssetId: officialVisits.coverAssetId,
          visitedOn: officialVisits.visitedOn,
          countryCode: officialVisits.countryCode,
          host: t.hostInstitution,
          location: t.location,
        })
        .from(t)
        .innerJoin(officialVisits, eq(officialVisits.id, t.visitId))
        .where(
          and(
            eq(t.locale, locale),
            "slug" in lookup ? eq(t.slug, lookup.slug) : eq(t.visitId, lookup.id),
            publishedOnly ? published(t.status) : undefined,
            publishedOnly ? visible(officialVisits.isDemo, options) : undefined,
          ),
        );
      if (!row) return undefined;

      const participants = await db
        .select({
          fullName: officialVisitParticipants.fullName,
          roleTitle: officialVisitParticipantTranslations.roleTitle,
        })
        .from(officialVisitParticipants)
        .leftJoin(
          officialVisitParticipantTranslations,
          and(
            eq(officialVisitParticipantTranslations.participantId, officialVisitParticipants.id),
            eq(officialVisitParticipantTranslations.locale, locale),
          ),
        )
        .where(eq(officialVisitParticipants.visitId, row.id))
        .orderBy(asc(officialVisitParticipants.sortOrder), asc(officialVisitParticipants.fullName));

      const { visitedOn, countryCode, host, location, ...base } = row;
      return {
        ...base,
        facts: {
          kind: "visit",
          visitedOn,
          host: isFilled(host) ? host : null,
          place: formatPlace(locale, location, countryCode),
          countryCode,
          participants: participants.map((p) => ({
            fullName: p.fullName,
            roleTitle: isFilled(p.roleTitle) ? p.roleTitle : null,
          })),
        },
      };
    }
  }
}

async function galleryIds(db: Database, section: DetailSection, id: string): Promise<string[]> {
  switch (section) {
    case "expertises":
      return [];
    case "projects":
      return (
        await db
          .select({ assetId: projectGallery.assetId })
          .from(projectGallery)
          .where(eq(projectGallery.projectId, id))
          .orderBy(asc(projectGallery.sortOrder))
      ).map((row) => row.assetId);
    case "visits":
      return (
        await db
          .select({ assetId: officialVisitGallery.assetId })
          .from(officialVisitGallery)
          .where(eq(officialVisitGallery.visitId, id))
          .orderBy(asc(officialVisitGallery.sortOrder))
      ).map((row) => row.assetId);
  }
}

/** Published slugs per entry of a section, optionally for one entry only. */
async function publishedSlugRows(
  db: Database,
  section: DetailSection,
  options: ReadOptions,
  entityId?: string,
  publishedOnly = true,
): Promise<SlugRow[]> {
  switch (section) {
    case "expertises": {
      const t = expertiseTranslations;
      return db
        .select({ id: t.expertiseId, locale: t.locale, slug: t.slug, updatedAt: t.updatedAt })
        .from(t)
        .innerJoin(expertises, eq(expertises.id, t.expertiseId))
        .where(
          and(
            publishedOnly ? published(t.status) : undefined,
            publishedOnly ? visible(expertises.isDemo, options) : undefined,
            entityId ? eq(t.expertiseId, entityId) : undefined,
          ),
        );
    }
    case "projects": {
      const t = projectTranslations;
      return db
        .select({ id: t.projectId, locale: t.locale, slug: t.slug, updatedAt: t.updatedAt })
        .from(t)
        .innerJoin(projects, eq(projects.id, t.projectId))
        .where(
          and(
            publishedOnly ? published(t.status) : undefined,
            publishedOnly ? visible(projects.isDemo, options) : undefined,
            entityId ? eq(t.projectId, entityId) : undefined,
          ),
        );
    }
    case "visits": {
      const t = officialVisitTranslations;
      return db
        .select({ id: t.visitId, locale: t.locale, slug: t.slug, updatedAt: t.updatedAt })
        .from(t)
        .innerJoin(officialVisits, eq(officialVisits.id, t.visitId))
        .where(
          and(
            publishedOnly ? published(t.status) : undefined,
            publishedOnly ? visible(officialVisits.isDemo, options) : undefined,
            entityId ? eq(t.visitId, entityId) : undefined,
          ),
        );
    }
  }
}

async function assembleDetail(
  db: Database,
  section: DetailSection,
  locale: Locale,
  lookup: DetailLookup,
  options: ReadOptions,
  publishedOnly: boolean,
): Promise<DetailEntry | null> {
  const row = await detailRow(db, section, locale, lookup, options, publishedOnly);
  if (!row) return null;

  const [slugRows, gallery] = await Promise.all([
    publishedSlugRows(db, section, options, row.id, publishedOnly),
    galleryIds(db, section, row.id),
  ]);
  const slugs: LocaleSlugs = {};
  for (const entry of slugRows) slugs[entry.locale] = entry.slug;

  const { coverAssetId, ...entry } = row;
  const images = await loadImages(db, [coverAssetId, ...gallery], locale, options);
  return {
    ...entry,
    image: (coverAssetId && images.get(coverAssetId)) || null,
    gallery: gallery.flatMap((id) => images.get(id) ?? []),
    slugs,
  };
}

export async function findDetail(
  db: Database,
  section: DetailSection,
  locale: Locale,
  slug: string,
  options: ReadOptions,
): Promise<DetailEntry | null> {
  return assembleDetail(db, section, locale, { slug }, options, true);
}

/** Panel preview: drafts included, never used on public routes. */
export async function findPreviewDetail(
  db: Database,
  section: DetailSection,
  locale: Locale,
  id: string,
): Promise<DetailEntry | null> {
  return assembleDetail(db, section, locale, { id }, { demo: true }, false);
}

const detailSections: DetailSection[] = ["expertises", "projects", "visits"];

/** Every published detail page, grouped per entry; feeds the sitemap and prerendering. */
export async function listPublishedEntries(
  db: Database,
  options: ReadOptions,
): Promise<PublishedEntry[]> {
  const entries: PublishedEntry[] = [];
  for (const section of detailSections) {
    const byId = new Map<string, PublishedEntry>();
    for (const row of await publishedSlugRows(db, section, options)) {
      const entry = byId.get(row.id) ?? { section, id: row.id, slugs: {}, updatedAt: row.updatedAt };
      entry.slugs[row.locale] = row.slug;
      if (row.updatedAt > entry.updatedAt) entry.updatedAt = row.updatedAt;
      byId.set(row.id, entry);
    }
    entries.push(...byId.values());
  }
  return entries;
}

export async function findPage(
  db: Database,
  key: PageKey,
  locale: Locale,
): Promise<PageView | null> {
  const t = pageContentTranslations;
  const [row] = await db
    .select({
      title: t.title,
      summary: t.summary,
      body: t.body,
      seoTitle: t.seoTitle,
      seoDescription: t.seoDescription,
      updatedAt: t.updatedAt,
    })
    .from(t)
    .innerJoin(pageContents, eq(pageContents.id, t.pageId))
    .where(and(eq(pageContents.key, key), eq(t.locale, locale), published(t.status)));
  return row ?? null;
}

/** Languages in which an institutional page is published. */
export async function publishedPageLocales(db: Database, key: PageKey): Promise<Locale[]> {
  const t = pageContentTranslations;
  const rows = await db
    .select({ locale: t.locale })
    .from(t)
    .innerJoin(pageContents, eq(pageContents.id, t.pageId))
    .where(and(eq(pageContents.key, key), published(t.status)));
  return rows.map((row) => row.locale);
}

export async function getHomeVisuals(
  db: Database,
  locale: Locale,
  options: ReadOptions,
): Promise<HomeVisuals> {
  const chrome = await getSiteChrome(db, locale, options);
  return chrome.homeVisuals;
}

export async function listAboutSections(db: Database, locale: Locale): Promise<AboutSectionView[]> {
  const rows = await db
    .select({
      key: pageContents.key,
      title: pageContentTranslations.title,
      summary: pageContentTranslations.summary,
      body: pageContentTranslations.body,
    })
    .from(pageContents)
    .innerJoin(
      pageContentTranslations,
      and(
        eq(pageContentTranslations.pageId, pageContents.id),
        eq(pageContentTranslations.locale, locale),
        published(pageContentTranslations.status),
      ),
    )
    .where(inArray(pageContents.key, [...aboutSectionKeys]));
  return aboutSectionKeys.flatMap((key) => {
    const row = rows.find((item) => item.key === key);
    if (!row) return [];
    if (key === "certificates" && !row.body?.trim() && !row.summary?.trim()) return [];
    return [{ key, title: row.title, summary: row.summary, body: row.body }];
  });
}

function filledSocial(links: { label: string; url: string }[] | null | undefined) {
  return (links ?? []).filter((item) => item.label?.trim() && item.url?.startsWith("https://"));
}

async function resolveFaviconSrc(
  db: Database,
  assetId: string | null | undefined,
  options: ReadOptions,
): Promise<string | null> {
  if (!assetId) return null;
  const [asset] = await db
    .select({ storageKey: mediaAssets.storageKey, isDemo: mediaAssets.isDemo })
    .from(mediaAssets)
    .where(and(eq(mediaAssets.id, assetId), visible(mediaAssets.isDemo, options)));
  return asset ? mediaUrl(asset.storageKey) : null;
}

export async function getSiteChrome(
  db: Database,
  locale: Locale,
  options: ReadOptions,
): Promise<SiteChrome> {
  const [settings] = await db.select().from(siteSettings).where(eq(siteSettings.id, 1));
  const [copyRow] = settings
    ? await db
        .select()
        .from(siteSettingTranslations)
        .where(
          and(
            eq(siteSettingTranslations.settingsId, settings.id),
            eq(siteSettingTranslations.locale, locale),
            published(siteSettingTranslations.status),
          ),
        )
    : [];

  const imageIds = [
    settings?.logoAssetId,
    settings?.faviconAssetId,
    settings?.heroImageAssetId,
    settings?.callToActionImageAssetId,
  ];
  const images = await loadImages(db, imageIds, locale, options);
  const copy: HomeCopyView | null = copyRow
    ? {
        heroTitle: copyRow.heroTitle,
        heroDescription: copyRow.heroDescription,
        introTitle: copyRow.introTitle,
        introBody: copyRow.introBody,
        ctaTitle: copyRow.ctaTitle,
        ctaDescription: copyRow.ctaDescription,
        ctaLabel: copyRow.ctaLabel,
        ctaHref: copyRow.ctaHref,
        footerTagline: copyRow.footerTagline,
        seoTitle: copyRow.seoTitle,
        seoDescription: copyRow.seoDescription,
      }
    : null;

  return {
    companyName: settings?.companyName ?? null,
    contactEmail: settings?.contactEmail ?? null,
    contactPhone: settings?.contactPhone ?? null,
    postalAddress: settings?.postalAddress ?? null,
    whatsapp: settings?.whatsapp ?? null,
    socialLinks: filledSocial(settings?.socialLinks),
    logo: (settings?.logoAssetId && images.get(settings.logoAssetId)) || null,
    faviconSrc: await resolveFaviconSrc(db, settings?.faviconAssetId, options),
    copy,
    homeVisuals: {
      hero: (settings?.heroImageAssetId && images.get(settings.heroImageAssetId)) || null,
      callToAction: (settings?.callToActionImageAssetId && images.get(settings.callToActionImageAssetId)) || null,
      heroVideoUrl: settings?.heroVideoUrl ?? null,
    },
    homeLayout: normalizeHomeLayout(settings?.homeSections),
    groupLayout: normalizeGroupLayout(settings?.groupSections),
  };
}

export async function listUiOverrides(
  db: Database,
  locale: Locale,
): Promise<Record<string, string>> {
  const rows = await db
    .select({ key: uiStringOverrides.key, value: uiStringOverrides.value })
    .from(uiStringOverrides)
    .where(eq(uiStringOverrides.locale, locale));
  return Object.fromEntries(rows.map((row) => [row.key, row.value]));
}

export type PublicMenuItem = {
  id: string;
  href: string;
  label: string;
  external: boolean;
  children: { id: string; href: string; label: string; external: boolean }[];
};

export async function listPublishedMenu(
  db: Database,
  locale: Locale,
  location: "header" | "footer",
): Promise<PublicMenuItem[]> {
  const [menu] = await db.select().from(menus).where(eq(menus.location, location));
  if (!menu) return [];
  const items = await db
    .select()
    .from(menuItems)
    .where(eq(menuItems.menuId, menu.id))
    .orderBy(asc(menuItems.sortOrder));
  const labels = await db.select().from(menuItemTranslations).where(eq(menuItemTranslations.locale, locale));
  const labelMap = new Map(labels.map((row) => [row.itemId, row.label] as const));

  const cmsIds = items.filter((item) => item.kind === "cms_page" && item.cmsPageId).map((item) => item.cmsPageId!);
  const cmsRows =
    cmsIds.length === 0
      ? []
      : await db
          .select({
            pageId: cmsPageTranslations.pageId,
            slug: cmsPageTranslations.slug,
          })
          .from(cmsPageTranslations)
          .where(
            and(
              inArray(cmsPageTranslations.pageId, cmsIds),
              eq(cmsPageTranslations.locale, locale),
              published(cmsPageTranslations.status),
            ),
          );
  const cmsSlug = new Map(cmsRows.map((row) => [row.pageId, row.slug] as const));

  function hrefOf(item: (typeof items)[number]): string | null {
    if (item.kind === "section" && item.sectionKey) {
      return sectionPath(locale, item.sectionKey as Section);
    }
    if (item.kind === "cms_page" && item.cmsPageId) {
      const slug = cmsSlug.get(item.cmsPageId);
      return slug ? cmsPagePath(locale, slug) : null;
    }
    if (item.kind === "url" && item.externalUrl?.startsWith("https://")) return item.externalUrl;
    return null;
  }

  const roots = items.filter((item) => !item.parentId);
  return roots.flatMap((item) => {
    const label = labelMap.get(item.id);
    const href = hrefOf(item);
    const children = items
      .filter((child) => child.parentId === item.id)
      .flatMap((child) => {
        const childLabel = labelMap.get(child.id);
        const childHref = hrefOf(child);
        if (!childLabel || !childHref) return [];
        return [
          {
            id: child.id,
            href: childHref,
            label: childLabel,
            external: child.kind === "url",
          },
        ];
      });
    if (!label) return [];
    if (!href && children.length === 0) return [];
    if (!href && children.length > 0) {
      return [{ id: item.id, href: children[0]!.href, label, external: false, children }];
    }
    return [{ id: item.id, href: href!, label, external: item.kind === "url", children }];
  });
}

export type CmsPageView = {
  id: string;
  slug: string;
  title: string;
  summary: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  ogTitle: string | null;
  ogDescription: string | null;
  layout: CmsLayoutBlock[];
  copy: Record<string, CmsBlockCopy>;
  images: Map<string, ResolvedImage>;
  cover: ResolvedImage | null;
  ogImage: ResolvedImage | null;
  updatedAt: Date;
};

export async function findPublishedCmsPage(
  db: Database,
  locale: Locale,
  slug: string,
  options: ReadOptions,
): Promise<CmsPageView | null> {
  const [row] = await db
    .select({
      id: cmsPages.id,
      layout: cmsPages.layout,
      coverAssetId: cmsPages.coverAssetId,
      slug: cmsPageTranslations.slug,
      title: cmsPageTranslations.title,
      summary: cmsPageTranslations.summary,
      seoTitle: cmsPageTranslations.seoTitle,
      seoDescription: cmsPageTranslations.seoDescription,
      ogTitle: cmsPageTranslations.ogTitle,
      ogDescription: cmsPageTranslations.ogDescription,
      ogImageAssetId: cmsPageTranslations.ogImageAssetId,
      blocks: cmsPageTranslations.blocks,
      updatedAt: cmsPageTranslations.updatedAt,
    })
    .from(cmsPageTranslations)
    .innerJoin(cmsPages, eq(cmsPages.id, cmsPageTranslations.pageId))
    .where(
      and(
        eq(cmsPageTranslations.locale, locale),
        eq(cmsPageTranslations.slug, slug),
        published(cmsPageTranslations.status),
      ),
    );
  if (!row) return null;
  return hydrateCms(db, locale, options, row);
}

export async function findCmsPageById(
  db: Database,
  locale: Locale,
  id: string,
  options: ReadOptions,
): Promise<CmsPageView | null> {
  const [row] = await db
    .select({
      id: cmsPages.id,
      layout: cmsPages.layout,
      coverAssetId: cmsPages.coverAssetId,
      slug: cmsPageTranslations.slug,
      title: cmsPageTranslations.title,
      summary: cmsPageTranslations.summary,
      seoTitle: cmsPageTranslations.seoTitle,
      seoDescription: cmsPageTranslations.seoDescription,
      ogTitle: cmsPageTranslations.ogTitle,
      ogDescription: cmsPageTranslations.ogDescription,
      ogImageAssetId: cmsPageTranslations.ogImageAssetId,
      blocks: cmsPageTranslations.blocks,
      updatedAt: cmsPageTranslations.updatedAt,
    })
    .from(cmsPageTranslations)
    .innerJoin(cmsPages, eq(cmsPages.id, cmsPageTranslations.pageId))
    .where(and(eq(cmsPages.id, id), eq(cmsPageTranslations.locale, locale)));
  if (!row) return null;
  return hydrateCms(db, locale, options, row);
}

async function hydrateCms(
  db: Database,
  locale: Locale,
  options: ReadOptions,
  row: {
    id: string;
    layout: CmsLayoutBlock[];
    coverAssetId: string | null;
    slug: string;
    title: string;
    summary: string | null;
    seoTitle: string | null;
    seoDescription: string | null;
    ogTitle: string | null;
    ogDescription: string | null;
    ogImageAssetId: string | null;
    blocks: Record<string, CmsBlockCopy>;
    updatedAt: Date;
  },
): Promise<CmsPageView> {
  const ids: (string | null)[] = [row.coverAssetId, row.ogImageAssetId];
  for (const block of row.layout) {
    ids.push(block.imageAssetId ?? null);
    ids.push(block.mobileAssetId ?? null);
    ids.push(block.imageByLocale?.[locale] ?? null);
    if (block.galleryAssetIds) ids.push(...block.galleryAssetIds);
  }
  const images = await loadImages(db, ids, locale, options);
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    summary: row.summary,
    seoTitle: row.seoTitle,
    seoDescription: row.seoDescription,
    ogTitle: row.ogTitle,
    ogDescription: row.ogDescription,
    layout: row.layout,
    copy: row.blocks ?? {},
    images,
    cover: (row.coverAssetId && images.get(row.coverAssetId)) || null,
    ogImage: (row.ogImageAssetId && images.get(row.ogImageAssetId)) || null,
    updatedAt: row.updatedAt,
  };
}

export async function listPublishedCmsSlugs(db: Database): Promise<{ pageId: string; locale: Locale; slug: string; updatedAt: Date }[]> {
  return db
    .select({
      pageId: cmsPageTranslations.pageId,
      locale: cmsPageTranslations.locale,
      slug: cmsPageTranslations.slug,
      updatedAt: cmsPageTranslations.updatedAt,
    })
    .from(cmsPageTranslations)
    .where(eq(cmsPageTranslations.status, "published"));
}

export async function publishedCmsAlternates(
  db: Database,
  pageId: string,
): Promise<Partial<Record<Locale, string>>> {
  const rows = await db
    .select({ locale: cmsPageTranslations.locale, slug: cmsPageTranslations.slug })
    .from(cmsPageTranslations)
    .where(and(eq(cmsPageTranslations.pageId, pageId), eq(cmsPageTranslations.status, "published")));
  return Object.fromEntries(rows.map((row) => [row.locale, cmsPagePath(row.locale, row.slug)]));
}
