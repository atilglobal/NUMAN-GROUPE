import type { Metadata } from "next";
import { Suspense, type ReactNode } from "react";
import {
  getExpertises,
  getFeaturedProjects,
  getFeaturedVisits,
  getSiteChrome,
  getTeam,
} from "@/content/service";
import type { HomeSectionKey } from "@/content/home-layout";
import { getI18n } from "@/i18n/server";
import { homePath, sectionAlternates, sectionPath } from "@/i18n/routes";
import { publicPageMetadata } from "@/lib/seo";
import { CallToAction } from "@/components/home/CallToAction";
import { ExpertisesSection } from "@/components/home/ExpertisesSection";
import { Hero } from "@/components/home/Hero";
import { Intro } from "@/components/home/Intro";
import { ProcessSection } from "@/components/home/Process";
import { ProjectsSection } from "@/components/home/ProjectsSection";
import { TeamSection } from "@/components/home/TeamSection";
import { VisitsSection } from "@/components/home/VisitsSection";

export async function generateMetadata(): Promise<Metadata> {
  const { locale, dict } = await getI18n();
  const chrome = await getSiteChrome(locale);
  const title = chrome.copy?.seoTitle ?? dict.meta.homeTitle;
  const metadata = publicPageMetadata({
    locale,
    title,
    description: chrome.copy?.seoDescription ?? dict.meta.description,
    path: homePath(locale),
    alternates: sectionAlternates(null),
    image: chrome.homeVisuals.hero,
  });
  return { ...metadata, title: { absolute: title } };
}

async function LocaleNotice({ searchParams }: { searchParams: PageProps<"/[locale]">["searchParams"] }) {
  const { dict } = await getI18n();
  const notice = (await searchParams).notice;
  if (notice !== "unavailable") return null;
  return (
    <p role="status" className="border-b border-line bg-paper-2 px-4 py-3 text-center text-sm">
      {dict.i18n.unavailable}
    </p>
  );
}

export default async function HomePage({ searchParams }: PageProps<"/[locale]">) {
  const { locale, dict } = await getI18n();
  const [chrome, expertises, projects, visits, team] = await Promise.all([
    getSiteChrome(locale),
    getExpertises(locale),
    getFeaturedProjects(locale),
    getFeaturedVisits(locale),
    getTeam(locale, 3),
  ]);
  const contactHref = sectionPath(locale, "contact");
  const copy = chrome.copy;
  const visuals = chrome.homeVisuals;

  const sections: Record<HomeSectionKey, ReactNode> = {
    hero: (
      <Hero
        dict={dict}
        image={visuals.hero}
        videoUrl={visuals.heroVideoUrl}
        contactHref={contactHref}
        copy={{
          title: copy?.heroTitle?.trim() || dict.hero.title,
          description: copy?.heroDescription?.trim() || dict.hero.description,
          primaryLabel: dict.hero.primaryCta,
          primaryHref: sectionPath(locale, "projects"),
        }}
      />
    ),
    intro: (
      <Intro
        dict={dict}
        aboutHref={sectionPath(locale, "about")}
        title={copy?.introTitle}
        body={copy?.introBody}
      />
    ),
    process: <ProcessSection dict={dict} />,
    expertises: <ExpertisesSection locale={locale} dict={dict} expertises={expertises} />,
    projects: <ProjectsSection locale={locale} dict={dict} projects={projects} />,
    visits: <VisitsSection locale={locale} dict={dict} visits={visits} />,
    team: <TeamSection locale={locale} dict={dict} team={team} />,
    cta: (
      <CallToAction
        dict={dict}
        image={visuals.callToAction}
        href={copy?.ctaHref?.trim() || contactHref}
        title={copy?.ctaTitle}
        description={copy?.ctaDescription}
        label={copy?.ctaLabel}
      />
    ),
  };

  return (
    <>
      <Suspense>
        <LocaleNotice searchParams={searchParams} />
      </Suspense>
      {chrome.homeLayout
        .filter((section) => section.visible)
        .map((section) => (
          <div key={section.key}>{sections[section.key]}</div>
        ))}
    </>
  );
}
