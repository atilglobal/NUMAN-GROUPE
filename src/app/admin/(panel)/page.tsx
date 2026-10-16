import type { Metadata } from "next";
import Link from "next/link";
import { getContentCounts, getNewInquiries, getRecentActivity } from "@/admin/dashboard";
import { dateTimeFormat, describeAction, entityLabels, pageKeyLabels } from "@/admin/labels";
import { can } from "@/auth/permissions";
import { requireUser } from "@/auth/session";
import { getTranslationCoverage, incompleteRows } from "@/content/coverage";
import { getDb } from "@/db/client";
import { locales } from "@/i18n/config";
import { Card, EmptyState, PageHeader, Pill, StatusBadge } from "@/components/admin/ui";

export const metadata: Metadata = { title: "Gösterge paneli" };

const editorPaths: Partial<Record<string, string>> = {
  expertise: "/admin/uzmanliklar",
  project: "/admin/projeler",
  visit: "/admin/ziyaretler",
  team_member: "/admin/kadro",
  page: "/admin/sayfalar",
};
const PENDING_LIMIT = 12;

export default async function DashboardPage() {
  const user = await requireUser();
  const db = getDb();
  const seesInquiries = can(user.role, "inquiries:read");

  const [counts, coverage, activity, inquiries] = await Promise.all([
    getContentCounts(db),
    getTranslationCoverage(db),
    getRecentActivity(db, { limit: 10, contentOnly: !can(user.role, "audit:read") }),
    seesInquiries ? getNewInquiries(db, 5) : null,
  ]);
  const pending = incompleteRows(coverage);

  const countCards = [
    { label: "Uzmanlık alanları", value: counts.expertises, href: "/admin/uzmanliklar" },
    { label: "Projeler", value: counts.projects, href: "/admin/projeler" },
    { label: "Resmî ziyaretler", value: counts.visits, href: "/admin/ziyaretler" },
    { label: "Kadro", value: counts.team, href: "/admin/kadro" },
    { label: "Kurumsal sayfalar", value: counts.pages, href: "/admin/sayfalar" },
    { label: "Medya dosyaları", value: counts.media, href: "/admin/medya" },
  ];

  return (
    <>
      <PageHeader title={`Hoş geldiniz, ${user.name}`} description="İçeriklerin genel durumu ve son işlemler." />

      <section aria-labelledby="counts-title" className="mb-6">
        <h2 id="counts-title" className="sr-only">
          İçerik sayıları
        </h2>
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
          {countCards.map((card) => (
            <li key={card.label} className="rounded-lg border border-line bg-white p-4 shadow-sm">
              <p className="text-2xl font-semibold text-navy-950">{card.value}</p>
              <p className="mt-1 text-sm text-muted">
                {card.href ? (
                  <Link href={card.href} className="underline-offset-4 hover:underline">
                    {card.label}
                  </Link>
                ) : (
                  card.label
                )}
              </p>
            </li>
          ))}
        </ul>
      </section>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card title="Taslaklar ve eksik çeviriler">
          {pending.length === 0 ? (
            <EmptyState title="Bekleyen içerik yok">Bütün kayıtlar üç dilde de yayında.</EmptyState>
          ) : (
            <>
              <ul className="divide-y divide-line">
                {pending.slice(0, PENDING_LIMIT).map((row) => {
                  const path = editorPaths[row.entity];
                  return (
                    <li key={`${row.entity}-${row.id}`} className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:justify-between">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-navy-950">
                          {path ? (
                            <Link href={`${path}/${row.id}`} className="underline-offset-4 hover:underline">
                              {row.label}
                            </Link>
                          ) : row.entity === "page" ? (
                            (pageKeyLabels[row.label] ?? row.label)
                          ) : (
                            row.label
                          )}
                        </p>
                        <p className="text-xs text-muted">
                          {entityLabels[row.entity]}
                          {row.isDemo ? <span className="ml-2"><Pill tone="warning">Demo</Pill></span> : null}
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {locales.map((locale) => (
                          <StatusBadge key={locale} state={row.locales[locale]} prefix={locale.toUpperCase()} />
                        ))}
                      </div>
                    </li>
                  );
                })}
              </ul>
              {pending.length > PENDING_LIMIT ? (
                <p className="mt-3 text-xs text-muted">
                  ve {pending.length - PENDING_LIMIT} kayıt daha.
                </p>
              ) : null}
            </>
          )}
        </Card>

        <Card title={can(user.role, "audit:read") ? "Son işlemler" : "Son içerik işlemleri"}>
          {activity.length === 0 ? (
            <EmptyState title="Henüz işlem yok" />
          ) : (
            <ul className="divide-y divide-line">
              {activity.map((entry) => (
                <li key={entry.id} className="py-3">
                  <p className="text-sm text-navy-950">
                    {describeAction(entry.action, entry.entityType)}
                    {typeof entry.metadata.locale === "string" ? ` (${entry.metadata.locale.toUpperCase()})` : null}
                    {typeof entry.metadata.name === "string" ? ` — ${entry.metadata.name}` : null}
                  </p>
                  <p className="text-xs text-muted">
                    {entry.actorName ?? "Bilinmeyen kullanıcı"} · {dateTimeFormat.format(entry.createdAt)}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </Card>

        {inquiries ? (
          <Card title={`Yeni iletişim talepleri (${inquiries.total})`}>
            {inquiries.rows.length === 0 ? (
              <EmptyState title="Yeni talep yok">Gelen iletişim ve proje talepleri burada listelenir.</EmptyState>
            ) : (
              <ul className="divide-y divide-line">
                {inquiries.rows.map((inquiry) => (
                  <li key={inquiry.id} className="py-3">
                    <p className="text-sm font-medium text-navy-950">
                      <Link href={`/admin/talepler/${inquiry.id}`} className="underline-offset-4 hover:underline">
                        {inquiry.fullName}
                      </Link>
                      {inquiry.organization ? ` — ${inquiry.organization}` : null}
                    </p>
                    <p className="text-xs text-muted">
                      {inquiry.type === "project_request" ? "Proje talebi" : "İletişim"} · {inquiry.locale.toUpperCase()} ·{" "}
                      {dateTimeFormat.format(inquiry.createdAt)}
                    </p>
                  </li>
                ))}
              </ul>
            )}
            <p className="mt-4 text-sm">
              <Link href="/admin/talepler" className="underline-offset-4 hover:underline">
                Tüm talepler
              </Link>
            </p>
          </Card>
        ) : null}
      </div>
    </>
  );
}
