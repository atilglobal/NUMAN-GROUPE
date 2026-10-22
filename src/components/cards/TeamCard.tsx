import type { TeamMemberView } from "@/content/types";
import { TeamMemberCard } from "@/components/team/TeamMemberCard";

type TeamCardProps = {
  member: TeamMemberView;
  demoLabel: string;
  portraitPendingLabel: string;
  viewProfileLabel: string;
  closeLabel: string;
};

export function TeamCard({ member, demoLabel, portraitPendingLabel, viewProfileLabel, closeLabel }: TeamCardProps) {
  return (
    <TeamMemberCard
      member={member}
      labels={{
        viewProfile: viewProfileLabel,
        close: closeLabel,
        portraitPending: portraitPendingLabel,
        demo: demoLabel,
      }}
    />
  );
}
