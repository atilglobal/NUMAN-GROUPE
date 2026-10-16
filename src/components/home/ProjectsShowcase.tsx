"use client";

import { useState } from "react";
import type { ProjectStatus, ProjectView } from "@/content/types";
import { ProjectCard } from "@/components/cards/ProjectCard";
import { cn } from "@/components/ui/cn";

type Filter = "all" | ProjectStatus;

type ProjectsShowcaseProps = {
  items: { project: ProjectView; href: string }[];
  labels: {
    filter: string;
    all: string;
    completed: string;
    inProgress: string;
    emptyFilter: string;
    demo: string;
    status: Record<ProjectStatus, string>;
  };
  limit: number;
};

export function ProjectsShowcase({ items, labels, limit }: ProjectsShowcaseProps) {
  const [filter, setFilter] = useState<Filter>("all");
  const visible = items
    .filter((item) => filter === "all" || item.project.status === filter)
    .slice(0, limit);

  const options: { value: Filter; label: string }[] = [
    { value: "all", label: labels.all },
    { value: "completed", label: labels.completed },
    { value: "in_progress", label: labels.inProgress },
  ];

  return (
    <div>
      <div
        role="group"
        aria-label={labels.filter}
        className="grid grid-cols-3 gap-1 rounded-full border border-line bg-white p-1 sm:inline-flex"
      >
        {options.map((option) => {
          const active = option.value === filter;
          return (
            <button
              key={option.value}
              type="button"
              aria-pressed={active}
              onClick={() => setFilter(option.value)}
              className={cn(
                "min-h-10 rounded-full px-2 text-[0.8125rem] leading-tight transition-colors sm:px-5 sm:text-sm",
                active ? "bg-navy-900 text-paper" : "text-ink/80 hover:bg-paper-2 hover:text-navy-950",
              )}
            >
              {option.label}
            </button>
          );
        })}
      </div>

      {visible.length > 0 ? (
        <ul className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map(({ project, href }) => (
            <li key={project.id}>
              <ProjectCard
                project={project}
                href={href}
                statusLabel={labels.status[project.status]}
                demoLabel={labels.demo}
              />
            </li>
          ))}
        </ul>
      ) : (
        <p role="status" className="mt-8 border border-dashed border-line px-6 py-10 text-center text-muted">
          {labels.emptyFilter}
        </p>
      )}
    </div>
  );
}
