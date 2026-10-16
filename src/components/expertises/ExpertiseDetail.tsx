import type { DetailEntry, ProjectView } from "@/content/types";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import { detailPath, homePath, sectionPath } from "@/i18n/routes";
import { DetailExtras } from "@/components/detail/DetailExtras";
import { PendingPage } from "@/components/layout/PendingPage";
import { ProjectCard } from "@/components/cards/ProjectCard";
import { DemoBadge } from "@/components/ui/Badges";
import { Button } from "@/components/ui/Button";

export function ExpertiseDetail({
  locale,
  dict,
  entry,
  related,
  preview = false,
}: {
  locale: Locale;
  dict: Dictionary;
  entry: DetailEntry;
  related: ProjectView[];
  preview?: boolean;
}) {
  const parentLabel = dict.nav.expertises;
  return (
    <PendingPage
      breadcrumbs={[
        { label: dict.nav.home, href: homePath(locale) },
        { label: parentLabel, href: sectionPath(locale, "expertises") },
        { label: entry.title },
      ]}
      breadcrumbsLabel={dict.a11y.breadcrumbs}
      statusLabel={parentLabel}
      title={entry.title}
      badges={entry.isDemo ? <DemoBadge label={dict.demo.badge} /> : null}
      lead={entry.summary}
      body={entry.body}
      message={dict.expertises.scopePending}
      actions={
        preview
          ? []
          : [
              { href: sectionPath(locale, "expertises"), label: parentLabel },
              { href: sectionPath(locale, "contact"), label: dict.expertises.contactCta },
            ]
      }
    >
      <DetailExtras entry={entry} locale={locale} dict={dict} />
      {related.length > 0 ? (
        <section aria-labelledby="expertise-projects" className="mt-12">
          <h2 id="expertise-projects" className="font-serif text-2xl text-navy-950">
            {dict.expertises.relatedProjects}
          </h2>
          <ul className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((project) => (
              <li key={project.id}>
                <ProjectCard
                  project={project}
                  href={preview ? "#" : detailPath(locale, "projects", project.slug)}
                  statusLabel={dict.projects.status[project.status]}
                  demoLabel={dict.demo.badge}
                />
              </li>
            ))}
          </ul>
        </section>
      ) : (
        <p className="mt-10 text-sm text-muted">{dict.expertises.noProjects}</p>
      )}
      {preview ? null : (
        <div className="mt-10">
          <Button href={sectionPath(locale, "contact")} variant="primary">
            {dict.expertises.contactCta}
          </Button>
        </div>
      )}
    </PendingPage>
  );
}
