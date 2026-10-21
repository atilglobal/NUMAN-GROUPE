import Link from "next/link";
import type { Locale } from "@/i18n/config";
import type { VisitView } from "@/content/types";
import { DemoBadge } from "@/components/ui/Badges";
import { ArrowRightIcon } from "@/components/ui/icons";
import { MediaFrame } from "@/components/ui/MediaFrame";
import { cn } from "@/components/ui/cn";

type VisitCardProps = {
  visit: VisitView;
  href: string;
  locale: Locale;
  demoLabel: string;
  readMoreLabel?: string;
  layout?: "card" | "row";
};

export function VisitCard({
  visit,
  href,
  locale,
  demoLabel,
  readMoreLabel,
  layout = "card",
}: VisitCardProps) {
  const date = visit.visitedOn ? (
    <time dateTime={visit.visitedOn}>
      {new Intl.DateTimeFormat(locale, { dateStyle: "long", timeZone: "UTC" }).format(new Date(visit.visitedOn))}
    </time>
  ) : null;
  const meta = [date, visit.host].filter(Boolean);

  return (
    <article
      className={cn(
        "group relative flex h-full bg-white text-ink",
        layout === "row" ? "flex-col sm:flex-row" : "flex-col",
      )}
    >
      <MediaFrame
        image={visit.image}
        sizes={layout === "row" ? "(min-width: 640px) 280px, 100vw" : "(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"}
        className={layout === "row" ? "aspect-[16/10] sm:w-72 sm:shrink-0 sm:aspect-[4/3]" : "aspect-[16/10]"}
        imageClassName="transition-transform duration-500 group-hover:scale-[1.03]"
      >
        {visit.isDemo ? <DemoBadge label={demoLabel} className="absolute right-3 top-3" /> : null}
      </MediaFrame>
      <div className="flex flex-1 items-start justify-between gap-4 p-5">
        <div>
          {meta.length > 0 ? (
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gold-700">
              {meta.map((item, index) => (
                <span key={index}>
                  {index > 0 ? <span aria-hidden="true"> · </span> : null}
                  {item}
                </span>
              ))}
            </p>
          ) : null}
          <h3 className="mt-1 font-serif text-xl leading-snug text-navy-950">
            <Link href={href} className="after:absolute after:inset-0">
              {visit.title}
            </Link>
          </h3>
          {visit.place ? <p className="mt-1 text-sm text-muted">{visit.place}</p> : null}
          {visit.summary ? <p className="mt-2 text-sm leading-relaxed text-ink/80">{visit.summary}</p> : null}
          {readMoreLabel ? (
            <p className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-navy-950">
              {readMoreLabel}
              <ArrowRightIcon className="size-4" />
            </p>
          ) : null}
        </div>
        {readMoreLabel ? null : (
          <span
            aria-hidden="true"
            className="mt-1 grid size-9 shrink-0 place-items-center rounded-full border border-line text-navy-900 transition-colors group-hover:border-navy-900 group-hover:bg-navy-900 group-hover:text-paper"
          >
            <ArrowRightIcon />
          </span>
        )}
      </div>
    </article>
  );
}
