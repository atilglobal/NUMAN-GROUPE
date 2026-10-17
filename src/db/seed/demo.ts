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
  gallery: DemoImageKey[];
  slug: Localized;
  title: Localized;
  summary: Localized;
  body: Localized;
  seoTitle: Localized;
  seoDescription: Localized;
};

export const demoProjects: DemoProjectSeed[] = [
  {
    status: "in_progress",
    expertiseSlugFr: "stades",
    isFeatured: true,
    sortOrder: 10,
    cover: "stadium",
    gallery: ["construction"],
    slug: { fr: "exemple-stade-ouvert", en: "sample-open-stadium", tr: "ornek-acik-stadyum" },
    title: {
      fr: "Projet de démonstration — stade ouvert",
      en: "Sample project — open stadium",
      tr: "Örnek proje — açık stadyum",
    },
    summary: {
      fr: "Scénario démo : un stade de plein air, présenté pour montrer la fiche projet. Aucune jauge ni chantier réel.",
      en: "Demo scenario: an open-air stadium used to show the project sheet. No real capacity or site.",
      tr: "Demo senaryosu: proje kartını göstermek için açık stadyum. Gerçek kapasite veya şantiye yok.",
    },
    body: {
      fr: "Cette fiche décrit l’approche d’un stade ouvert : lecture des flux, structure des tribunes, accès et locaux de service. Le statut « en cours » appartient au scénario de démonstration. Aucun client, aucun contrat et aucune date de livraison réelle ne sont avancés. L’illustration n’est pas une photographie d’un ouvrage NUMAN GROUPE.",
      en: "This sheet describes the approach to an open stadium: flows, stand structure, access and service rooms. The “in progress” status belongs to the demonstration scenario. No client, contract or real handover date is claimed. The picture is not a photograph of a NUMAN GROUPE work.",
      tr: "Bu kart açık stadyum yaklaşımını anlatır: akışlar, tribün strüktürü, erişim ve servis mekânları. « Devam eden » durumu gösterim senaryosuna aittir. Müşteri, sözleşme veya gerçek teslim tarihi yoktur. Görsel bir NUMAN GROUPE fotoğrafı değildir.",
    },
    seoTitle: {
      fr: "Exemple — stade ouvert | NUMAN GROUPE",
      en: "Sample — open stadium | NUMAN GROUPE",
      tr: "Örnek — açık stadyum | NUMAN GROUPE",
    },
    seoDescription: {
      fr: "Projet de démonstration : stade ouvert. Contenu pédagogique, pas une référence livrée.",
      en: "Sample project: open stadium. Teaching content, not a delivered reference.",
      tr: "Örnek proje: açık stadyum. Öğretici içerik, teslim edilmiş referans değil.",
    },
  },
  {
    status: "completed",
    expertiseSlugFr: "stades",
    isFeatured: true,
    sortOrder: 20,
    cover: "stadium",
    gallery: ["hero"],
    slug: { fr: "exemple-stade-couvert", en: "sample-covered-stadium", tr: "ornek-kapali-stadyum" },
    title: {
      fr: "Projet de démonstration — stade couvert",
      en: "Sample project — covered stadium",
      tr: "Örnek proje — kapalı stadyum",
    },
    summary: {
      fr: "Scénario démo : un stade couvert pour illustrer le filtre « terminé ». Aucune réception réelle.",
      en: "Demo scenario: a covered stadium to illustrate the “completed” filter. No real reception.",
      tr: "Demo senaryosu: « tamamlanan » filtresini göstermek için kapalı stadyum. Gerçek kabul yok.",
    },
    body: {
      fr: "Le scénario couvert insiste sur l’enveloppe, le confort et les locaux d’hospitalité. L’état « terminé » est une donnée de démonstration pour tester les filtres publics. Il ne décrit pas une mise en service. Les images sont des illustrations générées.",
      en: "The covered scenario stresses envelope, comfort and hospitality rooms. “Completed” is demonstration data for public filters. It does not describe commissioning. Images are generated illustrations.",
      tr: "Kapalı senaryo kabuk, konfor ve ağırlama mekânlarını vurgular. « Tamamlandı » public filtreler için gösterim verisidir; devreye almayı anlatmaz. Görseller üretilmiş illüstrasyonlardır.",
    },
    seoTitle: {
      fr: "Exemple — stade couvert | NUMAN GROUPE",
      en: "Sample — covered stadium | NUMAN GROUPE",
      tr: "Örnek — kapalı stadyum | NUMAN GROUPE",
    },
    seoDescription: {
      fr: "Projet de démonstration : stade couvert, statut fictif « terminé ».",
      en: "Sample project: covered stadium, fictional “completed” status.",
      tr: "Örnek proje: kapalı stadyum, kurgusal « tamamlandı » durumu.",
    },
  },
  {
    status: "in_progress",
    expertiseSlugFr: "hopitaux",
    isFeatured: true,
    sortOrder: 30,
    cover: "hospital",
    gallery: ["construction"],
    slug: {
      fr: "exemple-hopital-campus",
      en: "sample-hospital-campus",
      tr: "ornek-hastane-kampusu",
    },
    title: {
      fr: "Projet de démonstration — campus hospitalier",
      en: "Sample project — hospital campus",
      tr: "Örnek proje — hastane kampüsü",
    },
    summary: {
      fr: "Scénario démo : campus de soins pour montrer la coordination des flux. Aucun lit annoncé.",
      en: "Demo scenario: a care campus to show flow coordination. No bed count is stated.",
      tr: "Demo senaryosu: akış koordinasyonunu göstermek için bakım kampüsü. Yatak sayısı yok.",
    },
    body: {
      fr: "La fiche campus sépare les circuits public, soignant et technique. Le statut « en cours » est un exemple de filtre. Aucun établissement nommé, aucune capacité et aucun agrément ne sont cités. L’illustration n’est pas un hôpital livré par NUMAN GROUPE.",
      en: "The campus sheet separates public, clinical and technical circuits. “In progress” is a filter example. No named facility, capacity or approval is cited. The illustration is not a hospital delivered by NUMAN GROUPE.",
      tr: "Kampüs kartı kamu, klinik ve teknik devreleri ayırır. « Devam eden » bir filtre örneğidir. Adlı tesis, kapasite veya ruhsat yoktur. Görsel NUMAN GROUPE’un teslim ettiği bir hastane değildir.",
    },
    seoTitle: {
      fr: "Exemple — campus hospitalier | NUMAN GROUPE",
      en: "Sample — hospital campus | NUMAN GROUPE",
      tr: "Örnek — hastane kampüsü | NUMAN GROUPE",
    },
    seoDescription: {
      fr: "Projet de démonstration : campus hospitalier, sans capacité inventée.",
      en: "Sample project: hospital campus, no invented capacity.",
      tr: "Örnek proje: hastane kampüsü, uydurma kapasite yok.",
    },
  },
  {
    status: "completed",
    expertiseSlugFr: "hopitaux",
    isFeatured: false,
    sortOrder: 40,
    cover: "hospital",
    gallery: ["hospital"],
    slug: {
      fr: "exemple-hopital-consultations",
      en: "sample-outpatient-hospital",
      tr: "ornek-poliklinik-hastanesi",
    },
    title: {
      fr: "Projet de démonstration — bâtiment de consultations",
      en: "Sample project — outpatient building",
      tr: "Örnek proje — poliklinik binası",
    },
    summary: {
      fr: "Scénario démo : un bâtiment de consultations pour le filtre « terminé ». Aucune mise en service réelle.",
      en: "Demo scenario: an outpatient building for the “completed” filter. No real commissioning.",
      tr: "Demo senaryosu: « tamamlanan » filtresi için poliklinik binası. Gerçek devreye alma yok.",
    },
    body: {
      fr: "L’exemple insiste sur l’accueil, les salles d’attente et la séparation des flux. Le statut « terminé » sert uniquement à peupler la liste publique. Ce n’est pas l’annonce d’un hôpital ouvert.",
      en: "The example stresses reception, waiting rooms and separated flows. “Completed” only fills the public list. It is not the announcement of an open hospital.",
      tr: "Örnek karşılama, bekleme ve ayrılmış akışları vurgular. « Tamamlandı » yalnızca public listeyi doldurur; açık bir hastane duyurusu değildir.",
    },
    seoTitle: {
      fr: "Exemple — consultations | NUMAN GROUPE",
      en: "Sample — outpatient building | NUMAN GROUPE",
      tr: "Örnek — poliklinik | NUMAN GROUPE",
    },
    seoDescription: {
      fr: "Projet de démonstration : bâtiment de consultations.",
      en: "Sample project: outpatient building.",
      tr: "Örnek proje: poliklinik binası.",
    },
  },
  {
    status: "in_progress",
    expertiseSlugFr: "villages-sportifs",
    isFeatured: true,
    sortOrder: 50,
    cover: "sportsVillage",
    gallery: ["housing"],
    slug: { fr: "exemple-village-sportif", en: "sample-sports-village", tr: "ornek-spor-koyu" },
    title: {
      fr: "Projet de démonstration — village sportif",
      en: "Sample project — sports village",
      tr: "Örnek proje — spor köyü",
    },
    summary: {
      fr: "Scénario démo : un campus d’entraînement. Aucun événement réel n’est associé.",
      en: "Demo scenario: a training campus. No real event is attached.",
      tr: "Demo senaryosu: antrenman kampüsü. Gerçek etkinlik bağlanmaz.",
    },
    body: {
      fr: "Le village d’exemple relie salles, hébergement et espaces de récupération. Aucune délégation, aucun calendrier officiel et aucune jauge ne sont cités. L’état « en cours » est un scénario de démonstration.",
      en: "The sample village links halls, lodging and recovery spaces. No delegation, official timetable or capacity is cited. “In progress” is a demonstration scenario.",
      tr: "Örnek köy salon, konaklama ve toparlanma alanlarını bağlar. Delegasyon, resmî takvim veya kapasite yoktur. « Devam eden » bir gösterim senaryosudur.",
    },
    seoTitle: {
      fr: "Exemple — village sportif | NUMAN GROUPE",
      en: "Sample — sports village | NUMAN GROUPE",
      tr: "Örnek — spor köyü | NUMAN GROUPE",
    },
    seoDescription: {
      fr: "Projet de démonstration : village sportif, sans événement réel.",
      en: "Sample project: sports village, no real event.",
      tr: "Örnek proje: spor köyü, gerçek etkinlik yok.",
    },
  },
  {
    status: "completed",
    expertiseSlugFr: "logements",
    isFeatured: true,
    sortOrder: 60,
    cover: "housing",
    gallery: ["construction"],
    slug: {
      fr: "exemple-campus-residentiel",
      en: "sample-residential-campus",
      tr: "ornek-lojman-yerleskesi",
    },
    title: {
      fr: "Projet de démonstration — campus résidentiel",
      en: "Sample project — residential campus",
      tr: "Örnek proje — lojman yerleşkesi",
    },
    summary: {
      fr: "Scénario démo : logements de fonction et espaces communs. Aucune capacité habitée.",
      en: "Demo scenario: staff housing and shared spaces. No occupied capacity.",
      tr: "Demo senaryosu: lojman ve ortak alanlar. Dolu kapasite yok.",
    },
    body: {
      fr: "La fiche décrit un tissu habité : logements, voiries internes et locaux communs. Le statut « terminé » est un exemple de filtre. Aucun maître d’ouvrage, aucun volume de logements et aucune date de livraison réelle ne sont indiqués.",
      en: "The sheet describes inhabited fabric: dwellings, internal roads and shared rooms. “Completed” is a filter example. No client, dwelling count or real handover date is given.",
      tr: "Kart yaşanan bir dokuyu anlatır: konutlar, iç yollar ve ortak mekânlar. « Tamamlandı » bir filtre örneğidir. İşveren, konut adedi veya gerçek teslim tarihi yoktur.",
    },
    seoTitle: {
      fr: "Exemple — campus résidentiel | NUMAN GROUPE",
      en: "Sample — residential campus | NUMAN GROUPE",
      tr: "Örnek — lojman yerleşkesi | NUMAN GROUPE",
    },
    seoDescription: {
      fr: "Projet de démonstration : campus résidentiel / logements de fonction.",
      en: "Sample project: residential campus / staff housing.",
      tr: "Örnek proje: lojman yerleşkesi.",
    },
  },
];

