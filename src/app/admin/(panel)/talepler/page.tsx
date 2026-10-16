import type { Metadata } from "next";
import Link from "next/link";
import { listInquiries } from "@/admin/inquiries";
import { dateTimeFormat } from "@/admin/labels";
import { requirePermission } from "@/auth/session";
import { getDb } from "@/db/client";
import { inquiryStatuses } from "@/db/schema";
import { buttonClass } from "@/components/admin/button-styles";
import { Card, EmptyState, PageHeader, Pager, Pill } from "@/components/admin/ui";

export const metadata: Metadata = { title: "Talepler" };

const STATUS_LABELS: Record<string, string> = {
  new: "Yeni",
  reviewing: "İnceleniyor",
  replied: "Yanıtlandı",
  archived: "Arşivlendi",
};

export default async function InquiriesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requirePermission("inquiries:read");
  const params = await searchParams;
  const q = typeof params.q === "string" ? params.q.trim() : "";
  const status = typeof params.status === "string" ? params.status : "all";
  const page = Number(params.page ?? 1);
  const { rows, total, page: current, pageSize } = await listInquiries(getDb(), {
    q: q || undefined,
    status,
    page,
  });
  const href = (nextPage: number) => {
    const search = new URLSearchParams();
    if (q) search.set("q", q);
    if (status !== "all") search.set("status", status);
    if (nextPage > 1) search.set("page", String(nextPage));
    const query = search.toString();
    return `/admin/talepler${query ? `?${query}` : ""}`;
  };

  return (
    <>
      <PageHeader title="İletişim ve proje talepleri" description="Kişisel veriler yalnızca bu ekranda; işlem kaydına mesaj kopyalanmaz." />
      <Card>
        <form method="get" className="mb-4 flex flex-wrap gap-3">
          <input name="q" defaultValue={q} placeholder="Ad veya e-posta" className="min-h-10 min-w-56 flex-1 rounded-md border border-line px-3 text-sm" />
          <select name="status" defaultValue={status} className="min-h-10 rounded-md border border-line px-3 text-sm">
            <option value="all">Tüm durumlar</option>
            {inquiryStatuses.map((value) => (
              <option key={value} value={value}>
                {STATUS_LABELS[value]}
              </option>
            ))}
          </select>
          <button type="submit" className={buttonClass("secondary")}>
            Filtrele
          </button>
        </form>
        {rows.length === 0 ? (
          <EmptyState title="Talep yok">Yayımlanan formdan gelen kayıtlar burada listelenir.</EmptyState>
        ) : (
          <ul className="divide-y divide-line">
            {rows.map((row) => (
              <li key={row.id} className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <Link href={`/admin/talepler/${row.id}`} className="font-medium text-navy-950 underline-offset-4 hover:underline">
                    {row.fullName}
                  </Link>
                  <p className="text-xs text-muted">
                    {row.type === "project_request" ? "Proje talebi" : "İletişim"} · {row.locale.toUpperCase()} ·{" "}
                    {dateTimeFormat.format(row.createdAt)}
                  </p>
                </div>
                <Pill>{STATUS_LABELS[row.status] ?? row.status}</Pill>
              </li>
            ))}
          </ul>
        )}
        <Pager page={current} pageSize={pageSize} total={total} href={href} />
      </Card>
    </>
  );
}
