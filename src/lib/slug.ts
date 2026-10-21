import { SLUG_PATTERN } from "../db/schema";

const SLUG_RE = new RegExp(SLUG_PATTERN);

/** URL-safe slug from a title (FR/EN/TR letters). Empty result is "". */
export function slugFromTitle(title: string): string {
  const ascii = title
    .normalize("NFKD")
    .replace(/\p{M}/gu, "")
    .replace(/[ıİ]/g, "i")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 160)
    .replace(/-+$/g, "");
  return SLUG_RE.test(ascii) ? ascii : "";
}

export function isValidSlug(value: string): boolean {
  return SLUG_RE.test(value) && value.length <= 160;
}

/** Next unused candidate: base, then base-2, base-3, … */
export function nextSlugCandidate(base: string, attempt: number): string {
  const safe = isValidSlug(base) ? base : "projet";
  if (attempt <= 1) return safe;
  const suffix = `-${attempt}`;
  return `${safe.slice(0, Math.max(1, 160 - suffix.length))}${suffix}`.replace(/-+$/g, "");
}
