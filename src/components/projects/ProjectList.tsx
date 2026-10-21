import type { ProjectListFilters, ProjectListResult } from "@/content/types";
import { projectListHref } from "@/content/project-filters";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import { pageCount } from "@/lib/pagination";
import { detailPath, homePath, sectionPath } from "@/i18n/routes";
import type { ProjectStatus } from "@/db/schema/projects";
import { ProjectCard } from "@/components/cards/ProjectCard";
import { EmptyState } from "@/components/home/EmptyState";
import { PageCta } from "@/components/page/PageCta";
import { PageHero } from "@/components/page/PageHero";
import { Container } from "@/components/ui/Container";
import { cn } from "@/components/ui/cn";

const STATUS_FILTERS: { value?: ProjectStatus; label: (dict: Dictionary) => string }[] = [
  { value: undefined, label: (dict) => dict.projects.filterAll },
  { value: "planned", label: (dict) => dict.projects.filterPlanned },
  { value: "in_progress", label: (dict) => dict.projects.filterInProgress },
  { value: "completed", label: (dict) => dict.projects.filterCompleted },
];

export function ProjectList({
  locale,
  dict,
  listing,
  filters,
}: {
  locale: Locale;
  dict: Dictionary;
  listing: ProjectListResult;
  filters: ProjectListFilters;
}) {
  const label = dict.nav.projects;
  const last = pageCount(listing.total, listing.pageSize);

  return (
    <>
      <PageHero
        breadcrumbs={[{ label: dict.nav.home, href: homePath(locale) }, { label }]}
        breadcrumbsLabel={dict.a11y.breadcrumbs}
        eyebrow={dict.projects.eyebrow}
        title={label}
        lead={dict.projects.description}
      />
      <Container className="pb-14 lg:pb-16">
        <div
          role="group"
          aria-label={dict.projects.filterLabel}
          className="grid grid-cols-2 gap-1 rounded-full border border-line bg-white p-1 sm:inline-flex"
        >
          {STATUS_FILTERS.map((option) => {
            const active = (filters.status ?? undefined) === option.value;
            return (
              <a
                key={option.value ?? "all"}
                href={projectListHref(locale, { status: option.value })}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "inline-flex min-h-11 items-center justify-center rounded-full px-3 text-center text-[0.8125rem] leading-tight transition-colors sm:px-5 sm:text-sm",
                  active ? "bg-navy-900 text-paper" : "text-ink/80 hover:bg-paper-2 hover:text-navy-950",
                )}
              >
                {option.label(dict)}
              </a>
            );
          })}
        </div>

        {listing.items.length === 0 ? (
          <div className="mt-10">
            <EmptyState>
              {listing.total === 0 && !filters.status ? dict.projects.empty : dict.projects.emptyFilter}
            </EmptyState>
          </div>
        ) : (
          <ul className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {listing.items.map((project) => (
              <li key={project.id}>
                <ProjectCard
                  project={project}
                  href={detailPath(locale, "projects", project.slug)}
                  statusLabel={dict.projects.status[project.status]}
                  demoLabel={dict.demo.badge}
                  viewLabel={dict.projects.viewDetail}
                />
              </li>
            ))}
          </ul>
        )}

        {last > 1 ? (
          <nav aria-label={dict.projects.pagination} className="mt-10 flex flex-wrap items-center gap-3">
            {listing.page > 1 ? (
              <a
                href={projectListHref(locale, { ...filters, page: listing.page - 1 })}
                className="inline-flex min-h-11 items-center rounded-md border border-line px-4 text-sm"
              >
                {dict.projects.prevPage}
              </a>
            ) : null}
            <p className="text-sm text-muted">
              {dict.projects.pageOf.replace("{page}", String(listing.page)).replace("{total}", String(last))}
            </p>
            {listing.page < last ? (
              <a
                href={projectListHref(locale, { ...filters, page: listing.page + 1 })}
                className="inline-flex min-h-11 items-center rounded-md border border-line px-4 text-sm"
              >
                {dict.projects.nextPage}
              </a>
            ) : null}
          </nav>
        ) : null}
      </Container>
      <PageCta
        title={dict.projects.ctaTitle}
        description={dict.callToAction.description}
        href={sectionPath(locale, "contact")}
        label={dict.projects.requestCta}
      />
    </>
  );
}
