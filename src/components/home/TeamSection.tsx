import type { TeamMemberView } from "@/content/types";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import { sectionPath } from "@/i18n/routes";
import { TeamCard } from "@/components/cards/TeamCard";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { teamCardGridClass } from "@/components/team/layout";
import { EmptyState } from "./EmptyState";

type Props = { locale: Locale; dict: Dictionary; team: TeamMemberView[] };

export function TeamSection({ locale, dict, team }: Props) {
  const shown = team.slice(0, 3);
  const hasDemo = shown.some((member) => member.isDemo);

  return (
    <section aria-labelledby="team-title" className="py-20 lg:py-28">
      <Container>
        <SectionHeading
          id="team-title"
          eyebrow={dict.team.eyebrow}
          title={dict.team.title}
          description={dict.team.description}
        />
        <div className="mt-12">
          {shown.length > 0 ? (
            <ul className={teamCardGridClass}>
              {shown.map((member) => (
                <li key={member.id}>
                  <TeamCard
                    member={member}
                    demoLabel={dict.demo.badge}
                    portraitPendingLabel={dict.team.portraitPending}
                    viewProfileLabel={dict.team.viewProfile}
                    closeLabel={dict.team.closeProfile}
                  />
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState>{dict.team.empty}</EmptyState>
          )}
        </div>
        <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <Button href={sectionPath(locale, "team")} variant="secondary" withArrow>
            {dict.team.viewAll}
          </Button>
          {hasDemo ? <p className="text-sm text-muted">{dict.demo.sectionNote}</p> : null}
        </div>
      </Container>
    </section>
  );
}
