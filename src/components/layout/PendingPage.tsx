import type { ReactNode } from "react";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { hasRichText, RichText } from "@/content/rich-text";
import { PageHero } from "@/components/page/PageHero";
import { Prose } from "@/components/page/Prose";
import type { Crumb } from "@/components/ui/Breadcrumbs";

type PendingPageProps = {
  breadcrumbs: Crumb[];
  breadcrumbsLabel: string;
  statusLabel: string;
  title: string;
  badges?: ReactNode;
  lead?: string | null;
  body?: string | null;
  message: string;
  actions: { href: string; label: string; variant?: "primary" | "secondary" }[];
  children?: ReactNode;
  /** Legal pages stay a readable column without promotional chrome. */
  legal?: boolean;
};

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
  legal = false,
}: PendingPageProps) {
  return (
    <>
      <PageHero
        breadcrumbs={breadcrumbs}
        breadcrumbsLabel={breadcrumbsLabel}
        eyebrow={statusLabel}
        title={title}
        lead={lead}
        badges={badges}
      />
      <Container className="pb-16 lg:pb-20">
        <Prose narrow={legal}>
          {hasRichText(body) ? (
            <RichText source={body} className="space-y-5" />
          ) : (
            <p className="border-l-2 border-gold-400 pl-5 text-muted">{message}</p>
          )}
        </Prose>
        {children}
        {actions.length > 0 ? (
          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            {actions.map((action) => (
              <Button key={action.href} href={action.href} variant={action.variant ?? "secondary"}>
                {action.label}
              </Button>
            ))}
          </div>
        ) : null}
      </Container>
    </>
  );
}
