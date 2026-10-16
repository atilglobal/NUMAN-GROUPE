import type { DetailEntry, VisitView } from "@/content/types";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import { detailPath, homePath, sectionPath } from "@/i18n/routes";
import { DetailExtras } from "@/components/detail/DetailExtras";
import { PendingPage } from "@/components/layout/PendingPage";
import { VisitCard } from "@/components/cards/VisitCard";
import { DemoBadge } from "@/components/ui/Badges";

export function VisitDetail({
  locale,
  dict,
  entry,
  related,
  preview = false,
}: {
  locale: Locale;
  dict: Dictionary;
  entry: DetailEntry;
  related: VisitView[];
  preview?: boolean;
}) {
  const parentLabel = dict.nav.visits;
  return (
    <PendingPage
      breadcrumbs={[
        { label: dict.nav.home, href: homePath(locale) },
        { label: parentLabel, href: sectionPath(locale, "visits") },
        { label: entry.title },
      ]}
      breadcrumbsLabel={dict.a11y.breadcrumbs}
      statusLabel={parentLabel}
      title={entry.title}
      badges={entry.isDemo ? <DemoBadge label={dict.demo.badge} /> : null}
      lead={entry.summary}
      body={entry.body}
      message={entry.isDemo ? dict.demo.sectionNote : dict.visits.disclaimer}
      actions={
        preview
          ? []
          : [
              { href: sectionPath(locale, "visits"), label: parentLabel },
              { href: sectionPath(locale, "contact"), label: dict.nav.contact },
            ]
      }
    >
      {entry.summary ? (
        <p className="mt-8 text-xs font-semibold uppercase tracking-[0.14em] text-muted">{dict.visits.purpose}</p>
      ) : null}
      <DetailExtras entry={entry} locale={locale} dict={dict} />
      {related.length > 0 ? (
        <section aria-labelledby="related-visits" className="mt-12">
          <h2 id="related-visits" className="font-serif text-2xl text-navy-950">
            {dict.visits.related}
          </h2>
          <ul className="mt-6 grid gap-5 sm:grid-cols-2">
            {related.map((visit) => (
              <li key={visit.id}>
                <VisitCard
                  visit={visit}
                  href={preview ? "#" : detailPath(locale, "visits", visit.slug)}
                  locale={locale}
                  demoLabel={dict.demo.badge}
                />
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </PendingPage>
  );
}
