import type { ResolvedImage } from "@/content/types";
import type { Dictionary } from "@/i18n/dictionaries";
import { DemoBadge } from "@/components/ui/Badges";
import { Button } from "@/components/ui/Button";
import { cn } from "@/components/ui/cn";
import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/SectionHeading";
import { HeroVisual } from "./HeroVisual";

type HeroCopy = {
  title: string;
  description: string;
  primaryLabel: string;
  primaryHref: string;
};

type HeroProps = {
  dict: Dictionary;
  image: ResolvedImage | null;
  videoUrl: string | null;
  copy: HeroCopy;
  contactHref: string;
};

export function Hero({ dict, image, videoUrl, copy, contactHref }: HeroProps) {
  const hasVisual = Boolean(videoUrl || image);

  return (
    <section
      aria-labelledby="hero-title"
      className="on-dark relative isolate overflow-hidden bg-navy-950 text-paper"
    >
      <div
        className={cn(
          "relative h-[min(52svh,24rem)] sm:h-[28rem] lg:absolute lg:inset-0 lg:-z-10 lg:block lg:h-auto",
          !hasVisual && "hidden",
        )}
      >
        <HeroVisual image={image} videoUrl={videoUrl} />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-linear-to-t from-navy-950 via-navy-950/10 via-35% to-transparent lg:bg-linear-to-r lg:from-navy-950/90 lg:via-navy-950/55 lg:via-50% lg:to-navy-950/5"
        />
        {image?.isDemo ? (
          <DemoBadge
            label={dict.demo.imageBadge}
            className="absolute right-4 top-4 lg:top-auto lg:bottom-4 lg:right-6"
          />
        ) : null}
      </div>

      <Container
        className={cn(
          "pb-16 sm:pb-20 lg:flex lg:min-h-[min(86svh,46rem)] lg:flex-col lg:justify-center lg:py-28",
          hasVisual ? "pt-2" : "pt-20",
        )}
      >
        <div className="max-w-2xl">
          <Eyebrow tone="dark">{dict.hero.eyebrow}</Eyebrow>
          <h1
            id="hero-title"
            className="mt-6 font-serif text-[2.75rem] leading-[1.03] tracking-[-0.015em] sm:text-6xl lg:text-[4.75rem]"
          >
            {copy.title}
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-paper/85">{copy.description}</p>
          <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:gap-4">
            <Button href={copy.primaryHref} withArrow>
              {copy.primaryLabel}
            </Button>
            {copy.primaryHref !== contactHref ? (
              <Button href={contactHref} variant="outline-light">
                {dict.hero.secondaryCta}
              </Button>
            ) : null}
          </div>
        </div>
      </Container>
    </section>
  );
}
