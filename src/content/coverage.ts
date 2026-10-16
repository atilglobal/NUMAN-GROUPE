import { eq } from "drizzle-orm";
import type { Database } from "@/db/client";
import {
  expertises,
  expertiseTranslations,
  mediaAssets,
  mediaAssetTranslations,
  officialVisits,
  officialVisitTranslations,
  cmsPages,
  cmsPageTranslations,
  pageContents,
  pageContentTranslations,
  projects,
  projectTranslations,
  teamMembers,
  teamMemberTranslations,
  type PublicationStatus,
} from "@/db/schema";
import { defaultLocale, locales, type Locale } from "@/i18n/config";
import type { TranslatableEntity } from "./publishing";

/*
 * Translation gaps for the panel. Labels here are editor-facing only; the
 * public site never borrows text from another language.
 */

export type TranslationState = PublicationStatus | "missing";

export type CoverageRow = {
  entity: TranslatableEntity;
  id: string;
  label: string;
  isDemo: boolean;
  locales: Record<Locale, TranslationState>;
};

type Root = { id: string; isDemo: boolean; fallbackLabel: string };
type TranslationRow = { ownerId: string; locale: Locale; status: PublicationStatus; label: string };

function combine(entity: TranslatableEntity, roots: Root[], rows: TranslationRow[]): CoverageRow[] {
  return roots.map((root) => {
    const own = rows.filter((row) => row.ownerId === root.id);
    const states = Object.fromEntries(
      locales.map((locale) => [locale, own.find((row) => row.locale === locale)?.status ?? "missing"]),
    ) as Record<Locale, TranslationState>;
    const label =
      own.find((row) => row.locale === defaultLocale)?.label ?? own[0]?.label ?? root.fallbackLabel;
    return { entity, id: root.id, label, isDemo: root.isDemo, locales: states };
  });
}

export async function getTranslationCoverage(db: Database): Promise<CoverageRow[]> {
  const [
    expertiseRoots,
    expertiseRows,
    projectRoots,
    projectRows,
    visitRoots,
    visitRows,
    teamRoots,
    teamRows,
    pageRoots,
    pageRows,
    cmsRoots,
    cmsRows,
  ] = await Promise.all([
    db.select({ id: expertises.id, isDemo: expertises.isDemo }).from(expertises),
    db
      .select({
        ownerId: expertiseTranslations.expertiseId,
        locale: expertiseTranslations.locale,
        status: expertiseTranslations.status,
        label: expertiseTranslations.name,
      })
      .from(expertiseTranslations),
    db.select({ id: projects.id, isDemo: projects.isDemo }).from(projects),
    db
      .select({
        ownerId: projectTranslations.projectId,
        locale: projectTranslations.locale,
        status: projectTranslations.status,
        label: projectTranslations.title,
      })
      .from(projectTranslations),
    db.select({ id: officialVisits.id, isDemo: officialVisits.isDemo }).from(officialVisits),
    db
      .select({
        ownerId: officialVisitTranslations.visitId,
        locale: officialVisitTranslations.locale,
        status: officialVisitTranslations.status,
        label: officialVisitTranslations.title,
      })
      .from(officialVisitTranslations),
    db
      .select({ id: teamMembers.id, isDemo: teamMembers.isDemo, fullName: teamMembers.fullName })
      .from(teamMembers),
    db
      .select({
        ownerId: teamMemberTranslations.memberId,
        locale: teamMemberTranslations.locale,
        status: teamMemberTranslations.status,
        label: teamMemberTranslations.roleTitle,
      })
      .from(teamMemberTranslations),
    db.select({ id: pageContents.id, key: pageContents.key }).from(pageContents),
    db
      .select({
        ownerId: pageContentTranslations.pageId,
        locale: pageContentTranslations.locale,
        status: pageContentTranslations.status,
        label: pageContentTranslations.title,
      })
      .from(pageContentTranslations),
    db.select({ id: cmsPages.id }).from(cmsPages),
    db
      .select({
        ownerId: cmsPageTranslations.pageId,
        locale: cmsPageTranslations.locale,
        status: cmsPageTranslations.status,
        label: cmsPageTranslations.title,
      })
      .from(cmsPageTranslations),
  ]);

  return [
    ...combine("expertise", expertiseRoots.map((r) => ({ ...r, fallbackLabel: r.id })), expertiseRows),
    ...combine("project", projectRoots.map((r) => ({ ...r, fallbackLabel: r.id })), projectRows),
    ...combine("visit", visitRoots.map((r) => ({ ...r, fallbackLabel: r.id })), visitRows),
    // A person's name does not change with the language, so it labels the row.
    ...combine(
      "team_member",
      teamRoots.map((r) => ({ id: r.id, isDemo: r.isDemo, fallbackLabel: r.fullName })),
      teamRows.map((row) => ({ ...row, label: teamRoots.find((r) => r.id === row.ownerId)?.fullName ?? row.label })),
    ),
    ...combine("page", pageRoots.map((r) => ({ id: r.id, isDemo: false, fallbackLabel: r.key })), pageRows),
    ...combine("cms_page", cmsRoots.map((r) => ({ id: r.id, isDemo: false, fallbackLabel: r.id })), cmsRows),
  ];
}

/** Rows with at least one language that is not published. */
export function incompleteRows(rows: CoverageRow[]): CoverageRow[] {
  return rows.filter((row) => locales.some((locale) => row.locales[locale] !== "published"));
}

export type MissingAltRow = { id: string; storageKey: string; isDemo: boolean; missing: Locale[] };

/** Images lacking alt text in a language are not shown in that language. */
export async function getMissingAltText(db: Database): Promise<MissingAltRow[]> {
  const rows = await db
    .select({
      id: mediaAssets.id,
      storageKey: mediaAssets.storageKey,
      isDemo: mediaAssets.isDemo,
      locale: mediaAssetTranslations.locale,
    })
    .from(mediaAssets)
    .leftJoin(mediaAssetTranslations, eq(mediaAssetTranslations.assetId, mediaAssets.id));

  const byAsset = new Map<string, { storageKey: string; isDemo: boolean; present: Set<Locale> }>();
  for (const row of rows) {
    const entry = byAsset.get(row.id) ?? { storageKey: row.storageKey, isDemo: row.isDemo, present: new Set() };
    if (row.locale) entry.present.add(row.locale);
    byAsset.set(row.id, entry);
  }

  return [...byAsset.entries()]
    .map(([id, entry]) => ({
      id,
      storageKey: entry.storageKey,
      isDemo: entry.isDemo,
      missing: locales.filter((locale) => !entry.present.has(locale)),
    }))
    .filter((row) => row.missing.length > 0);
}
