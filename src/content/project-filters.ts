import type { Locale } from "@/i18n/config";
import { sectionPath } from "@/i18n/routes";
import type { ProjectListFilters } from "./types";

export function parseProjectFilters(searchParams: Record<string, string | string[] | undefined>): ProjectListFilters {
  const read = (key: string) => {
    const value = searchParams[key];
    return Array.isArray(value) ? value[0] : value;
  };
  const status = read("status");
  const country = read("country");
  const pageRaw = Number(read("page") ?? "1");
  return {
    status: status === "completed" || status === "in_progress" ? status : undefined,
    expertiseSlug: read("expertise")?.trim() || undefined,
    country: country && /^[A-Z]{2}$/i.test(country) ? country.toUpperCase() : undefined,
    page: Number.isFinite(pageRaw) && pageRaw > 0 ? Math.floor(pageRaw) : 1,
  };
}

export function projectListHref(
  locale: Locale,
  filters: Partial<ProjectListFilters> & { expertiseSlug?: string },
): string {
  const params = new URLSearchParams();
  if (filters.status) params.set("status", filters.status);
  if (filters.expertiseSlug) params.set("expertise", filters.expertiseSlug);
  if (filters.country) params.set("country", filters.country);
  if (filters.page && filters.page > 1) params.set("page", String(filters.page));
  const query = params.toString();
  return `${sectionPath(locale, "projects")}${query ? `?${query}` : ""}`;
}
