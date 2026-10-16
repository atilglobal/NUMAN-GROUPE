import type { Locale } from "@/i18n/config";

/** "City, Country" from whatever was provided; null when nothing was. */
export function formatPlace(
  locale: Locale,
  local: string | null,
  countryCode: string | null,
): string | null {
  let country: string | null = null;
  if (countryCode) {
    try {
      country = new Intl.DisplayNames([locale], { type: "region" }).of(countryCode) ?? null;
    } catch {
      country = null;
    }
  }
  const parts = [local?.trim(), country].filter((part): part is string => Boolean(part));
  return parts.length > 0 ? parts.join(", ") : null;
}
