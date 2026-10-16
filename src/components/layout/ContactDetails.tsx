import type { ReactNode } from "react";
import type { SiteChrome } from "@/content/types";
import type { Dictionary } from "@/i18n/dictionaries";
import { mailtoHref, telHref, whatsappHref } from "@/lib/contact";

const itemClass = "text-sm leading-relaxed";
const linkClass = "underline decoration-gold-500/80 underline-offset-4 hover:text-gold-300";

export function ContactDetails({
  chrome,
  dict,
  tone = "light",
}: {
  chrome: Pick<SiteChrome, "contactEmail" | "contactPhone" | "postalAddress" | "whatsapp" | "socialLinks">;
  dict: Dictionary;
  tone?: "light" | "dark";
}) {
  const email = mailtoHref(chrome.contactEmail);
  const phone = telHref(chrome.contactPhone);
  const whatsapp = whatsappHref(chrome.whatsapp);
  const items: { label: string; content: ReactNode }[] = [];

  if (email && chrome.contactEmail) {
    items.push({
      label: dict.contact.email,
      content: (
        <a href={email} className={linkClass}>
          {chrome.contactEmail}
        </a>
      ),
    });
  }
  if (phone && chrome.contactPhone) {
    items.push({
      label: dict.contact.phone,
      content: (
        <a href={phone} className={linkClass}>
          {chrome.contactPhone}
        </a>
      ),
    });
  }
  if (chrome.postalAddress?.trim()) {
    items.push({ label: dict.contact.address, content: chrome.postalAddress });
  }
  if (whatsapp && chrome.whatsapp) {
    items.push({
      label: dict.contact.whatsapp,
      content: (
        <a href={whatsapp} className={linkClass} rel="noopener noreferrer" target="_blank">
          {chrome.whatsapp}
        </a>
      ),
    });
  }
  if (chrome.socialLinks.length > 0) {
    items.push({
      label: dict.contact.social,
      content: (
        <ul className="flex flex-wrap gap-x-3 gap-y-1">
          {chrome.socialLinks.map((item) => (
            <li key={item.url}>
              <a href={item.url} className={linkClass} rel="noopener noreferrer" target="_blank">
                {item.label}
              </a>
            </li>
          ))}
        </ul>
      ),
    });
  }

  if (items.length === 0) return null;

  const muted = tone === "dark" ? "text-on-dark-muted" : "text-muted";
  const ink = tone === "dark" ? "text-paper" : "text-ink";

  return (
    <dl className={`grid gap-4 ${ink}`}>
      {items.map((item) => (
        <div key={item.label}>
          <dt className={`text-xs font-semibold uppercase tracking-[0.16em] ${muted}`}>{item.label}</dt>
          <dd className={`mt-1 ${itemClass}`}>{item.content}</dd>
        </div>
      ))}
    </dl>
  );
}
