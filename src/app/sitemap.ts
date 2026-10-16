import type { MetadataRoute } from "next";
import { connection } from "next/server";
import { getPublishedCmsSlugs, getPublishedEntries, getPublishedPageLocales } from "@/content/service";
import { pageKeyEnum } from "@/db/schema";
import { locales, type Locale } from "@/i18n/config";
import { cmsPagePath, detailPath, homePath, sectionAlternates, sectionPath, sections, type Section } from "@/i18n/routes";
import { siteUrl } from "@/lib/site";

/**
 * Only published language versions are listed; drafts, demo entries (when demo
 * is disabled) and pages still "in preparation" are left out.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  await connection();
  const base = siteUrl();
  if (!base) return [];

  const absolute = (path: string) => new URL(path, base).toString();

  const group = (paths: Partial<Record<Locale, string>>, lastModified?: Date) => {
    const languages = Object.fromEntries(
      Object.entries(paths).map(([locale, path]) => [locale, absolute(path)]),
    );
    return Object.values(paths).map((path) => ({
      url: absolute(path),
      lastModified,
      alternates: { languages },
    }));
  };

  const entries: MetadataRoute.Sitemap = group(
    Object.fromEntries(locales.map((locale) => [locale, homePath(locale)])),
  );

  const listingSections = ["expertises", "projects", "visits", "team", "contact"] as const satisfies readonly Section[];
  for (const section of listingSections) {
    entries.push(...group(sectionAlternates(section)));
  }

  for (const key of pageKeyEnum.enumValues) {
    if (!(sections as readonly string[]).includes(key)) continue;
    if ((listingSections as readonly string[]).includes(key)) continue;
    const published = await getPublishedPageLocales(key);
    if (published.length === 0) continue;
    entries.push(
      ...group(
        Object.fromEntries(published.map((locale) => [locale, sectionPath(locale, key as Section)])),
      ),
    );
  }

  const cms = await getPublishedCmsSlugs();
  const cmsByPage = new Map<string, typeof cms>();
  for (const row of cms) {
    const list = cmsByPage.get(row.pageId) ?? [];
    list.push(row);
    cmsByPage.set(row.pageId, list);
  }
  for (const rows of cmsByPage.values()) {
    entries.push(
      ...group(
        Object.fromEntries(rows.map((row) => [row.locale, cmsPagePath(row.locale, row.slug)])),
        rows[0]?.updatedAt,
      ),
    );
  }

  for (const entry of await getPublishedEntries()) {
    const paths: Partial<Record<Locale, string>> = {};
    for (const locale of locales) {
      const slug = entry.slugs[locale];
      if (slug) paths[locale] = detailPath(locale, entry.section, slug);
    }
    entries.push(...group(paths, entry.updatedAt));
  }

  return entries;
}
