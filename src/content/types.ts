import type { Locale } from "@/i18n/config";
import type { DetailSection } from "@/i18n/routes";
import type { ProjectStatus, TechnicalDetail } from "@/db/schema/projects";

export type { ProjectStatus, TechnicalDetail };

/** Content resolved for one language, ready to render. */
export type ResolvedImage = {
  src: string;
  width: number | null;
  height: number | null;
  alt: string;
  caption: string | null;
  isDemo: boolean;
  assetId?: string;
  focalX?: number;
  focalY?: number;
};

export type ExpertiseView = {
  id: string;
  slug: string;
  name: string;
  summary: string | null;
  image: ResolvedImage | null;
};

export type ProjectListFilters = {
  status?: ProjectStatus;
  expertiseSlug?: string;
  country?: string;
  page: number;
};

export type ProjectListResult = {
  items: ProjectView[];
  total: number;
  page: number;
  pageSize: number;
  countries: { code: string }[];
  expertises: { slug: string; name: string }[];
};

export type ProjectView = {
  id: string;
  slug: string;
  title: string;
  summary: string | null;
  status: ProjectStatus;
  expertiseName: string | null;
  /** City and/or country name in the page language; null when neither was provided. */
  place: string | null;
  image: ResolvedImage | null;
  isDemo: boolean;
};

export type VisitListFilters = {
  country?: string;
  year?: number;
  page: number;
};

export type VisitListResult = {
  items: VisitView[];
  total: number;
  page: number;
  pageSize: number;
  countries: { code: string }[];
  years: number[];
};

export type VisitView = {
  id: string;
  slug: string;
  title: string;
  summary: string | null;
  host: string | null;
  place: string | null;
  visitedOn: string | null;
  countryCode: string | null;
  image: ResolvedImage | null;
  isDemo: boolean;
};

export type TeamMemberView = {
  id: string;
  fullName: string;
  roleTitle: string;
  bio: string | null;
  photo: ResolvedImage | null;
  links: { label: string; url: string }[];
  isDemo: boolean;
};

export type LocaleSlugs = Partial<Record<Locale, string>>;

export type ProjectFacts = {
  kind: "project";
  status: ProjectStatus;
  expertiseName: string | null;
  expertiseSlug: string | null;
  expertiseId: string | null;
  place: string | null;
  startedOn: string | null;
  completedOn: string | null;
  videoUrl: string | null;
  /** Shown only when a verified figure was entered; never inferred from dates. */
  progressPercent: number | null;
  /** Only rows with both a label and a value. */
  technicalDetails: TechnicalDetail[];
};

export type VisitFacts = {
  kind: "visit";
  visitedOn: string | null;
  host: string | null;
  place: string | null;
  countryCode: string | null;
  /** Role titles appear only where one was provided in this language. */
  participants: { fullName: string; roleTitle: string | null }[];
};

export type DetailFacts = ProjectFacts | VisitFacts | { kind: "expertise" };

export type DetailEntry = {
  id: string;
  title: string;
  summary: string | null;
  body: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  isDemo: boolean;
  image: ResolvedImage | null;
  /** Images with alt text in this language only. */
  gallery: ResolvedImage[];
  facts: DetailFacts;
  /** Slugs of the same entry in the languages where it is published, and only those. */
  slugs: LocaleSlugs;
};

export type PublishedEntry = {
  section: DetailSection;
  id: string;
  slugs: LocaleSlugs;
  updatedAt: Date;
};

export type PageView = {
  title: string;
  summary: string | null;
  body: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  updatedAt: Date;
};

export type HomeVisuals = {
  hero: ResolvedImage | null;
  callToAction: ResolvedImage | null;
  heroVideoUrl: string | null;
};

export type HomeCopyView = {
  heroTitle: string | null;
  heroDescription: string | null;
  introTitle: string | null;
  introBody: string | null;
  ctaTitle: string | null;
  ctaDescription: string | null;
  ctaLabel: string | null;
  ctaHref: string | null;
  footerTagline: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
};

export type SiteChrome = {
  companyName: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  postalAddress: string | null;
  whatsapp: string | null;
  socialLinks: { label: string; url: string }[];
  logo: ResolvedImage | null;
  faviconSrc: string | null;
  copy: HomeCopyView | null;
  homeVisuals: HomeVisuals;
  homeLayout: import("./home-layout").HomeSectionLayout[];
};

export type AboutSectionView = {
  key: string;
  title: string;
  summary: string | null;
  body: string | null;
};
