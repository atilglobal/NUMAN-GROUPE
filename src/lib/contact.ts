/** WhatsApp chat URL; null when no number was stored. */
export function whatsappHref(value: string | null | undefined): string | null {
  if (!value?.trim()) return null;
  const digits = value.replace(/\D/g, "");
  if (digits.length < 8 || digits.length > 15) return null;
  return `https://wa.me/${digits}`;
}

export function telHref(value: string | null | undefined): string | null {
  if (!value?.trim()) return null;
  const compact = value.replace(/[^\d+]/g, "");
  return compact ? `tel:${compact}` : null;
}

export function mailtoHref(value: string | null | undefined): string | null {
  const email = value?.trim();
  return email ? `mailto:${email}` : null;
}
