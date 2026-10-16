import type { ReactNode } from "react";
import { Breadcrumbs, type Crumb } from "@/components/ui/Breadcrumbs";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/SectionHeading";
import { hasRichText, RichText } from "@/content/rich-text";

type PendingPageProps = {
  breadcrumbs: Crumb[];
  breadcrumbsLabel: string;
  statusLabel: string;
  title: string;
  badges?: ReactNode;
  lead?: string | null;
  /** Published text; when present it replaces the interim message. */
  body?: string | null;
  message: string;
  actions: { href: string; label: string; variant?: "primary" | "secondary" }[];
  /** Rendered between the text and the actions (facts, images). */
  children?: ReactNode;
};

/**
 * Text page: shows published editorial text, or an honest interim state for
 * routes whose content is not published yet.
 */
export function PendingPage({
  breadcrumbs,
  breadcrumbsLabel,
  statusLabel,
  title,
  badges,
  lead,
  body,
  message,
  actions,
  children,
}: PendingPageProps) {
  return (
    <Container className="py-14 lg:py-20">
      <Breadcrumbs items={breadcrumbs} label={breadcrumbsLabel} />
      <div className="mt-12 max-w-3xl lg:mt-16">
        <Eyebrow>{statusLabel}</Eyebrow>
        <h1 className="mt-5 font-serif text-[2.5rem] leading-[1.08] text-navy-950 sm:text-6xl">
          {title}
        </h1>
        {badges ? <div className="mt-5 flex flex-wrap gap-2">{badges}</div> : null}
        {lead ? <p className="mt-6 text-xl leading-relaxed text-ink/85">{lead}</p> : null}
        {hasRichText(body) ? (
          <RichText source={body} className="mt-8 space-y-5 text-base leading-relaxed text-ink/85" />
        ) : (
          <p className="mt-6 max-w-2xl border-l-2 border-gold-400 pl-5 text-base leading-relaxed text-muted">
            {message}
          </p>
        )}
        {children}
        <div className="mt-10 flex flex-col gap-3 sm:flex-row">
          {actions.map((action) => (
            <Button key={action.href} href={action.href} variant={action.variant ?? "secondary"}>
              {action.label}
            </Button>
          ))}
        </div>
      </div>
    </Container>
  );
}
