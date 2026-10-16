import type { Metadata } from "next";
import { notFound, permanentRedirect, redirect } from "next/navigation";
import {
  getCmsPage,
  getCmsRedirect,
  getPublishedCmsAlternates,
  getPublishedCmsSlugs,
} from "@/content/service";
import { isLocale, locales } from "@/i18n/config";
import { getI18n } from "@/i18n/server";
import { cmsPagePath, homePath } from "@/i18n/routes";
import { publicPageMetadata } from "@/lib/seo";
import { PageAlternates } from "@/components/i18n/alternates";
import { CmsPageView } from "@/components/cms/CmsPageView";
import { locale as localeParam } from "next/root-params";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/p/[slug]">): Promise<Metadata> {
  const { locale, dict } = await getI18n();
  const slug = decodeURIComponent((await params).slug);
  const page = await getCmsPage(locale, slug);
  if (!page) {
    return { title: dict.notFound.title, robots: { index: false, follow: false } };
  }
  const alternates = await getPublishedCmsAlternates(page.id);
  return publicPageMetadata({
    locale,
    title: page.seoTitle || page.title,
    description: page.seoDescription || page.summary,
    path: cmsPagePath(locale, page.slug),
    alternates,
    image: page.ogImage ?? page.cover,
  });
}

export default async function PublicCmsPage({ params }: PageProps<"/[locale]/p/[slug]">) {
  const { locale, dict } = await getI18n();
  const slug = decodeURIComponent((await params).slug);
  const page = await getCmsPage(locale, slug);
  if (page) {
    const published = await getPublishedCmsAlternates(page.id);
    const alternates = Object.fromEntries(
      locales.map((item) => [item, published[item] ?? `${homePath(item)}?notice=unavailable`]),
    );
    return (
      <>
        <PageAlternates alternates={alternates} />
        <CmsPageView locale={locale} dict={dict} page={page} />
      </>
    );
  }
  const redirected = await getCmsRedirect(locale, slug);
  if (redirected) permanentRedirect(redirected);
  if (slug === "unpublished") notFound();
  redirect(`${homePath(locale)}?notice=unavailable`);
}

export async function generateStaticParams() {
  const locale = await localeParam();
  if (!locale || !isLocale(locale)) return [{ slug: "unpublished" }];
  const rows = (await getPublishedCmsSlugs()).filter((row) => row.locale === locale);
  return rows.length > 0 ? rows.map((row) => ({ slug: row.slug })) : [{ slug: "unpublished" }];
}
