import { cacheLife, cacheTag } from "next/cache";
import { tryGetDb } from "@/db/client";
import type { PageKey } from "@/db/schema";
import type { Locale } from "@/i18n/config";
import type { DetailSection } from "@/i18n/routes";
import { PUBLIC_PAGE_SIZE } from "@/lib/pagination";
import { contentTags } from "./cache-tags";
import { isDemoContentEnabled } from "./demo-policy";
import { DEFAULT_HOME_LAYOUT } from "./home-layout";
import * as queries from "./queries";
import { resolveCmsSlugRedirect, resolveSlugRedirect as lookupSlugRedirect } from "./slug-redirects";
import { mergeDictionary } from "@/i18n/catalog";
import { getDictionary } from "@/i18n/dictionaries";
import type { ProjectListFilters, SiteChrome, VisitListFilters } from "./types";

/*
 * Cached public reads used by pages. Panel writes expire these tags
 * (see publishing.ts); the "hours" lifetime bounds staleness for changes made
 * outside the panel, such as seed scripts.
 *
 * When Postgres is not configured (typical Vercel build before env is attached),
 * public routes render empty chrome instead of failing `next build`.
 */

const options = () => ({ demo: isDemoContentEnabled() });

function emptyChrome(): SiteChrome {
  return {
    companyName: null,
    contactEmail: null,
    contactPhone: null,
    postalAddress: null,
    whatsapp: null,
    socialLinks: [],
    logo: null,
    faviconSrc: null,
    copy: null,
    homeVisuals: { hero: null, callToAction: null, heroVideoUrl: null },
    homeLayout: DEFAULT_HOME_LAYOUT,
  };
}

export async function getExpertises(locale: Locale) {
  "use cache";
  cacheLife("hours");
  cacheTag(contentTags.expertises, contentTags.media);
  const db = tryGetDb();
  return db ? queries.listExpertises(db, locale, options()) : [];
}

export async function getProjects(locale: Locale, limit?: number) {
  "use cache";
  cacheLife("hours");
  cacheTag(contentTags.projects, contentTags.expertises, contentTags.media);
  const db = tryGetDb();
  return db ? queries.listProjects(db, locale, { ...options(), limit }) : [];
}

export async function getFeaturedProjects(locale: Locale) {
  "use cache";
  cacheLife("hours");
  cacheTag(contentTags.projects, contentTags.expertises, contentTags.media);
  const db = tryGetDb();
  return db ? queries.listProjects(db, locale, { ...options(), featuredOnly: true, limit: 12 }) : [];
}

export async function getProjectListing(locale: Locale, filters: ProjectListFilters) {
  "use cache";
  cacheLife("hours");
  cacheTag(contentTags.projects, contentTags.expertises, contentTags.media);
  const db = tryGetDb();
  return db
    ? queries.listProjectsPage(db, locale, options(), filters)
    : { items: [], total: 0, page: filters.page, pageSize: PUBLIC_PAGE_SIZE, countries: [], expertises: [] };
}

export async function getRelatedProjects(locale: Locale, projectId: string, expertiseId: string | null) {
  "use cache";
  cacheLife("hours");
  cacheTag(contentTags.projects, contentTags.expertises, contentTags.media);
  const db = tryGetDb();
  return db ? queries.listRelatedProjects(db, locale, options(), { projectId, expertiseId }) : [];
}

export async function getProjectsForExpertise(locale: Locale, expertiseId: string) {
  "use cache";
  cacheLife("hours");
  cacheTag(contentTags.projects, contentTags.expertises, contentTags.media);
  const db = tryGetDb();
  return db ? queries.listProjectsForExpertise(db, locale, options(), expertiseId) : [];
}

export async function getVisits(locale: Locale, limit?: number) {
  "use cache";
  cacheLife("hours");
  cacheTag(contentTags.visits, contentTags.media);
  const db = tryGetDb();
  return db ? queries.listVisits(db, locale, { ...options(), limit }) : [];
}

export async function getFeaturedVisits(locale: Locale) {
  "use cache";
  cacheLife("hours");
  cacheTag(contentTags.visits, contentTags.media);
  const db = tryGetDb();
  return db ? queries.listVisits(db, locale, { ...options(), featuredOnly: true, limit: 6 }) : [];
}

export async function getVisitListing(locale: Locale, filters: VisitListFilters) {
  "use cache";
  cacheLife("hours");
  cacheTag(contentTags.visits, contentTags.media);
  const db = tryGetDb();
  return db
    ? queries.listVisitsPage(db, locale, options(), filters)
    : { items: [], total: 0, page: filters.page, pageSize: PUBLIC_PAGE_SIZE, countries: [], years: [] };
}

