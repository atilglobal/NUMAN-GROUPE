import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  deleteProjectAction,
  saveProjectTranslationAction,
  setProjectStatusAction,
  updateProjectRootAction,
} from "@/admin/actions/projects";
import { dateTimeFormat, localeLabels } from "@/admin/labels";
import { getProjectForEditor, listExpertiseOptions } from "@/admin/projects";
import { idSchema } from "@/admin/validation";
import { requirePermission } from "@/auth/session";
import { getDb } from "@/db/client";
import { locales } from "@/i18n/config";
import { countryOptions } from "@/lib/countries";
import { listImagesForPicker } from "@/media/store";
import { PublishForm } from "@/components/admin/ExpertiseForms";
import { ConfirmDialog } from "@/components/admin/forms";
import { LocaleTabs } from "@/components/admin/LocaleTabs";
import { ProjectRootForm, ProjectTranslationForm } from "@/components/admin/ProjectForms";
import { Card, PageHeader, Pill, StatusBadge } from "@/components/admin/ui";

export const metadata: Metadata = { title: "Projeyi düzenle" };

export default async function EditProjectPage({ params }: PageProps<"/admin/projeler/[id]">) {
  await requirePermission("content:write");
  const { id } = await params;
  if (!idSchema.safeParse(id).success) notFound();
  const db = getDb();
  const [entry, expertises, media] = await Promise.all([
    getProjectForEditor(db, id),
    listExpertiseOptions(db),
    listImagesForPicker(db),
  ]);
  if (!entry) notFound();

  const title = entry.translations.fr?.title ?? Object.values(entry.translations)[0]?.title ?? "(adsız kayıt)";
  const expertiseOptions = expertises.map((item) => ({ value: item.id, label: item.label }));

  const tabs = locales.map((locale) => {
    const translation = entry.translations[locale];
    const published = translation?.status === "published";
    return {
      id: locale,
      label: `${locale.toUpperCase()} · ${localeLabels[locale]}`,
      status: <StatusBadge state={translation?.status ?? "missing"} />,
      content: (
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_16rem]">
          <ProjectTranslationForm
            action={saveProjectTranslationAction.bind(null, id, locale)}
            exists={Boolean(translation)}
            defaults={{
              title: translation?.title ?? "",
              slug: translation?.slug ?? "",
              summary: translation?.summary ?? "",
              body: translation?.body ?? "",
              city: translation?.city ?? "",
              seoTitle: translation?.seoTitle ?? "",
              seoDescription: translation?.seoDescription ?? "",
              technicalDetails: translation?.technicalDetails ?? [],
            }}
          />
          <aside className="grid content-start gap-3 rounded-md border border-line bg-paper/50 p-4 text-sm">
            <p className="font-medium text-navy-950">Yayın durumu</p>
            <StatusBadge state={translation?.status ?? "missing"} />
            {translation ? (
              <>
                <p className="text-xs text-muted">Son değişiklik: {dateTimeFormat.format(translation.updatedAt)}</p>
                <PublishForm
                  action={setProjectStatusAction.bind(null, id, locale, published ? "draft" : "published")}
                  published={published}
                />
                <a
                  href={`/admin/onizleme/projeler/${id}?dil=${locale}`}
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
        back={{ href: "/admin/projeler", label: "Projeler" }}
        description={
          <span className="flex flex-wrap gap-2">
            {entry.isFeatured ? <Pill>Öne çıkan</Pill> : null}
            {entry.isDemo ? <Pill tone="warning">Demo içerik — üretimde gösterilmez</Pill> : null}
          </span>
        }
      />
      <div className="grid gap-6">
        <Card title="İçerik">
          <LocaleTabs label="İçerik dili" tabs={tabs} />
        </Card>
        <Card title="Genel bilgiler, kapak ve galeri">
          <ProjectRootForm
            action={updateProjectRootAction.bind(null, id)}
            expertiseOptions={expertiseOptions}
            countryOptions={countryOptions("tr")}
            media={media}
            defaults={{
              status: entry.status,
              expertiseId: entry.expertiseId,
              countryCode: entry.countryCode,
              startedOn: entry.startedOn,
              completedOn: entry.completedOn,
              videoUrl: entry.videoUrl,
              progressPercent: entry.progressPercent,
              isFeatured: entry.isFeatured,
              sortOrder: entry.sortOrder,
              coverAssetId: entry.coverAssetId,
              gallery: entry.gallery,
            }}
          />
        </Card>
        <Card title="Tehlikeli işlemler">
          <p className="mb-3 text-sm text-muted">Silme bütün dillerdeki içeriği kaldırır. Uzmanlık alanı durur.</p>
          <ConfirmDialog
            triggerLabel="Projeyi sil"
            title="Proje silinsin mi?"
            description={`“${title}” ve çevirileri kalıcı olarak silinecek.`}
            confirmLabel="Evet, sil"
            action={deleteProjectAction.bind(null, id)}
          />
        </Card>
      </div>
    </>
  );
}
