import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";

type PageCtaProps = {
  title: string;
  description: string;
  href: string;
  label: string;
  maxWidthClass?: string;
};

export function PageCta({ title, description, href, label, maxWidthClass }: PageCtaProps) {
  return (
    <section className="border-t border-line bg-navy-950 text-paper">
      <Container
        maxWidthClass={maxWidthClass}
        className="flex flex-col gap-6 py-12 lg:flex-row lg:items-end lg:justify-between lg:py-16"
      >
        <div className="max-w-xl">
          <h2 className="font-serif text-[1.85rem] leading-[1.12] sm:text-4xl">{title}</h2>
          <p className="mt-3 text-base leading-relaxed text-paper/85">{description}</p>
        </div>
        <Button href={href} withArrow>
          {label}
        </Button>
      </Container>
    </section>
  );
}
