import { Container } from "@/components/ui/Container";

export function DemoBanner({ label, message }: { label: string; message: string }) {
  return (
    <aside aria-label={label} className="border-b border-gold-500/40 bg-paper-2">
      <Container className="flex items-start gap-3 py-2.5 text-[0.8125rem] leading-snug text-ink">
        <span className="mt-px shrink-0 rounded-[2px] border border-dashed border-navy-900/60 px-1.5 text-[0.6875rem] font-semibold uppercase tracking-[0.14em]">
          {label}
        </span>
        <p>{message}</p>
      </Container>
    </aside>
  );
}
