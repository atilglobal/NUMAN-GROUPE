import type { ReactNode } from "react";
import { cn } from "@/components/ui/cn";

export function Prose({
  children,
  narrow = false,
  className,
}: {
  children: ReactNode;
  narrow?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "space-y-5 text-base leading-relaxed text-ink/90",
        narrow ? "max-w-[42rem]" : "max-w-[46rem]",
        className,
      )}
    >
      {children}
    </div>
  );
}
