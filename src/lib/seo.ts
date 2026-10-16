import type { Metadata } from "next";
import type { SiteChrome } from "@/content/types";
import type { Locale } from "@/i18n/config";
import { buildAlternates, siteUrl } from "./site";

const OG_LOCALE: Record<Locale, string> = {
  fr: "fr_FR",
  en: "en_US",
  tr: "tr_TR",
};

export type PublicPageSeo = {
  locale: Locale;
  title: string;
  description?: string | null;
  path: string;
  alternates: Partial<Record<Locale, string>>;
  image?: { src: string; alt: string; width?: number | null; height?: number | null } | null;
  robots?: Metadata["robots"];
};

export function publicPageMetadata({
  locale,
  title,
  description,
  path,
  alternates,
  image,
  robots,
}: PublicPageSeo): Metadata {
  const desc = description?.trim() || undefined;
  const ogImage = image?.src
    ? [
        {
          url: image.src,
          alt: image.alt,
          width: image.width ?? undefined,
          height: image.height ?? undefined,
        },
      ]
    : undefined;

  return {
    title,
    description: desc,
    alternates: buildAlternates(locale, { ...alternates, [locale]: path }),
    robots,
    openGraph: {
      type: "website",
      locale: OG_LOCALE[locale],
      siteName: "NUMAN GROUPE",
      title,
      description: desc,
      url: path,
      images: ogImage,
    },
    twitter: ogImage ? { card: "summary_large_image", title, description: desc } : { card: "summary", title, description: desc },
  };
}

/** Structured data from configured chrome only — no invented firm facts. */
export function organizationJsonLd(chrome: SiteChrome): Record<string, unknown> | null {
  const base = siteUrl()?.toString().replace(/\/$/, "");
  const name = chrome.companyName?.trim() || "NUMAN GROUPE";
  const data: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name,
  };
  if (base) data.url = base;
  if (chrome.logo?.src) data.logo = chrome.logo.src.startsWith("http") || !base ? chrome.logo.src : `${base}${chrome.logo.src}`;
  if (chrome.contactEmail) data.email = chrome.contactEmail;
  if (chrome.contactPhone) data.telephone = chrome.contactPhone;
  if (chrome.postalAddress?.trim()) {
    data.address = { "@type": "PostalAddress", streetAddress: chrome.postalAddress.trim() };
  }
  const sameAs = chrome.socialLinks.map((item) => item.url).filter(Boolean);
  if (sameAs.length > 0) data.sameAs = sameAs;
  return data;
}
