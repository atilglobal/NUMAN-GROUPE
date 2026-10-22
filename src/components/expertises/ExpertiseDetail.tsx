import type { DetailEntry, ExpertiseView, ProjectView } from "@/content/types";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import { hasRichText, renderInline, type RichBlock } from "@/content/rich-text";
import { expertiseLayout, sectionList, sidebarFocuses } from "@/content/expertise-body";
import { interpolate } from "@/i18n/placeholders";
import { detailPath, homePath, sectionPath } from "@/i18n/routes";
import { ProjectCard } from "@/components/cards/ProjectCard";
import { GalleryLightbox } from "@/components/detail/GalleryLightbox";
import { PageHero } from "@/components/page/PageHero";
import { DemoBadge } from "@/components/ui/Badges";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { ArrowRightIcon } from "@/components/ui/icons";
import { MediaFrame } from "@/components/ui/MediaFrame";
import { Eyebrow } from "@/components/ui/SectionHeading";
import { ExpertiseMark } from "./ExpertiseMarks";

const PAGE_MAX = "max-w-[1200px]";

function stepLabel(index: number) {
  return String(index + 1).padStart(2, "0");
}

function ExpertiseBlocks({ blocks, className }: { blocks: RichBlock[]; className?: string }) {
  return (
    <div className={className}>
      {blocks.map((block, index) => {
        if (block.type === "heading") {
          return (
            <h3 key={index} className="pt-2 font-serif text-xl text-navy-950">
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
                <li key={itemIndex} className="text-[1.0625rem] leading-[1.7] text-ink/90">
                  {renderInline(item, `si${index}-${itemIndex}`)}
                </li>
              ))}
            </Tag>
          );
        }
        return (
          <p key={index} className="text-[1.0625rem] leading-[1.7] text-ink/90 lg:text-lg lg:leading-[1.7]">
            {renderInline(block.text, `sp${index}`)}
          </p>
        );
      })}
    </div>
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
  const layout = expertiseLayout(entry.body);
  const focuses = sidebarFocuses(entry.body, 4);
  const scopeItems = sectionList(layout.scope)?.items ?? [];
  const priorityItems = sectionList(layout.priorities)?.items ?? [];
  const processItems = sectionList(layout.process)?.items ?? [];
  const showAside = focuses.length > 0;
  const closingTitle = interpolate(dict.expertises.closingTitle, { title: entry.title }, locale);

  return (
    <>
      <PageHero
        maxWidthClass={PAGE_MAX}
        className="pb-6 lg:pb-8"
        breadcrumbs={[
          { label: dict.nav.home, href: homePath(locale) },
          { label: parentLabel, href: sectionPath(locale, "expertises") },
          { label: entry.title },
        ]}
        breadcrumbsLabel={dict.a11y.breadcrumbs}
        eyebrow={dict.expertises.eyebrow}
        title={entry.title}
        lead={entry.summary}
        badges={entry.isDemo ? <DemoBadge label={dict.demo.badge} /> : null}
        actions={
          preview ? null : (
            <Button href={contactHref} withArrow>
              {dict.expertises.discussCta}
            </Button>
          )
        }
      />

      <Container maxWidthClass={PAGE_MAX} className="pb-4">
        {entry.image ? (
          <figure>
            <MediaFrame
              image={entry.image}
              sizes="(min-width: 1200px) 1120px, 100vw"
              className="aspect-[4/3] w-full sm:aspect-[16/9] lg:aspect-[21/9]"
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
      </Container>

      <Container maxWidthClass={PAGE_MAX} className="py-14 lg:py-20">
        {hasRichText(entry.body) || entry.summary ? (
          <section aria-labelledby="expertise-about" className="grid gap-10 lg:grid-cols-12 lg:gap-12">
            <div className={showAside ? "lg:col-span-8" : "lg:col-span-12"}>
              <Eyebrow>{dict.expertises.aboutEyebrow}</Eyebrow>
              <h2 id="expertise-about" className="mt-4 text-balance font-serif text-3xl leading-tight text-navy-950 lg:text-4xl">
                {dict.expertises.aboutTitle}
              </h2>
              {layout.intro.length > 0 ? (
                <ExpertiseBlocks blocks={layout.intro} className="mt-8 space-y-5" />
              ) : (
                <p className="mt-8 border-l-2 border-gold-400 pl-5 text-[1.0625rem] leading-[1.7] text-muted">
                  {dict.expertises.scopePending}
                </p>
              )}
            </div>
            {showAside ? (
              <aside className="border-t-2 border-gold-400 bg-white px-5 py-6 lg:col-span-4 lg:self-start">
                {focuses.length > 0 ? (
                  <>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gold-700">
                      {dict.expertises.focusesTitle}
                    </p>
                    <ul className="mt-4 space-y-3">
                      {focuses.map((item) => (
                        <li key={item} className="border-l border-line pl-3 text-[0.95rem] leading-relaxed text-ink/85">
                          {item}
                        </li>
                      ))}
                    </ul>
                  </>
                ) : null}
                {preview ? null : (
                  <div className={`${focuses.length > 0 ? "mt-6 border-t border-line pt-5" : ""} grid gap-3`}>
                    <Button href={contactHref} withArrow>
                      {dict.expertises.discussCta}
                    </Button>
                    <a
                      href={sectionPath(locale, "projects")}
                      className="text-sm font-medium text-navy-950 underline-offset-4 hover:underline"
                    >
                      {dict.expertises.browseProjects}
                    </a>
                  </div>
                )}
              </aside>
            ) : null}
          </section>
        ) : (
          <p className="max-w-[42rem] border-l-2 border-gold-400 pl-5 text-[1.0625rem] leading-[1.7] text-muted">
            {dict.expertises.scopePending}
          </p>
        )}
      </Container>

      {scopeItems.length > 0 ? (
        <Container maxWidthClass={PAGE_MAX} className="pb-16 lg:pb-20">
          <section aria-labelledby="expertise-scope">
            <Eyebrow>{dict.expertises.scopeEyebrow}</Eyebrow>
            <h2 id="expertise-scope" className="mt-4 max-w-[28rem] font-serif text-3xl leading-tight text-navy-950 lg:text-4xl">
              {dict.expertises.scopeByProject}
            </h2>
            <ul className="mt-10 grid gap-x-8 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
              {scopeItems.map((item, index) => (
                <li key={item} className="border-t border-line pt-5">
                  <ExpertiseMark index={index} className="size-6 text-gold-700" />
                  <p className="mt-4 text-[1.0625rem] leading-[1.65] text-ink/90">{renderInline(item, `scope-${index}`)}</p>
                </li>
              ))}
            </ul>
          </section>
        </Container>
      ) : null}

      {priorityItems.length > 0 ? (
        <section aria-labelledby="expertise-priorities" className="on-dark bg-navy-950 text-paper">
          <Container maxWidthClass={PAGE_MAX} className="py-16 lg:py-20">
            <p className="font-mono text-xs uppercase tracking-[0.28em] text-gold-300">{dict.expertises.prioritiesEyebrow}</p>
            <h2
              id="expertise-priorities"
              className="mt-4 max-w-[36rem] text-balance font-serif text-3xl leading-[1.12] lg:text-[2.75rem]"
            >
              {layout.priorities?.title ?? dict.expertises.prioritiesFallback}
            </h2>
            <ol className="mt-10 grid gap-x-12 gap-y-8 sm:grid-cols-2">
              {priorityItems.map((item, index) => (
                <li key={item} className="grid grid-cols-[3.25rem_minmax(0,1fr)] gap-4 border-t border-paper/15 pt-5">
                  <span className="font-serif text-2xl text-gold-300">{stepLabel(index)}</span>
                  <p className="text-[1.0625rem] leading-[1.65] text-paper/90">{renderInline(item, `prio-${index}`)}</p>
                </li>
              ))}
            </ol>
          </Container>
        </section>
      ) : null}

      {processItems.length > 0 ? (
        <Container maxWidthClass={PAGE_MAX} className="py-16 lg:py-20">
          <section aria-labelledby="expertise-process">
            <Eyebrow>{dict.expertises.processEyebrow}</Eyebrow>
            <h2 id="expertise-process" className="mt-4 font-serif text-3xl leading-tight text-navy-950 lg:text-4xl">
              {layout.process?.title ?? dict.expertises.processFallback}
            </h2>
            <ol className="mt-10 grid gap-8 sm:grid-cols-2 xl:grid-cols-4">
              {processItems.map((item, index) => (
                <li key={item} className="border-t-2 border-gold-400 pt-5">
                  <p className="font-serif text-4xl leading-none text-gold-500 lg:text-5xl">{stepLabel(index)}</p>
                  <p className="mt-4 text-[1.0625rem] leading-[1.65] text-ink/90">{renderInline(item, `step-${index}`)}</p>
                </li>
              ))}
            </ol>
          </section>
        </Container>
      ) : null}

      {layout.extra.map((section) => (
        <Container key={section.title} maxWidthClass={PAGE_MAX} className="pb-12">
          <section>
            <h2 className="font-serif text-3xl text-navy-950">{section.title}</h2>
            <ExpertiseBlocks blocks={section.blocks} className="mt-6 max-w-[48rem] space-y-4" />
          </section>
        </Container>
      ))}

      {entry.gallery.length > 0 ? (
        <Container maxWidthClass={PAGE_MAX} className="pb-16">
          <section aria-labelledby="expertise-gallery">
            <h2 id="expertise-gallery" className="font-serif text-3xl text-navy-950">
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
        </Container>
      ) : null}

      {related.length > 0 ? (
        <Container maxWidthClass={PAGE_MAX} className="pb-16">
          <section aria-labelledby="expertise-projects">
            <h2 id="expertise-projects" className="font-serif text-3xl text-navy-950">
              {dict.expertises.relatedProjects}
            </h2>
            <ul className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
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
        </Container>
      ) : preview ? null : (
        <Container maxWidthClass={PAGE_MAX} className="pb-10">
          <Button href={sectionPath(locale, "projects")} variant="secondary" withArrow>
            {dict.expertises.browseProjects}
          </Button>
        </Container>
      )}

      {others.length > 0 ? (
        <Container maxWidthClass={PAGE_MAX} className="pb-16 lg:pb-20">
          <nav aria-labelledby="expertise-others">
            <h2 id="expertise-others" className="font-serif text-3xl text-navy-950">
              {dict.expertises.otherExpertises}
            </h2>
            <ul className="mt-8 grid gap-4 sm:grid-cols-3">
              {others.map((item) => (
                <li key={item.id}>
                  <a
                    href={preview ? "#" : detailPath(locale, "expertises", item.slug)}
                    className="group flex h-full flex-col border border-line bg-white p-5"
                  >
                    <h3 className="font-serif text-xl text-navy-950">{item.name}</h3>
                    {item.summary ? (
                      <p className="mt-2 line-clamp-3 flex-1 text-sm leading-relaxed text-muted">{item.summary}</p>
                    ) : null}
                    <span className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-navy-950">
                      {dict.expertises.openLabel}
                      <ArrowRightIcon className="size-4" />
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </Container>
      ) : null}

      {preview ? null : (
        <section aria-labelledby="expertise-close" className="on-dark bg-navy-950 text-paper">
          <Container maxWidthClass={PAGE_MAX} className="py-16 lg:py-20">
            <h2 id="expertise-close" className="max-w-[40rem] text-balance font-serif text-3xl leading-[1.12] sm:text-4xl lg:text-5xl">
              {closingTitle}
            </h2>
            <p className="mt-5 max-w-[36rem] text-lg leading-relaxed text-paper/80">{dict.expertises.closingLead}</p>
            <div className="mt-8">
              <Button href={contactHref} withArrow>
                {dict.expertises.discussCta}
              </Button>
            </div>
          </Container>
        </section>
      )}
    </>
  );
}
