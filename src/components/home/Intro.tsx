import type { Dictionary } from "@/i18n/dictionaries";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/SectionHeading";

export function Intro({
  dict,
  aboutHref,
  title,
  body,
}: {
  dict: Dictionary;
  aboutHref: string;
  title?: string | null;
  body?: string | null;
}) {
  return (
    <section aria-labelledby="intro-title" className="py-20 lg:py-28">
      <Container className="grid gap-10 lg:grid-cols-12 lg:gap-10">
        <div className="lg:col-span-6">
          <Eyebrow>{dict.intro.eyebrow}</Eyebrow>
          <h2
            id="intro-title"
            className="mt-4 font-serif text-[2rem] leading-[1.12] text-navy-950 sm:text-[2.5rem]"
          >
            {title?.trim() || dict.intro.title}
          </h2>
        </div>
        <div className="lg:col-span-5 lg:col-start-8 lg:pt-10">
          <p className="text-lg leading-relaxed text-ink/85">{body?.trim() || dict.intro.body}</p>
          <div className="mt-8">
            <Button href={aboutHref} variant="secondary" withArrow>
              {dict.intro.cta}
            </Button>
          </div>
        </div>
      </Container>
    </section>
  );
}
