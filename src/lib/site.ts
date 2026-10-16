import type { Metadata } from "next";
import { defaultLocale, type Locale } from "@/i18n/config";

export function siteUrl(): URL | undefined {
  const value = process.env.SITE_URL;
  if (!value) return undefined;
  try {
    return new URL(value);
  } catch {
    return undefined;
  }
}

/** hreflang alternates limited to the languages the page actually exists in. */
export function buildAlternates(
  locale: Locale,
  paths: Partial<Record<Locale, string>>,
): Metadata["alternates"] {
  const languages: Record<string, string> = { ...paths };
  if (paths[defaultLocale]) languages["x-default"] = paths[defaultLocale];
  return { canonical: paths[locale], languages };
}
