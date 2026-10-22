import type { DetailEntry, ExpertiseView, ProjectView } from "@/content/types";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import { hasRichText, renderInline, type RichBlock } from "@/content/rich-text";
import { introMarkdown, splitExpertiseBody } from "@/content/expertise-body";
import { detailPath, homePath, sectionPath } from "@/i18n/routes";
import { ProjectCard } from "@/components/cards/ProjectCard";
import { GalleryLightbox } from "@/components/detail/GalleryLightbox";
import { PageCta } from "@/components/page/PageCta";
import { PageHero } from "@/components/page/PageHero";
import { Prose } from "@/components/page/Prose";
import { DemoBadge } from "@/components/ui/Badges";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { MediaFrame } from "@/components/ui/MediaFrame";

const PAGE_MAX = "max-w-[1200px]";

function ExpertiseBlocks({ blocks }: { blocks: RichBlock[] }) {
  return (
    <>
      {blocks.map((block, index) => {
        if (block.type === "heading") {
          return (
            <h3 key={index} className="pt-2 text-xl font-semibold text-navy-950">
              {renderInline(block.text, `s${index}`)}
            </h3>
          );
        }
        if (block.type === "list") {
          const Tag = block.ordered ? "ol" : "ul";
          return (
            <Tag
              key={index}
              className={block.ordered ? "list-decimal space-y-3 pl-6" : "list-disc space-y-3 pl-6"}
            >
              {block.items.map((item, itemIndex) => (
                <li key={itemIndex} className="text-base leading-relaxed text-ink/90">
                  {renderInline(item, `si${index}-${itemIndex}`)}
                </li>
              ))}
            </Tag>
          );
        }
        return (
          <p key={index} className="text-base leading-relaxed text-ink/90">
            {renderInline(block.text, `sp${index}`)}
          </p>
        );
      })}
    </>
  );
}

export function ExpertiseDetail({
  locale,
  dict,
  entry,
  related,
  others = [],
  preview = false,
}: {
  locale: Locale;
  dict: Dictionary;
  entry: DetailEntry;
  related: ProjectView[];
  others?: ExpertiseView[];
  preview?: boolean;
}) {
  const parentLabel = dict.nav.expertises;
  const contactHref = sectionPath(locale, "contact");
  const { intro, sections } = splitExpertiseBody(entry.body);
  const introSource = introMarkdown(entry.body ?? "");

  return (
    <>
      <PageHero
        maxWidthClass={PAGE_MAX}
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
      <Container maxWidthClass={PAGE_MAX} className="pb-14 lg:pb-16">
        {entry.image ? (
          <figure>
            <MediaFrame
              image={entry.image}
              sizes="(min-width: 1200px) 1120px, 100vw"
              className="aspect-[16/9] w-full"
              preload
            >
              {entry.image.isDemo ? (
                <DemoBadge label={dict.demo.imageBadge} className="absolute right-3 top-3" />
              ) : null}
            </MediaFrame>
            {entry.image.caption ? (
              <figcaption className="mt-2 text-sm text-muted">{entry.image.caption}</figcaption>
            ) : null}
          </figure>
        ) : null}

        {hasRichText(introSource) ? (
          <section aria-labelledby="expertise-about" className="mt-12">
            <h2 id="expertise-about" className="font-serif text-2xl text-navy-950">
              {dict.expertises.scopeTitle}
            </h2>
            <Prose className="mt-6 max-w-[48rem]">
              <ExpertiseBlocks blocks={intro} />
            </Prose>
          </section>
        ) : !hasRichText(entry.body) ? (
          <p className="mt-10 max-w-[42rem] border-l-2 border-gold-400 pl-5 text-base leading-relaxed text-muted">
            {dict.expertises.scopePending}
          </p>
        ) : null}

        {sections.map((section, index) => {
          const list = section.blocks.find((block) => block.type === "list");
          const isScope = index === 0 && list && !list.ordered;
          const isSteps = list?.ordered;
          return (
            <section key={section.title} aria-labelledby={`expertise-section-${index}`} className="mt-14 lg:mt-16">
              <h2 id={`expertise-section-${index}`} className="font-serif text-2xl text-navy-950">
                {section.title}
              </h2>
              {isScope ? (
                <ul className="mt-6 grid gap-x-12 gap-y-5 md:grid-cols-2">
                  {list.items.map((item) => (
                    <li key={item} className="border-l-2 border-gold-400 pl-4 text-base leading-relaxed text-ink/90">
                      {renderInline(item, item.slice(0, 12))}
                    </li>
                  ))}
                </ul>
              ) : isSteps ? (
                <ol className="mt-6 max-w-[48rem] space-y-4">
                  {list.items.map((item, step) => (
                    <li key={item} className="grid grid-cols-[2rem_minmax(0,1fr)] gap-4 text-base leading-relaxed text-ink/90">
                      <span className="font-serif text-xl text-gold-700">{step + 1}</span>
                      <span>{renderInline(item, `step-${step}`)}</span>
                    </li>
                  ))}
                </ol>
              ) : (
                <div className="mt-6 max-w-[48rem] space-y-4">
                  <ExpertiseBlocks blocks={section.blocks} />
                </div>
              )}
            </section>
          );
        })}

        {entry.gallery.length > 0 ? (
          <section aria-labelledby="expertise-gallery" className="mt-14">
            <h2 id="expertise-gallery" className="font-serif text-2xl text-navy-950">
              {dict.detail.gallery}
            </h2>
            <GalleryLightbox
              images={entry.gallery}
              labels={{
                gallery: dict.detail.gallery,
                open: dict.detail.galleryOpen,
                close: dict.detail.galleryClose,
                previous: dict.detail.galleryPrev,
                next: dict.detail.galleryNext,
                of: dict.detail.galleryOf,
                demo: dict.demo.imageBadge,
              }}
            />
          </section>
        ) : null}

        {related.length > 0 ? (
          <section aria-labelledby="expertise-projects" className="mt-14">
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
        ) : null}

        {preview ? null : (
          <div className="mt-10 flex flex-wrap gap-3">
            <Button href={sectionPath(locale, "projects")} variant="secondary">
              {dict.projects.viewAll}
            </Button>
            <Button href={sectionPath(locale, "expertises")} variant="secondary">
              {parentLabel}
            </Button>
          </div>
        )}

        {others.length > 0 ? (
          <nav aria-labelledby="expertise-others" className="mt-16 border-t border-line pt-10">
            <h2 id="expertise-others" className="font-serif text-2xl text-navy-950">
              {dict.expertises.otherExpertises}
            </h2>
            <ul className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:gap-x-8 sm:gap-y-3">
              {others.map((item) => (
                <li key={item.id}>
                  <a
                    href={preview ? "#" : detailPath(locale, "expertises", item.slug)}
                    className="text-base font-medium text-navy-950 underline-offset-4 hover:underline"
                  >
                    {item.name}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        ) : null}
      </Container>
      {preview ? null : (
        <PageCta
          maxWidthClass={PAGE_MAX}
          title={dict.callToAction.title}
          description={dict.callToAction.description}
          href={contactHref}
          label={dict.expertises.contactCta}
        />
      )}
    </>
  );
}
