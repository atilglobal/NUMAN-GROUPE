import type { AboutSectionView } from "@/content/types";
import { hasRichText, RichText } from "@/content/rich-text";

export function AboutSections({ sections }: { sections: AboutSectionView[] }) {
  if (sections.length === 0) return null;
  return (
    <div className="mt-14 grid gap-12">
      {sections.map((section) => (
        <section key={section.key} aria-labelledby={`about-${section.key}`}>
          <h2 id={`about-${section.key}`} className="font-serif text-2xl text-navy-950 sm:text-3xl">
            {section.title}
          </h2>
          {section.summary ? <p className="mt-3 text-base leading-relaxed text-ink/85">{section.summary}</p> : null}
          {hasRichText(section.body) ? (
            <RichText source={section.body} className="mt-5 space-y-4 text-base leading-relaxed text-ink/85" />
          ) : null}
        </section>
      ))}
    </div>
  );
}
