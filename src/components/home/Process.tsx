import type { Dictionary } from "@/i18n/dictionaries";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";

const STEPS = ["design", "planning", "build", "handover"] as const;

export function ProcessSection({ dict }: { dict: Dictionary }) {
  return (
    <section className="border-y border-line/70 bg-paper-2/50 py-20 lg:py-28">
      <Container>
        <SectionHeading
          eyebrow={dict.process.eyebrow}
          title={dict.process.title}
          description={dict.process.description}
        />
        <ol className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {STEPS.map((key, index) => (
            <li key={key} className="border border-line bg-white p-6">
              <p className="font-mono text-xs uppercase tracking-[0.2em] text-gold-700">
                {String(index + 1).padStart(2, "0")}
              </p>
              <h3 className="mt-3 font-serif text-xl text-navy-950">{dict.process[key].title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted">{dict.process[key].body}</p>
            </li>
          ))}
        </ol>
      </Container>
    </section>
  );
}
