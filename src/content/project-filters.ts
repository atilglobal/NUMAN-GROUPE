import type { Locale } from "@/i18n/config";
import { sectionPath } from "@/i18n/routes";
import type { ProjectStatus } from "@/db/schema/projects";
import type { ProjectListFilters } from "./types";

const STATUSES = new Set<ProjectStatus>(["planned", "in_progress", "completed"]);

export function parseProjectFilters(searchParams: Record<string, string | string[] | undefined>): ProjectListFilters {
  const read = (key: string) => {
    const value = searchParams[key];
    return Array.isArray(value) ? value[0] : value;
  };
  const status = read("status");
  const pageRaw = Number(read("page") ?? "1");
  return {
    status: status && STATUSES.has(status as ProjectStatus) ? (status as ProjectStatus) : undefined,
    page: Number.isFinite(pageRaw) && pageRaw > 0 ? Math.floor(pageRaw) : 1,
  };
}

export function projectListHref(locale: Locale, filters: Partial<ProjectListFilters>): string {
  const params = new URLSearchParams();
  if (filters.status) params.set("status", filters.status);
  if (filters.page && filters.page > 1) params.set("page", String(filters.page));
  const query = params.toString();
  return `${sectionPath(locale, "projects")}${query ? `?${query}` : ""}`;
}
