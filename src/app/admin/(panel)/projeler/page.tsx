import type { Metadata } from "next";
import Link from "next/link";
import { listExpertiseOptions, listProjectsForAdmin } from "@/admin/projects";
import { requirePermission } from "@/auth/session";
import { getDb } from "@/db/client";
import { locales } from "@/i18n/config";
import { buttonClass } from "@/components/admin/button-styles";
import { Card, EmptyState, PageHeader, Pager, Pill, StatusBadge } from "@/components/admin/ui";

export const metadata: Metadata = { title: "Projeler" };

export default async function ProjectsAdminPage({
  searchParams,
}: PageProps<"/admin/projeler">) {
  await requirePermission("content:write");
  const params = await searchParams;
  const q = typeof params.q === "string" ? params.q.trim() : "";
  const status = params.status === "completed" || params.status === "in_progress" ? params.status : undefined;
  const expertiseId = typeof params.expertise === "string" && params.expertise ? params.expertise : undefined;
  const page = Number(params.page ?? 1);
  const db = getDb();
  const [{ rows, total, page: current, pageSize }, expertises] = await Promise.all([
    listProjectsForAdmin(db, { q: q || undefined, status, expertiseId, page }),
    listExpertiseOptions(db),
  ]);

  const href = (nextPage: number) => {
    const search = new URLSearchParams();
    if (q) search.set("q", q);
    if (status) search.set("status", status);
    if (expertiseId) search.set("expertise", expertiseId);
    if (nextPage > 1) search.set("page", String(nextPage));
    const query = search.toString();
    return `/admin/projeler${query ? `?${query}` : ""}`;
  };

  return (
    <>
      <PageHeader
        title="Projeler"
        description="Tamamlanan ve devam eden işler. İlerleme yüzdesi zorunlu değildir; yalnızca doğrulanmış oran girilirse sitede görünür."
        actions={
          <Link href="/admin/projeler/yeni" className={buttonClass("primary")}>
            Yeni proje
          </Link>
        }
      />
      <Card>
        <form method="get" className="mb-4 grid gap-3 sm:grid-cols-4">
          <input name="q" defaultValue={q} placeholder="Ara (başlık veya slug)" className="min-h-10 rounded-md border border-line px-3 text-sm" />
          <select name="status" defaultValue={status ?? ""} className="min-h-10 rounded-md border border-line px-3 text-sm">
            <option value="">Tüm durumlar</option>
            <option value="in_progress">Devam ediyor</option>
            <option value="completed">Tamamlandı</option>
          </select>
          <select name="expertise" defaultValue={expertiseId ?? ""} className="min-h-10 rounded-md border border-line px-3 text-sm">
            <option value="">Tüm uzmanlıklar</option>
            {expertises.map((item) => (
              <option key={item.id} value={item.id}>
                {item.label}
              </option>
            ))}
          </select>
          <button type="submit" className={buttonClass("secondary")}>
            Filtrele
          </button>
        </form>
        {rows.length === 0 ? (
          <EmptyState title="Kayıt bulunamadı">Filtreleri temizleyin veya yeni proje ekleyin.</EmptyState>
        ) : (
          <ul className="divide-y divide-line">
            {rows.map((row) => (
              <li key={row.id} className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <Link href={`/admin/projeler/${row.id}`} className="font-medium text-navy-950 underline-offset-4 hover:underline">
                    {row.label ?? "(adsız kayıt)"}
                  </Link>
                  <p className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-muted">
                    {row.status === "completed" ? "Tamamlandı" : "Devam ediyor"}
                    {row.expertiseLabel ? <span>· {row.expertiseLabel}</span> : <span>· uzmanlık yok</span>}
                    {row.isFeatured ? <Pill>Öne çıkan</Pill> : null}
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
