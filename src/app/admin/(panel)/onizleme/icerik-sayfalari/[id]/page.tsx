import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { idSchema, localeSchema } from "@/admin/validation";
import { requirePermission } from "@/auth/session";
import { findCmsPageById } from "@/content/queries";
import { getDb } from "@/db/client";
import { getDictionary } from "@/i18n/dictionaries";
import { locales } from "@/i18n/config";
import { CmsPageView } from "@/components/cms/CmsPageView";

export const metadata: Metadata = { title: "Sayfa önizleme", robots: { index: false, follow: false } };

export default async function CmsPreviewPage({
  params,
  searchParams,
}: PageProps<"/admin/onizleme/icerik-sayfalari/[id]">) {
  await requirePermission("content:write");
  const { id } = await params;
  if (!idSchema.safeParse(id).success) notFound();
  const query = await searchParams;
  const parsed = localeSchema.safeParse(query.dil ?? "fr");
  const locale = parsed.success ? parsed.data : "fr";
  const page = await findCmsPageById(getDb(), locale, id, { demo: true });
  if (!page) {
    return (
      <div className="rounded-lg border border-line bg-white p-6">
        <h1 className="text-lg font-semibold">Bu dilde içerik yok</h1>
        <Link href={`/admin/icerik-sayfalari/${id}`} className="mt-4 inline-block text-sm underline">
          Düzenlemeye dön
        </Link>
      </div>
    );
  }
  const dict = getDictionary(locale);
  return (
    <div>
      <div className="mb-4 rounded-md border border-amber-300 bg-amber-50 px-4 py-3 text-sm">
        Taslak önizleme — oturum olmadan açılamaz.{" "}
        {locales.map((item) => (
          <Link key={item} href={`/admin/onizleme/icerik-sayfalari/${id}?dil=${item}`} className="ml-2 underline">
            {item.toUpperCase()}
          </Link>
        ))}
      </div>
      <div lang={locale}>
        <CmsPageView locale={locale} dict={dict} page={page} />
      </div>
    </div>
  );
}
