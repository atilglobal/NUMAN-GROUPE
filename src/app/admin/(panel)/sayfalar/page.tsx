import type { Metadata } from "next";
import Link from "next/link";
import { pageKeyLabels } from "@/admin/labels";
import { listPagesForAdmin } from "@/admin/pages";
import { requirePermission } from "@/auth/session";
import { getDb } from "@/db/client";
import { locales } from "@/i18n/config";
import { Card, PageHeader, StatusBadge } from "@/components/admin/ui";

export const metadata: Metadata = { title: "Kurumsal içerikler" };

export default async function PagesAdminPage() {
  await requirePermission("content:write");
  const rows = await listPagesForAdmin(getDb());

  return (
    <>
      <PageHeader
        title="Kurumsal içerikler"
        description="Sabit bloklar: hakkımızda, misyon ve vizyon, çalışma yaklaşımı, kalite ve güvenlik, varsa doğrulanmış sertifikalar. Tam sayfa oluşturucu yoktur."
      />
      <Card>
        <ul className="divide-y divide-line">
          {rows.map((row) => (
            <li key={row.id} className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <Link href={`/admin/sayfalar/${row.id}`} className="font-medium text-navy-950 underline-offset-4 hover:underline">
                  {pageKeyLabels[row.key] ?? row.key}
                </Link>
                <p className="mt-0.5 text-xs text-muted">{row.title ?? "henüz metin yok"}</p>
              </div>
              <div className="flex flex-wrap gap-1">
                {locales.map((locale) => (
                  <StatusBadge key={locale} state={row.states[locale]} prefix={locale.toUpperCase()} />
                ))}
              </div>
            </li>
          ))}
        </ul>
      </Card>
    </>
  );
}
