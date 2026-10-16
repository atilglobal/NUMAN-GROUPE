import type { Locale } from "../config";
import fr from "./fr.json";
import en from "./en.json";
import tr from "./tr.json";

export type Dictionary = typeof fr;

export const dictionaries: Record<Locale, Dictionary> = { fr, en, tr };

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale];
}
