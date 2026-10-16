import type { VisitListResult } from "@/content/types";
import { visitListHref } from "@/content/visit-filters";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import { countryLabel } from "@/lib/countries";
import { pageCount } from "@/lib/pagination";
import { detailPath, homePath } from "@/i18n/routes";
import { VisitCard } from "@/components/cards/VisitCard";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/SectionHeading";

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
    <Container className="py-14 lg:py-20">
      <Breadcrumbs
        label={dict.a11y.breadcrumbs}
        items={[{ label: dict.nav.home, href: homePath(locale) }, { label }]}
      />
      <div className="mt-12 max-w-3xl">
        <Eyebrow>{dict.visits.eyebrow}</Eyebrow>
        <h1 className="mt-5 font-serif text-[2.5rem] leading-[1.08] text-navy-950 sm:text-6xl">{label}</h1>
        <p className="mt-6 text-lg text-ink/85">{dict.visits.description}</p>
        <p className="mt-3 text-sm text-muted">{dict.visits.disclaimer}</p>
      </div>

      <form method="get" className="mt-10 grid gap-3 rounded-lg border border-line bg-white p-4 sm:grid-cols-3">
        <label className="grid gap-1 text-sm">
          {dict.visits.filterCountry}
          <select name="country" defaultValue={filters.country ?? ""} className="min-h-10 rounded-md border border-line px-3">
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
          <select name="year" defaultValue={filters.year ? String(filters.year) : ""} className="min-h-10 rounded-md border border-line px-3">
            <option value="">{dict.visits.filterAllYears}</option>
            {listing.years.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </label>
        <div className="flex items-end">
          <button type="submit" className="inline-flex min-h-10 items-center rounded-md bg-navy-950 px-4 text-sm text-paper">
            {dict.visits.applyFilters}
          </button>
        </div>
      </form>

      {listing.items.length === 0 ? (
        <p role="status" className="mt-10 border border-dashed border-line px-6 py-12 text-center text-muted">
          {listing.total === 0 && !filters.country && !filters.year ? dict.visits.empty : dict.visits.emptyFilter}
        </p>
      ) : (
        <ul className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {listing.items.map((visit) => (
            <li key={visit.id}>
              <VisitCard
                visit={visit}
                href={detailPath(locale, "visits", visit.slug)}
                locale={locale}
                demoLabel={dict.demo.badge}
              />
            </li>
          ))}
        </ul>
      )}

      {last > 1 ? (
        <nav aria-label={dict.visits.pagination} className="mt-10 flex items-center gap-3">
          {listing.page > 1 ? (
            <a href={visitListHref(locale, { ...filters, page: listing.page - 1 })} className="rounded-md border border-line px-3 py-2 text-sm">
              {dict.visits.prevPage}
            </a>
          ) : null}
          <p className="text-sm text-muted">
            {dict.visits.pageOf.replace("{page}", String(listing.page)).replace("{total}", String(last))}
          </p>
          {listing.page < last ? (
            <a href={visitListHref(locale, { ...filters, page: listing.page + 1 })} className="rounded-md border border-line px-3 py-2 text-sm">
              {dict.visits.nextPage}
            </a>
          ) : null}
        </nav>
      ) : null}
    </Container>
  );
}
