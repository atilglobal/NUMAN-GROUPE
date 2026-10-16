import type { ProjectStatus } from "@/content/types";
import { cn } from "./cn";

export function DemoBadge({ label, className }: { label: string; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-[2px] border border-dashed border-navy-900/60 bg-paper/95 px-2 py-0.5 text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-navy-900",
        className,
      )}
    >
      {label}
    </span>
  );
}

export function StatusBadge({ status, label }: { status: ProjectStatus; label: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-[2px] px-2.5 py-1 text-[0.6875rem] font-semibold uppercase tracking-[0.14em]",
        status === "in_progress" ? "bg-gold-400 text-navy-950" : "bg-navy-900 text-paper",
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          "size-1.5 rounded-full",
          status === "in_progress" ? "bg-navy-950" : "bg-gold-300",
        )}
      />
      {label}
    </span>
  );
}
