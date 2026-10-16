import type { ReactNode } from "react";
import { cn } from "@/components/ui/cn";

export function EmptyState({
  children,
  tone = "light",
}: {
  children: ReactNode;
  tone?: "light" | "dark";
}) {
  return (
    <p
      className={cn(
        "border border-dashed px-6 py-10 text-center",
        tone === "dark" ? "border-paper/25 text-on-dark-muted" : "border-line text-muted",
      )}
    >
      {children}
    </p>
  );
}
