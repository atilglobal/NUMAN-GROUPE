"use client";

import { useEffect, useId, useRef, useState } from "react";
import type { TeamMemberView } from "@/content/types";
import { DemoBadge } from "@/components/ui/Badges";
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
        <div className="mt-4 grid gap-8 lg:grid-cols-[14rem_minmax(0,1fr)] lg:items-start">
          <TeamPortrait
            name={member.fullName}
            photo={member.photo}
            sizes="(min-width: 1024px) 14rem, 50vw"
            compact={!member.photo}
            className={member.photo ? undefined : "mx-auto"}
          />
          <div>
            <h2 id={titleId} className="font-serif text-3xl text-navy-950">
              {member.fullName}
            </h2>
            <p className="mt-2 text-sm font-medium uppercase tracking-[0.14em] text-gold-700">{member.roleTitle}</p>
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
    <article className={featured ? "grid gap-6 bg-white p-6 lg:grid-cols-12 lg:items-center lg:p-8" : "flex h-full flex-col bg-white"}>
      <div className={featured ? "lg:col-span-5" : undefined}>
        <TeamPortrait
          name={member.fullName}
          photo={member.photo}
          sizes={featured ? "(min-width: 1024px) 30vw, 100vw" : "(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"}
          compact={!member.photo}
          className={member.photo ? undefined : featured ? "lg:mx-0" : "mx-auto mt-6"}
        />
      </div>
      <div className={featured ? "lg:col-span-7" : "flex flex-1 flex-col px-5 py-5"}>
        {member.isDemo ? <DemoBadge label={labels.demo} /> : null}
        <h3 className="break-words font-serif text-2xl text-navy-950">{member.fullName}</h3>
        <p className="mt-2 break-words text-sm font-medium text-gold-700">{member.roleTitle}</p>
        {member.summary ? <p className="mt-4 max-w-[36rem] text-base leading-relaxed text-ink/80">{member.summary}</p> : null}
        <button
          ref={triggerRef}
          type="button"
          onClick={() => setOpen(true)}
          className="mt-5 inline-flex min-h-11 w-fit items-center border-b border-gold-500 text-sm font-medium text-navy-950"
        >
          {labels.viewProfile}
        </button>
      </div>
      {open ? <TeamProfileDialog member={member} labels={labels} onClose={close} /> : null}
    </article>
  );
}
