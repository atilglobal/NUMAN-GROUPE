import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { locale as localeParam } from "next/root-params";
import { parseProjectFilters, projectListHref } from "@/content/project-filters";
import { parseVisitFilters, visitListHref } from "@/content/visit-filters";
import {
  getAboutSections,
  getExpertises,
  getPage,
  getProjectListing,
  getPublishedPageLocales,
  getSiteChrome,
  getTeam,
  getVisitListing,
} from "@/content/service";
import { pageKeyEnum, type PageKey } from "@/db/schema";
import { isLocale, type Locale } from "@/i18n/config";
import { sectionLabel } from "@/i18n/labels";
import { getI18n } from "@/i18n/server";
import {
  homePath,
  sectionAlternates,
  sectionFromSlug,
  sectionPath,
  sections,
  sectionSlugs,
  type Section,
} from "@/i18n/routes";
import { publicPageMetadata } from "@/lib/seo";
import { hasRichText } from "@/content/rich-text";
import { AboutPage } from "@/components/about/AboutPage";
import { ContactPage } from "@/components/contact/ContactPage";
import { ExpertiseList } from "@/components/expertises/ExpertiseList";
import { PageAlternates } from "@/components/i18n/alternates";
import { PendingPage } from "@/components/layout/PendingPage";
import { ProjectList } from "@/components/projects/ProjectList";
import { TeamList } from "@/components/team/TeamList";
import { VisitList } from "@/components/visits/VisitList";
import { locales } from "@/i18n/config";
import { Suspense } from "react";

export async function generateStaticParams() {
  const locale = await localeParam();
  if (!locale || !isLocale(locale)) return [];
  return sections.map((section) => ({ section: sectionSlugs[section][locale] }));
}

function pageKeyOf(section: Section): PageKey | null {
  return (pageKeyEnum.enumValues as readonly string[]).includes(section)
    ? (section as PageKey)
    : null;
}

async function resolve(params: PageProps<"/[locale]/[section]">["params"]) {
  const { locale, dict } = await getI18n();
  const section = sectionFromSlug(locale, (await params).section);
  if (!section) notFound();
  const pageKey = pageKeyOf(section);
  const page = pageKey ? await getPage(pageKey, locale) : null;
  return { locale, dict, section, pageKey, page };
}

const INDEXABLE_WITHOUT_PAGE: Section[] = ["projects", "expertises", "visits", "team", "contact"];

function listingDescription(section: Section, dict: Awaited<ReturnType<typeof getI18n>>["dict"]) {
  if (section === "projects") return dict.projects.description;
  if (section === "visits") return dict.visits.description;
  if (section === "expertises") return dict.expertises.description;
  if (section === "team") return dict.team.description;
  if (section === "contact") return dict.inquiry.lead;
  return dict.placeholder.body;
}

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/[section]">): Promise<Metadata> {
  const { locale, dict, section, pageKey, page } = await resolve(params);
  const path = sectionPath(locale, section);
  const alwaysOn = (INDEXABLE_WITHOUT_PAGE as readonly string[]).includes(section);

  if (alwaysOn) {
    return publicPageMetadata({
      locale,
      title: page?.seoTitle ?? page?.title ?? sectionLabel(section, dict),
      description: page?.seoDescription ?? page?.summary ?? listingDescription(section, dict),
      path,
      alternates: sectionAlternates(section),
    });
  }

  if (!page || !pageKey) {
    return publicPageMetadata({
      locale,
      title: sectionLabel(section, dict),
      description: listingDescription(section, dict),
      path,
      alternates: { [locale]: path },
      robots: { index: false, follow: true },
    });
  }

  const published = await getPublishedPageLocales(pageKey);
  const all = sectionAlternates(section);
  const alternates: Partial<Record<Locale, string>> = {};
  for (const target of published) alternates[target] = all[target];

  return publicPageMetadata({
    locale,
    title: page.seoTitle ?? page.title,
    description: page.seoDescription ?? page.summary,
    path,
    alternates,
  });
}

export default function SectionPage({
  params,
  searchParams,
}: PageProps<"/[locale]/[section]">) {
  return (
    <Suspense fallback={<div className="px-5 py-20 text-sm text-muted">…</div>}>
      <SectionBody params={params} searchParams={searchParams} />
    </Suspense>
  );
}

async function SectionBody({
  params,
  searchParams,
}: PageProps<"/[locale]/[section]">) {
  const { locale, dict, section, page } = await resolve(params);
  const label = sectionLabel(section, dict);

  if (section === "projects") {
    const filters = parseProjectFilters(await searchParams);
    const listing = await getProjectListing(locale, filters);
    const alternates = Object.fromEntries(
      locales.map((target) => [target, projectListHref(target, { ...filters, page: 1 })]),
    ) as Record<(typeof locales)[number], string>;
    return (
      <>
        <PageAlternates alternates={alternates} />
        <ProjectList locale={locale} dict={dict} listing={listing} filters={filters} />
      </>
    );
  }

  if (section === "expertises") {
    const expertises = await getExpertises(locale);
    return (
      <>
        <PageAlternates alternates={sectionAlternates("expertises")} />
        <ExpertiseList locale={locale} dict={dict} expertises={expertises} />
      </>
    );
  }

  if (section === "visits") {
    const filters = parseVisitFilters(await searchParams);
    const listing = await getVisitListing(locale, filters);
    const alternates = Object.fromEntries(
      locales.map((target) => [target, visitListHref(target, { ...filters, page: 1 })]),
    ) as Record<(typeof locales)[number], string>;
    return (
      <>
        <PageAlternates alternates={alternates} />
        <VisitList locale={locale} dict={dict} listing={listing} filters={filters} />
      </>
    );
  }

  if (section === "team") {
    const team = await getTeam(locale);
    return (
      <>
        <PageAlternates alternates={sectionAlternates("team")} />
        <TeamList locale={locale} dict={dict} team={team} />
      </>
    );
  }

  if (section === "contact") {
    const [chrome, expertises] = await Promise.all([getSiteChrome(locale), getExpertises(locale)]);
    return (
      <>
        <PageAlternates alternates={sectionAlternates("contact")} />
        <ContactPage
          locale={locale}
          dict={dict}
          chrome={chrome}
          expertises={expertises.map((item) => ({ id: item.id, name: item.name }))}
          page={page}
        />
      </>
    );
  }

  if (section === "about") {
    const aboutSections = await getAboutSections(locale);
    return (
      <>
        <PageAlternates alternates={sectionAlternates("about")} />
        <AboutPage locale={locale} dict={dict} page={page} sections={aboutSections} />
      </>
    );
  }

  const legal = section === "privacy" || section === "legal" || section === "cookies";
  const legalGap = legal && !hasRichText(page?.body);

  return (
    <PendingPage
      breadcrumbs={[{ label: dict.nav.home, href: homePath(locale) }, { label: label }]}
      breadcrumbsLabel={dict.a11y.breadcrumbs}
      statusLabel={legalGap ? dict.placeholder.legalStatus : page ? label : dict.placeholder.status}
      title={legalGap ? dict.placeholder.legalTitle : (page?.title ?? label)}
      lead={legalGap ? undefined : page ? page.summary : dict.placeholder.title}
      body={legalGap ? null : page?.body}
      message={legalGap ? dict.placeholder.legalBody : dict.placeholder.body}
      legal={legal}
      actions={[
        { href: homePath(locale), label: dict.placeholder.backHome },
        { href: sectionPath(locale, "contact"), label: dict.nav.contact },
      ]}
    />
  );
}
