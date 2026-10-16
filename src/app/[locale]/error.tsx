"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { isLocale, type Locale } from "@/i18n/config";
import { homePath } from "@/i18n/routes";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";

const copy: Record<Locale, { title: string; body: string; retry: string; home: string }> = {
  fr: {
    title: "Erreur",
    body: "Cette page n'a pas pu être affichée. Réessayez, ou revenez à l'accueil.",
    retry: "Réessayer",
    home: "Retour à l'accueil",
  },
  en: {
    title: "Error",
    body: "This page could not be displayed. Try again, or return home.",
    retry: "Try again",
    home: "Back to home",
  },
  tr: {
    title: "Hata",
    body: "Bu sayfa gösterilemedi. Yeniden deneyin veya ana sayfaya dönün.",
    retry: "Yeniden dene",
    home: "Ana sayfaya dön",
  },
};

export default function LocaleError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const pathname = usePathname();
  const segment = pathname.split("/").filter(Boolean)[0];
  const locale: Locale = segment && isLocale(segment) ? segment : "fr";
  const t = copy[locale];

  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      console.error(error);
    }
  }, [error]);

  return (
    <Container className="py-24 lg:py-32">
      <h1 className="font-serif text-[2.5rem] leading-[1.08] text-navy-950 sm:text-6xl">{t.title}</h1>
      <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted">{t.body}</p>
      <div className="mt-10 flex flex-wrap gap-3">
        <Button type="button" onClick={reset}>
          {t.retry}
        </Button>
        <Button href={homePath(locale)} variant="secondary">
          {t.home}
        </Button>
      </div>
    </Container>
  );
}
