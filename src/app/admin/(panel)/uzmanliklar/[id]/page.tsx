import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  deleteExpertiseAction,
  saveExpertiseTranslationAction,
  setExpertiseStatusAction,
  updateExpertiseRootAction,
} from "@/admin/actions/expertises";
import { getExpertiseForEditor } from "@/admin/expertises";
import { dateTimeFormat, localeLabels } from "@/admin/labels";
import { idSchema } from "@/admin/validation";
import { requirePermission } from "@/auth/session";
import { getDb } from "@/db/client";
import { locales } from "@/i18n/config";
import { listImagesForPicker } from "@/media/store";
import { PublishForm, RootForm, TranslationForm } from "@/components/admin/ExpertiseForms";
import { ConfirmDialog } from "@/components/admin/forms";
import { LocaleTabs } from "@/components/admin/LocaleTabs";
import { Card, PageHeader, Pill, StatusBadge } from "@/components/admin/ui";

export const metadata: Metadata = { title: "Uzmanlık alanını düzenle" };

export default async function EditExpertisePage({ params }: PageProps<"/admin/uzmanliklar/[id]">) {
  await requirePermission("content:write");
  const { id } = await params;
  if (!idSchema.safeParse(id).success) notFound();
  const db = getDb();
  const [entry, media] = await Promise.all([getExpertiseForEditor(db, id), listImagesForPicker(db)]);
  if (!entry) notFound();

  const title = entry.translations.fr?.name ?? Object.values(entry.translations)[0]?.name ?? "(adsız kayıt)";

  const tabs = locales.map((locale) => {
    const translation = entry.translations[locale];
    const published = translation?.status === "published";
    return {
      id: locale,
      label: `${locale.toUpperCase()} · ${localeLabels[locale]}`,
      status: <StatusBadge state={translation?.status ?? "missing"} />,
      content: (
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_16rem]">
          <TranslationForm
            action={saveExpertiseTranslationAction.bind(null, id, locale)}
            exists={Boolean(translation)}
            defaults={{
              name: translation?.name ?? "",
              slug: translation?.slug ?? "",
              summary: translation?.summary ?? "",
              body: translation?.body ?? "",
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
                {translation.publishedAt && published ? (
                  <p className="text-xs text-muted">Yayın tarihi: {dateTimeFormat.format(translation.publishedAt)}</p>
                ) : null}
                <PublishForm
                  action={setExpertiseStatusAction.bind(null, id, locale, published ? "draft" : "published")}
                  published={published}
                />
                <a
                  href={`/admin/onizleme/uzmanliklar/${id}?dil=${locale}`}
                  className="text-xs text-navy-950 underline underline-offset-4"
                >
                  {published ? "Sitedeki hali (önizleme)" : "Taslak önizleme"}
                </a>
              </>
            ) : (
              <p className="text-xs text-muted">Yayımlamak için önce bu dildeki içeriği kaydedin.</p>
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
        back={{ href: "/admin/uzmanliklar", label: "Uzmanlık alanları" }}
        description={
          <span className="flex flex-wrap gap-2">
            {entry.isSeed ? <Pill>Başlangıç kaydı</Pill> : null}
            {entry.isDemo ? <Pill tone="warning">Demo içerik — üretimde gösterilmez</Pill> : null}
          </span>
        }
      />
      <div className="grid gap-6">
        <Card title="İçerik">
          <LocaleTabs label="İçerik dili" tabs={tabs} />
        </Card>
        <Card title="Genel">
          <RootForm
            action={updateExpertiseRootAction.bind(null, id)}
            sortOrder={entry.sortOrder}
            coverAssetId={entry.coverAssetId}
            media={media}
          />
        </Card>
        <Card title="Tehlikeli işlemler">
          <p className="mb-3 text-sm text-muted">
            Silme işlemi bütün dillerdeki içeriği kalıcı olarak kaldırır. Bu alana bağlı projelerin uzmanlık bağlantısı boşaltılır.
          </p>
          <ConfirmDialog
            triggerLabel="Uzmanlık alanını sil"
            title="Uzmanlık alanı silinsin mi?"
            description={
              <>
                <p>
                  “{title}” ve bütün çevirileri kalıcı olarak silinecek. Bu işlem geri alınamaz.
                </p>
                {entry.isSeed ? (
                  <p className="mt-2 font-medium text-amber-900">
                    Bu kayıt sitenin başlangıç uzmanlık alanlarından biridir. Silmeden önce emin olun.
                  </p>
                ) : null}
              </>
            }
            confirmLabel="Evet, sil"
            action={deleteExpertiseAction.bind(null, id)}
          />
        </Card>
      </div>
    </>
  );
}
