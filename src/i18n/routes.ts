import { defaultLocale, isLocale, locales, type Locale, type Localized } from "./config";

export const sections = [
  "about",
  "expertises",
  "projects",
  "visits",
  "team",
  "contact",
  "privacy",
  "legal",
  "cookies",
] as const;

export type Section = (typeof sections)[number];

export const sectionSlugs: Record<Section, Localized> = {
  about: { fr: "a-propos", en: "about", tr: "hakkimizda" },
  expertises: { fr: "expertises", en: "expertise", tr: "uzmanliklar" },
  projects: { fr: "projets", en: "projects", tr: "projeler" },
  visits: {
    fr: "visites-institutionnelles",
    en: "institutional-visits",
    tr: "resmi-ziyaretler",
  },
  team: { fr: "equipe", en: "team", tr: "kadro" },
  contact: { fr: "contact", en: "contact", tr: "iletisim" },
  privacy: { fr: "confidentialite", en: "privacy", tr: "gizlilik" },
  legal: {
    fr: "mentions-legales",
    en: "legal-notice",
    tr: "yasal-bilgilendirme",
  },
  cookies: { fr: "cookies", en: "cookies", tr: "cerezler" },
};

export const detailSections = ["expertises", "projects", "visits"] as const;

export type DetailSection = (typeof detailSections)[number];

export function isDetailSection(section: Section): section is DetailSection {
  return (detailSections as readonly Section[]).includes(section);
}

/** Previous visit URLs, still resolved so bookmarks and tests keep working. */
const visitSlugAliases: Partial<Record<Locale, string>> = {
  fr: "visites-officielles",
  en: "official-visits",
};

export function sectionFromSlug(locale: Locale, slug: string): Section | null {
  const match = sections.find((section) => sectionSlugs[section][locale] === slug);
  if (match) return match;
  if (visitSlugAliases[locale] === slug) return "visits";
  return null;
}

/** French is unprefixed (`/`); English and Turkish keep `/en` and `/tr`. */
export function localePrefix(locale: Locale): string {
  return locale === defaultLocale ? "" : `/${locale}`;
}

export function homePath(locale: Locale): string {
  return localePrefix(locale) || "/";
}

export function sectionPath(locale: Locale, section: Section): string {
  return `${localePrefix(locale)}/${sectionSlugs[section][locale]}`;
}

export function detailPath(
  locale: Locale,
  section: DetailSection,
  slug: string,
): string {
  return `${sectionPath(locale, section)}/${slug}`;
}

export type ParsedPath = {
  locale: Locale;
  section: Section | null;
  slug: string | null;
};

export function cmsPagePath(locale: Locale, slug: string): string {
  return `${localePrefix(locale)}/p/${slug}`;
}

export function parsePath(pathname: string): ParsedPath | null {
  const parts = pathname.split("/").filter(Boolean);
  let locale: Locale = defaultLocale;
  let rest = parts;

  if (parts[0] && isLocale(parts[0])) {
    locale = parts[0];
    rest = parts.slice(1);
  } else if (parts.length === 0) {
    return { locale: defaultLocale, section: null, slug: null };
  }

  const [sectionSegment, slugSegment, ...extra] = rest;
  if (extra.length > 0) return null;

  if (!sectionSegment) {
    return { locale, section: null, slug: null };
  }

  if (sectionSegment === "p" && slugSegment) {
    return {
      locale,
      section: null,
      slug: decodeURIComponent(slugSegment),
    };
  }

  const section = sectionFromSlug(locale, sectionSegment);
  if (!section) return null;
  if (slugSegment && !isDetailSection(section)) return null;

  return {
    locale,
    section,
    slug: slugSegment ? decodeURIComponent(slugSegment) : null,
  };
}

/**
 * Locale-prefixed paths that are not a known home/section/detail URL.
 * Used by `src/proxy.ts` so unknown sections return HTTP 404 (Cache
 * Components would otherwise render the not-found UI as 200).
 */
export function isUnknownPublicPath(pathname: string): boolean {
  const [first, second, third, ...rest] = pathname.split("/").filter(Boolean);
  if (!first) return false;
  if (first === "admin" || first === "setup" || first === "media") return false;
  if (second === "p" && third && rest.length === 0) return false;
  return parsePath(pathname) === null;
}

/**
 * Section-level equivalent of a path in another language. Detail slugs are
 * language-specific, so a detail page falls back to its section list unless the
 * page supplies its own alternates.
 */
export function translatePath(pathname: string, target: Locale): string {
  const parsed = parsePath(pathname);
  if (!parsed || !parsed.section) return homePath(target);
  return sectionPath(target, parsed.section);
}

export function sectionAlternates(section: Section | null): Localized {
  return Object.fromEntries(
    locales.map((locale) => [
      locale,
      section ? sectionPath(locale, section) : homePath(locale),
    ]),
  ) as Localized;
}
