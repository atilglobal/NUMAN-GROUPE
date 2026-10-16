import type { TeamMemberView } from "@/content/types";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import { homePath, sectionPath } from "@/i18n/routes";
import { TeamCard } from "@/components/cards/TeamCard";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/SectionHeading";

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
    <Container className="py-14 lg:py-20">
      <Breadcrumbs
        label={dict.a11y.breadcrumbs}
        items={[{ label: dict.nav.home, href: homePath(locale) }, { label }]}
      />
      <div className="mt-12 max-w-3xl">
        <Eyebrow>{dict.team.eyebrow}</Eyebrow>
        <h1 className="mt-5 font-serif text-[2.5rem] leading-[1.08] text-navy-950 sm:text-6xl">{label}</h1>
        <p className="mt-6 text-lg text-ink/85">{dict.team.description}</p>
      </div>
      {team.length === 0 ? (
        <p role="status" className="mt-10 border border-dashed border-line px-6 py-12 text-center text-muted">
          {dict.team.empty}
        </p>
      ) : (
        <ul className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {team.map((member) => (
            <li key={member.id}>
              <TeamCard
                member={member}
                demoLabel={dict.demo.badge}
                portraitPendingLabel={dict.team.portraitPending}
                bioToggleLabel={dict.team.bioToggle}
              />
            </li>
          ))}
        </ul>
      )}
      <p className="mt-10">
        <a href={sectionPath(locale, "contact")} className="text-sm text-navy-950 underline underline-offset-4">
          {dict.nav.contact}
        </a>
      </p>
    </Container>
  );
}
