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
  viewLabel: string;
};

export function ProjectCard({ project, href, statusLabel, demoLabel, viewLabel }: ProjectCardProps) {
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
      <div className="flex flex-1 flex-col p-5">
        <h3 className="font-serif text-xl leading-snug text-navy-950">
          <Link href={href} className="after:absolute after:inset-0">
            {project.title}
          </Link>
        </h3>
        {project.summary ? <p className="mt-2 text-sm text-ink/80">{project.summary}</p> : null}
        <p className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-navy-950">
          {viewLabel}
          <span
            aria-hidden="true"
            className="grid size-8 place-items-center rounded-full border border-line transition-colors group-hover:border-navy-900 group-hover:bg-navy-900 group-hover:text-paper"
          >
            <ArrowRightIcon />
          </span>
        </p>
      </div>
    </article>
  );
}
