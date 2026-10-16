import { locales, type Locale } from "./config";
import { sectionSlugs, sections } from "./routes";

const SYSTEM = ["admin", "api", "media", "p", "onizleme", "giris", "fr", "en", "tr", "favicon.ico"] as const;

export function reservedCmsSlugs(locale: Locale): Set<string> {
  const reserved = new Set<string>(SYSTEM);
  for (const section of sections) reserved.add(sectionSlugs[section][locale]);
  for (const other of locales) {
    for (const section of sections) reserved.add(sectionSlugs[section][other]);
  }
  return reserved;
}

export function isReservedCmsSlug(locale: Locale, slug: string): boolean {
  return reservedCmsSlugs(locale).has(slug);
}
