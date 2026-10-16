import type { Metadata } from "next";
import Link from "next/link";
import { listExpertisesForAdmin } from "@/admin/expertises";
import { requirePermission } from "@/auth/session";
import { getDb } from "@/db/client";
import { locales } from "@/i18n/config";
import { buttonClass } from "@/components/admin/button-styles";
import { Card, EmptyState, PageHeader, Pager, Pill, StatusBadge } from "@/components/admin/ui";

export const metadata: Metadata = { title: "Uzmanlık alanları" };

export default async function ExpertisesPage({
  searchParams,
}: PageProps<"/admin/uzmanliklar">) {
  await requirePermission("content:write");
  const params = await searchParams;
  const q = typeof params.q === "string" ? params.q.trim() : "";
  const page = Number(params.page ?? 1);
  const { rows, total, page: current, pageSize } = await listExpertisesForAdmin(getDb(), {
    q: q || undefined,
    page,
  });

  const href = (nextPage: number) => {
    const search = new URLSearchParams();
    if (q) search.set("q", q);
    if (nextPage > 1) search.set("page", String(nextPage));
    const query = search.toString();
    return `/admin/uzmanliklar${query ? `?${query}` : ""}`;
  };

  return (
    <>
      <PageHeader
        title="Uzmanlık alanları"
        description="Sitede gösterilen faaliyet alanları. Her dil ayrı yayımlanır; yayımlanmamış dil sitede görünmez."
        actions={
          <Link href="/admin/uzmanliklar/yeni" className={buttonClass("primary")}>
            Yeni uzmanlık alanı
          </Link>
        }
      />
      <Card>
        <form method="get" className="mb-4 flex flex-wrap gap-3">
          <input
            name="q"
            defaultValue={q}
            placeholder="Ara (ad veya slug)"
            className="min-h-10 min-w-56 flex-1 rounded-md border border-line px-3 text-sm"
          />
          <button type="submit" className={buttonClass("secondary")}>
            Filtrele
          </button>
        </form>
        {rows.length === 0 ? (
          <EmptyState title={q ? "Kayıt bulunamadı" : "Henüz uzmanlık alanı yok"}>
            {q ? "Aramayı değiştirin veya temizleyin." : "“Yeni uzmanlık alanı” ile ilk kaydı oluşturun."}
          </EmptyState>
        ) : (
          <ul className="divide-y divide-line">
            {rows.map((row) => (
              <li key={row.id} className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <Link
                    href={`/admin/uzmanliklar/${row.id}`}
                    className="font-medium text-navy-950 underline-offset-4 hover:underline"
                  >
                    {row.label ?? "(adsız kayıt)"}
                  </Link>
                  <p className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-muted">
                    Sıra {row.sortOrder}
                    {row.isSeed ? <Pill>Başlangıç kaydı</Pill> : null}
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
