import type { Metadata } from "next";
import { getI18n } from "@/i18n/server";
import { homePath } from "@/i18n/routes";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/SectionHeading";

export async function generateMetadata(): Promise<Metadata> {
  const { dict } = await getI18n();
  return { title: dict.notFound.title, robots: { index: false, follow: false } };
}

export default async function LocaleNotFound() {
  const { locale, dict } = await getI18n();

  return (
    <Container className="py-24 lg:py-32">
      <div className="max-w-2xl">
        <Eyebrow>{dict.notFound.eyebrow}</Eyebrow>
        <h1 className="mt-5 font-serif text-[2.5rem] leading-[1.08] text-navy-950 sm:text-6xl">
          {dict.notFound.title}
        </h1>
        <p className="mt-6 text-lg leading-relaxed text-muted">{dict.notFound.body}</p>
        <div className="mt-10">
          <Button href={homePath(locale)} withArrow>
            {dict.notFound.backHome}
          </Button>
        </div>
      </div>
    </Container>
  );
}
