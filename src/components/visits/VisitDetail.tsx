import type { DetailEntry, VisitView } from "@/content/types";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import { hasRichText, RichText } from "@/content/rich-text";
import { detailPath, homePath, sectionPath } from "@/i18n/routes";
import { countryLabel } from "@/lib/countries";
import { VisitCard } from "@/components/cards/VisitCard";
import { VisitLightbox } from "@/components/visits/VisitLightbox";
import { PageHero } from "@/components/page/PageHero";
import { Prose } from "@/components/page/Prose";
import { DemoBadge } from "@/components/ui/Badges";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";

function formatDate(locale: Locale, value: string): string {
  return new Intl.DateTimeFormat(locale, { dateStyle: "long", timeZone: "UTC" }).format(new Date(value));
}

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
  const facts = entry.facts.kind === "visit" ? entry.facts : null;
  const photos = [
    ...(entry.image ? [entry.image] : []),
    ...entry.gallery.filter((item) => (item.assetId ?? item.src) !== (entry.image?.assetId ?? entry.image?.src)),
  ];
  const rows: { label: string; value: string }[] = [];
  if (facts?.host) rows.push({ label: dict.detail.host, value: facts.host });
  if (facts?.place) rows.push({ label: dict.detail.location, value: facts.place });
  if (facts?.countryCode) rows.push({ label: dict.visits.filterCountry, value: countryLabel(locale, facts.countryCode) });
  if (facts?.visitedOn) rows.push({ label: dict.detail.date, value: formatDate(locale, facts.visitedOn) });
  const participants = facts?.participants ?? [];

  return (
    <>
      <PageHero
        breadcrumbs={[
          { label: dict.nav.home, href: homePath(locale) },
          { label: parentLabel, href: sectionPath(locale, "visits") },
          { label: entry.title },
        ]}
        breadcrumbsLabel={dict.a11y.breadcrumbs}
        eyebrow={parentLabel}
        title={entry.title}
        lead={entry.summary}
        badges={entry.isDemo ? <DemoBadge label={dict.demo.badge} /> : null}
      />
      <Container className="pb-16 lg:pb-24">
        <p className="max-w-[42rem] text-sm leading-relaxed text-muted">{dict.visits.disclaimer}</p>

        {rows.length > 0 ? (
          <dl className="mt-8 grid gap-x-8 gap-y-3 border-t border-line pt-6 sm:grid-cols-2 lg:grid-cols-4">
            {rows.map((row) => (
              <div key={row.label}>
                <dt className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">{row.label}</dt>
                <dd className="mt-1 text-ink">{row.value}</dd>
              </div>
            ))}
          </dl>
        ) : null}

        {photos.length > 0 ? (
          <div className="mt-10">
            <VisitLightbox
              images={photos}
              demoLabel={dict.demo.imageBadge}
              labels={{
                gallery: dict.detail.gallery,
                open: dict.detail.galleryOpen,
                close: dict.detail.galleryClose,
                previous: dict.detail.galleryPrev,
                next: dict.detail.galleryNext,
                of: dict.detail.galleryOf,
                zoomIn: dict.detail.zoomIn,
                zoomOut: dict.detail.zoomOut,
                demo: dict.demo.imageBadge,
                showAll: dict.detail.showAllPhotos,
                showLess: dict.detail.showLessPhotos,
              }}
            />
          </div>
        ) : null}

        {hasRichText(entry.body) ? (
          <section aria-labelledby="visit-purpose" className="mt-12">
            <h2 id="visit-purpose" className="font-serif text-2xl text-navy-950">
              {dict.visits.purpose}
            </h2>
            <Prose className="mt-4">
              <RichText source={entry.body} className="space-y-4" />
            </Prose>
          </section>
        ) : null}

        {participants.length > 0 ? (
          <section aria-labelledby="detail-participants" className="mt-12">
            <h2 id="detail-participants" className="font-serif text-2xl text-navy-950">
              {dict.detail.participants}
            </h2>
            <ul className="mt-4 space-y-2 border-t border-line pt-4">
              {participants.map((participant, index) => (
                <li key={`${participant.fullName}-${index}`} className="text-ink">
                  <span className="font-medium">{participant.fullName}</span>
                  {participant.roleTitle ? <span className="text-muted"> — {participant.roleTitle}</span> : null}
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {related.length > 0 ? (
          <section aria-labelledby="related-visits" className="mt-16">
            <h2 id="related-visits" className="font-serif text-2xl text-navy-950">
              {dict.visits.related}
            </h2>
            <ul className="mt-8 grid gap-10">
              {related.map((visit) => (
                <li key={visit.id}>
                  <VisitCard
                    visit={visit}
                    href={preview ? "#" : detailPath(locale, "visits", visit.slug)}
                    locale={locale}
                    demoLabel={dict.demo.badge}
                    readMoreLabel={dict.visits.readMore}
                    layout="row"
                  />
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {preview ? null : (
          <div className="mt-12">
            <Button href={sectionPath(locale, "visits")} variant="secondary">
              {parentLabel}
            </Button>
          </div>
        )}
      </Container>
    </>
  );
}
