import Link from "next/link";
import { cacheLife } from "next/cache";
import type { SiteChrome } from "@/content/types";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import { homePath, sectionPath } from "@/i18n/routes";
import { Logo } from "@/components/brand/Logo";
import { Container } from "@/components/ui/Container";
import { ContactDetails } from "./ContactDetails";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { legalNav, primaryNav, type NavItem } from "./nav";

async function CurrentYear() {
  "use cache";
  cacheLife("days");
  return <>{new Date().getFullYear()}</>;
}

const linkClass =
  "inline-flex min-h-9 items-center text-sm text-on-dark-muted transition-colors hover:text-paper";

export function Footer({
  locale,
  dict,
  chrome,
  items,
}: {
  locale: Locale;
  dict: Dictionary;
  chrome: SiteChrome;
  items?: NavItem[];
}) {
  const navigation =
    items && items.length > 0
      ? items
      : [
          ...primaryNav(locale, dict),
          { id: "contact", section: "contact" as const, href: sectionPath(locale, "contact"), label: dict.nav.contact },
        ];
  const tagline = chrome.copy?.footerTagline?.trim() || dict.footer.tagline;

  return (
    <footer className="on-dark bg-navy-950 text-paper">
      <Container className="grid gap-12 py-16 lg:grid-cols-12 lg:gap-10 lg:py-20">
        <div className="lg:col-span-4">
          <Logo
            href={homePath(locale)}
            homeLabel={dict.a11y.home}
            placeholderLabel={dict.a11y.logoPlaceholder}
            tone="dark"
            image={chrome.logo}
          />
          <p className="mt-6 text-sm uppercase tracking-[0.18em] text-gold-300">{tagline}</p>
          <div className="mt-8">
            <ContactDetails chrome={chrome} dict={dict} tone="dark" />
          </div>
        </div>

        <nav aria-labelledby="footer-nav-title" className="lg:col-span-3">
          <h2 id="footer-nav-title" className="text-xs font-semibold uppercase tracking-[0.2em] text-paper">
            {dict.footer.navigation}
          </h2>
          <ul className="mt-4 grid gap-1">
            {navigation.map((item) => (
              <li key={item.id}>
                <Link href={item.href} className={linkClass}>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-labelledby="footer-legal-title" className="lg:col-span-3">
          <h2 id="footer-legal-title" className="text-xs font-semibold uppercase tracking-[0.2em] text-paper">
            {dict.footer.legal}
          </h2>
          <ul className="mt-4 grid gap-1">
            {legalNav(locale, dict).map((item) => (
              <li key={item.id}>
                <Link href={item.href} className={linkClass}>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="lg:col-span-2">
          <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-paper">
            {dict.footer.languages}
          </h2>
          <LanguageSwitcher
            current={locale}
            label={dict.a11y.languageSwitcher}
            names={dict.languages}
            tone="dark"
            className="mt-3"
          />
        </div>
      </Container>

      <div className="border-t border-paper/10">
        <Container className="flex flex-col gap-2 py-6 text-xs text-on-dark-muted sm:flex-row sm:items-center sm:justify-between">
          <p>
            © <CurrentYear /> NUMAN GROUPE. {dict.footer.rights}
          </p>
        </Container>
      </div>
    </footer>
  );
}
