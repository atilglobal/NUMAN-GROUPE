import type { ExpertiseView } from "@/content/types";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import { detailPath, sectionPath } from "@/i18n/routes";
import { ExpertiseCard } from "@/components/cards/ExpertiseCard";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";

type Props = { locale: Locale; dict: Dictionary; expertises: ExpertiseView[] };

export function ExpertisesSection({ locale, dict, expertises }: Props) {
  return (
    <section aria-labelledby="expertises-title" className="border-t border-line py-20 lg:py-28">
      <Container>
        <SectionHeading
          id="expertises-title"
          eyebrow={dict.expertises.eyebrow}
          title={dict.expertises.title}
          description={dict.expertises.description}
        />
        {expertises.length === 0 ? (
          <p className="mt-12 text-muted">{dict.expertises.empty}</p>
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
        <div className="mt-10">
          <Button href={sectionPath(locale, "expertises")} variant="secondary" withArrow>
            {dict.expertises.viewAll}
          </Button>
        </div>
      </Container>
    </section>
  );
}
