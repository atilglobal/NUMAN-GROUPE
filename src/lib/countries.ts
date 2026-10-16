import type { Locale } from "@/i18n/config";

/**
 * Withdrawn or exceptionally reserved ISO 3166-1 codes that Intl still names,
 * producing duplicate labels (e.g. DD and DE both "Allemagne").
 */
const EXCLUDED = new Set([
  "AN",
  "BU",
  "CS",
  "DD",
  "DY",
  "EU",
  "EZ",
  "FX",
  "HV",
  "NH",
  "RH",
  "SU",
  "TP",
  "UK",
  "UN",
  "VD",
  "YD",
  "YU",
  "ZR",
]);

const extra = ["XK"];

function isCurrentRegionCode(code: string): boolean {
  if (!/^[A-Z]{2}$/.test(code)) return false;
  if (EXCLUDED.has(code)) return false;
  if (code[0] === "X" && code !== "XK") return false;
  if (code[0] === "Q" && code >= "QM") return false;
  if (code === "AA" || code === "ZZ") return false;
  return true;
}

/**
 * Walk A–Z rather than `Intl.supportedValuesOf("region")`, which throws in the
 * Next.js build worker.
 */
function probedRegionCodes(): string[] {
  const probe = new Intl.DisplayNames("en", { type: "region" });
  const codes: string[] = [];
  for (let first = 65; first <= 90; first += 1) {
    for (let second = 65; second <= 90; second += 1) {
      const code = String.fromCharCode(first, second);
      const label = probe.of(code);
      if (label && label !== code && isCurrentRegionCode(code)) codes.push(code);
    }
  }
  return codes;
}

const CODES = [...new Set([...probedRegionCodes(), ...extra.filter(isCurrentRegionCode)])].sort();

export function regionCodes(): string[] {
  return CODES;
}

export function countryLabel(locale: Locale, code: string): string {
  try {
    return new Intl.DisplayNames([locale], { type: "region" }).of(code) ?? code;
  } catch {
    return code;
  }
}

export function countryOptions(locale: Locale): { value: string; label: string }[] {
  return regionCodes()
    .map((value) => ({ value, label: `${countryLabel(locale, value)} (${value})` }))
    .sort((a, b) => a.label.localeCompare(b.label, locale));
}
