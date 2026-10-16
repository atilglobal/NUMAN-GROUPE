import { and, eq } from "drizzle-orm";
import type { Database } from "@/db/client";
import {
  cmsPageTranslations,
  contentSlugRedirects,
  expertiseTranslations,
  expertises,
  officialVisitTranslations,
  officialVisits,
  projectTranslations,
  projects,
} from "@/db/schema";
import type { Locale } from "@/i18n/config";
import { cmsPagePath, detailPath, type DetailSection } from "@/i18n/routes";

export type RedirectSection = DetailSection | "cms";
import type { ReadOptions } from "./queries";

export async function rememberSlugChange(
  db: Database,
  input: {
    locale: Locale;
    section: RedirectSection;
    entityId: string;
    previous: string | undefined;
    next: string;
  },
): Promise<void> {
  if (!input.previous || input.previous === input.next) return;

  await db
    .delete(contentSlugRedirects)
    .where(
      and(
        eq(contentSlugRedirects.locale, input.locale),
        eq(contentSlugRedirects.section, input.section),
        eq(contentSlugRedirects.oldSlug, input.next),
      ),
    );

  await db
    .insert(contentSlugRedirects)
    .values({
      locale: input.locale,
      section: input.section,
      oldSlug: input.previous,
      entityId: input.entityId,
    })
    .onConflictDoUpdate({
      target: [contentSlugRedirects.locale, contentSlugRedirects.section, contentSlugRedirects.oldSlug],
      set: { entityId: input.entityId },
    });
}

export async function resolveSlugRedirect(
  db: Database,
  section: DetailSection,
  locale: Locale,
  oldSlug: string,
  options: ReadOptions,
): Promise<string | null> {
  const [row] = await db
    .select({ entityId: contentSlugRedirects.entityId })
    .from(contentSlugRedirects)
    .where(
      and(
        eq(contentSlugRedirects.locale, locale),
        eq(contentSlugRedirects.section, section),
        eq(contentSlugRedirects.oldSlug, oldSlug),
      ),
    );
  if (!row) return null;

  const current = await publishedSlug(db, section, locale, row.entityId, options);
  if (!current || current === oldSlug) return null;
  return detailPath(locale, section, current);
}

export async function resolveCmsSlugRedirect(
  db: Database,
  locale: Locale,
  oldSlug: string,
): Promise<string | null> {
  const [row] = await db
    .select({ entityId: contentSlugRedirects.entityId })
    .from(contentSlugRedirects)
    .where(
      and(
        eq(contentSlugRedirects.locale, locale),
        eq(contentSlugRedirects.section, "cms"),
        eq(contentSlugRedirects.oldSlug, oldSlug),
      ),
    );
  if (!row) return null;
  const [current] = await db
    .select({ slug: cmsPageTranslations.slug })
    .from(cmsPageTranslations)
    .where(
      and(
        eq(cmsPageTranslations.pageId, row.entityId),
        eq(cmsPageTranslations.locale, locale),
        eq(cmsPageTranslations.status, "published"),
      ),
    );
  if (!current || current.slug === oldSlug) return null;
  return cmsPagePath(locale, current.slug);
}

async function publishedSlug(
  db: Database,
  section: DetailSection,
  locale: Locale,
  entityId: string,
  options: ReadOptions,
): Promise<string | null> {
  if (section === "projects") {
    const [row] = await db
      .select({ slug: projectTranslations.slug, isDemo: projects.isDemo })
      .from(projectTranslations)
      .innerJoin(projects, eq(projects.id, projectTranslations.projectId))
      .where(
        and(
          eq(projectTranslations.projectId, entityId),
          eq(projectTranslations.locale, locale),
          eq(projectTranslations.status, "published"),
        ),
      );
    if (!row || (row.isDemo && !options.demo)) return null;
    return row.slug;
  }
  if (section === "expertises") {
    const [row] = await db
      .select({ slug: expertiseTranslations.slug, isDemo: expertises.isDemo })
      .from(expertiseTranslations)
      .innerJoin(expertises, eq(expertises.id, expertiseTranslations.expertiseId))
      .where(
        and(
          eq(expertiseTranslations.expertiseId, entityId),
          eq(expertiseTranslations.locale, locale),
          eq(expertiseTranslations.status, "published"),
        ),
      );
    if (!row || (row.isDemo && !options.demo)) return null;
    return row.slug;
  }
  const [row] = await db
    .select({ slug: officialVisitTranslations.slug, isDemo: officialVisits.isDemo })
    .from(officialVisitTranslations)
    .innerJoin(officialVisits, eq(officialVisits.id, officialVisitTranslations.visitId))
    .where(
      and(
        eq(officialVisitTranslations.visitId, entityId),
        eq(officialVisitTranslations.locale, locale),
        eq(officialVisitTranslations.status, "published"),
      ),
    );
  if (!row || (row.isDemo && !options.demo)) return null;
  return row.slug;
}
