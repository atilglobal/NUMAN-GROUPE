import type { Localized } from "../../i18n/config";
import type { ProjectStatus } from "../schema";

/*
 * Demo-only data. Every image is a generated illustration, not a NUMAN GROUPE
 * photograph; every entry is titled "Exemple" and flagged isDemo. Refused when
 * demo content is disabled (SITE_ENV=production always disables it).
 */

export type DemoImageSeed = {
  key: string;
  storageKey: string;
  width: number;
  height: number;
  byteSize: number;
  alt: Localized;
  caption?: Localized;
};

export const demoImages = {
  hero: {
    key: "hero",
    storageKey: "demo/hero-stadium.jpg",
    width: 1280,
    height: 720,
    byteSize: 335385,
    alt: {
      fr: "Illustration : stade moderne illuminé au crépuscule, en bord de ville",
      en: "Illustration: modern stadium lit at dusk on the edge of a city",
      tr: "İllüstrasyon: alacakaranlıkta ışıklandırılmış, şehir kenarında modern stadyum",
    },
  },
  stadium: {
    key: "stadium",
    storageKey: "demo/expertise-stadium.jpg",
    width: 1152,
    height: 864,
    byteSize: 380628,
    alt: {
      fr: "Illustration : tribunes et pelouse d'un stade",
      en: "Illustration: stands and pitch of a stadium",
      tr: "İllüstrasyon: bir stadyumun tribünleri ve sahası",
    },
  },
  hospital: {
    key: "hospital",
    storageKey: "demo/expertise-hospital.jpg",
    width: 1152,
    height: 864,
    byteSize: 350922,
    alt: {
      fr: "Illustration : façade d'un bâtiment hospitalier contemporain",
      en: "Illustration: facade of a contemporary hospital building",
      tr: "İllüstrasyon: çağdaş bir hastane binasının cephesi",
    },
  },
  sportsVillage: {
    key: "sportsVillage",
    storageKey: "demo/expertise-sports-village.jpg",
    width: 1152,
    height: 864,
    byteSize: 428060,
    alt: {
      fr: "Illustration : piste d'athlétisme devant des résidences",
      en: "Illustration: athletics track in front of residential buildings",
      tr: "İllüstrasyon: konut binalarının önünde atletizm pisti",
    },
  },
  housing: {
    key: "housing",
    storageKey: "demo/expertise-housing.jpg",
    width: 1152,
    height: 864,
    byteSize: 458914,
    alt: {
      fr: "Illustration : immeubles de logements avec balcons et palmiers",
      en: "Illustration: housing blocks with balconies and palm trees",
      tr: "İllüstrasyon: balkonlu ve palmiyeli konut blokları",
    },
  },
  meetingRoom: {
    key: "meetingRoom",
    storageKey: "demo/visit-meeting-room.jpg",
    width: 1152,
    height: 864,
    byteSize: 316519,
    alt: {
      fr: "Illustration : salle de réunion institutionnelle vide",
      en: "Illustration: empty institutional meeting room",
      tr: "İllüstrasyon: boş bir kurumsal toplantı salonu",
    },
    caption: {
      fr: "Illustration générée : salle vide, sans personne identifiable.",
      en: "Generated illustration: empty room, no identifiable person.",
      tr: "Üretilmiş illüstrasyon: boş salon, tanınabilir kişi yok.",
    },
  },
  institution: {
    key: "institution",
    storageKey: "demo/visit-institution.jpg",
    width: 1152,
    height: 864,
    byteSize: 378385,
    alt: {
      fr: "Illustration : bâtiment institutionnel à colonnade",
      en: "Illustration: institutional building with a colonnade",
      tr: "İllüstrasyon: sütunlu kurumsal bina",
    },
    caption: {
      fr: "Illustration générée : façade d'un bâtiment public générique.",
      en: "Generated illustration: facade of a generic public building.",
      tr: "Üretilmiş illüstrasyon: genel bir kamu binası cephesi.",
    },
  },
  construction: {
    key: "construction",
    storageKey: "demo/cta-construction.jpg",
    width: 1280,
    height: 720,
    byteSize: 247422,
    alt: {
      fr: "Illustration : chantier avec grues au coucher du soleil",
      en: "Illustration: construction site with cranes at sunset",
      tr: "İllüstrasyon: gün batımında vinçli şantiye",
    },
  },
} satisfies Record<string, DemoImageSeed>;

export type DemoImageKey = keyof typeof demoImages;

/** Base expertise (by French slug) that receives a demo cover illustration. */
export const demoExpertiseCovers: Record<string, DemoImageKey> = {
  stades: "stadium",
  hopitaux: "hospital",
  "villages-sportifs": "sportsVillage",
  logements: "housing",
};

export type DemoProjectSeed = {
  status: ProjectStatus;
  expertiseSlugFr: string;
  isFeatured: boolean;
  sortOrder: number;
  cover: DemoImageKey;
  slug: Localized;
  title: Localized;
};

