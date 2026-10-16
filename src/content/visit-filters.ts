import type { Locale } from "@/i18n/config";
import { sectionPath } from "@/i18n/routes";
import type { VisitListFilters } from "./types";

export function parseVisitFilters(searchParams: Record<string, string | string[] | undefined>): VisitListFilters {
  const read = (key: string) => {
    const value = searchParams[key];
    return Array.isArray(value) ? value[0] : value;
  };
  const country = read("country");
  const yearRaw = Number(read("year") ?? "");
  const pageRaw = Number(read("page") ?? "1");
  return {
    country: country && /^[A-Z]{2}$/i.test(country) ? country.toUpperCase() : undefined,
    year: Number.isInteger(yearRaw) && yearRaw >= 1900 && yearRaw <= 2100 ? yearRaw : undefined,
    page: Number.isFinite(pageRaw) && pageRaw > 0 ? Math.floor(pageRaw) : 1,
  };
}

export function visitListHref(locale: Locale, filters: Partial<VisitListFilters>): string {
  const params = new URLSearchParams();
  if (filters.country) params.set("country", filters.country);
  if (filters.year) params.set("year", String(filters.year));
  if (filters.page && filters.page > 1) params.set("page", String(filters.page));
  const query = params.toString();
  return `${sectionPath(locale, "visits")}${query ? `?${query}` : ""}`;
}
