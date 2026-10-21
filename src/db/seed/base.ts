import type { Localized } from "../../i18n/config";
import type { PageKey } from "../schema";

/*
 * Production-safe starting data: the four expertises named in the brief (a
 * taxonomy, not a company metric) and empty institutional page slots. No
 * project, visit, person, figure or contact detail is created here.
 */

export type ExpertiseSeed = {
  sortOrder: number;
  slug: Localized;
  name: Localized;
  summary: Localized;
};

export const baseExpertises: ExpertiseSeed[] = [
  {
    sortOrder: 10,
    slug: { fr: "stades", en: "stadiums", tr: "stadyumlar" },
    name: { fr: "Stades", en: "Stadiums", tr: "Stadyumlar" },
    summary: {
      fr: "Enceintes sportives et équipements de grande capacité.",
      en: "Sports venues and large-capacity facilities.",
      tr: "Spor tesisleri ve yüksek kapasiteli yapılar.",
    },
  },
  {
    sortOrder: 20,
    slug: { fr: "hopitaux", en: "hospitals", tr: "hastaneler" },
    name: { fr: "Hôpitaux", en: "Hospitals", tr: "Hastaneler" },
    summary: {
      fr: "Établissements de santé et infrastructures hospitalières.",
      en: "Healthcare facilities and hospital infrastructure.",
      tr: "Sağlık tesisleri ve hastane altyapısı.",
    },
  },
  {
    sortOrder: 30,
    slug: { fr: "villages-sportifs", en: "sports-villages", tr: "spor-koyleri" },
    name: { fr: "Villages sportifs", en: "Sports villages", tr: "Spor köyleri" },
    summary: {
      fr: "Ensembles intégrant hébergement et installations sportives.",
      en: "Complexes combining accommodation and sports facilities.",
      tr: "Konaklama ve spor tesislerini bir araya getiren yerleşkeler.",
    },
  },
  {
    sortOrder: 40,
    slug: { fr: "logements", en: "housing", tr: "lojmanlar" },
    name: { fr: "Logements", en: "Housing", tr: "Lojmanlar" },
    summary: {
      fr: "Programmes résidentiels et logements de fonction.",
      en: "Residential programmes and staff housing.",
      tr: "Konut programları ve lojmanlar.",
    },
  },
];

/** Page slots only; their text is written and published from the panel. */
export const basePageKeys: PageKey[] = [
  "about",
  "mission",
  "vision",
  "history",
  "approach",
  "principles",
  "finance",
  "regions",
  "organization",
  "future",
  "quality",
  "certificates",
  "contact",
  "privacy",
  "legal",
  "cookies",
];