export const demoProjects: DemoProjectSeed[] = [
  {
    status: "in_progress",
    expertiseSlugFr: "stades",
    isFeatured: true,
    sortOrder: 10,
    cover: "stadium",
    slug: { fr: "exemple-complexe-sportif", en: "example-sports-complex", tr: "ornek-spor-kompleksi" },
    title: {
      fr: "Exemple — complexe sportif",
      en: "Example — sports complex",
      tr: "Örnek — spor kompleksi",
    },
  },
  {
    status: "completed",
    expertiseSlugFr: "hopitaux",
    isFeatured: true,
    sortOrder: 20,
    cover: "hospital",
    slug: {
      fr: "exemple-etablissement-hospitalier",
      en: "example-hospital-facility",
      tr: "ornek-hastane-tesisi",
    },
    title: {
      fr: "Exemple — établissement hospitalier",
      en: "Example — hospital facility",
      tr: "Örnek — hastane tesisi",
    },
  },
  {
    status: "in_progress",
    expertiseSlugFr: "logements",
    isFeatured: true,
    sortOrder: 30,
    cover: "housing",
    slug: {
      fr: "exemple-programme-de-logements",
      en: "example-housing-programme",
      tr: "ornek-lojman-programi",
    },
    title: {
      fr: "Exemple — programme de logements",
      en: "Example — housing programme",
      tr: "Örnek — lojman programı",
    },
  },
  {
    status: "completed",
    expertiseSlugFr: "villages-sportifs",
    isFeatured: false,
    sortOrder: 40,
    cover: "sportsVillage",
    slug: { fr: "exemple-village-sportif", en: "example-sports-village", tr: "ornek-spor-koyu" },
    title: {
      fr: "Exemple — village sportif",
      en: "Example — sports village",
      tr: "Örnek — spor köyü",
    },
  },
];

export type DemoVisitSeed = {
  isFeatured: boolean;
  visitedOn: string;
  countryCode: string;
  cover: DemoImageKey;
  gallery: DemoImageKey[];
  slug: Localized;
  title: Localized;
  host: Localized;
  location: Localized;
  summary: Localized;
  body: Localized;
};

export const demoVisits: DemoVisitSeed[] = [
  {
    isFeatured: true,
    visitedOn: "2024-11-18",
    countryCode: "FR",
    cover: "meetingRoom",
    gallery: ["institution"],
    slug: {
      fr: "exemple-rencontre-institutionnelle",
      en: "example-institutional-meeting",
      tr: "ornek-kurumsal-gorusme",
    },
    title: {
      fr: "Exemple — rencontre institutionnelle",
      en: "Example — institutional meeting",
      tr: "Örnek — kurumsal görüşme",
    },
    host: { fr: "Institution (exemple)", en: "Institution (example)", tr: "Kurum (örnek)" },
    location: { fr: "Paris", en: "Paris", tr: "Paris" },
    summary: {
      fr: "Exemple de fiche : présentation du groupe lors d'une rencontre. Aucun partenariat n'est impliqué.",
      en: "Sample record: a group presentation during a meeting. No partnership is implied.",
      tr: "Örnek kayıt: bir görüşmede grup tanıtımı. Ortaklık ima edilmez.",
    },
    body: {
      fr: "Cette fiche démo décrit une visite à titre informatif. Elle n'indique ni soutien de l'État, ni attribution de marché, ni homologation.",
      en: "This demo record describes a visit for information only. It does not indicate state support, a contract award or an endorsement.",
      tr: "Bu demo kayıt ziyareti yalnızca bilgilendirme amacıyla anlatır. Devlet desteği, ihale veya onay anlamına gelmez.",
    },
  },
  {
    isFeatured: false,
    visitedOn: "2023-06-02",
    countryCode: "SN",
    cover: "institution",
    gallery: ["meetingRoom"],
    slug: { fr: "exemple-visite-officielle", en: "example-official-visit", tr: "ornek-resmi-ziyaret" },
    title: {
      fr: "Exemple — visite officielle",
      en: "Example — official visit",
      tr: "Örnek — resmî ziyaret",
    },
    host: { fr: "Institution (exemple)", en: "Institution (example)", tr: "Kurum (örnek)" },
    location: { fr: "Dakar", en: "Dakar", tr: "Dakar" },
    summary: {
      fr: "Exemple de fiche : visite d'un bâtiment institutionnel. La photo est une illustration, pas un cliché officiel.",
      en: "Sample record: a visit to an institutional building. The image is an illustration, not an official photograph.",
      tr: "Örnek kayıt: kurumsal bir binaya ziyaret. Görsel illüstrasyondur, resmî fotoğraf değildir.",
    },
    body: {
      fr: "Les visites restent des visites. Cette entrée démo n'établit aucune alliance ni commande.",
      en: "Visits remain visits. This demo entry does not establish an alliance or a commission.",
      tr: "Ziyaret ziyaret olarak kalır. Bu demo kayıt ittifak veya sipariş oluşturmaz.",
    },
  },
];

export type DemoTeamSeed = {
  fullName: string;
  sortOrder: number;
  roleTitle: Localized;
  bio: Localized;
};

export const demoTeam: DemoTeamSeed[] = [
  {
    fullName: "Profil démo A",
    sortOrder: 10,
    roleTitle: { fr: "Direction", en: "Management", tr: "Yönetim" },
    bio: {
      fr: "Exemple de fiche : orientation stratégique du groupe.",
      en: "Sample profile: the group's strategic direction.",
      tr: "Örnek profil: grubun stratejik yönetimi.",
    },
  },
  {
    fullName: "Profil démo B",
    sortOrder: 20,
    roleTitle: { fr: "Ingénierie", en: "Engineering", tr: "Mühendislik" },
    bio: {
      fr: "Exemple de fiche : expertise technique des projets.",
      en: "Sample profile: technical expertise on projects.",
      tr: "Örnek profil: projelerin teknik uzmanlığı.",
    },
  },
  {
    fullName: "Profil démo C",
    sortOrder: 30,
    roleTitle: { fr: "Gestion de projets", en: "Project management", tr: "Proje yönetimi" },
    bio: {
      fr: "Exemple de fiche : pilotage et suivi des réalisations.",
      en: "Sample profile: steering and monitoring delivery.",
      tr: "Örnek profil: uygulamaların yönetimi ve takibi.",
    },
  },
];
