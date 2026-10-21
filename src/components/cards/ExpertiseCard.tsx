import Link from "next/link";
import type { ExpertiseView } from "@/content/types";
import { DemoBadge } from "@/components/ui/Badges";
import { ArrowRightIcon } from "@/components/ui/icons";
import { MediaFrame } from "@/components/ui/MediaFrame";

type ExpertiseCardProps = {
  expertise: ExpertiseView;
  href: string;
  demoImageLabel: string;
  openLabel?: string;
};

export function ExpertiseCard({ expertise, href, demoImageLabel, openLabel }: ExpertiseCardProps) {
  return (
    <article className="group relative flex h-full flex-col bg-white shadow-[0_1px_0_rgb(0_0_0/0.04)]">
      <MediaFrame
        image={expertise.image}
        sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
        className="aspect-[4/3]"
        imageClassName="transition-transform duration-500 group-hover:scale-[1.03]"
      >
        {expertise.image?.isDemo ? (
          <DemoBadge label={demoImageLabel} className="absolute right-3 top-3" />
        ) : null}
      </MediaFrame>
      <div className="flex flex-1 items-start justify-between gap-4 border-t-2 border-gold-400 p-5">
        <div>
          <h3 className="font-serif text-xl text-navy-950">
            <Link href={href} className="after:absolute after:inset-0">
              {expertise.name}
            </Link>
          </h3>
          {expertise.summary ? <p className="mt-2 text-sm leading-relaxed text-muted">{expertise.summary}</p> : null}
          {openLabel ? <p className="mt-3 text-sm font-medium text-navy-950">{openLabel}</p> : null}
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
