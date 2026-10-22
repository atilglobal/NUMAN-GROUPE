import type { TeamMemberView, TeamPresentationGroup } from "@/content/types";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import { homePath, sectionPath } from "@/i18n/routes";
import { TeamMemberCard, type TeamLabels } from "@/components/team/TeamMemberCard";
import { EmptyState } from "@/components/home/EmptyState";
import { PageCta } from "@/components/page/PageCta";
import { PageHero } from "@/components/page/PageHero";
import { Container } from "@/components/ui/Container";

const GROUPS: TeamPresentationGroup[] = ["international", "technical", "legal", "finance"];

function groupLabel(dict: Dictionary, group: TeamPresentationGroup): string {
  return dict.team.groups[group];
}

export function TeamList({
  locale,
  dict,
  team,
}: {
  locale: Locale;
  dict: Dictionary;
  team: TeamMemberView[];
}) {
  const labels: TeamLabels = {
    viewProfile: dict.team.viewProfile,
    close: dict.team.closeProfile,
    portraitPending: dict.team.portraitPending,
    demo: dict.demo.badge,
  };
  const leadership = team.filter((member) => member.presentationGroup === "leadership");
  const featured = leadership.length > 0 ? leadership : team.slice(0, 2);
  const featuredIds = new Set(featured.map((member) => member.id));
  const remainder = team.filter((member) => !featuredIds.has(member.id));

  return (
    <>
      <PageHero
        className="pt-8 pb-6 lg:pt-10 lg:pb-6"
        breadcrumbs={[{ label: dict.nav.home, href: homePath(locale) }, { label: dict.nav.team }]}
        breadcrumbsLabel={dict.a11y.breadcrumbs}
        eyebrow={dict.team.eyebrow}
        title={dict.team.pageTitle}
        lead={dict.team.description}
      />
      <Container className="pb-16 lg:pb-20">
        {team.length === 0 ? (
          <EmptyState>{dict.team.empty}</EmptyState>
        ) : (
          <div className="grid gap-16">
            {featured.length > 0 ? (
              <section aria-labelledby="team-leadership">
                <h2 id="team-leadership" className="font-serif text-2xl text-navy-950">
                  {dict.team.groups.leadership}
                </h2>
                <ul className={`mt-6 grid gap-6 ${featured.length === 1 ? "" : "lg:grid-cols-2"}`}>
                  {featured.map((member) => (
                    <li key={member.id}>
                      <TeamMemberCard member={member} labels={labels} featured />
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}

            {GROUPS.map((group) => {
              const members = remainder.filter((member) => member.presentationGroup === group);
              if (members.length === 0) return null;
              const columns = members.length === 1 ? "" : members.length === 2 ? "sm:grid-cols-2" : "sm:grid-cols-2 lg:grid-cols-3";
              return (
                <section key={group} aria-labelledby={`team-${group}`}>
                  <h2 id={`team-${group}`} className="font-serif text-2xl text-navy-950">
                    {groupLabel(dict, group)}
                  </h2>
                  <ul className={`mt-6 grid gap-6 ${columns}`}>
                    {members.map((member) => (
                      <li key={member.id}>
                        <TeamMemberCard member={member} labels={labels} />
                      </li>
                    ))}
                  </ul>
                </section>
              );
            })}

            {remainder.some((member) => !member.presentationGroup) ? (
              <section aria-labelledby="team-other">
                <h2 id="team-other" className="font-serif text-2xl text-navy-950">
                  {dict.team.groups.other}
                </h2>
                <ul className="mt-6 grid gap-6 sm:grid-cols-2">
                  {remainder
                    .filter((member) => !member.presentationGroup)
                    .map((member) => (
                      <li key={member.id}>
                        <TeamMemberCard member={member} labels={labels} />
                      </li>
                    ))}
                </ul>
              </section>
            ) : null}
          </div>
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
