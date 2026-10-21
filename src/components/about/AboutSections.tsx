import type { AboutSectionView } from "@/content/types";
import { hasRichText, RichText } from "@/content/rich-text";
import { Prose } from "@/components/page/Prose";

export function AboutSections({ sections }: { sections: AboutSectionView[] }) {
  if (sections.length === 0) return null;
  return (
    <div className="mt-12 grid gap-10">
      {sections.map((section) => (
        <section key={section.key} aria-labelledby={`about-${section.key}`} className="border-t border-line pt-10">
          <h2 id={`about-${section.key}`} className="font-serif text-3xl text-navy-950">
            {section.title}
          </h2>
          {section.summary ? <p className="mt-3 max-w-[42rem] text-lg leading-relaxed text-ink/85">{section.summary}</p> : null}
          {hasRichText(section.body) ? (
            <Prose className="mt-5">
              <RichText source={section.body} className="space-y-4" />
            </Prose>
          ) : null}
        </section>
      ))}
    </div>
  );
}
