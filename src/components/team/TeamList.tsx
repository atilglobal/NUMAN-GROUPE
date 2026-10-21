import type { TeamMemberView } from "@/content/types";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import { homePath, sectionPath } from "@/i18n/routes";
import { TeamCard } from "@/components/cards/TeamCard";
import { EmptyState } from "@/components/home/EmptyState";
import { PageCta } from "@/components/page/PageCta";
import { PageHero } from "@/components/page/PageHero";
import { Container } from "@/components/ui/Container";

export function TeamList({
  locale,
  dict,
  team,
}: {
  locale: Locale;
  dict: Dictionary;
  team: TeamMemberView[];
}) {
  const label = dict.nav.team;
  return (
    <>
      <PageHero
        breadcrumbs={[{ label: dict.nav.home, href: homePath(locale) }, { label }]}
        breadcrumbsLabel={dict.a11y.breadcrumbs}
        eyebrow={dict.team.eyebrow}
        title={label}
        lead={dict.team.description}
      />
      <Container className="pb-14 lg:pb-16">
        {team.length === 0 ? (
          <EmptyState>{dict.team.empty}</EmptyState>
        ) : (
          <ul className="grid justify-center gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {team.map((member) => (
              <li key={member.id} className="mx-auto w-full max-w-sm">
                <TeamCard
                  member={member}
                  demoLabel={dict.demo.badge}
                  portraitPendingLabel={dict.team.portraitPending}
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
        label={dict.team.contactCta}
      />
    </>
  );
}
