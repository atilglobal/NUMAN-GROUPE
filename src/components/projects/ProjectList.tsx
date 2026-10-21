import type { ProjectListFilters, ProjectListResult } from "@/content/types";
import { projectListHref } from "@/content/project-filters";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import { pageCount } from "@/lib/pagination";
import { detailPath, homePath, sectionPath } from "@/i18n/routes";
import type { ProjectStatus } from "@/db/schema/projects";
import { ProjectCard } from "@/components/cards/ProjectCard";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/SectionHeading";
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
    <Container className="py-14 lg:py-20">
      <Breadcrumbs
        label={dict.a11y.breadcrumbs}
        items={[{ label: dict.nav.home, href: homePath(locale) }, { label }]}
      />
      <div className="mt-12 max-w-3xl">
        <Eyebrow>{dict.projects.eyebrow}</Eyebrow>
        <h1 className="mt-5 font-serif text-[2.5rem] leading-[1.08] text-navy-950 sm:text-6xl">{label}</h1>
        <p className="mt-6 text-lg text-ink/85">{dict.projects.description}</p>
      </div>

      <div
        role="group"
        aria-label={dict.projects.filterLabel}
        className="mt-10 grid grid-cols-2 gap-1 rounded-full border border-line bg-white p-1 sm:inline-flex"
      >
        {STATUS_FILTERS.map((option) => {
          const active = (filters.status ?? undefined) === option.value;
          return (
            <a
              key={option.value ?? "all"}
              href={projectListHref(locale, { status: option.value })}
              aria-current={active ? "page" : undefined}
              className={cn(
                "min-h-10 rounded-full px-3 text-center text-[0.8125rem] leading-tight transition-colors sm:px-5 sm:text-sm",
                active ? "bg-navy-900 text-paper" : "text-ink/80 hover:bg-paper-2 hover:text-navy-950",
              )}
            >
              {option.label(dict)}
            </a>
          );
        })}
      </div>

      {listing.items.length === 0 ? (
        <p role="status" className="mt-10 border border-dashed border-line px-6 py-12 text-center text-muted">
          {listing.total === 0 && !filters.status ? dict.projects.empty : dict.projects.emptyFilter}
        </p>
      ) : (
        <ul className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
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
        <nav aria-label={dict.projects.pagination} className="mt-10 flex items-center gap-3">
          {listing.page > 1 ? (
            <a
              href={projectListHref(locale, { ...filters, page: listing.page - 1 })}
              className="rounded-md border border-line px-3 py-2 text-sm"
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
              className="rounded-md border border-line px-3 py-2 text-sm"
            >
              {dict.projects.nextPage}
            </a>
          ) : null}
        </nav>
      ) : null}

      <p className="mt-10">
        <a href={sectionPath(locale, "contact")} className="text-sm text-navy-950 underline underline-offset-4">
          {dict.projects.requestCta}
        </a>
      </p>
    </Container>
  );
}
