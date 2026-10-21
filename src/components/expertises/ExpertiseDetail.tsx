import type { DetailEntry, ProjectView } from "@/content/types";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import { hasRichText, RichText } from "@/content/rich-text";
import { detailPath, homePath, sectionPath } from "@/i18n/routes";
import { ProjectCard } from "@/components/cards/ProjectCard";
import { DetailExtras } from "@/components/detail/DetailExtras";
import { PageCta } from "@/components/page/PageCta";
import { PageHero } from "@/components/page/PageHero";
import { Prose } from "@/components/page/Prose";
import { DemoBadge } from "@/components/ui/Badges";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";

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
  const contactHref = sectionPath(locale, "contact");

  return (
    <>
      <PageHero
        breadcrumbs={[
          { label: dict.nav.home, href: homePath(locale) },
          { label: parentLabel, href: sectionPath(locale, "expertises") },
          { label: entry.title },
        ]}
        breadcrumbsLabel={dict.a11y.breadcrumbs}
        eyebrow={parentLabel}
        title={entry.title}
        lead={entry.summary}
        badges={entry.isDemo ? <DemoBadge label={dict.demo.badge} /> : null}
      />
      <Container className="pb-14 lg:pb-16">
        {hasRichText(entry.body) ? (
          <section aria-labelledby="expertise-scope">
            <h2 id="expertise-scope" className="font-serif text-2xl text-navy-950">
              {dict.expertises.scopeTitle}
            </h2>
            <Prose className="mt-4">
              <RichText source={entry.body} className="space-y-4" />
            </Prose>
          </section>
        ) : (
          <p className="max-w-[42rem] border-l-2 border-gold-400 pl-5 text-base leading-relaxed text-muted">
            {dict.expertises.scopePending}
          </p>
        )}

        <DetailExtras entry={entry} locale={locale} dict={dict} />

        {related.length > 0 ? (
          <section aria-labelledby="expertise-projects" className="mt-12">
            <h2 id="expertise-projects" className="font-serif text-2xl text-navy-950">
              {dict.expertises.relatedProjects}
            </h2>
            <ul className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((project) => (
                <li key={project.id}>
                  <ProjectCard
                    project={project}
                    href={preview ? "#" : detailPath(locale, "projects", project.slug)}
                    statusLabel={dict.projects.status[project.status]}
                    demoLabel={dict.demo.badge}
                    viewLabel={dict.projects.viewDetail}
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
            <Button href={sectionPath(locale, "expertises")} variant="secondary">
              {parentLabel}
            </Button>
          </div>
        )}
      </Container>
      {preview ? null : (
        <PageCta
          title={dict.callToAction.title}
          description={dict.callToAction.description}
          href={contactHref}
          label={dict.expertises.contactCta}
        />
      )}
    </>
  );
}
