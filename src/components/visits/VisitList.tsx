import type { VisitListResult } from "@/content/types";
import { visitListHref } from "@/content/visit-filters";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import { countryLabel } from "@/lib/countries";
import { pageCount } from "@/lib/pagination";
import { detailPath, homePath } from "@/i18n/routes";
import { VisitCard } from "@/components/cards/VisitCard";
import { EmptyState } from "@/components/home/EmptyState";
import { PageHero } from "@/components/page/PageHero";
import { Container } from "@/components/ui/Container";

export function VisitList({
  locale,
  dict,
  listing,
  filters,
}: {
  locale: Locale;
  dict: Dictionary;
  listing: VisitListResult;
  filters: { country?: string; year?: number; page: number };
}) {
  const label = dict.nav.visits;
  const last = pageCount(listing.total, listing.pageSize);

  return (
    <>
      <PageHero
        breadcrumbs={[{ label: dict.nav.home, href: homePath(locale) }, { label }]}
        breadcrumbsLabel={dict.a11y.breadcrumbs}
        eyebrow={dict.visits.eyebrow}
        title={dict.visits.title}
        lead={dict.visits.description}
      />
      <Container className="pb-16 lg:pb-24">
        <p className="max-w-[42rem] text-sm leading-relaxed text-muted">{dict.visits.disclaimer}</p>

        <form method="get" className="mt-8 grid gap-3 border border-line bg-white p-4 sm:grid-cols-3">
          <label className="grid gap-1 text-sm">
            {dict.visits.filterCountry}
            <select
              name="country"
              defaultValue={filters.country ?? ""}
              className="min-h-11 rounded-md border border-line px-3"
            >
              <option value="">{dict.visits.filterAllCountries}</option>
              {listing.countries.map((item) => (
                <option key={item.code} value={item.code}>
                  {countryLabel(locale, item.code)}
                </option>
              ))}
            </select>
          </label>
          <label className="grid gap-1 text-sm">
            {dict.visits.filterYear}
            <select
              name="year"
              defaultValue={filters.year ? String(filters.year) : ""}
              className="min-h-11 rounded-md border border-line px-3"
            >
              <option value="">{dict.visits.filterAllYears}</option>
              {listing.years.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </label>
          <div className="flex items-end">
            <button
              type="submit"
              className="inline-flex min-h-11 w-full items-center justify-center rounded-md bg-navy-950 px-4 text-sm text-paper sm:w-auto"
            >
              {dict.visits.applyFilters}
            </button>
          </div>
        </form>

        {listing.items.length === 0 ? (
          <div className="mt-10">
            <EmptyState>
              {listing.total === 0 && !filters.country && !filters.year ? dict.visits.empty : dict.visits.emptyFilter}
            </EmptyState>
          </div>
        ) : (
          <ul className="mt-12 grid gap-12">
            {listing.items.map((visit) => (
              <li key={visit.id} className="border-t border-line pt-10 first:border-t-0 first:pt-0">
                <VisitCard
                  visit={visit}
                  href={detailPath(locale, "visits", visit.slug)}
                  locale={locale}
                  demoLabel={dict.demo.badge}
                  readMoreLabel={dict.visits.readMore}
                  layout="row"
                />
              </li>
            ))}
          </ul>
        )}

        {last > 1 ? (
          <nav aria-label={dict.visits.pagination} className="mt-12 flex flex-wrap items-center gap-3">
            {listing.page > 1 ? (
              <a
                href={visitListHref(locale, { ...filters, page: listing.page - 1 })}
                className="inline-flex min-h-11 items-center rounded-md border border-line px-4 text-sm"
              >
                {dict.visits.prevPage}
              </a>
            ) : null}
            <p className="text-sm text-muted">
              {dict.visits.pageOf.replace("{page}", String(listing.page)).replace("{total}", String(last))}
            </p>
            {listing.page < last ? (
              <a
                href={visitListHref(locale, { ...filters, page: listing.page + 1 })}
                className="inline-flex min-h-11 items-center rounded-md border border-line px-4 text-sm"
              >
                {dict.visits.nextPage}
              </a>
            ) : null}
          </nav>
        ) : null}
      </Container>
    </>
  );
}
