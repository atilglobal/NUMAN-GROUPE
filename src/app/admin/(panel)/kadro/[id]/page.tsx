import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  deleteTeamMemberAction,
  saveTeamTranslationAction,
  setTeamStatusAction,
  updateTeamRootAction,
} from "@/admin/actions/team";
import { dateTimeFormat, localeLabels } from "@/admin/labels";
import { getTeamMemberForEditor } from "@/admin/team";
import { idSchema } from "@/admin/validation";
import { requirePermission } from "@/auth/session";
import { getDb } from "@/db/client";
import { locales } from "@/i18n/config";
import { listImagesForPicker } from "@/media/store";
import { PublishForm } from "@/components/admin/ExpertiseForms";
import { ConfirmDialog } from "@/components/admin/forms";
import { LocaleTabs } from "@/components/admin/LocaleTabs";
import { TeamRootForm, TeamTranslationForm } from "@/components/admin/TeamForms";
import { Card, PageHeader, Pill, StatusBadge } from "@/components/admin/ui";

export const metadata: Metadata = { title: "Kişiyi düzenle" };

export default async function EditTeamPage({ params }: { params: Promise<{ id: string }> }) {
  await requirePermission("content:write");
  const { id } = await params;
  if (!idSchema.safeParse(id).success) notFound();
  const db = getDb();
  const [entry, media] = await Promise.all([getTeamMemberForEditor(db, id), listImagesForPicker(db)]);
  if (!entry) notFound();

  const tabs = locales.map((locale) => {
    const translation = entry.translations[locale];
    const published = translation?.status === "published";
    return {
      id: locale,
      label: `${locale.toUpperCase()} · ${localeLabels[locale]}`,
      status: <StatusBadge state={translation?.status ?? "missing"} />,
      content: (
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_16rem]">
          <TeamTranslationForm
            action={saveTeamTranslationAction.bind(null, id, locale)}
            exists={Boolean(translation)}
            defaults={{ roleTitle: translation?.roleTitle ?? "", bio: translation?.bio ?? "" }}
          />
          <aside className="grid content-start gap-3 rounded-md border border-line bg-paper/50 p-4 text-sm">
            <p className="font-medium text-navy-950">Yayın durumu</p>
            <StatusBadge state={translation?.status ?? "missing"} />
            {translation ? (
              <>
                <p className="text-xs text-muted">Son değişiklik: {dateTimeFormat.format(translation.updatedAt)}</p>
                <PublishForm
                  action={setTeamStatusAction.bind(null, id, locale, published ? "draft" : "published")}
                  published={published}
                />
              </>
            ) : (
              <p className="text-xs text-muted">Önce bu dili kaydedin.</p>
            )}
          </aside>
        </div>
      ),
    };
  });

  return (
    <>
      <PageHeader
        title={entry.fullName}
        back={{ href: "/admin/kadro", label: "Kadro" }}
        description={
          <span className="flex flex-wrap gap-2">
            {entry.isVisible ? null : <Pill>Gizli</Pill>}
            {entry.isDemo ? <Pill tone="warning">Demo içerik — üretimde gösterilmez</Pill> : null}
          </span>
        }
      />
      <div className="grid gap-6">
        <Card title="Unvan ve biyografi">
          <LocaleTabs label="İçerik dili" tabs={tabs} />
        </Card>
        <Card title="Kimlik, fotoğraf ve profil">
          <TeamRootForm
            action={updateTeamRootAction.bind(null, id)}
            media={media}
            defaults={{
              fullName: entry.fullName,
              sortOrder: entry.sortOrder,
              isVisible: entry.isVisible,
              photoAssetId: entry.photoAssetId,
              linkLabel: entry.link?.label ?? "",
              linkUrl: entry.link?.url ?? "",
            }}
          />
        </Card>
        <Card title="Tehlikeli işlemler">
          <ConfirmDialog
            triggerLabel="Kişiyi sil"
            title="Kişi silinsin mi?"
            description={`“${entry.fullName}” ve çevirileri kalıcı olarak silinecek.`}
            confirmLabel="Evet, sil"
            action={deleteTeamMemberAction.bind(null, id)}
          />
        </Card>
      </div>
    </>
  );
}
