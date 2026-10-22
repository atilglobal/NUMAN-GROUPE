import Link from "next/link";
import type { Locale } from "@/i18n/config";
import type { VisitView } from "@/content/types";
import { DemoBadge } from "@/components/ui/Badges";
import { ArrowRightIcon } from "@/components/ui/icons";
import { VisitPhoto } from "@/components/visits/VisitPhoto";
import { cn } from "@/components/ui/cn";
import { countryLabel } from "@/lib/countries";

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
  const country = visit.countryCode ? countryLabel(locale, visit.countryCode) : null;
  const meta = [visit.host, visit.place, country].filter(Boolean);

  return (
    <article
      className={cn(
        "group relative overflow-hidden bg-white text-ink",
        layout === "row" ? "grid lg:grid-cols-12 lg:items-center" : "flex flex-col",
      )}
    >
      {visit.image ? (
        <div className={layout === "row" ? "lg:col-span-7" : undefined}>
          <VisitPhoto
            image={visit.image}
            sizes={layout === "row" ? "(min-width: 1024px) 60vw, 100vw" : "(min-width: 1024px) 40vw, 100vw"}
            demoLabel={demoLabel}
            className={layout === "row" ? "min-h-[16rem]" : "min-h-[12rem]"}
          />
        </div>
      ) : null}
      <div className={cn("flex flex-1 flex-col justify-center gap-3 p-6 lg:p-8", layout === "row" ? "lg:col-span-5" : "")}>
        {visit.isDemo && !visit.image ? <DemoBadge label={demoLabel} /> : null}
        {date ? <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gold-700">{date}</p> : null}
        <h3 className="font-serif text-2xl leading-snug text-navy-950 lg:text-[1.85rem]">
          <Link href={href} className="after:absolute after:inset-0">
            {visit.title}
          </Link>
        </h3>
        {meta.length > 0 ? <p className="text-sm text-muted">{meta.join(" · ")}</p> : null}
        {visit.summary ? <p className="max-w-[36rem] text-base leading-relaxed text-ink/80">{visit.summary}</p> : null}
        {readMoreLabel ? (
          <p className="mt-2 inline-flex items-center gap-2 text-sm font-medium text-navy-950">
            {readMoreLabel}
            <ArrowRightIcon className="size-4" />
          </p>
        ) : null}
      </div>
    </article>
  );
}
