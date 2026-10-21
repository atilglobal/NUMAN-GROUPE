import type { TeamMemberView } from "@/content/types";
import { DemoBadge } from "@/components/ui/Badges";
import { MediaFrame } from "@/components/ui/MediaFrame";

type TeamCardProps = {
  member: TeamMemberView;
  demoLabel: string;
  portraitPendingLabel: string;
  bioToggleLabel?: string;
};

function initials(fullName: string): string {
  const words = fullName.trim().split(/\s+/);
  const first = words[0]?.charAt(0) ?? "";
  const last = words.length > 1 ? words[words.length - 1].charAt(0) : "";
  return (first + last).toUpperCase();
}

export function TeamCard({ member, demoLabel, portraitPendingLabel }: TeamCardProps) {
  const badge = member.isDemo ? <DemoBadge label={demoLabel} className="absolute right-3 top-3" /> : null;

  return (
    <article className="relative flex h-full flex-col bg-white text-center">
      {member.photo ? (
        <MediaFrame
          image={member.photo}
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          className="aspect-[3/4]"
        >
          {badge}
        </MediaFrame>
      ) : (
        <div className="relative grid aspect-[3/4] place-items-center bg-paper-2">
          <div className="flex flex-col items-center gap-3">
            <span
              aria-hidden="true"
              className="grid size-20 place-items-center rounded-full border border-gold-500 font-serif text-2xl text-gold-700"
            >
              {initials(member.fullName)}
            </span>
            <span className="text-xs uppercase tracking-[0.16em] text-muted">{portraitPendingLabel}</span>
          </div>
          {badge}
        </div>
      )}
      <div className="flex flex-1 flex-col px-5 py-5 text-left">
        <h3 className="break-words font-serif text-xl text-navy-950">{member.fullName}</h3>
        <p className="mt-1 break-words text-sm font-medium text-gold-700">{member.roleTitle}</p>
        {member.bio ? <p className="mt-3 text-sm leading-relaxed text-muted">{member.bio}</p> : null}
        {member.links.length > 0 ? (
          <ul className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-sm">
            {member.links.map((link) => (
              <li key={link.url}>
                <a
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-navy-900 underline decoration-gold-500 underline-offset-4 hover:text-gold-700"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </article>
  );
}
