"use client";

import { useEffect, useId, useRef, useState } from "react";
import type { TeamMemberView } from "@/content/types";
import { DemoBadge } from "@/components/ui/Badges";
import { cn } from "@/components/ui/cn";
import { TEAM_CARD_MAX } from "./layout";
import { TeamPortrait } from "./TeamPortrait";

export type TeamLabels = {
  viewProfile: string;
  close: string;
  portraitPending: string;
  demo: string;
};

function TeamProfileDialog({
  member,
  labels,
  onClose,
}: {
  member: TeamMemberView;
  labels: TeamLabels;
  onClose: () => void;
}) {
  const titleId = useId();
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    closeRef.current?.focus();
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-navy-950/80 p-4 sm:items-center" role="presentation">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="max-h-[90vh] w-full max-w-3xl overflow-y-auto bg-paper p-6 shadow-2xl sm:p-10"
      >
        <div className="flex justify-end">
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            className="inline-flex min-h-11 items-center border border-navy-900 px-4 text-sm font-medium text-navy-900 hover:bg-navy-900 hover:text-paper"
          >
            {labels.close}
          </button>
        </div>
        <div className="mt-4 grid gap-8 lg:grid-cols-[10rem_minmax(0,1fr)] lg:items-start">
          <TeamPortrait name={member.fullName} photo={member.photo} sizes="10rem" className="max-w-[10rem]" />
          <div className="min-w-0">
            <h2 id={titleId} className="break-words font-serif text-3xl text-navy-950">
              {member.fullName}
            </h2>
            <p className="mt-2 break-words text-sm font-medium text-gold-700">{member.roleTitle}</p>
            {member.bio ? (
              <div className="mt-6 space-y-4 text-base leading-relaxed text-ink/90">
                {member.bio.split(/\n+/).map((paragraph) => (
                  <p key={paragraph.slice(0, 48)}>{paragraph}</p>
                ))}
              </div>
            ) : member.summary ? (
              <p className="mt-6 text-base leading-relaxed text-ink/90">{member.summary}</p>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

export function TeamMemberCard({
  member,
  labels,
  featured = false,
}: {
  member: TeamMemberView;
  labels: TeamLabels;
  featured?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);

  function close() {
    setOpen(false);
    requestAnimationFrame(() => triggerRef.current?.focus());
  }

  return (
    <article
      className={cn(
        "flex h-full w-full flex-col bg-white",
        featured ? cn(TEAM_CARD_MAX, "lg:max-w-none lg:flex-row lg:items-stretch") : TEAM_CARD_MAX,
      )}
    >
      <div className={featured ? "w-full shrink-0 lg:w-40" : "w-full"}>
        <TeamPortrait
          name={member.fullName}
          photo={member.photo}
          sizes={featured ? "(min-width: 1024px) 160px, 340px" : "340px"}
        />
      </div>
      <div className="flex min-w-0 flex-1 flex-col p-5 lg:p-6">
        {member.isDemo ? <DemoBadge label={labels.demo} /> : null}
        <h3 className="break-words font-serif text-xl leading-snug text-navy-950 lg:text-[1.35rem]">{member.fullName}</h3>
        <p className="mt-2 break-words text-[0.95rem] font-medium leading-snug text-gold-700">{member.roleTitle}</p>
        {member.summary ? (
          <p className="mt-3 line-clamp-4 text-[15px] leading-relaxed text-ink/80">{member.summary}</p>
        ) : null}
        <button
          ref={triggerRef}
          type="button"
          onClick={() => setOpen(true)}
          className="mt-auto inline-flex min-h-11 w-fit items-center border-b border-gold-500 pt-5 text-sm font-medium text-navy-950"
        >
          {labels.viewProfile}
        </button>
      </div>
      {open ? <TeamProfileDialog member={member} labels={labels} onClose={close} /> : null}
    </article>
  );
}
