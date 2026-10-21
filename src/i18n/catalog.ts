import { dictionaries, type Dictionary } from "./dictionaries";
import type { Locale } from "./config";

export type UiStringKey = string;

export const uiGroupLabels: Record<string, string> = {
  meta: "SEO ve site adı",
  a11y: "Erişilebilirlik",
  nav: "Menü ve navigasyon",
  languages: "Dil adları",
  hero: "Ana sayfa karşılama",
  intro: "Giriş metinleri",
  process: "Süreç bölümü",
  expertises: "Uzmanlık arayüzü",
  projects: "Proje listesi ve filtreler",
  visits: "Ziyaret listesi ve filtreler",
  team: "Kadro arayüzü",
  contact: "İletişim etiketleri",
  pages: "İç sayfa bağlantıları",
  callToAction: "Çağrı metinleri",
  footer: "Alt bilgi",
  demo: "Demo uyarıları",
  detail: "Detay etiketleri",
  placeholder: "Boş / hazırlanıyor durumları",
  notFound: "Bulunamadı sayfası",
  forms: "Form yardımı",
  inquiry: "İletişim formu",
  gallery: "Görsel galeri",
  i18n: "Dil değişimi bildirimleri",
};

export type CatalogEntry = {
  key: string;
  group: string;
  defaults: Record<Locale, string>;
};

function flatten(value: unknown, prefix = ""): { key: string; value: string }[] {
  if (typeof value === "string") return [{ key: prefix, value }];
  if (typeof value !== "object" || value === null) return [];
  return Object.entries(value).flatMap(([child, nested]) =>
    flatten(nested, prefix ? `${prefix}.${child}` : child),
  );
}

const frLeaves = flatten(dictionaries.fr);
const enMap = Object.fromEntries(flatten(dictionaries.en).map((row) => [row.key, row.value]));
const trMap = Object.fromEntries(flatten(dictionaries.tr).map((row) => [row.key, row.value]));

export const uiCatalog: CatalogEntry[] = frLeaves.map((row) => ({
  key: row.key,
  group: row.key.split(".")[0] ?? "meta",
  defaults: {
    fr: row.value,
    en: enMap[row.key] ?? row.value,
    tr: trMap[row.key] ?? row.value,
  },
}));

export const uiKeySet = new Set(uiCatalog.map((entry) => entry.key));

export function isUiStringKey(key: string): boolean {
  return uiKeySet.has(key);
}

export function catalogEntry(key: string): CatalogEntry | undefined {
  return uiCatalog.find((entry) => entry.key === key);
}

export function setNested(target: Dictionary, key: string, value: string): Dictionary {
  const parts = key.split(".");
  const root = structuredClone(target) as Record<string, unknown>;
  let cursor: Record<string, unknown> = root;
  for (let i = 0; i < parts.length - 1; i++) {
    const part = parts[i]!;
    const next = cursor[part];
    if (typeof next !== "object" || next === null) return target;
    cursor = next as Record<string, unknown>;
  }
  cursor[parts[parts.length - 1]!] = value;
  return root as Dictionary;
}

export function mergeDictionary(base: Dictionary, overrides: Record<string, string>): Dictionary {
  let next = base;
  for (const [key, value] of Object.entries(overrides)) {
    if (!isUiStringKey(key) || !value.trim()) continue;
    next = setNested(next, key, value);
  }
  return next;
}

export function leafAt(dict: Dictionary, key: string): string | undefined {
  const parts = key.split(".");
  let cursor: unknown = dict;
  for (const part of parts) {
    if (typeof cursor !== "object" || cursor === null) return undefined;
    cursor = (cursor as Record<string, unknown>)[part];
  }
  return typeof cursor === "string" ? cursor : undefined;
}
