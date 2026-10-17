import type { Dictionary } from "@/i18n/dictionaries";

const STEPS = ["design", "planning", "build", "handover"] as const;

export function ProcessSection({ dict }: { dict: Dictionary }) {
  return (
    <section className="section-space border-y border-line/70 bg-surface-muted/40">
      <div className="page-shell">
        <p className="section-eyebrow">{dict.process.eyebrow}</p>
        <h2 className="section-title max-w-3xl">{dict.process.title}</h2>
        <p className="section-lead mt-4">{dict.process.description}</p>
        <ol className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {STEPS.map((key, index) => (
            <li key={key} className="border border-line bg-surface p-6">
              <p className="font-mono text-xs uppercase tracking-[0.2em] text-accent">
                {String(index + 1).padStart(2, "0")}
              </p>
              <h3 className="mt-3 font-display text-xl text-ink">{dict.process[key].title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-ink-muted">{dict.process[key].body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
