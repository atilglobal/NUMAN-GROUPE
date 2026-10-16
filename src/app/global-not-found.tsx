import type { Metadata } from "next";
import { Inter, Source_Serif_4 } from "next/font/google";
import { locales } from "@/i18n/config";
import { dictionaries } from "@/i18n/dictionaries";
import { homePath } from "@/i18n/routes";
import "./globals.css";

const inter = Inter({ subsets: ["latin", "latin-ext"], variable: "--font-inter", display: "swap" });
const display = Source_Serif_4({ subsets: ["latin", "latin-ext"], variable: "--font-display", display: "swap" });

export const metadata: Metadata = {
  title: `${dictionaries.fr.notFound.title} | NUMAN GROUPE`,
  robots: { index: false, follow: false },
};

/** Unmatched URLs outside any language prefix: offer every language's home. */
export default function GlobalNotFound() {
  const fr = dictionaries.fr;

  return (
    <html lang="fr" className={`${inter.variable} ${display.variable}`}>
      <body className="grid min-h-svh place-items-center bg-paper px-5 antialiased">
        <main className="w-full max-w-2xl py-20">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-gold-700">
            {fr.notFound.eyebrow}
          </p>
          <h1 className="mt-5 font-serif text-5xl leading-[1.08] text-navy-950">
            {fr.notFound.title}
          </h1>
          <ul className="mt-10 grid gap-6 border-t border-line pt-8">
            {locales.map((locale) => {
              const dict = dictionaries[locale];
              return (
                <li key={locale} lang={locale}>
                  <p className="text-muted">{dict.notFound.body}</p>
                  <a
                    href={homePath(locale)}
                    hrefLang={locale}
                    className="mt-2 inline-flex min-h-10 items-center font-medium text-navy-950 underline underline-offset-4"
                  >
                    {dict.notFound.backHome} — {dict.languages[locale]}
                  </a>
                </li>
              );
            })}
          </ul>
        </main>
      </body>
    </html>
  );
}
