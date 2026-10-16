import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { idSchema, localeSchema } from "@/admin/validation";
import { requirePermission } from "@/auth/session";
import { findPreviewDetail, listRelatedVisits } from "@/content/queries";
import { getDb } from "@/db/client";
import { locales } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { VisitDetail } from "@/components/visits/VisitDetail";

export const metadata: Metadata = { title: "Ziyaret önizleme", robots: { index: false, follow: false } };

export default async function VisitPreviewPage({
  params,
  searchParams,
}: PageProps<"/admin/onizleme/ziyaretler/[id]">) {
  await requirePermission("content:write");
  const { id } = await params;
  if (!idSchema.safeParse(id).success) notFound();
  const query = await searchParams;
  const parsed = localeSchema.safeParse(query.dil ?? "fr");
  const locale = parsed.success ? parsed.data : "fr";
  const db = getDb();
  const entry = await findPreviewDetail(db, "visits", locale, id);
  if (!entry) {
    return (
      <div className="rounded-lg border border-line bg-white p-6">
        <h1 className="text-lg font-semibold">Bu dilde içerik yok</h1>
        <Link href={`/admin/ziyaretler/${id}`} className="mt-4 inline-block text-sm underline">
          Düzenlemeye dön
        </Link>
      </div>
    );
  }
  const related =
    entry.facts.kind === "visit"
      ? await listRelatedVisits(db, locale, { demo: true }, {
          visitId: id,
          countryCode: entry.facts.countryCode,
        })
      : [];
  const dict = getDictionary(locale);

  return (
    <div>
      <div className="mb-4 rounded-md border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-950">
        Taslak önizleme — oturum olmadan açılamaz.
        {locales.map((item) => (
          <Link key={item} href={`/admin/onizleme/ziyaretler/${id}?dil=${item}`} className="ml-2 underline">
            {item.toUpperCase()}
          </Link>
        ))}
        <Link href={`/admin/ziyaretler/${id}`} className="ml-4 underline">
          Düzenle
        </Link>
      </div>
      <div lang={locale}>
        <VisitDetail locale={locale} dict={dict} entry={entry} related={related} preview />
      </div>
    </div>
  );
}
