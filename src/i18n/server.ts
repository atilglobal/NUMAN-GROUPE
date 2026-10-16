import { notFound } from "next/navigation";
import { locale as localeParam } from "next/root-params";
import { getMergedDictionary } from "@/content/service";
import { isLocale, type Locale } from "./config";
import { getDictionary } from "./dictionaries";

export async function getLocale(): Promise<Locale> {
  const value = await localeParam();
  if (!value || !isLocale(value)) notFound();
  return value;
}

export async function getI18n() {
  const locale = await getLocale();
  try {
    return { locale, dict: await getMergedDictionary(locale) };
  } catch {
    return { locale, dict: getDictionary(locale) };
  }
}
