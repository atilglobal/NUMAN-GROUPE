import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import { locale as localeParam } from "next/root-params";
import {
  findDetail,
  getProjectsForExpertise,
  getPublishedEntries,
  getRelatedProjects,
  getRelatedVisits,
  resolveSlugRedirect,
} from "@/content/service";
import { isLocale, locales, type Locale } from "@/i18n/config";
import { sectionLabel } from "@/i18n/labels";
import { getI18n } from "@/i18n/server";
import {
  detailPath,
  homePath,
  isDetailSection,
  sectionFromSlug,
  sectionPath,
  sectionSlugs,
} from "@/i18n/routes";
import { publicPageMetadata } from "@/lib/seo";
import { DetailExtras } from "@/components/detail/DetailExtras";
import { ExpertiseDetail } from "@/components/expertises/ExpertiseDetail";
import { PageAlternates } from "@/components/i18n/alternates";
import { PendingPage } from "@/components/layout/PendingPage";
import { ProjectDetail } from "@/components/projects/ProjectDetail";
import { VisitDetail } from "@/components/visits/VisitDetail";
import { DemoBadge } from "@/components/ui/Badges";

/** Cache Components needs at least one param; this one resolves to a 404. */
const PLACEHOLDER_SLUG = "unpublished";

export async function generateStaticParams() {
  const locale = await localeParam();
  if (!locale || !isLocale(locale)) return [];

  const params = (await getPublishedEntries()).flatMap(({ section, slugs }) => {
    const slug = slugs[locale];
    return slug ? [{ section: sectionSlugs[section][locale], slug }] : [];
  });
  return params.length > 0
    ? params
    : [{ section: sectionSlugs.projects[locale], slug: PLACEHOLDER_SLUG }];
}

async function resolve(params: PageProps<"/[locale]/[section]/[slug]">["params"]) {
  const { locale, dict } = await getI18n();
  const { section: sectionSlug, slug } = await params;
  const section = sectionFromSlug(locale, sectionSlug);
  if (!section || !isDetailSection(section)) notFound();

  const decoded = decodeURIComponent(slug);
  const entry = await findDetail(section, locale, decoded);
  if (!entry) {
    const destination = await resolveSlugRedirect(section, locale, decoded);
    if (destination) permanentRedirect(destination);
    notFound();
  }

  const alternates: Partial<Record<Locale, string>> = {};
  for (const target of locales) {
    const targetSlug = entry.slugs[target];
    if (targetSlug) alternates[target] = detailPath(target, section, targetSlug);
  }

  return { locale, dict, section, entry, alternates };
}

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/[section]/[slug]">): Promise<Metadata> {
  const { locale, entry, alternates, section } = await resolve(params);
  const slug = entry.slugs[locale];
  return publicPageMetadata({
    locale,
    title: entry.seoTitle ?? entry.title,
    description: entry.seoDescription ?? entry.summary,
    path: slug ? detailPath(locale, section, slug) : homePath(locale),
    alternates,
    image: entry.image,
    robots: entry.isDemo ? { index: false, follow: true } : undefined,
  });
}

export default async function DetailPage({ params }: PageProps<"/[locale]/[section]/[slug]">) {
  const { locale, dict, section, entry, alternates } = await resolve(params);
  const parentLabel = sectionLabel(section, dict);

  if (section === "projects" && entry.facts.kind === "project") {
    const related = await getRelatedProjects(locale, entry.id, entry.facts.expertiseId);
    return (
      <>
        <PageAlternates alternates={alternates} />
        <ProjectDetail locale={locale} dict={dict} entry={entry} related={related} />
      </>
    );
  }

  if (section === "expertises") {
    const related = await getProjectsForExpertise(locale, entry.id);
    return (
      <>
        <PageAlternates alternates={alternates} />
        <ExpertiseDetail locale={locale} dict={dict} entry={entry} related={related} />
      </>
    );
  }

  if (section === "visits" && entry.facts.kind === "visit") {
    const related = await getRelatedVisits(locale, entry.id, entry.facts.countryCode);
    return (
      <>
        <PageAlternates alternates={alternates} />
        <VisitDetail locale={locale} dict={dict} entry={entry} related={related} />
      </>
    );
  }

  return (
    <>
      <PageAlternates alternates={alternates} />
      <PendingPage
        breadcrumbs={[
          { label: dict.nav.home, href: homePath(locale) },
          { label: parentLabel, href: sectionPath(locale, section) },
          { label: entry.title },
        ]}
        breadcrumbsLabel={dict.a11y.breadcrumbs}
        statusLabel={parentLabel}
        title={entry.title}
        badges={entry.isDemo ? <DemoBadge label={dict.demo.badge} /> : null}
        lead={entry.summary}
        body={entry.body}
        message={entry.isDemo ? dict.demo.sectionNote : dict.placeholder.detailBody}
        actions={[
          { href: sectionPath(locale, section), label: parentLabel },
          { href: sectionPath(locale, "contact"), label: dict.nav.contact },
        ]}
      >
        <DetailExtras entry={entry} locale={locale} dict={dict} />
      </PendingPage>
    </>
  );
}
