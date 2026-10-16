import type { Metadata } from "next";
import Link from "next/link";
import { listVisitsForAdmin } from "@/admin/visits";
import { requirePermission } from "@/auth/session";
import { getDb } from "@/db/client";
import { locales } from "@/i18n/config";
import { buttonClass } from "@/components/admin/button-styles";
import { Card, EmptyState, PageHeader, Pager, Pill, StatusBadge } from "@/components/admin/ui";

export const metadata: Metadata = { title: "Resmî ziyaretler" };

export default async function VisitsAdminPage({ searchParams }: PageProps<"/admin/ziyaretler">) {
  await requirePermission("content:write");
  const params = await searchParams;
  const q = typeof params.q === "string" ? params.q.trim() : "";
  const year = Number(params.year ?? "");
  const page = Number(params.page ?? 1);
  const { rows, total, page: current, pageSize } = await listVisitsForAdmin(getDb(), {
    q: q || undefined,
    year: Number.isInteger(year) && year >= 1900 ? year : undefined,
    page,
  });

  const href = (nextPage: number) => {
    const search = new URLSearchParams();
    if (q) search.set("q", q);
    if (Number.isInteger(year) && year >= 1900) search.set("year", String(year));
    if (nextPage > 1) search.set("page", String(nextPage));
    const query = search.toString();
    return `/admin/ziyaretler${query ? `?${query}` : ""}`;
  };

  return (
    <>
      <PageHeader
        title="Resmî ziyaretler"
        description="Ziyaretler ziyaret olarak kaydedilir. Ana sayfada yalnızca “Ana sayfada göster” işaretliler çıkar."
        actions={
          <Link href="/admin/ziyaretler/yeni" className={buttonClass("primary")}>
            Yeni ziyaret
          </Link>
        }
      />
      <Card>
        <form method="get" className="mb-4 grid gap-3 sm:grid-cols-3">
          <input name="q" defaultValue={q} placeholder="Ara (başlık, kurum veya slug)" className="min-h-10 rounded-md border border-line px-3 text-sm" />
          <input name="year" defaultValue={Number.isInteger(year) && year >= 1900 ? year : ""} placeholder="Yıl" className="min-h-10 rounded-md border border-line px-3 text-sm" />
          <button type="submit" className={buttonClass("secondary")}>
            Filtrele
          </button>
        </form>
        {rows.length === 0 ? (
          <EmptyState title={q || year ? "Kayıt bulunamadı" : "Henüz ziyaret yok"}>
            {q || year ? "Filtreleri temizleyin." : "“Yeni ziyaret” ile ilk kaydı oluşturun."}
          </EmptyState>
        ) : (
          <ul className="divide-y divide-line">
            {rows.map((row) => (
              <li key={row.id} className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <Link href={`/admin/ziyaretler/${row.id}`} className="font-medium text-navy-950 underline-offset-4 hover:underline">
                    {row.label ?? "(adsız kayıt)"}
                  </Link>
                  <p className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-muted">
                    {row.visitedOn ?? "tarih yok"}
                    {row.host ? <span>· {row.host}</span> : null}
                    {row.isFeatured ? <Pill>Ana sayfa</Pill> : null}
                    {row.isDemo ? <Pill tone="warning">Demo</Pill> : null}
                  </p>
                </div>
                <div className="flex flex-wrap gap-1">
                  {locales.map((locale) => (
                    <StatusBadge key={locale} state={row.states[locale]} prefix={locale.toUpperCase()} />
                  ))}
                </div>
              </li>
            ))}
          </ul>
        )}
        <Pager page={current} pageSize={pageSize} total={total} href={href} />
      </Card>
    </>
  );
}
