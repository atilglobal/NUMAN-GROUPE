import type { Locale } from "@/i18n/config";
import type { ResolvedImage } from "./types";

/**
 * Bundled category illustrations (in `public/brand/`). They are not project,
 * visit or staff records and are not flagged as demo CMS rows. Used only when
 * a published record has no durable cover of its own.
 */
const EXPERTISE_BY_SLUG: Record<string, { src: string; alt: Record<Locale, string> }> = {
  stades: {
    src: "/brand/expertise-stadium.jpg",
    alt: {
      fr: "Illustration : tribunes et pelouse d'un stade",
      en: "Illustration: stands and pitch of a stadium",
      tr: "İllüstrasyon: bir stadyumun tribünleri ve sahası",
    },
  },
  stadiums: {
    src: "/brand/expertise-stadium.jpg",
    alt: {
      fr: "Illustration : tribunes et pelouse d'un stade",
      en: "Illustration: stands and pitch of a stadium",
      tr: "İllüstrasyon: bir stadyumun tribünleri ve sahası",
    },
  },
  stadyumlar: {
    src: "/brand/expertise-stadium.jpg",
    alt: {
      fr: "Illustration : tribunes et pelouse d'un stade",
      en: "Illustration: stands and pitch of a stadium",
      tr: "İllüstrasyon: bir stadyumun tribünleri ve sahası",
    },
  },
  hopitaux: {
    src: "/brand/expertise-hospital.jpg",
    alt: {
      fr: "Illustration : façade d'un bâtiment hospitalier contemporain",
      en: "Illustration: facade of a contemporary hospital building",
      tr: "İllüstrasyon: çağdaş bir hastane binasının cephesi",
    },
  },
  hospitals: {
    src: "/brand/expertise-hospital.jpg",
    alt: {
      fr: "Illustration : façade d'un bâtiment hospitalier contemporain",
      en: "Illustration: facade of a contemporary hospital building",
      tr: "İllüstrasyon: çağdaş bir hastane binasının cephesi",
    },
  },
  hastaneler: {
    src: "/brand/expertise-hospital.jpg",
    alt: {
      fr: "Illustration : façade d'un bâtiment hospitalier contemporain",
      en: "Illustration: facade of a contemporary hospital building",
      tr: "İllüstrasyon: çağdaş bir hastane binasının cephesi",
    },
  },
  "villages-sportifs": {
    src: "/brand/expertise-sports-village.jpg",
    alt: {
      fr: "Illustration : piste d'athlétisme devant des résidences",
      en: "Illustration: athletics track in front of residential buildings",
      tr: "İllüstrasyon: konut binalarının önünde atletizm pisti",
    },
  },
  "sports-villages": {
    src: "/brand/expertise-sports-village.jpg",
    alt: {
      fr: "Illustration : piste d'athlétisme devant des résidences",
      en: "Illustration: athletics track in front of residential buildings",
      tr: "İllüstrasyon: konut binalarının önünde atletizm pisti",
    },
  },
  "spor-koyleri": {
    src: "/brand/expertise-sports-village.jpg",
    alt: {
      fr: "Illustration : piste d'athlétisme devant des résidences",
      en: "Illustration: athletics track in front of residential buildings",
      tr: "İllüstrasyon: konut binalarının önünde atletizm pisti",
    },
  },
  logements: {
    src: "/brand/expertise-housing.jpg",
    alt: {
      fr: "Illustration : immeubles de logements avec balcons",
      en: "Illustration: housing blocks with balconies",
      tr: "İllüstrasyon: balkonlu konut blokları",
    },
  },
  housing: {
    src: "/brand/expertise-housing.jpg",
    alt: {
      fr: "Illustration : immeubles de logements avec balcons",
      en: "Illustration: housing blocks with balconies",
      tr: "İllüstrasyon: balkonlu konut blokları",
    },
  },
  lojmanlar: {
    src: "/brand/expertise-housing.jpg",
    alt: {
      fr: "Illustration : immeubles de logements avec balcons",
      en: "Illustration: housing blocks with balconies",
      tr: "İllüstrasyon: balkonlu konut blokları",
    },
  },
};

function image(src: string, alt: string, width: number, height: number): ResolvedImage {
  return { src, alt, width, height, caption: null, isDemo: false };
}

export function promoHero(locale: Locale): ResolvedImage {
  return image("/brand/hero-stadium.jpg", {
    fr: "Illustration : stade moderne illuminé au crépuscule",
    en: "Illustration: modern stadium lit at dusk",
    tr: "İllüstrasyon: alacakaranlıkta ışıklandırılmış modern stadyum",
  }[locale], 1280, 720);
}

export function promoCta(locale: Locale): ResolvedImage {
  return image("/brand/cta-construction.jpg", {
    fr: "Illustration : chantier et structure contemporaine",
    en: "Illustration: construction site and contemporary structure",
    tr: "İllüstrasyon: şantiye ve çağdaş yapı",
  }[locale], 1280, 720);
}

export function promoForExpertiseSlug(slug: string, locale: Locale): ResolvedImage | null {
  const entry = EXPERTISE_BY_SLUG[slug];
  if (!entry) return null;
  return image(entry.src, entry.alt[locale], 1152, 864);
}
