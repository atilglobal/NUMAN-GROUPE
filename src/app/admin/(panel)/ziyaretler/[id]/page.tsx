import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  deleteVisitAction,
  saveVisitTranslationAction,
  setVisitStatusAction,
  updateVisitRootAction,
} from "@/admin/actions/visits";
import { dateTimeFormat, localeLabels } from "@/admin/labels";
import { getVisitForEditor } from "@/admin/visits";
import { idSchema } from "@/admin/validation";
import { requirePermission } from "@/auth/session";
import { getDb } from "@/db/client";
import { locales } from "@/i18n/config";
import { countryOptions } from "@/lib/countries";
import { listImagesForPicker } from "@/media/store";
import { PublishForm } from "@/components/admin/ExpertiseForms";
import { ConfirmDialog } from "@/components/admin/forms";
import { LocaleTabs } from "@/components/admin/LocaleTabs";
import { VisitRootForm, VisitTranslationForm } from "@/components/admin/VisitForms";
import { Card, PageHeader, Pill, StatusBadge } from "@/components/admin/ui";

export const metadata: Metadata = { title: "Ziyareti düzenle" };

export default async function EditVisitPage({ params }: PageProps<"/admin/ziyaretler/[id]">) {
  await requirePermission("content:write");
  const { id } = await params;
  if (!idSchema.safeParse(id).success) notFound();
  const db = getDb();
  const [entry, media] = await Promise.all([getVisitForEditor(db, id), listImagesForPicker(db)]);
  if (!entry) notFound();

  const title = entry.translations.fr?.title ?? Object.values(entry.translations)[0]?.title ?? "(adsız kayıt)";

  const tabs = locales.map((locale) => {
    const translation = entry.translations[locale];
    const published = translation?.status === "published";
    return {
      id: locale,
      label: `${locale.toUpperCase()} · ${localeLabels[locale]}`,
      status: <StatusBadge state={translation?.status ?? "missing"} />,
      content: (
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_16rem]">
          <VisitTranslationForm
            action={saveVisitTranslationAction.bind(null, id, locale)}
            exists={Boolean(translation)}
            defaults={{
              title: translation?.title ?? "",
              slug: translation?.slug ?? "",
              summary: translation?.summary ?? "",
              body: translation?.body ?? "",
              hostInstitution: translation?.hostInstitution ?? "",
              location: translation?.location ?? "",
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
                  action={setVisitStatusAction.bind(null, id, locale, published ? "draft" : "published")}
                  published={published}
                />
                <a
                  href={`/admin/onizleme/ziyaretler/${id}?dil=${locale}`}
                  className="text-xs text-navy-950 underline underline-offset-4"
                >
                  {published ? "Sitedeki hali (önizleme)" : "Taslak önizleme"}
                </a>
              </>
            ) : (
              <p className="text-xs text-muted">Önizlemek için önce bu dili kaydedin.</p>
            )}
          </aside>
        </div>
      ),
    };
  });

  return (
    <>
      <PageHeader
        title={title}
        back={{ href: "/admin/ziyaretler", label: "Resmî ziyaretler" }}
        description={
          <span className="flex flex-wrap gap-2">
            {entry.isFeatured ? <Pill>Ana sayfa</Pill> : null}
            {entry.isDemo ? <Pill tone="warning">Demo içerik — üretimde gösterilmez</Pill> : null}
          </span>
        }
      />
      <div className="grid gap-6">
        <Card title="İçerik">
          <LocaleTabs label="İçerik dili" tabs={tabs} />
        </Card>
        <Card title="Tarih, konum, katılımcılar ve görseller">
          <p className="mb-4 text-sm text-muted">
            Ziyareti ortaklık, devlet desteği veya ihale kazanımı olarak kaydetmeyin. Kapak ve galeri illüstrasyon veya
            gerçek ziyaret fotoğrafı olabilir; devlet başkanı veya bakanla sahte görüşme görseli yüklemeyin.
          </p>
          <VisitRootForm
            action={updateVisitRootAction.bind(null, id)}
            countryOptions={countryOptions("tr")}
            media={media}
            defaults={{
              visitedOn: entry.visitedOn,
              countryCode: entry.countryCode,
              isFeatured: entry.isFeatured,
              coverAssetId: entry.coverAssetId,
              gallery: entry.gallery,
              participants: entry.participants,
            }}
          />
        </Card>
        <Card title="Tehlikeli işlemler">
          <p className="mb-3 text-sm text-muted">Silme bütün diller, katılımcılar ve galeri bağlarını kaldırır.</p>
          <ConfirmDialog
            triggerLabel="Ziyareti sil"
            title="Ziyaret silinsin mi?"
            description={`“${title}” ve çevirileri kalıcı olarak silinecek.`}
            confirmLabel="Evet, sil"
            action={deleteVisitAction.bind(null, id)}
          />
        </Card>
      </div>
    </>
  );
}
