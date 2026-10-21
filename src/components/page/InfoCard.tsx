import type { ReactNode } from "react";
import { cn } from "@/components/ui/cn";

export function InfoCard({
  title,
  children,
  className,
}: {
  title?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("border border-line bg-white p-6 sm:p-7", className)}>
      {title ? <h2 className="font-serif text-2xl text-navy-950">{title}</h2> : null}
      <div className={title ? "mt-5" : undefined}>{children}</div>
    </section>
  );
}
