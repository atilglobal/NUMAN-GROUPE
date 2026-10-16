"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { locales, type Locale } from "@/i18n/config";
import { translatePath } from "@/i18n/routes";
import { usePageAlternates } from "@/components/i18n/alternates";
import { cn } from "@/components/ui/cn";

type LanguageSwitcherProps = {
  current: Locale;
  label: string;
  names: Record<Locale, string>;
  tone?: "light" | "dark";
  className?: string;
};

export function LanguageSwitcher({
  current,
  label,
  names,
  tone = "light",
  className,
}: LanguageSwitcherProps) {
  const pathname = usePathname();
  const alternates = usePageAlternates();
  const dark = tone === "dark";

  return (
    <nav aria-label={label} className={className}>
      <ul className="flex items-center text-[0.8125rem] font-semibold tracking-[0.12em]">
        {locales.map((locale, index) => {
          const isCurrent = locale === current;
          const href = alternates?.[locale] ?? translatePath(pathname, locale);
          return (
            <li key={locale} className="flex items-center">
              {index > 0 ? (
                <span aria-hidden="true" className={cn("px-1.5", dark ? "text-paper/40" : "text-line")}>
                  /
                </span>
              ) : null}
              <Link
                href={href}
                hrefLang={locale}
                lang={locale}
                aria-current={isCurrent ? "true" : undefined}
                className={cn(
                  "relative inline-flex min-h-10 min-w-8 items-center justify-center uppercase",
                  isCurrent
                    ? cn(
                        "after:absolute after:inset-x-1.5 after:bottom-2 after:h-px",
                        dark ? "text-gold-300 after:bg-gold-300" : "text-navy-950 after:bg-navy-950",
                      )
                    : dark
                      ? "text-paper/80 hover:text-paper"
                      : "text-muted hover:text-navy-950",
                )}
              >
                <span aria-hidden="true">{locale}</span>
                <span className="sr-only">{names[locale]}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
