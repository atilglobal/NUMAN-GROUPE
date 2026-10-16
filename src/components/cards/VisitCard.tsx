import Link from "next/link";
import type { Locale } from "@/i18n/config";
import type { VisitView } from "@/content/types";
import { DemoBadge } from "@/components/ui/Badges";
import { ArrowRightIcon } from "@/components/ui/icons";
import { MediaFrame } from "@/components/ui/MediaFrame";

type VisitCardProps = {
  visit: VisitView;
  href: string;
  locale: Locale;
  demoLabel: string;
};

export function VisitCard({ visit, href, locale, demoLabel }: VisitCardProps) {
  return (
    <article className="group relative flex h-full flex-col bg-paper text-ink">
      <MediaFrame
        image={visit.image}
        sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
        className="aspect-[4/3]"
        imageClassName="transition-transform duration-500 group-hover:scale-[1.03]"
      >
        {visit.isDemo ? <DemoBadge label={demoLabel} className="absolute right-3 top-3" /> : null}
      </MediaFrame>
      <div className="flex flex-1 items-start justify-between gap-4 p-5">
        <div>
          {visit.visitedOn ? (
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gold-700">
              <time dateTime={visit.visitedOn}>
                {new Intl.DateTimeFormat(locale, { dateStyle: "long", timeZone: "UTC" }).format(
                  new Date(visit.visitedOn),
                )}
              </time>
            </p>
          ) : null}
          <h3 className="mt-1 font-serif text-lg leading-snug text-navy-950">
            <Link href={href} className="after:absolute after:inset-0">
              {visit.title}
            </Link>
          </h3>
          {visit.host ? <p className="mt-1 text-sm text-muted">{visit.host}</p> : null}
          {visit.place ? <p className="mt-0.5 text-sm text-muted">{visit.place}</p> : null}
          {visit.summary ? <p className="mt-2 text-sm leading-relaxed text-ink/80">{visit.summary}</p> : null}
        </div>
        <span
          aria-hidden="true"
          className="mt-1 grid size-9 shrink-0 place-items-center rounded-full border border-line text-navy-900 transition-colors group-hover:border-navy-900 group-hover:bg-navy-900 group-hover:text-paper"
        >
          <ArrowRightIcon />
        </span>
      </div>
    </article>
  );
}
