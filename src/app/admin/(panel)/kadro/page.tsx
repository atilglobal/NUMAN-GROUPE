import type { Metadata } from "next";
import Link from "next/link";
import { listTeamForAdmin } from "@/admin/team";
import { requirePermission } from "@/auth/session";
import { getDb } from "@/db/client";
import { locales } from "@/i18n/config";
import { buttonClass } from "@/components/admin/button-styles";
import { Card, EmptyState, PageHeader, Pager, Pill, StatusBadge } from "@/components/admin/ui";

export const metadata: Metadata = { title: "Kadro" };

export default async function TeamAdminPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  await requirePermission("content:write");
  const params = await searchParams;
  const q = typeof params.q === "string" ? params.q.trim() : "";
  const page = Number(params.page ?? 1);
  const { rows, total, page: current, pageSize } = await listTeamForAdmin(getDb(), { q: q || undefined, page });
  const href = (nextPage: number) => {
    const search = new URLSearchParams();
    if (q) search.set("q", q);
    if (nextPage > 1) search.set("page", String(nextPage));
    const query = search.toString();
    return `/admin/kadro${query ? `?${query}` : ""}`;
  };

  return (
    <>
      <PageHeader
        title="Kadro"
        description="Yalnızca gerçek ekip üyelerini ekleyin. Uydurma kişi veya unvan yazmayın."
        actions={
          <Link href="/admin/kadro/yeni" className={buttonClass("primary")}>
            Yeni kişi
          </Link>
        }
      />
      <Card>
        <form method="get" className="mb-4 flex flex-wrap gap-3">
          <input name="q" defaultValue={q} placeholder="Ara (ad veya unvan)" className="min-h-10 min-w-56 flex-1 rounded-md border border-line px-3 text-sm" />
          <button type="submit" className={buttonClass("secondary")}>
            Filtrele
          </button>
        </form>
        {rows.length === 0 ? (
          <EmptyState title={q ? "Kayıt bulunamadı" : "Henüz kadro kaydı yok"}>
            {q ? "Aramayı temizleyin." : "“Yeni kişi” ile ilk kaydı oluşturun."}
          </EmptyState>
        ) : (
          <ul className="divide-y divide-line">
            {rows.map((row) => (
              <li key={row.id} className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <Link href={`/admin/kadro/${row.id}`} className="font-medium text-navy-950 underline-offset-4 hover:underline">
                    {row.fullName}
                  </Link>
                  <p className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-muted">
                    {row.roleTitle ?? "unvan yok"} · sıra {row.sortOrder}
                    {row.isVisible ? null : <Pill>Gizli</Pill>}
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
