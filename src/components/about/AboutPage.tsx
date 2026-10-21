import type { AboutSectionView, PageView } from "@/content/types";
import type { Dictionary } from "@/i18n/dictionaries";
import type { Locale } from "@/i18n/config";
import { hasRichText, RichText } from "@/content/rich-text";
import { homePath, sectionPath } from "@/i18n/routes";
import { AboutSections } from "@/components/about/AboutSections";
import { PageCta } from "@/components/page/PageCta";
import { PageHero } from "@/components/page/PageHero";
import { Prose } from "@/components/page/Prose";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";

export function AboutPage({
  locale,
  dict,
  page,
  sections,
}: {
  locale: Locale;
  dict: Dictionary;
  page: PageView | null;
  sections: AboutSectionView[];
}) {
  const title = page?.title ?? dict.nav.group;
  const published = Boolean(page) || sections.length > 0;

  return (
    <>
      <PageHero
        breadcrumbs={[{ label: dict.nav.home, href: homePath(locale) }, { label: dict.nav.group }]}
        breadcrumbsLabel={dict.a11y.breadcrumbs}
        eyebrow={dict.intro.eyebrow}
        title={title}
        lead={page?.summary ?? (published ? null : dict.placeholder.title)}
      />
      <Container className="pb-14 lg:pb-16">
        {hasRichText(page?.body) ? (
          <Prose>
            <RichText source={page!.body} className="space-y-5" />
          </Prose>
        ) : !published ? (
          <p className="max-w-[42rem] border-l-2 border-gold-400 pl-5 text-base leading-relaxed text-muted">
            {dict.placeholder.body}
          </p>
        ) : null}

        <AboutSections sections={sections} />

        <div className="mt-12 flex flex-col gap-3 sm:flex-row">
          <Button href={sectionPath(locale, "expertises")} variant="secondary" withArrow>
            {dict.pages.exploreExpertises}
          </Button>
          <Button href={sectionPath(locale, "projects")} variant="secondary" withArrow>
            {dict.pages.exploreProjects}
          </Button>
        </div>
      </Container>
      <PageCta
        title={dict.callToAction.title}
        description={dict.callToAction.description}
        href={sectionPath(locale, "contact")}
        label={dict.callToAction.button}
      />
    </>
  );
}
