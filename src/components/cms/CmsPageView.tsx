import type { CmsPageView as CmsPage } from "@/content/queries";
import { getExpertises, getProjects, getTeam, getVisits } from "@/content/service";
import { RichText } from "@/content/rich-text";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import { detailPath, sectionPath } from "@/i18n/routes";
import { ExpertiseCard } from "@/components/cards/ExpertiseCard";
import { ProjectCard } from "@/components/cards/ProjectCard";
import { TeamCard } from "@/components/cards/TeamCard";
import { VisitCard } from "@/components/cards/VisitCard";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { MediaFrame } from "@/components/ui/MediaFrame";
import { SectionHeading } from "@/components/ui/SectionHeading";

export async function CmsPageView({
  locale,
  dict,
  page,
}: {
  locale: Locale;
  dict: Dictionary;
  page: CmsPage;
}) {
  const [expertises, projects, visits, team] = await Promise.all([
    getExpertises(locale),
    getProjects(locale, 6),
    getVisits(locale, 6),
    getTeam(locale, 8),
  ]);

  return (
    <article>
      <Container className="py-12 lg:py-16">
        <h1 className="font-serif text-4xl text-navy-950">{page.title}</h1>
        {page.summary ? <p className="mt-4 max-w-2xl text-lg text-muted">{page.summary}</p> : null}
      </Container>
      {page.layout.map((block) => {
        const copy = page.copy[block.id] ?? {};
        const localeImageId = block.imageByLocale?.[locale];
        const image =
          (localeImageId && page.images.get(localeImageId)) ||
          (block.imageAssetId && page.images.get(block.imageAssetId)) ||
          null;
        const alt = copy.imageAlt === "" ? "" : copy.imageAlt?.trim() || image?.alt || "";
        const resolved = image ? { ...image, alt } : null;

        if (block.type === "hero") {
          return (
            <section key={block.id}>
              <MediaFrame image={resolved} profile="desktopHero" sizes="100vw" preload className="min-h-[42vh] w-full" />
              <Container className="py-10">
                {copy.title ? <h2 className="font-serif text-3xl text-navy-950">{copy.title}</h2> : null}
                {copy.body ? (
                  <div className="mt-4 max-w-3xl text-muted">
                    <RichText source={copy.body} />
                  </div>
                ) : null}
              </Container>
            </section>
          );
        }
        if (block.type === "richtext") {
          return (
            <Container key={block.id} className="py-10">
              {copy.title ? <h2 className="font-serif text-3xl text-navy-950">{copy.title}</h2> : null}
              <div className="mt-4 max-w-3xl">
                <RichText source={copy.body ?? ""} />
              </div>
            </Container>
          );
        }
        if (block.type === "imageText") {
          return (
            <Container key={block.id} className="grid items-center gap-8 py-10 lg:grid-cols-2">
              <MediaFrame image={resolved} profile="pageBanner" sizes="(min-width: 1024px) 50vw, 100vw" className="aspect-[16/9]" />
              <div>
                {copy.title ? <h2 className="font-serif text-3xl text-navy-950">{copy.title}</h2> : null}
                <div className="mt-4 text-muted">
                  <RichText source={copy.body ?? ""} />
                </div>
              </div>
            </Container>
          );
        }
        if (block.type === "fullImage") {
          return (
            <div key={block.id} className="py-6">
              <MediaFrame image={resolved} profile="pageBanner" sizes="100vw" className="aspect-[21/9] w-full" />
            </div>
          );
        }
        if (block.type === "gallery") {
          const ids = (block.galleryAssetIds ?? []).filter(Boolean);
          return (
            <Container key={block.id} className="py-10">
              {copy.title ? <h2 className="font-serif text-3xl text-navy-950">{copy.title}</h2> : null}
              <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {ids.map((id) => {
                  const item = page.images.get(id);
                  if (!item) return null;
                  return (
                    <li key={id}>
                      <MediaFrame image={item} profile="galleryThumb" sizes="(min-width: 768px) 33vw, 50vw" className="aspect-square" />
                    </li>
                  );
                })}
              </ul>
            </Container>
          );
        }
        if (block.type === "expertises") {
          return (
            <Container key={block.id} className="py-10">
              <SectionHeading eyebrow={dict.expertises.eyebrow} title={copy.title || dict.expertises.title} />
              <ul className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {expertises.map((item) => (
                  <li key={item.id}>
                    <ExpertiseCard expertise={item} href={detailPath(locale, "expertises", item.slug)} demoImageLabel={dict.demo.imageBadge} />
                  </li>
                ))}
              </ul>
            </Container>
          );
        }
        if (block.type === "projects") {
          return (
            <Container key={block.id} className="py-10">
              <SectionHeading eyebrow={dict.projects.eyebrow} title={copy.title || dict.projects.title} />
              <ul className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {projects.map((item) => (
                  <li key={item.id}>
                    <ProjectCard
                      project={item}
                      href={detailPath(locale, "projects", item.slug)}
                      statusLabel={dict.projects.status[item.status]}
                      demoLabel={dict.demo.badge}
                    />
                  </li>
                ))}
              </ul>
            </Container>
          );
        }
        if (block.type === "visits") {
          return (
            <Container key={block.id} className="py-10">
              <SectionHeading eyebrow={dict.visits.eyebrow} title={copy.title || dict.visits.title} />
              <ul className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {visits.map((item) => (
                  <li key={item.id}>
                    <VisitCard visit={item} href={detailPath(locale, "visits", item.slug)} locale={locale} demoLabel={dict.demo.badge} />
                  </li>
                ))}
              </ul>
            </Container>
          );
        }
        if (block.type === "team") {
          return (
            <Container key={block.id} className="py-10">
              <SectionHeading eyebrow={dict.team.eyebrow} title={copy.title || dict.team.title} />
              <ul className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {team.map((item) => (
                  <li key={item.id}>
                    <TeamCard
                      member={item}
                      demoLabel={dict.demo.badge}
                      portraitPendingLabel={dict.team.portraitPending}
                      bioToggleLabel={dict.team.bioToggle}
                    />
                  </li>
                ))}
              </ul>
            </Container>
          );
        }
        return (
          <Container key={block.id} className="py-16">
            <div className="bg-navy-950 p-8 text-paper">
              <h2 className="font-serif text-3xl">{copy.title || dict.callToAction.title}</h2>
              <p className="mt-3 text-paper/80">{copy.body || dict.callToAction.description}</p>
              <div className="mt-6">
                <Button href={copy.ctaHref || sectionPath(locale, "contact")} variant="secondary">
                  {copy.ctaLabel || dict.callToAction.button}
                </Button>
              </div>
            </div>
          </Container>
        );
      })}
    </article>
  );
}
