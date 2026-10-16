import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import { sectionPath, type Section } from "@/i18n/routes";

export type NavItem = {
  id: string;
  href: string;
  label: string;
  section?: Section;
  external?: boolean;
  children?: { id: string; href: string; label: string; external?: boolean }[];
};

const primarySections = [
  ["about", "group"],
  ["expertises", "expertises"],
  ["projects", "projects"],
  ["visits", "visits"],
  ["team", "team"],
] as const satisfies readonly (readonly [Section, keyof Dictionary["nav"]])[];

const legalSections = [
  ["privacy", "privacy"],
  ["legal", "legal"],
  ["cookies", "cookies"],
] as const satisfies readonly (readonly [Section, keyof Dictionary["nav"]])[];

function build(
  locale: Locale,
  dict: Dictionary,
  entries: readonly (readonly [Section, keyof Dictionary["nav"]])[],
): NavItem[] {
  return entries.map(([section, key]) => ({
    id: section,
    section,
    href: sectionPath(locale, section),
    label: dict.nav[key],
  }));
}

export function primaryNav(locale: Locale, dict: Dictionary): NavItem[] {
  return build(locale, dict, primarySections);
}

export function legalNav(locale: Locale, dict: Dictionary): NavItem[] {
  return build(locale, dict, legalSections);
}

export function isActivePath(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}
