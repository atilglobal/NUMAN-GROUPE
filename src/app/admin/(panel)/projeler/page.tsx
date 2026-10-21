import type { Metadata } from "next";
import Link from "next/link";
import { listProjectsForAdmin } from "@/admin/projects";
import { requirePermission } from "@/auth/session";
import { getDb } from "@/db/client";
import type { ProjectStatus } from "@/db/schema/projects";
import { locales } from "@/i18n/config";
import { buttonClass } from "@/components/admin/button-styles";
import { Card, EmptyState, PageHeader, Pager, Pill, StatusBadge } from "@/components/admin/ui";

export const metadata: Metadata = { title: "Projeler" };

const PROJECT_STATUSES: ProjectStatus[] = ["planned", "in_progress", "completed"];

const PROJECT_STATUS_TR: Record<ProjectStatus, string> = {
  planned: "Planlanan Projeler",
  in_progress: "Devam Eden Projeler",
  completed: "Tamamlanan Projeler",
};

export default async function ProjectsAdminPage({
  searchParams,
}: PageProps<"/admin/projeler">) {
  await requirePermission("content:write");
  const params = await searchParams;
  const q = typeof params.q === "string" ? params.q.trim() : "";
  const status = PROJECT_STATUSES.includes(params.status as ProjectStatus)
    ? (params.status as ProjectStatus)
    : undefined;
  const page = Number(params.page ?? 1);
  const { rows, total, page: current, pageSize } = await listProjectsForAdmin(getDb(), {
    q: q || undefined,
    status,
    page,
  });

  const href = (nextPage: number) => {
    const search = new URLSearchParams();
    if (q) search.set("q", q);
    if (status) search.set("status", status);
    if (nextPage > 1) search.set("page", String(nextPage));
    const query = search.toString();
    return `/admin/projeler${query ? `?${query}` : ""}`;
  };

  return (
    <>
      <PageHeader
        title="Projeler"
        description="Kurumsal tanıtım. Proje durumu ile dil bazında taslak/yayım ayrı tutulur."
        actions={
          <Link href="/admin/projeler/yeni" className={buttonClass("primary")}>
            Yeni proje
          </Link>
        }
      />
      <Card>
        <form method="get" className="mb-4 grid gap-3 sm:grid-cols-3">
          <input name="q" defaultValue={q} placeholder="Ara (başlık veya slug)" className="min-h-10 rounded-md border border-line px-3 text-sm" />
          <select name="status" defaultValue={status ?? ""} className="min-h-10 rounded-md border border-line px-3 text-sm">
            <option value="">Tüm durumlar</option>
            {PROJECT_STATUSES.map((value) => (
              <option key={value} value={value}>
                {PROJECT_STATUS_TR[value]}
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
                    {PROJECT_STATUS_TR[row.status]}
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
