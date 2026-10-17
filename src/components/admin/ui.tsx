import Link from "next/link";
import type { ReactNode } from "react";
import { statusLabels } from "@/admin/labels";
import type { TranslationState } from "@/content/coverage";

export function PageHeader({
  title,
  description,
  actions,
  back,
}: {
  title: string;
  description?: ReactNode;
  actions?: ReactNode;
  back?: { href: string; label: string };
}) {
  return (
    <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {back ? (
          <Link href={back.href} className="text-sm text-muted underline-offset-4 hover:underline">
            ← {back.label}
          </Link>
        ) : null}
        <h1 className="mt-1 text-2xl font-semibold text-navy-950">{title}</h1>
        {description ? <div className="mt-1 max-w-2xl text-sm text-muted">{description}</div> : null}
      </div>
      {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
    </header>
  );
}

export function Card({ title, children, actions }: { title?: string; children: ReactNode; actions?: ReactNode }) {
  return (
    <section className="rounded-lg border border-line bg-white p-5 shadow-sm">
      {title || actions ? (
        <div className="mb-4 flex items-center justify-between gap-3">
          {title ? <h2 className="text-base font-semibold text-navy-950">{title}</h2> : <span />}
          {actions}
        </div>
      ) : null}
      {children}
    </section>
  );
}

export function EmptyState({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className="rounded-md border border-dashed border-line bg-paper/60 px-4 py-6 text-center">
      <p className="text-sm font-medium text-navy-950">{title}</p>
      {children ? <div className="mt-1 text-sm text-muted">{children}</div> : null}
    </div>
  );
}

const statusStyles: Record<TranslationState, string> = {
  published: "bg-emerald-100 text-emerald-900",
  draft: "bg-amber-100 text-amber-900",
  missing: "bg-red-50 text-red-800 ring-1 ring-red-200",
};

export function StatusBadge({ state, prefix }: { state: TranslationState; prefix?: string }) {
  return (
    <span className={`inline-flex items-center rounded px-2 py-0.5 text-xs font-medium ${statusStyles[state]}`}>
      {prefix ? `${prefix}: ` : null}
      {statusLabels[state]}
    </span>
  );
}

export function Pill({ children, tone = "neutral" }: { children: ReactNode; tone?: "neutral" | "warning" | "danger" }) {
  const styles = {
    neutral: "bg-paper-2 text-navy-900",
    warning: "bg-amber-100 text-amber-900",
    danger: "bg-red-100 text-red-900",
  };
  return <span className={`inline-flex rounded px-2 py-0.5 text-xs font-medium ${styles[tone]}`}>{children}</span>;
}

export function Pager({
  page,
  pageSize,
  total,
  href,
}: {
  page: number;
  pageSize: number;
  total: number;
  href: (page: number) => string;
}) {
  const last = Math.max(1, Math.ceil(total / pageSize));
  if (last <= 1) return null;
  return (
    <nav aria-label="Sayfalar" className="mt-4 flex flex-wrap items-center gap-2">
      {page > 1 ? (
        <Link href={href(page - 1)} className="rounded-md border border-line px-3 py-2 text-sm">
          Önceki
        </Link>
      ) : null}
      <p className="text-sm text-muted">
        Sayfa {page} / {last}
      </p>
      {page < last ? (
        <Link href={href(page + 1)} className="rounded-md border border-line px-3 py-2 text-sm">
          Sonraki
        </Link>
      ) : null}
    </nav>
  );
}

export function PanelSkeleton() {
  return (
    <div role="status" aria-live="polite" className="grid gap-4">
      <span className="sr-only">Yükleniyor…</span>
      <div className="h-8 w-56 animate-pulse rounded bg-line/70" />
      <div className="grid gap-4 sm:grid-cols-3">
        {[0, 1, 2].map((key) => (
          <div key={key} className="h-24 animate-pulse rounded-lg bg-white" />
        ))}
      </div>
      <div className="h-64 animate-pulse rounded-lg bg-white" />
    </div>
  );
}