export type DemoVisitSeed = {
  isFeatured: boolean;
  visitedOn: string;
  cover: DemoImageKey;
  gallery: DemoImageKey[];
  slug: Localized;
  title: Localized;
  host: Localized;
  location: Localized;
  summary: Localized;
  body: Localized;
  seoTitle: Localized;
  seoDescription: Localized;
};

export const demoVisits: DemoVisitSeed[] = [
  {
    isFeatured: true,
    visitedOn: "2024-03-12",
    cover: "meetingRoom",
    gallery: ["institution"],
    slug: {
      fr: "exemple-rencontre-de-presentation",
      en: "sample-introductory-meeting",
      tr: "ornek-tanisma-toplantisi",
    },
    title: {
      fr: "Contenu d’exemple — rencontre de présentation",
      en: "Sample content — introductory meeting",
      tr: "Örnek içerik — tanışma toplantısı",
    },
    host: {
      fr: "Hôte non identifié (scénario)",
      en: "Unnamed host (scenario)",
      tr: "Adlandırılmamış ev sahibi (senaryo)",
    },
    location: {
      fr: "Salle de réunion (lieu de démonstration, non localisé)",
      en: "Meeting room (demonstration place, not a real address)",
      tr: "Toplantı salonu (gösterim mekânı, gerçek adres değil)",
    },
    summary: {
      fr: "Scénario : une première présentation du Groupe. Aucune institution réelle n’est nommée.",
      en: "Scenario: a first presentation of the Group. No real institution is named.",
      tr: "Senaryo: Grubun ilk tanıtımı. Gerçek kurum adı yoktur.",
    },
    body: {
      fr: "Cette fiche montre le gabarit d’une visite institutionnelle. Elle n’identifie ni président, ni ministre, ni administration. Une visite reste une visite : ce n’est ni un partenariat, ni un soutien de l’État, ni une commande. Les images sont des illustrations de salles vides.",
      en: "This sheet shows the layout of an institutional visit. It names no president, minister or administration. A visit remains a visit: not a partnership, state support or commission. Images are illustrations of empty rooms.",
      tr: "Bu kart resmî ziyaret düzenini gösterir. Cumhurbaşkanı, bakan veya idare adı yoktur. Ziyaret ziyarettir: ortaklık, devlet desteği veya sipariş değildir. Görseller boş salon illüstrasyonlarıdır.",
    },
    seoTitle: {
      fr: "Exemple — rencontre de présentation | NUMAN GROUPE",
      en: "Sample — introductory meeting | NUMAN GROUPE",
      tr: "Örnek — tanışma toplantısı | NUMAN GROUPE",
    },
    seoDescription: {
      fr: "Contenu d’exemple : rencontre de présentation, sans institution réelle.",
      en: "Sample content: introductory meeting, no real institution.",
      tr: "Örnek içerik: tanışma toplantısı, gerçek kurum yok.",
    },
  },
  {
    isFeatured: true,
    visitedOn: "2024-07-04",
    cover: "institution",
    gallery: ["meetingRoom"],
    slug: {
      fr: "exemple-entretien-devaluation",
      en: "sample-project-review-meeting",
      tr: "ornek-proje-degerlendirme",
    },
    title: {
      fr: "Contenu d’exemple — entretien d’évaluation",
      en: "Sample content — project review meeting",
      tr: "Örnek içerik — proje değerlendirme görüşmesi",
    },
    host: {
      fr: "Hôte non identifié (scénario)",
      en: "Unnamed host (scenario)",
      tr: "Adlandırılmamış ev sahibi (senaryo)",
    },
    location: {
      fr: "Bâtiment public générique (illustration, non localisé)",
      en: "Generic public building (illustration, not a real address)",
      tr: "Genel kamu binası (illüstrasyon, gerçek adres değil)",
    },
    summary: {
      fr: "Scénario : un échange sur un programme d’équipement. Aucun marché n’est évoqué.",
      en: "Scenario: a discussion of a facility brief. No contract is implied.",
      tr: "Senaryo: bir tesis programı üzerine görüşme. İhale ima edilmez.",
    },
    body: {
      fr: "L’entretien d’exemple sert à montrer comment relater un échange technique. Il n’attribue aucun rôle d’État et n’identifie aucun interlocuteur réel. Les photographies ne sont pas des clichés officiels.",
      en: "The sample review shows how to record a technical exchange. It assigns no state role and names no real counterpart. Photographs are not official stills.",
      tr: "Örnek görüşme teknik bir alışverişin nasıl anlatılacağını gösterir. Devlet rolü atamaz, gerçek muhatap adlandırmaz. Fotoğraflar resmî kareler değildir.",
    },
    seoTitle: {
      fr: "Exemple — entretien d’évaluation | NUMAN GROUPE",
      en: "Sample — project review | NUMAN GROUPE",
      tr: "Örnek — proje değerlendirme | NUMAN GROUPE",
    },
    seoDescription: {
      fr: "Contenu d’exemple : entretien d’évaluation de projet.",
      en: "Sample content: project review meeting.",
      tr: "Örnek içerik: proje değerlendirme görüşmesi.",
    },
  },
  {
    isFeatured: false,
    visitedOn: "2025-01-21",
    cover: "meetingRoom",
    gallery: ["construction"],
    slug: {
      fr: "exemple-visite-de-coordination",
      en: "sample-coordination-visit",
      tr: "ornek-teknik-koordinasyon",
    },
    title: {
      fr: "Contenu d’exemple — visite de coordination technique",
      en: "Sample content — technical coordination visit",
      tr: "Örnek içerik — teknik koordinasyon ziyareti",
    },
    host: {
      fr: "Hôte non identifié (scénario)",
      en: "Unnamed host (scenario)",
      tr: "Adlandırılmamış ev sahibi (senaryo)",
    },
    location: {
      fr: "Salle de travail (lieu de démonstration, non localisé)",
      en: "Work room (demonstration place, not a real address)",
      tr: "Çalışma salonu (gösterim mekânı, gerçek adres değil)",
    },
    summary: {
      fr: "Scénario : une visite de coordination d’interfaces. Aucun chantier réel n’est identifié.",
      en: "Scenario: an interface coordination visit. No real site is identified.",
      tr: "Senaryo: arayüz koordinasyon ziyareti. Gerçek şantiye yoktur.",
    },
    body: {
      fr: "Cette entrée décrit une visite de coordination : lots, interfaces, points ouverts. Elle n’établit aucune alliance et n’utilise aucune image de responsable public.",
      en: "This entry describes a coordination visit: packages, interfaces, open points. It establishes no alliance and uses no image of a public official.",
      tr: "Bu kayıt koordinasyon ziyaretini anlatır: iş paketleri, arayüzler, açık maddeler. İttifak kurmaz ve kamu yetkilisi görseli kullanmaz.",
    },
    seoTitle: {
      fr: "Exemple — coordination technique | NUMAN GROUPE",
      en: "Sample — technical coordination | NUMAN GROUPE",
      tr: "Örnek — teknik koordinasyon | NUMAN GROUPE",
    },
    seoDescription: {
      fr: "Contenu d’exemple : visite de coordination technique.",
      en: "Sample content: technical coordination visit.",
      tr: "Örnek içerik: teknik koordinasyon ziyareti.",
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
    fullName: "Poste — direction générale",
    sortOrder: 10,
    roleTitle: { fr: "Direction générale", en: "General management", tr: "Genel yönetim" },
    bio: {
      fr: "Fiche de poste provisoire. Les noms et biographies seront mis à jour. Aucun portrait n’est publié.",
      en: "Provisional role card. Names and biographies will be updated. No portrait is published.",
      tr: "Geçici görev kartı. Kadro bilgileri güncellenecek. Portre yayımlanmaz.",
    },
  },
  {
    fullName: "Poste — coordination de projet",
    sortOrder: 20,
    roleTitle: { fr: "Coordination de projet", en: "Project coordination", tr: "Proje koordinasyonu" },
    bio: {
      fr: "Fiche de poste provisoire. Les noms et biographies seront mis à jour. Aucun portrait n’est publié.",
      en: "Provisional role card. Names and biographies will be updated. No portrait is published.",
      tr: "Geçici görev kartı. Kadro bilgileri güncellenecek. Portre yayımlanmaz.",
    },
  },
  {
    fullName: "Poste — direction technique",
    sortOrder: 30,
    roleTitle: { fr: "Direction technique", en: "Technical management", tr: "Teknik yönetim" },
    bio: {
      fr: "Fiche de poste provisoire. Les noms et biographies seront mis à jour. Aucun portrait n’est publié.",
      en: "Provisional role card. Names and biographies will be updated. No portrait is published.",
      tr: "Geçici görev kartı. Kadro bilgileri güncellenecek. Portre yayımlanmaz.",
    },
  },
  {
    fullName: "Poste — développement international",
    sortOrder: 40,
    roleTitle: {
      fr: "Développement international",
      en: "International business development",
      tr: "Uluslararası iş geliştirme",
    },
    bio: {
      fr: "Fiche de poste provisoire. Les noms et biographies seront mis à jour. Aucun portrait n’est publié.",
      en: "Provisional role card. Names and biographies will be updated. No portrait is published.",
      tr: "Geçici görev kartı. Kadro bilgileri güncellenecek. Portre yayımlanmaz.",
    },
  },
];