export async function getRelatedVisits(locale: Locale, visitId: string, countryCode: string | null) {
  "use cache";
  cacheLife("hours");
  cacheTag(contentTags.visits, contentTags.media);
  const db = tryGetDb();
  return db ? queries.listRelatedVisits(db, locale, options(), { visitId, countryCode }) : [];
}

export async function getTeam(locale: Locale, limit?: number) {
  "use cache";
  cacheLife("hours");
  cacheTag(contentTags.team, contentTags.media);
  const db = tryGetDb();
  return db ? queries.listTeam(db, locale, { ...options(), limit }) : [];
}

export async function getHomeVisuals(locale: Locale) {
  "use cache";
  cacheLife("hours");
  cacheTag(contentTags.settings, contentTags.media);
  const db = tryGetDb();
  return db ? queries.getHomeVisuals(db, locale, options()) : emptyChrome().homeVisuals;
}

export async function getSiteChrome(locale: Locale) {
  "use cache";
  cacheLife("hours");
  cacheTag(contentTags.settings, contentTags.media);
  const db = tryGetDb();
  return db ? queries.getSiteChrome(db, locale, options()) : emptyChrome();
}

export async function getAboutSections(locale: Locale) {
  "use cache";
  cacheLife("hours");
  cacheTag(contentTags.pages);
  const db = tryGetDb();
  return db ? queries.listAboutSections(db, locale) : [];
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
  const db = tryGetDb();
  return db ? queries.findDetail(db, section, locale, slug, options()) : null;
}

export async function resolveSlugRedirect(section: DetailSection, locale: Locale, slug: string) {
  "use cache";
  cacheLife("hours");
  cacheTag(sectionTag[section]);
  const db = tryGetDb();
  return db ? lookupSlugRedirect(db, section, locale, slug, options()) : null;
}

export async function getPublishedEntries() {
  "use cache";
  cacheLife("hours");
  cacheTag(contentTags.expertises, contentTags.projects, contentTags.visits);
  const db = tryGetDb();
  return db ? queries.listPublishedEntries(db, options()) : [];
}

export async function getPage(key: PageKey, locale: Locale) {
  "use cache";
  cacheLife("hours");
  cacheTag(contentTags.pages);
  const db = tryGetDb();
  return db ? queries.findPage(db, key, locale) : null;
}

export async function getMergedDictionary(locale: Locale) {
  "use cache";
  cacheLife("hours");
  cacheTag(contentTags.ui);
  const db = tryGetDb();
  if (!db) return getDictionary(locale);
  const overrides = await queries.listUiOverrides(db, locale);
  return mergeDictionary(getDictionary(locale), overrides);
}

export async function getHeaderMenu(locale: Locale) {
  "use cache";
  cacheLife("hours");
  cacheTag(contentTags.menus, contentTags.cms);
  const db = tryGetDb();
  return db ? queries.listPublishedMenu(db, locale, "header") : [];
}

export async function getFooterMenu(locale: Locale) {
  "use cache";
  cacheLife("hours");
  cacheTag(contentTags.menus, contentTags.cms);
  const db = tryGetDb();
  return db ? queries.listPublishedMenu(db, locale, "footer") : [];
}

export async function getCmsPage(locale: Locale, slug: string) {
  "use cache";
  cacheLife("hours");
  cacheTag(contentTags.cms, contentTags.media);
  const db = tryGetDb();
  return db ? queries.findPublishedCmsPage(db, locale, slug, options()) : null;
}

export async function getCmsRedirect(locale: Locale, slug: string) {
  "use cache";
  cacheLife("hours");
  cacheTag(contentTags.cms);
  const db = tryGetDb();
  return db ? resolveCmsSlugRedirect(db, locale, slug) : null;
}

export async function getPublishedCmsAlternates(pageId: string) {
  "use cache";
  cacheLife("hours");
  cacheTag(contentTags.cms);
  const db = tryGetDb();
  return db ? queries.publishedCmsAlternates(db, pageId) : ({} as Partial<Record<Locale, string>>);
}

export async function getPublishedCmsSlugs() {
  "use cache";
  cacheLife("hours");
  cacheTag(contentTags.cms);
  const db = tryGetDb();
  return db ? queries.listPublishedCmsSlugs(db) : [];
}

export async function getPublishedPageLocales(key: PageKey) {
  "use cache";
  cacheLife("hours");
  cacheTag(contentTags.pages);
  const db = tryGetDb();
  return db ? queries.publishedPageLocales(db, key) : [];
}
