import type { DetailEntry, VisitView } from "@/content/types";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import { hasRichText, RichText } from "@/content/rich-text";
import { detailPath, homePath, sectionPath } from "@/i18n/routes";
import { VisitCard } from "@/components/cards/VisitCard";
import { DetailExtras } from "@/components/detail/DetailExtras";
import { PageHero } from "@/components/page/PageHero";
import { Prose } from "@/components/page/Prose";
import { DemoBadge } from "@/components/ui/Badges";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";

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
      <Container className="pb-16 lg:pb-20">
        <p className="max-w-[42rem] text-sm leading-relaxed text-muted">{dict.visits.disclaimer}</p>

        {hasRichText(entry.body) ? (
          <section aria-labelledby="visit-purpose" className="mt-10">
            <h2 id="visit-purpose" className="font-serif text-2xl text-navy-950">
              {dict.visits.purpose}
            </h2>
            <Prose className="mt-4">
              <RichText source={entry.body} className="space-y-4" />
            </Prose>
          </section>
        ) : null}

        <DetailExtras entry={entry} locale={locale} dict={dict} />

        {related.length > 0 ? (
          <section aria-labelledby="related-visits" className="mt-12">
            <h2 id="related-visits" className="font-serif text-2xl text-navy-950">
              {dict.visits.related}
            </h2>
            <ul className="mt-6 grid gap-6">
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
          <div className="mt-10">
            <Button href={sectionPath(locale, "visits")} variant="secondary">
              {parentLabel}
            </Button>
          </div>
        )}
      </Container>
    </>
  );
}
