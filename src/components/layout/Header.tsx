import type { SiteChrome } from "@/content/types";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import { homePath, sectionPath } from "@/i18n/routes";
import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { MobileMenu } from "./MobileMenu";
import { primaryNav, type NavItem } from "./nav";
import { PrimaryNav } from "./PrimaryNav";

export function Header({
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
  const navItems = items && items.length > 0 ? items : primaryNav(locale, dict);
  const contactHref = sectionPath(locale, "contact");

  return (
    <header className="sticky top-0 z-50 border-b border-line/80 bg-paper">
      <Container className="flex h-[var(--header-height)] items-center justify-between gap-6">
        <Logo
          href={homePath(locale)}
          homeLabel={dict.a11y.home}
          placeholderLabel={dict.a11y.logoPlaceholder}
          image={chrome.logo}
        />

        <PrimaryNav items={navItems} label={dict.a11y.mainNav} />

        <div className="flex items-center gap-3 sm:gap-5">
          <LanguageSwitcher
            current={locale}
            label={dict.a11y.languageSwitcher}
            names={dict.languages}
            className="hidden sm:block"
          />
          <div className="hidden lg:block">
            <Button href={contactHref} variant="secondary" size="sm" className="px-5">
              {dict.nav.contact}
            </Button>
          </div>
          <MobileMenu
            items={navItems}
            navLabel={dict.a11y.mobileNav}
            openLabel={dict.a11y.openMenu}
            closeLabel={dict.a11y.closeMenu}
            footer={
              <div className="flex flex-col gap-6">
                <Button href={contactHref} variant="secondary" withArrow className="w-full">
                  {dict.nav.contact}
                </Button>
                <LanguageSwitcher
                  current={locale}
                  label={dict.a11y.languageSwitcher}
                  names={dict.languages}
                  className="sm:hidden"
                />
              </div>
            }
          />
        </div>
      </Container>
    </header>
  );
}
