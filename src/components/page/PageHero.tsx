import type { ReactNode } from "react";
import { Breadcrumbs, type Crumb } from "@/components/ui/Breadcrumbs";
import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/SectionHeading";
import { cn } from "@/components/ui/cn";

type PageHeroProps = {
  breadcrumbs: Crumb[];
  breadcrumbsLabel: string;
  eyebrow?: string;
  title: string;
  lead?: string | null;
  badges?: ReactNode;
  actions?: ReactNode;
  children?: ReactNode;
  className?: string;
};

export function PageHero({
  breadcrumbs,
  breadcrumbsLabel,
  eyebrow,
  title,
  lead,
  badges,
  actions,
  children,
  className,
}: PageHeroProps) {
  return (
    <Container className={cn("pt-10 pb-8 lg:pt-14 lg:pb-10", className)}>
      <Breadcrumbs items={breadcrumbs} label={breadcrumbsLabel} />
      <header className="mt-8 grid gap-6 border-b border-line pb-8 lg:mt-10 lg:grid-cols-12 lg:items-end lg:gap-10 lg:pb-10">
        <div className="lg:col-span-7">
          {eyebrow ? <Eyebrow>{eyebrow}</Eyebrow> : null}
          <h1 className="mt-4 text-balance break-words font-serif text-[2.15rem] leading-[1.1] text-navy-950 sm:text-5xl lg:text-[3.15rem]">
            {title}
          </h1>
          {badges ? <div className="mt-5 flex flex-wrap gap-2">{badges}</div> : null}
        </div>
        {lead ? (
          <p className="max-w-[38rem] text-lg leading-relaxed text-ink/85 lg:col-span-5 lg:justify-self-end">
            {lead}
          </p>
        ) : null}
      </header>
      {actions ? <div className="mt-6 flex flex-col gap-3 sm:flex-row">{actions}</div> : null}
      {children}
    </Container>
  );
}
