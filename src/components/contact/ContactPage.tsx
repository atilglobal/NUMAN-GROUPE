import type { SiteChrome } from "@/content/types";
import type { Dictionary } from "@/i18n/dictionaries";
import type { Locale } from "@/i18n/config";
import { countryOptions } from "@/inquiries/countries";
import { homePath, sectionPath } from "@/i18n/routes";
import { ContactDetails } from "@/components/layout/ContactDetails";
import { InquiryForm } from "@/components/forms/InquiryForm";
import { hasRichText, RichText } from "@/content/rich-text";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/SectionHeading";

export function ContactPage({
  locale,
  dict,
  chrome,
  expertises,
  page,
}: {
  locale: Locale;
  dict: Dictionary;
  chrome: SiteChrome;
  expertises: { id: string; name: string }[];
  page: { title: string; summary: string | null; body: string | null } | null;
}) {
  return (
    <Container className="py-14 lg:py-20">
      <Breadcrumbs
        label={dict.a11y.breadcrumbs}
        items={[{ label: dict.nav.home, href: homePath(locale) }, { label: dict.nav.contact }]}
      />
      <div className="mt-12 grid gap-14 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <Eyebrow>{dict.nav.contact}</Eyebrow>
          <h1 className="mt-5 font-serif text-[2.5rem] leading-[1.08] text-navy-950 sm:text-6xl">
            {page?.title ?? dict.inquiry.title}
          </h1>
          <p className="mt-6 text-lg leading-relaxed text-ink/85">{page?.summary ?? dict.inquiry.lead}</p>
          {hasRichText(page?.body) ? (
            <RichText source={page!.body} className="mt-6 space-y-4 text-base leading-relaxed text-ink/85" />
          ) : null}
          <div className="mt-10">
            <InquiryForm
              locale={locale}
              dict={dict}
              privacyHref={sectionPath(locale, "privacy")}
              expertises={expertises}
              countries={countryOptions(locale)}
            />
          </div>
        </div>
        <div className="lg:col-span-4 lg:col-start-9">
          <ContactDetails chrome={chrome} dict={dict} />
        </div>
      </div>
    </Container>
  );
}
