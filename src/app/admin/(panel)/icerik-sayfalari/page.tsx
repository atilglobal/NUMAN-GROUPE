import type { Metadata } from "next";
import Link from "next/link";
import { createCmsPageAction } from "@/admin/actions/cms";
import { listCmsPages } from "@/admin/cms";
import { requirePermission } from "@/auth/session";
import { getDb } from "@/db/client";
import { locales } from "@/i18n/config";
import { buttonClass } from "@/components/admin/button-styles";
import { Card, PageHeader, StatusBadge } from "@/components/admin/ui";

export const metadata: Metadata = { title: "Sayfalar" };

export default async function CmsPagesAdminPage() {
  await requirePermission("content:write");
  const rows = await listCmsPages(getDb());

  return (
    <>
      <PageHeader
        title="Sayfalar"
        description="Yeni kurumsal sayfalar. Tek kayıt, FR / EN / TR karşılıklar. Özel şablonlar kod değişikliği gerektirir; standart içerik sayfası panelden eklenir."
        actions={
          <form action={createCmsPageAction}>
            <button type="submit" className={buttonClass("primary")}>
              Yeni sayfa
            </button>
          </form>
        }
      />
      <Card>
        {rows.length === 0 ? (
          <p className="text-sm text-muted">Henüz sayfa yok.</p>
        ) : (
          <ul className="divide-y divide-line">
            {rows.map((row) => (
              <li key={row.id} className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:justify-between">
                <Link href={`/admin/icerik-sayfalari/${row.id}`} className="font-medium text-navy-950 underline-offset-4 hover:underline">
                  {row.title}
                </Link>
                <div className="flex flex-wrap gap-1">
                  {locales.map((locale) => (
                    <StatusBadge key={locale} state={row.states[locale]} prefix={locale.toUpperCase()} />
                  ))}
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </>
  );
}
