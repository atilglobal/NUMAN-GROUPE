import type { DetailEntry, ProjectView } from "@/content/types";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import { hasRichText, RichText } from "@/content/rich-text";
import { detailPath, homePath, sectionPath } from "@/i18n/routes";
import { ProjectCard } from "@/components/cards/ProjectCard";
import { ProjectShowcase } from "@/components/projects/ProjectShowcase";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { DemoBadge, StatusBadge } from "@/components/ui/Badges";
import { Eyebrow } from "@/components/ui/SectionHeading";

export function ProjectDetail({
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
  const parentLabel = dict.nav.projects;
  const status = entry.facts.kind === "project" ? entry.facts.status : null;
  const others = related.filter((project) => project.id !== entry.id).slice(0, 3);
  const contactHref = sectionPath(locale, "contact");
  const listHref = sectionPath(locale, "projects");

  return (
    <article>
      <Container className="py-10 lg:py-14">
        <Breadcrumbs
          label={dict.a11y.breadcrumbs}
          items={[
            { label: dict.nav.home, href: homePath(locale) },
            { label: parentLabel, href: listHref },
            { label: entry.title },
          ]}
        />

        <header className="mt-10 grid gap-8 border-b border-line pb-10 lg:mt-12 lg:grid-cols-12 lg:items-end lg:gap-12 lg:pb-12">
          <div className="lg:col-span-7">
            <Eyebrow>{dict.projects.eyebrow}</Eyebrow>
            <h1 className="mt-4 text-balance break-words font-serif text-[2.25rem] leading-[1.1] text-navy-950 sm:text-5xl lg:text-[3.25rem]">
              {entry.title}
            </h1>
            <div className="mt-5 flex flex-wrap gap-2">
              {status ? <StatusBadge status={status} label={dict.projects.status[status]} /> : null}
              {entry.isDemo ? <DemoBadge label={dict.demo.badge} /> : null}
            </div>
          </div>
          {entry.summary ? (
            <p className="max-w-[38rem] text-lg leading-relaxed text-ink/85 lg:col-span-5 lg:justify-self-end">
              {entry.summary}
            </p>
          ) : null}
        </header>

        <div className="mt-10 lg:mt-12">
          <ProjectShowcase
            cover={entry.image}
            gallery={entry.gallery}
            labels={{
              gallery: dict.projects.galleryTitle,
              heading: dict.projects.galleryTitle,
              open: dict.detail.galleryOpen,
              close: dict.detail.galleryClose,
              previous: dict.detail.galleryPrev,
              next: dict.detail.galleryNext,
              of: dict.detail.galleryOf,
              demo: dict.demo.imageBadge,
              showAll: dict.projects.galleryShowAll,
              showLess: dict.projects.galleryShowLess,
              count: dict.projects.galleryPhotoCount,
            }}
          >
            <section
              aria-labelledby="project-about"
              className="mb-16 mt-14 grid gap-10 lg:mb-20 lg:grid-cols-12 lg:gap-12"
            >
              <div className="lg:col-span-8">
                <h2 id="project-about" className="font-serif text-3xl text-navy-950 sm:text-4xl">
                  {dict.projects.about}
                </h2>
                {hasRichText(entry.body) ? (
                  <RichText
                    source={entry.body}
                    className="mt-6 max-w-[38rem] space-y-5 text-base leading-relaxed text-ink/85"
                  />
                ) : (
                  <p className="mt-6 max-w-[38rem] border-l-2 border-gold-400 pl-5 text-base leading-relaxed text-muted">
                    {entry.isDemo ? dict.demo.sectionNote : dict.placeholder.detailBody}
                  </p>
                )}
              </div>
              <aside className="h-fit border border-line bg-paper-2/60 p-6 lg:sticky lg:top-[calc(var(--header-height)+1.25rem)] lg:col-span-4">
                {status ? (
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">{dict.detail.status}</p>
                    <p className="mt-2 text-navy-950">{dict.projects.status[status]}</p>
                  </div>
                ) : null}
                <p className="mt-6 text-sm leading-relaxed text-ink/85">{dict.projects.sidebarInvite}</p>
                {preview ? null : (
                  <div className="mt-6 flex flex-col gap-3">
                    <Button href={contactHref} variant="primary">
                      {dict.projects.contactCta}
                    </Button>
                    <Button href={listHref} variant="secondary">
                      {dict.projects.backToProjects}
                    </Button>
                  </div>
                )}
              </aside>
            </section>
          </ProjectShowcase>
        </div>
      </Container>

      {preview ? null : (
        <section className="mt-8 border-t border-line bg-navy-950 text-paper">
          <Container className="py-14 lg:py-16">
            <h2 className="max-w-[20ch] font-serif text-3xl leading-tight sm:text-4xl">{dict.projects.ctaTitle}</h2>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button href={contactHref} variant="primary">
                {dict.projects.contactCta}
              </Button>
              <Button href={listHref} variant="outline-light">
                {dict.projects.backToProjects}
              </Button>
            </div>
          </Container>
        </section>
      )}

      {others.length > 0 ? (
        <Container className="py-14 lg:py-16">
          <h2 className="font-serif text-3xl text-navy-950 sm:text-4xl">{dict.projects.related}</h2>
          <ul className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {others.map((project) => (
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
        </Container>
      ) : null}
    </article>
  );
}
