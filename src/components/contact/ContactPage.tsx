import type { SiteChrome } from "@/content/types";
import type { Dictionary } from "@/i18n/dictionaries";
import type { Locale } from "@/i18n/config";
import { countryOptions } from "@/inquiries/countries";
import { homePath, sectionPath } from "@/i18n/routes";
import { ContactDetails } from "@/components/layout/ContactDetails";
import { InquiryForm } from "@/components/forms/InquiryForm";
import { hasRichText, RichText } from "@/content/rich-text";
import { InfoCard } from "@/components/page/InfoCard";
import { PageHero } from "@/components/page/PageHero";
import { Container } from "@/components/ui/Container";

const NEXT_STEPS = [
  { title: "nextShareTitle", body: "nextShareBody" },
  { title: "nextReviewTitle", body: "nextReviewBody" },
  { title: "nextMeetTitle", body: "nextMeetBody" },
] as const;

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
  const hasDetails = Boolean(
    chrome.contactEmail ||
      chrome.contactPhone ||
      chrome.postalAddress?.trim() ||
      chrome.whatsapp ||
      chrome.socialLinks.length > 0,
  );

  return (
    <>
      <PageHero
        breadcrumbs={[{ label: dict.nav.home, href: homePath(locale) }, { label: dict.nav.contact }]}
        breadcrumbsLabel={dict.a11y.breadcrumbs}
        eyebrow={dict.nav.contact}
        title={page?.title ?? dict.inquiry.title}
        lead={page?.summary ?? dict.inquiry.lead}
      />

      <Container className="pb-14 lg:pb-20">
        {hasRichText(page?.body) ? (
          <RichText source={page!.body} className="mb-10 max-w-[42rem] space-y-4 text-base leading-relaxed text-ink/85" />
        ) : null}

        <div className="grid gap-8 lg:grid-cols-12 lg:items-start lg:gap-10">
          {hasDetails ? (
            <div className="lg:col-span-5">
              <InfoCard title={dict.contact.detailsTitle}>
                <ContactDetails chrome={chrome} dict={dict} />
              </InfoCard>
            </div>
          ) : null}
          <div className={hasDetails ? "lg:col-span-7" : "lg:col-span-8"}>
            <InfoCard title={dict.contact.formTitle}>
              <InquiryForm
                locale={locale}
                dict={dict}
                privacyHref={sectionPath(locale, "privacy")}
                expertises={expertises}
                countries={countryOptions(locale)}
              />
            </InfoCard>
          </div>
        </div>

        <section aria-labelledby="contact-next" className="mt-14 border-t border-line pt-12 lg:mt-16">
          <h2 id="contact-next" className="font-serif text-3xl text-navy-950">
            {dict.contact.nextTitle}
          </h2>
          <p className="mt-3 max-w-[42rem] text-base leading-relaxed text-muted">{dict.contact.nextLead}</p>
          <ol className="mt-8 grid gap-5 md:grid-cols-3">
            {NEXT_STEPS.map((step, index) => (
              <li key={step.title} className="border border-line bg-white p-6">
                <p className="font-mono text-xs uppercase tracking-[0.2em] text-gold-700">
                  {String(index + 1).padStart(2, "0")}
                </p>
                <h3 className="mt-3 font-serif text-xl text-navy-950">{dict.contact[step.title]}</h3>
                <p className="mt-3 text-sm leading-relaxed text-ink/80">{dict.contact[step.body]}</p>
              </li>
            ))}
          </ol>
        </section>
      </Container>
    </>
  );
}
