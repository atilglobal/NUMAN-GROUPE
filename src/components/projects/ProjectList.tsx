import type { ProjectListResult } from "@/content/types";
import { projectListHref } from "@/content/project-filters";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import { countryLabel } from "@/lib/countries";
import { pageCount } from "@/lib/pagination";
import { detailPath, homePath, sectionPath } from "@/i18n/routes";
import { ProjectCard } from "@/components/cards/ProjectCard";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/SectionHeading";

export function ProjectList({
  locale,
  dict,
  listing,
  filters,
}: {
  locale: Locale;
  dict: Dictionary;
  listing: ProjectListResult;
  filters: { status?: "completed" | "in_progress"; expertiseSlug?: string; country?: string; page: number };
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

      <form method="get" className="mt-10 grid gap-3 rounded-lg border border-line bg-white p-4 sm:grid-cols-3">
        <label className="grid gap-1 text-sm">
          {dict.projects.filterStatus}
          <select name="status" defaultValue={filters.status ?? ""} className="min-h-10 rounded-md border border-line px-3">
            <option value="">{dict.projects.filterAll}</option>
            <option value="completed">{dict.projects.filterCompleted}</option>
            <option value="in_progress">{dict.projects.filterInProgress}</option>
          </select>
        </label>
        <label className="grid gap-1 text-sm">
          {dict.projects.filterExpertise}
          <select
            name="expertise"
            defaultValue={filters.expertiseSlug ?? ""}
            className="min-h-10 rounded-md border border-line px-3"
          >
            <option value="">{dict.projects.filterAllExpertises}</option>
            {listing.expertises.map((item) => (
              <option key={item.slug} value={item.slug}>
                {item.name}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-1 text-sm">
          {dict.projects.filterCountry}
          <select name="country" defaultValue={filters.country ?? ""} className="min-h-10 rounded-md border border-line px-3">
            <option value="">{dict.projects.filterAllCountries}</option>
            {listing.countries.map((item) => (
              <option key={item.code} value={item.code}>
                {countryLabel(locale, item.code)}
              </option>
            ))}
          </select>
        </label>
        <div className="sm:col-span-3">
          <button type="submit" className="inline-flex min-h-10 items-center rounded-md bg-navy-950 px-4 text-sm text-paper">
            {dict.projects.applyFilters}
          </button>
        </div>
      </form>

      {listing.items.length === 0 ? (
        <p role="status" className="mt-10 border border-dashed border-line px-6 py-12 text-center text-muted">
          {listing.total === 0 && !filters.status && !filters.expertiseSlug && !filters.country
            ? dict.projects.empty
            : dict.projects.emptyFilter}
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
