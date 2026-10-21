import type { Metadata } from "next";
import { Inter, Source_Serif_4 } from "next/font/google";
import { isDemoContentEnabled } from "@/content/demo-policy";
import { getFooterMenu, getHeaderMenu, getSiteChrome } from "@/content/service";
import { locales } from "@/i18n/config";
import { documentHtmlProps, googleNoTranslateMeta } from "@/i18n/document";
import { getI18n } from "@/i18n/server";
import { AlternatesProvider } from "@/components/i18n/alternates";
import { DemoBanner } from "@/components/layout/DemoBanner";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { organizationJsonLd } from "@/lib/seo";
import { siteUrl } from "@/lib/site";
import { JsonLd } from "@/components/seo/JsonLd";
import "../globals.css";

const inter = Inter({
  subsets: ["latin", "latin-ext"],
  variable: "--font-inter",
  display: "swap",
});

const display = Source_Serif_4({
  subsets: ["latin", "latin-ext"],
  variable: "--font-display",
  display: "swap",
});

export async function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata(): Promise<Metadata> {
  const { locale, dict } = await getI18n();
  const chrome = await getSiteChrome(locale);
  return {
    metadataBase: siteUrl(),
    title: { default: chrome.copy?.seoTitle ?? dict.meta.homeTitle, template: `%s | ${dict.meta.siteName}` },
    description: chrome.copy?.seoDescription ?? dict.meta.description,
    icons: chrome.faviconSrc ? { icon: chrome.faviconSrc } : undefined,
    robots: isDemoContentEnabled() ? { index: false, follow: false } : undefined,
    other: googleNoTranslateMeta,
    openGraph: {
      type: "website",
      siteName: dict.meta.siteName,
      locale: locale === "fr" ? "fr_FR" : locale === "tr" ? "tr_TR" : "en_US",
    },
  };
}

export default async function LocaleLayout({ children }: LayoutProps<"/[locale]">) {
  const { locale, dict } = await getI18n();
  const [chrome, headerMenu, footerMenu] = await Promise.all([
    getSiteChrome(locale),
    getHeaderMenu(locale),
    getFooterMenu(locale),
  ]);
  const headerItems = headerMenu.map((item) => ({
    id: item.id,
    href: item.href,
    label: item.label,
    external: item.external,
    children: item.children,
  }));
  const footerItems = footerMenu.map((item) => ({
    id: item.id,
    href: item.href,
    label: item.label,
    external: item.external,
    children: item.children,
  }));

  return (
    <html {...documentHtmlProps(locale, `${inter.variable} ${display.variable} h-full`)}>
      <body className="flex min-h-full flex-col antialiased">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:bg-navy-950 focus:px-4 focus:py-3 focus:text-sm focus:text-paper"
        >
          {dict.a11y.skipToContent}
        </a>
        <JsonLd data={organizationJsonLd(chrome)} />
        <AlternatesProvider>
          <Header locale={locale} dict={dict} chrome={chrome} items={headerItems} />
          {isDemoContentEnabled() ? (
            <DemoBanner label={dict.demo.badge} message={dict.demo.banner} />
          ) : null}
          <main id="main" tabIndex={-1} className="flex-1 focus:outline-none">
            {children}
          </main>
          <Footer locale={locale} dict={dict} chrome={chrome} items={footerItems} />
        </AlternatesProvider>
      </body>
    </html>
  );
}
