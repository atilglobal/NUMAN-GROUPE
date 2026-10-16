import type { VisitView } from "@/content/types";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import { detailPath, sectionPath } from "@/i18n/routes";
import { VisitCard } from "@/components/cards/VisitCard";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/SectionHeading";
import { EmptyState } from "./EmptyState";

type Props = { locale: Locale; dict: Dictionary; visits: VisitView[] };

export function VisitsSection({ locale, dict, visits }: Props) {
  const shown = visits;
  const hasDemo = shown.some((visit) => visit.isDemo);

  return (
    <section aria-labelledby="visits-title" className="on-dark bg-navy-900 py-20 text-paper lg:py-28">
      <Container className="grid gap-12 lg:grid-cols-12 lg:gap-10">
        <div className="lg:col-span-5 lg:pr-6">
          <Eyebrow tone="dark">{dict.visits.eyebrow}</Eyebrow>
          <h2
            id="visits-title"
            className="mt-4 font-serif text-[2rem] leading-[1.12] sm:text-[2.5rem] lg:text-[2.75rem]"
          >
            {dict.visits.title}
          </h2>
          <p className="mt-6 max-w-md text-base leading-relaxed text-on-dark-muted">
            {dict.visits.description}
          </p>
          <div className="mt-8">
            <Button href={sectionPath(locale, "visits")} withArrow>
              {dict.visits.viewAll}
            </Button>
          </div>
        </div>

        <div className="lg:col-span-7">
          {shown.length > 0 ? (
            <ul className="grid gap-5 sm:grid-cols-2">
              {shown.map((visit) => (
                <li key={visit.id}>
                  <VisitCard
                    visit={visit}
                    locale={locale}
                    href={detailPath(locale, "visits", visit.slug)}
                    demoLabel={dict.demo.badge}
                  />
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState tone="dark">{dict.visits.empty}</EmptyState>
          )}
          {hasDemo ? (
            <p className="mt-5 text-sm text-on-dark-muted">{dict.demo.sectionNote}</p>
          ) : null}
        </div>
      </Container>
    </section>
  );
}
