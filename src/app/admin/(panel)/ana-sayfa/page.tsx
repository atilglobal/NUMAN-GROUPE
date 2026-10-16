import type { Metadata } from "next";
import {
  saveHomeCopyAction,
  setHomeCopyStatusAction,
  updateHomeVisualsAction,
} from "@/admin/actions/settings";
import { dateTimeFormat, localeLabels } from "@/admin/labels";
import { getHomeCopy, getSiteSettings } from "@/admin/settings";
import { requirePermission } from "@/auth/session";
import { getDb } from "@/db/client";
import { locales } from "@/i18n/config";
import { listImagesForPicker } from "@/media/store";
import { PublishForm } from "@/components/admin/ExpertiseForms";
import { HomeCopyForm, HomeVisualsForm } from "@/components/admin/HomeForms";
import { LocaleTabs } from "@/components/admin/LocaleTabs";
import { Card, PageHeader, StatusBadge } from "@/components/admin/ui";

export const metadata: Metadata = { title: "Ana sayfa" };

export default async function HomeAdminPage() {
  await requirePermission("content:write");
  const db = getDb();
  const [settings, media, copies] = await Promise.all([
    getSiteSettings(db),
    listImagesForPicker(db),
    Promise.all(locales.map(async (locale) => [locale, await getHomeCopy(db, locale)] as const)),
  ]);
  const byLocale = Object.fromEntries(copies);

  const tabs = locales.map((locale) => {
    const translation = byLocale[locale];
    const published = translation?.status === "published";
    return {
      id: locale,
      label: `${locale.toUpperCase()} · ${localeLabels[locale]}`,
      status: <StatusBadge state={translation?.status ?? "missing"} />,
      content: (
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_16rem]">
          <HomeCopyForm
            action={saveHomeCopyAction.bind(null, locale)}
            exists={Boolean(translation)}
            defaults={{
              heroTitle: translation?.heroTitle ?? "",
              heroDescription: translation?.heroDescription ?? "",
              introTitle: translation?.introTitle ?? "",
              introBody: translation?.introBody ?? "",
              ctaTitle: translation?.ctaTitle ?? "",
              ctaDescription: translation?.ctaDescription ?? "",
              ctaLabel: translation?.ctaLabel ?? "",
              ctaHref: translation?.ctaHref ?? "",
              footerTagline: translation?.footerTagline ?? "",
              seoTitle: translation?.seoTitle ?? "",
              seoDescription: translation?.seoDescription ?? "",
            }}
          />
          <aside className="grid content-start gap-3 rounded-md border border-line bg-paper/50 p-4 text-sm">
            <p className="font-medium text-navy-950">Yayın durumu</p>
            <StatusBadge state={translation?.status ?? "missing"} />
            {translation ? (
              <>
                <p className="text-xs text-muted">Son değişiklik: {dateTimeFormat.format(translation.updatedAt)}</p>
                <PublishForm
                  action={setHomeCopyStatusAction.bind(null, locale, published ? "draft" : "published")}
                  published={published}
                />
              </>
            ) : (
              <p className="text-xs text-muted">Yayımlamak için önce kaydedin. Taslakken sitede sözlük metni kalır.</p>
            )}
          </aside>
        </div>
      ),
    };
  });

  return (
    <>
      <PageHeader
        title="Ana sayfa"
        description="Hero, tanıtım, CTA ve bölüm görünürlüğü. Projeler ve ziyaretler paneldeki öne çıkan işaretinden seçilir."
      />
      <div className="grid gap-6">
        <Card title="Görseller, video ve bölümler">
          <HomeVisualsForm
            action={updateHomeVisualsAction}
            media={media}
            defaults={{
              heroImageAssetId: settings.heroImageAssetId,
              callToActionImageAssetId: settings.callToActionImageAssetId,
              heroVideoUrl: settings.heroVideoUrl ?? "",
              homeSections: settings.homeSections,
            }}
          />
        </Card>
        <Card title="Metinler (FR / EN / TR)">
          <LocaleTabs label="Ana sayfa dili" tabs={tabs} />
        </Card>
      </div>
    </>
  );
}
