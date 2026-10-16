import type { ResolvedImage } from "@/content/types";
import type { Dictionary } from "@/i18n/dictionaries";
import { DemoBadge } from "@/components/ui/Badges";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { MediaFrame } from "@/components/ui/MediaFrame";

type Props = {
  dict: Dictionary;
  image: ResolvedImage | null;
  href: string;
  title?: string | null;
  description?: string | null;
  label?: string | null;
};

export function CallToAction({ dict, image, href, title, description, label }: Props) {
  return (
    <section
      aria-labelledby="cta-title"
      className="on-dark relative isolate overflow-hidden bg-navy-950 text-paper"
    >
      <div className="absolute inset-0 -z-10">
        <MediaFrame image={image} sizes="100vw" className="h-full" imageClassName="object-[70%_center]" />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-linear-to-r from-navy-950/90 via-navy-950/70 to-navy-950/20"
        />
      </div>
      <Container className="flex flex-col gap-8 py-20 lg:flex-row lg:items-end lg:justify-between lg:py-28">
        <div className="max-w-xl">
          <h2 id="cta-title" className="font-serif text-[2.25rem] leading-[1.08] sm:text-5xl">
            {title?.trim() || dict.callToAction.title}
          </h2>
          <p className="mt-5 text-lg text-paper/85">{description?.trim() || dict.callToAction.description}</p>
        </div>
        <div>
          <Button href={href} withArrow>
            {label?.trim() || dict.callToAction.button}
          </Button>
        </div>
      </Container>
      {image?.isDemo ? (
        <DemoBadge label={dict.demo.imageBadge} className="absolute bottom-4 right-4 sm:right-6" />
      ) : null}
    </section>
  );
}
