import type { ProjectView } from "@/content/types";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import { detailPath, sectionPath } from "@/i18n/routes";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { EmptyState } from "./EmptyState";
import { ProjectsShowcase } from "./ProjectsShowcase";

type Props = { locale: Locale; dict: Dictionary; projects: ProjectView[] };

export function ProjectsSection({ locale, dict, projects }: Props) {
  const hasDemo = projects.some((project) => project.isDemo);

  return (
    <section aria-labelledby="projects-title" className="bg-paper-2 py-20 lg:py-28">
      <Container>
        <SectionHeading
          id="projects-title"
          eyebrow={dict.projects.eyebrow}
          title={dict.projects.title}
          description={dict.projects.description}
        />
        <div className="mt-10">
          {projects.length > 0 ? (
            <ProjectsShowcase
              limit={3}
              items={projects.map((project) => ({
                project,
                href: detailPath(locale, "projects", project.slug),
              }))}
              labels={{
                filter: dict.projects.filterLabel,
                all: dict.projects.filterAll,
                planned: dict.projects.filterPlanned,
                completed: dict.projects.filterCompleted,
                inProgress: dict.projects.filterInProgress,
                emptyFilter: dict.projects.emptyFilter,
                demo: dict.demo.badge,
                viewDetail: dict.projects.viewDetail,
                status: dict.projects.status,
              }}
            />
          ) : (
            <EmptyState>{dict.projects.empty}</EmptyState>
          )}
        </div>
        <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <Button href={sectionPath(locale, "projects")} variant="secondary" withArrow>
            {dict.projects.viewAll}
          </Button>
          {hasDemo ? <p className="text-sm text-muted">{dict.demo.sectionNote}</p> : null}
        </div>
      </Container>
    </section>
  );
}
