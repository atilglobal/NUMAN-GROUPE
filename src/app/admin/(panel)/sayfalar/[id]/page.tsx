import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { savePageTranslationAction, setPageStatusAction } from "@/admin/actions/pages";
import { dateTimeFormat, localeLabels, pageKeyLabels } from "@/admin/labels";
import { getPageForEditor } from "@/admin/pages";
import { idSchema } from "@/admin/validation";
import { requirePermission } from "@/auth/session";
import { getDb } from "@/db/client";
import { locales } from "@/i18n/config";
import { PublishForm } from "@/components/admin/ExpertiseForms";
import { LocaleTabs } from "@/components/admin/LocaleTabs";
import { PageTranslationForm } from "@/components/admin/PageForms";
import { Card, PageHeader, StatusBadge } from "@/components/admin/ui";

export const metadata: Metadata = { title: "Sayfayı düzenle" };

const HINTS: Record<string, string> = {
  certificates:
    "Yalnızca doğrulanmış sertifikaları yazın. Belge yoksa bu bloğu boş ve yayımlanmamış bırakın; sitede görünmez.",
  mission: "Misyon ve vizyonu abartmadan, doğrulanmış ifadelerle yazın.",
  quality: "Kalite ve güvenlik yaklaşımı. Sahip olunmayan belge veya standart iddiası yazmayın.",
  privacy:
    "Yer tutucu metin yayıma hazır gizlilik politikası değildir. Canlıya çıkmadan önce hukuk danışmanı metnini kaydedin; aksi hâlde sitede hukuki belge yok uyarısı görünür.",
  legal:
    "Yer tutucu metin yasal bilgilendirme yerine geçmez. Canlıya çıkmadan önce hukuk danışmanı metnini kaydedin ve yayımlayın.",
  cookies:
    "Çerez bildirimi hukuk danışmanı metni olmadan yayıma hazır sayılmaz. Boş bırakılırsa sitede hukuki belge yok uyarısı görünür.",
};

export default async function EditPageContent({ params }: { params: Promise<{ id: string }> }) {
  await requirePermission("content:write");
  const { id } = await params;
  if (!idSchema.safeParse(id).success) notFound();
  const entry = await getPageForEditor(getDb(), id);
  if (!entry) notFound();
  const title = pageKeyLabels[entry.key] ?? entry.key;

  const tabs = locales.map((locale) => {
    const translation = entry.translations[locale];
    const published = translation?.status === "published";
    return {
      id: locale,
      label: `${locale.toUpperCase()} · ${localeLabels[locale]}`,
      status: <StatusBadge state={translation?.status ?? "missing"} />,
      content: (
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_16rem]">
          <PageTranslationForm
            action={savePageTranslationAction.bind(null, id, locale)}
            exists={Boolean(translation)}
            hint={HINTS[entry.key]}
            defaults={{
              title: translation?.title ?? "",
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
                <PublishForm
                  action={setPageStatusAction.bind(null, id, locale, published ? "draft" : "published")}
                  published={published}
                />
              </>
            ) : (
              <p className="text-xs text-muted">Yayımlamak için önce kaydedin.</p>
            )}
          </aside>
        </div>
      ),
    };
  });

  return (
    <>
      <PageHeader title={title} back={{ href: "/admin/sayfalar", label: "Kurumsal içerikler" }} />
      <Card title="İçerik">
        <LocaleTabs label="İçerik dili" tabs={tabs} />
      </Card>
    </>
  );
}
