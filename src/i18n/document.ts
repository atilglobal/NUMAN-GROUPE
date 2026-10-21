import type { Metadata } from "next";
import type { Locale } from "./config";

/**
 * Chrome/Google Translate hints. These do not turn off our FR/EN/TR switcher;
 * they only ask the browser not to machine-translate the authored copy.
 */
export const googleNoTranslateMeta = {
  google: "notranslate",
} as const satisfies NonNullable<Metadata["other"]>;

export function documentHtmlProps(locale: Locale, className: string) {
  return {
    lang: locale,
    translate: "no" as const,
    className: `${className} notranslate`.trim(),
  };
}
