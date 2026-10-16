import { cacheLife, cacheTag } from "next/cache";
import { getDb } from "@/db/client";
import type { PageKey } from "@/db/schema";
import type { Locale } from "@/i18n/config";
import type { DetailSection } from "@/i18n/routes";
import { contentTags } from "./cache-tags";
import { isDemoContentEnabled } from "./demo-policy";
import * as queries from "./queries";
import { resolveCmsSlugRedirect, resolveSlugRedirect as lookupSlugRedirect } from "./slug-redirects";
import { mergeDictionary } from "@/i18n/catalog";
import { getDictionary } from "@/i18n/dictionaries";
import type { ProjectListFilters, VisitListFilters } from "./types";

/*
 * Cached public reads used by pages. Panel writes expire these tags
 * (see publishing.ts); the "hours" lifetime bounds staleness for changes made
 * outside the panel, such as seed scripts.
 */

const options = () => ({ demo: isDemoContentEnabled() });

export async function getExpertises(locale: Locale) {
  "use cache";
  cacheLife("hours");
  cacheTag(contentTags.expertises, contentTags.media);
  return queries.listExpertises(getDb(), locale, options());
}

export async function getProjects(locale: Locale, limit?: number) {
  "use cache";
  cacheLife("hours");
  cacheTag(contentTags.projects, contentTags.expertises, contentTags.media);
  return queries.listProjects(getDb(), locale, { ...options(), limit });
}

export async function getFeaturedProjects(locale: Locale) {
  "use cache";
  cacheLife("hours");
  cacheTag(contentTags.projects, contentTags.expertises, contentTags.media);
  return queries.listProjects(getDb(), locale, { ...options(), featuredOnly: true, limit: 12 });
}

export async function getProjectListing(locale: Locale, filters: ProjectListFilters) {
  "use cache";
  cacheLife("hours");
  cacheTag(contentTags.projects, contentTags.expertises, contentTags.media);
  return queries.listProjectsPage(getDb(), locale, options(), filters);
}

export async function getRelatedProjects(locale: Locale, projectId: string, expertiseId: string | null) {
  "use cache";
  cacheLife("hours");
  cacheTag(contentTags.projects, contentTags.expertises, contentTags.media);
  return queries.listRelatedProjects(getDb(), locale, options(), { projectId, expertiseId });
}

export async function getProjectsForExpertise(locale: Locale, expertiseId: string) {
  "use cache";
  cacheLife("hours");
  cacheTag(contentTags.projects, contentTags.expertises, contentTags.media);
  return queries.listProjectsForExpertise(getDb(), locale, options(), expertiseId);
}

export async function getVisits(locale: Locale, limit?: number) {
  "use cache";
  cacheLife("hours");
  cacheTag(contentTags.visits, contentTags.media);
  return queries.listVisits(getDb(), locale, { ...options(), limit });
}

export async function getFeaturedVisits(locale: Locale) {
  "use cache";
  cacheLife("hours");
  cacheTag(contentTags.visits, contentTags.media);
  return queries.listVisits(getDb(), locale, { ...options(), featuredOnly: true, limit: 6 });
}

export async function getVisitListing(locale: Locale, filters: VisitListFilters) {
  "use cache";
  cacheLife("hours");
  cacheTag(contentTags.visits, contentTags.media);
  return queries.listVisitsPage(getDb(), locale, options(), filters);
}

export async function getRelatedVisits(locale: Locale, visitId: string, countryCode: string | null) {
  "use cache";
  cacheLife("hours");
  cacheTag(contentTags.visits, contentTags.media);
  return queries.listRelatedVisits(getDb(), locale, options(), { visitId, countryCode });
}

export async function getTeam(locale: Locale, limit?: number) {
  "use cache";
  cacheLife("hours");
  cacheTag(contentTags.team, contentTags.media);
  return queries.listTeam(getDb(), locale, { ...options(), limit });
}

export async function getHomeVisuals(locale: Locale) {
  "use cache";
  cacheLife("hours");
  cacheTag(contentTags.settings, contentTags.media);
  return queries.getHomeVisuals(getDb(), locale, options());
}

export async function getSiteChrome(locale: Locale) {
  "use cache";
  cacheLife("hours");
  cacheTag(contentTags.settings, contentTags.media);
  return queries.getSiteChrome(getDb(), locale, options());
}

export async function getAboutSections(locale: Locale) {
  "use cache";
  cacheLife("hours");
  cacheTag(contentTags.pages);
  return queries.listAboutSections(getDb(), locale);
}

const sectionTag = {
  expertises: contentTags.expertises,
  projects: contentTags.projects,
  visits: contentTags.visits,
} as const;

export async function findDetail(section: DetailSection, locale: Locale, slug: string) {
  "use cache";
  cacheLife("hours");
  // Project details also show the expertise name; every detail may show images.
  cacheTag(sectionTag[section], contentTags.expertises, contentTags.media);
  return queries.findDetail(getDb(), section, locale, slug, options());
}

export async function resolveSlugRedirect(section: DetailSection, locale: Locale, slug: string) {
  "use cache";
  cacheLife("hours");
  cacheTag(sectionTag[section]);
  return lookupSlugRedirect(getDb(), section, locale, slug, options());
}

export async function getPublishedEntries() {
  "use cache";
  cacheLife("hours");
  cacheTag(contentTags.expertises, contentTags.projects, contentTags.visits);
  return queries.listPublishedEntries(getDb(), options());
}

export async function getPage(key: PageKey, locale: Locale) {
  "use cache";
  cacheLife("hours");
  cacheTag(contentTags.pages);
  return queries.findPage(getDb(), key, locale);
}

export async function getMergedDictionary(locale: Locale) {
  "use cache";
  cacheLife("hours");
  cacheTag(contentTags.ui);
  const overrides = await queries.listUiOverrides(getDb(), locale);
  return mergeDictionary(getDictionary(locale), overrides);
}

export async function getHeaderMenu(locale: Locale) {
  "use cache";
  cacheLife("hours");
  cacheTag(contentTags.menus, contentTags.cms);
  return queries.listPublishedMenu(getDb(), locale, "header");
}

export async function getFooterMenu(locale: Locale) {
  "use cache";
  cacheLife("hours");
  cacheTag(contentTags.menus, contentTags.cms);
  return queries.listPublishedMenu(getDb(), locale, "footer");
}

export async function getCmsPage(locale: Locale, slug: string) {
  "use cache";
  cacheLife("hours");
  cacheTag(contentTags.cms, contentTags.media);
  return queries.findPublishedCmsPage(getDb(), locale, slug, options());
}

export async function getCmsRedirect(locale: Locale, slug: string) {
  "use cache";
  cacheLife("hours");
  cacheTag(contentTags.cms);
  return resolveCmsSlugRedirect(getDb(), locale, slug);
}

export async function getPublishedCmsAlternates(pageId: string) {
  "use cache";
  cacheLife("hours");
  cacheTag(contentTags.cms);
  return queries.publishedCmsAlternates(getDb(), pageId);
}

export async function getPublishedCmsSlugs() {
  "use cache";
  cacheLife("hours");
  cacheTag(contentTags.cms);
  return queries.listPublishedCmsSlugs(getDb());
}

export async function getPublishedPageLocales(key: PageKey) {
  "use cache";
  cacheLife("hours");
  cacheTag(contentTags.pages);
  return queries.publishedPageLocales(getDb(), key);
}
