import type { ReactNode } from "react";
import { cn } from "./cn";

type SectionHeadingProps = {
  id?: string;
  eyebrow: string;
  title: string;
  description?: ReactNode;
  tone?: "light" | "dark";
  as?: "h1" | "h2";
  className?: string;
};

export function Eyebrow({ children, tone = "light" }: { children: ReactNode; tone?: "light" | "dark" }) {
  return (
    <p
      className={cn(
        "flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.22em]",
        tone === "dark" ? "text-gold-300" : "text-navy-800",
      )}
    >
      <span aria-hidden="true" className="h-px w-8 bg-current" />
      {children}
    </p>
  );
}

export function SectionHeading({
  id,
  eyebrow,
  title,
  description,
  tone = "light",
  as: Heading = "h2",
  className,
}: SectionHeadingProps) {
  return (
    <div className={cn("grid gap-6 lg:grid-cols-12 lg:items-end lg:gap-10", className)}>
      <div className="lg:col-span-7">
        <Eyebrow tone={tone}>{eyebrow}</Eyebrow>
        <Heading
          id={id}
          className={cn(
            "mt-4 font-serif text-[2rem] leading-[1.1] tracking-[-0.01em] sm:text-[2.5rem] lg:text-[2.75rem]",
            tone === "dark" ? "text-paper" : "text-navy-950",
          )}
        >
          {title}
        </Heading>
      </div>
      {description ? (
        <div
          className={cn(
            "max-w-md text-base leading-relaxed lg:col-span-4 lg:col-start-9",
            tone === "dark" ? "text-on-dark-muted" : "text-muted",
          )}
        >
          {description}
        </div>
      ) : null}
    </div>
  );
}
