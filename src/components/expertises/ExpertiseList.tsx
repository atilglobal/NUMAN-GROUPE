import type { ExpertiseView } from "@/content/types";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import { detailPath, homePath, sectionPath } from "@/i18n/routes";
import { ExpertiseCard } from "@/components/cards/ExpertiseCard";
import { EmptyState } from "@/components/home/EmptyState";
import { PageCta } from "@/components/page/PageCta";
import { PageHero } from "@/components/page/PageHero";
import { Container } from "@/components/ui/Container";

export function ExpertiseList({
  locale,
  dict,
  expertises,
}: {
  locale: Locale;
  dict: Dictionary;
  expertises: ExpertiseView[];
}) {
  const label = dict.nav.expertises;
  return (
    <>
      <PageHero
        breadcrumbs={[{ label: dict.nav.home, href: homePath(locale) }, { label }]}
        breadcrumbsLabel={dict.a11y.breadcrumbs}
        eyebrow={dict.expertises.eyebrow}
        title={label}
        lead={dict.expertises.description}
      />
      <Container className="pb-14 lg:pb-16">
        {expertises.length === 0 ? (
          <EmptyState>{dict.expertises.empty}</EmptyState>
        ) : (
          <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {expertises.map((expertise) => (
              <li key={expertise.id}>
                <ExpertiseCard
                  expertise={expertise}
                  href={detailPath(locale, "expertises", expertise.slug)}
                  demoImageLabel={dict.demo.imageBadge}
                  openLabel={dict.expertises.openLabel}
                />
              </li>
            ))}
          </ul>
        )}
      </Container>
      <PageCta
        title={dict.callToAction.title}
        description={dict.callToAction.description}
        href={sectionPath(locale, "contact")}
        label={dict.expertises.contactCta}
      />
    </>
  );
}
