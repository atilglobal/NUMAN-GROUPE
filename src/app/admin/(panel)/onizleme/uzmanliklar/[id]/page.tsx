import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { idSchema, localeSchema } from "@/admin/validation";
import { requirePermission } from "@/auth/session";
import { findPreviewDetail, listExpertises, listProjectsForExpertise } from "@/content/queries";
import { getDb } from "@/db/client";
import { locales } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { ExpertiseDetail } from "@/components/expertises/ExpertiseDetail";

export const metadata: Metadata = { title: "Uzmanlık önizleme", robots: { index: false, follow: false } };

export default async function ExpertisePreviewPage({
  params,
  searchParams,
}: PageProps<"/admin/onizleme/uzmanliklar/[id]">) {
  await requirePermission("content:write");
  const { id } = await params;
  if (!idSchema.safeParse(id).success) notFound();
  const query = await searchParams;
  const parsed = localeSchema.safeParse(query.dil ?? "fr");
  const locale = parsed.success ? parsed.data : "fr";
  const db = getDb();
  const entry = await findPreviewDetail(db, "expertises", locale, id);
  if (!entry) {
    return (
      <div className="rounded-lg border border-line bg-white p-6">
        <h1 className="text-lg font-semibold">Bu dilde içerik yok</h1>
        <Link href={`/admin/uzmanliklar/${id}`} className="mt-4 inline-block text-sm underline">
          Düzenlemeye dön
        </Link>
      </div>
    );
  }
  const [related, expertises] = await Promise.all([
    listProjectsForExpertise(db, locale, { demo: true }, id),
    listExpertises(db, locale, { demo: true }),
  ]);
  const dict = getDictionary(locale);

  return (
    <div>
      <div className="mb-4 rounded-md border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-950">
        Taslak önizleme — oturum olmadan açılamaz.
        {locales.map((item) => (
          <Link key={item} href={`/admin/onizleme/uzmanliklar/${id}?dil=${item}`} className="ml-2 underline">
            {item.toUpperCase()}
          </Link>
        ))}
        <Link href={`/admin/uzmanliklar/${id}`} className="ml-4 underline">
          Düzenle
        </Link>
      </div>
      <div lang={locale}>
        <ExpertiseDetail
          locale={locale}
          dict={dict}
          entry={entry}
          related={related}
          others={expertises.filter((item) => item.id !== entry.id)}
          preview
        />
      </div>
    </div>
  );
}
