import Link from "next/link";
import type { ProjectView } from "@/content/types";
import { DemoBadge, StatusBadge } from "@/components/ui/Badges";
import { ArrowRightIcon } from "@/components/ui/icons";
import { MediaFrame } from "@/components/ui/MediaFrame";

type ProjectCardProps = {
  project: ProjectView;
  href: string;
  statusLabel: string;
  demoLabel: string;
};

export function ProjectCard({ project, href, statusLabel, demoLabel }: ProjectCardProps) {
  return (
    <article className="group relative flex h-full flex-col bg-white">
      <MediaFrame
        image={project.image}
        profile="projectCard"
        sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
        className="aspect-[4/3]"
        imageClassName="transition-transform duration-500 group-hover:scale-[1.03]"
      >
        <div className="absolute inset-x-3 top-3 flex items-start justify-between gap-2">
          <StatusBadge status={project.status} label={statusLabel} />
          {project.isDemo ? <DemoBadge label={demoLabel} /> : null}
        </div>
      </MediaFrame>
      <div className="flex flex-1 items-start justify-between gap-4 p-5">
        <div>
          {project.expertiseName ? (
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gold-700">
              {project.expertiseName}
            </p>
          ) : null}
          <h3 className="mt-2 font-serif text-xl leading-snug text-navy-950">
            <Link href={href} className="after:absolute after:inset-0">
              {project.title}
            </Link>
          </h3>
          {project.place ? <p className="mt-1 text-sm text-muted">{project.place}</p> : null}
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
