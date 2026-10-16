import type { ExpertiseView } from "@/content/types";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import { detailPath, homePath, sectionPath } from "@/i18n/routes";
import { ExpertiseCard } from "@/components/cards/ExpertiseCard";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/SectionHeading";

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
    <Container className="py-14 lg:py-20">
      <Breadcrumbs
        label={dict.a11y.breadcrumbs}
        items={[{ label: dict.nav.home, href: homePath(locale) }, { label }]}
      />
      <div className="mt-12 max-w-3xl">
        <Eyebrow>{dict.expertises.eyebrow}</Eyebrow>
        <h1 className="mt-5 font-serif text-[2.5rem] leading-[1.08] text-navy-950 sm:text-6xl">{label}</h1>
        <p className="mt-6 text-lg text-ink/85">{dict.expertises.description}</p>
      </div>
      {expertises.length === 0 ? (
        <p role="status" className="mt-10 border border-dashed border-line px-6 py-12 text-center text-muted">
          {dict.expertises.empty}
        </p>
      ) : (
        <ul className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {expertises.map((expertise) => (
            <li key={expertise.id}>
              <ExpertiseCard
                expertise={expertise}
                href={detailPath(locale, "expertises", expertise.slug)}
                demoImageLabel={dict.demo.imageBadge}
              />
            </li>
          ))}
        </ul>
      )}
      <p className="mt-10">
        <a href={sectionPath(locale, "contact")} className="text-sm text-navy-950 underline underline-offset-4">
          {dict.expertises.contactCta}
        </a>
      </p>
    </Container>
  );
}
