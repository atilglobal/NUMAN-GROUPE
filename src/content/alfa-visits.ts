import type { Locale } from "@/i18n/config";
import { ALFA_VISITS_REST } from "./alfa-visits-rest";

export type AlfaPhoto = {
  file: string;
  sourceCaption: string;
  caption: Record<Locale, string>;
  alt: Record<Locale, string>;
};

export type AlfaVisit = {
  key: string;
  published: boolean;
  countryCode: string | null;
  city: Record<Locale, string>;
  host: Record<Locale, string>;
  title: Record<Locale, string>;
  summary: Record<Locale, string>;
  body: Record<Locale, string>;
  seoTitle: Record<Locale, string>;
  seoDescription: Record<Locale, string>;
  slug: Record<Locale, string>;
  photos: AlfaPhoto[];
  participants: { fullName: string; role: Record<Locale, string> }[];
  notes: string;
};

export const ALFA_HQ_PHOTO: AlfaPhoto = {
  file: "image26.jpeg",
  sourceCaption: "PDG de Numan Groupe au siège de Numan Groupe international à ANTALYA",
  caption: {
    fr: "M. Numan Hatipoglu, PDG, au siège de Numan Groupe International à Antalya.",
    en: "Mr Numan Hatipoglu, CEO, at the Numan Groupe International headquarters in Antalya.",
    tr: "Numan Groupe International Antalya merkezinde PDG Numan Hatipoglu.",
  },
  alt: {
    fr: "Homme à un bureau dans un bureau à Antalya, présenté comme le siège de Numan Groupe International.",
    en: "Man at a desk in an office in Antalya, presented as the Numan Groupe International headquarters.",
    tr: "Antalya’da bir ofis masasında oturan kişi; belgeye göre Numan Groupe International merkezi.",
  },
};

function photo(
  file: string,
  sourceCaption: string,
  caption: Record<Locale, string>,
  alt: Record<Locale, string>,
): AlfaPhoto {
  return { file, sourceCaption, caption, alt };
}

export const ALFA_VISITS_PRIMARY: AlfaVisit[] = [
  {
    key: "bamako-premier-ministre",
    published: true,
    countryCode: "ML",
    city: { fr: "Bamako", en: "Bamako", tr: "Bamako" },
    host: {
      fr: "Premier ministre du Mali",
      en: "Prime Minister of Mali",
      tr: "Mali Başbakanı",
    },
    slug: {
      fr: "bamako-premier-ministre-choguelle-maiga",
      en: "bamako-prime-minister-choguelle-maiga",
      tr: "bamako-basbakan-choguelle-maiga",
    },
    title: {
      fr: "Séjour de travail à Bamako auprès du Premier ministre du Mali",
      en: "Working stay in Bamako with the Prime Minister of Mali",
      tr: "Mali Başbakanı ile Bamako’da çalışma ziyareti",
    },
    summary: {
      fr: "M. Numan Hatipoglu, PDG de Numan Groupe International, à Bamako avec le Premier ministre du Mali, Dr Choguelle Maiga, et l’artiste Salif Keita, alors conseiller spécial.",
      en: "Mr Numan Hatipoglu, CEO of Numan Groupe International, in Bamako with the Prime Minister of Mali, Dr Choguelle Maiga, and the artist Salif Keita, then special adviser.",
      tr: "Numan Groupe International PDG’si Numan Hatipoglu, Bamako’da Mali Başbakanı Dr Choguelle Maiga ve o dönem özel danışman olan sanatçı Salif Keita ile.",
    },
    body: {
      fr: "Photographies d’un séjour de travail à Bamako. Les légendes nomment le Premier ministre du Mali, Dr Choguelle Maiga, et Salif Keita, conseiller spécial. Aucune date n’est indiquée dans le document source.",
      en: "Photographs of a working stay in Bamako. The captions name the Prime Minister of Mali, Dr Choguelle Maiga, and Salif Keita, special adviser. The source document gives no date.",
      tr: "Bamako’da bir çalışma ziyaretinin fotoğrafları. Açıklamalarda Mali Başbakanı Dr Choguelle Maiga ve özel danışman Salif Keita anılır. Kaynak belgede tarih yoktur.",
    },
    seoTitle: {
      fr: "Bamako — visite auprès du Premier ministre du Mali",
      en: "Bamako — visit with the Prime Minister of Mali",
      tr: "Bamako — Mali Başbakanı ile ziyaret",
    },
    seoDescription: {
      fr: "Visite de travail à Bamako auprès du Premier ministre du Mali, relatée d’après les légendes photographiques.",
      en: "Working visit in Bamako with the Prime Minister of Mali, recorded from the photograph captions.",
      tr: "Fotoğraf açıklamalarına göre Bamako’da Mali Başbakanı ile çalışma ziyareti.",
    },
    photos: [
      photo(
        "image1.jpeg",
        "Mr Numan PDG de Numan Groupe Internationale en séjour de travail à Bamako avec le Premier Ministre du Mali Dr Choguelle Maiga et l’artiste international Salif Keita, Conseiller Spé",
        {
          fr: "Séjour de travail à Bamako avec le Premier ministre du Mali, Dr Choguelle Maiga, et Salif Keita, conseiller spécial.",
          en: "Working stay in Bamako with the Prime Minister of Mali, Dr Choguelle Maiga, and Salif Keita, special adviser.",
          tr: "Bamako’da Mali Başbakanı Dr Choguelle Maiga ve özel danışman Salif Keita ile çalışma ziyareti.",
        },
        {
          fr: "Trois personnes posant à Bamako, d’après la légende : le PDG de Numan Groupe, le Premier ministre du Mali et Salif Keita.",
          en: "Three people posing in Bamako, according to the caption: the CEO of Numan Groupe, the Prime Minister of Mali and Salif Keita.",
          tr: "Açıklamaya göre Bamako’da poz veren üç kişi: Numan Groupe PDG’si, Mali Başbakanı ve Salif Keita.",
        },
      ),
      photo(
        "image2.jpeg",
        "Mr Numan Hatipoglu PDG de Numan Groupe et le Premier Ministre du Mali DR Choguelle Maiga à Bamako",
        {
          fr: "M. Numan Hatipoglu, PDG de Numan Groupe, et le Premier ministre du Mali, Dr Choguelle Maiga, à Bamako.",
          en: "Mr Numan Hatipoglu, CEO of Numan Groupe, and the Prime Minister of Mali, Dr Choguelle Maiga, in Bamako.",
          tr: "Numan Groupe PDG’si Numan Hatipoglu ve Mali Başbakanı Dr Choguelle Maiga, Bamako.",
        },
        {
          fr: "Deux hommes se serrant la main à Bamako, d’après la légende le PDG de Numan Groupe et le Premier ministre du Mali.",
          en: "Two men shaking hands in Bamako, according to the caption the CEO of Numan Groupe and the Prime Minister of Mali.",
          tr: "Açıklamaya göre Bamako’da el sıkışan iki kişi: Numan Groupe PDG’si ve Mali Başbakanı.",
        },
      ),
    ],
    participants: [
      { fullName: "Numan Hatipoglu", role: { fr: "PDG de Numan Groupe International", en: "CEO of Numan Groupe International", tr: "Numan Groupe International PDG’si" } },
      { fullName: "Choguelle Maiga", role: { fr: "Premier ministre du Mali", en: "Prime Minister of Mali", tr: "Mali Başbakanı" } },
      { fullName: "Salif Keita", role: { fr: "Conseiller spécial", en: "Special adviser", tr: "Özel danışman" } },
    ],
    notes: "Deux photos du même séjour à Bamako, légendes convergentes.",
  },
  {
    key: "gabon-jeunesse-sports",
    published: true,
    countryCode: "GA",
    city: { fr: "Libreville", en: "Libreville", tr: "Libreville" },
    host: {
      fr: "Ministère de la Jeunesse et des Sports du Gabon",
      en: "Ministry of Youth and Sports of Gabon",
      tr: "Gabon Gençlik ve Spor Bakanlığı",
    },
    slug: {
      fr: "gabon-ministere-jeunesse-sports",
      en: "gabon-ministry-youth-sports",
      tr: "gabon-genclik-spor-bakanligi",
    },
    title: {
      fr: "Visite de travail au ministère de la Jeunesse et des Sports du Gabon",
      en: "Working visit to Gabon’s Ministry of Youth and Sports",
      tr: "Gabon Gençlik ve Spor Bakanlığı’nda çalışma ziyareti",
    },
    summary: {
      fr: "Photographies d’une visite de travail au Gabon auprès du ministre Paul Ulrich Kessany Zategwa, dont la signature d’un protocole d’accord et la remise d’un maillot de l’équipe nationale.",
      en: "Photographs of a working visit in Gabon with minister Paul Ulrich Kessany Zategwa, including the signing of a memorandum of understanding and the presentation of a national-team shirt.",
      tr: "Bakan Paul Ulrich Kessany Zategwa ile Gabon’da bir çalışma ziyaretinin fotoğrafları; protokol imzası ve millî takım formasının teslimi belgede anılır.",
    },
    body: {
      fr: "Les légendes décrivent une visite de travail au Gabon, avec M. Alpha Cissé, représentant Afrique de Numan Groupe, le ministre de la Jeunesse et des Sports et le lieutenant-colonel Loïc. Un protocole d’accord avec le ministère est photographié. Le document ne précise ni la date ni le contenu juridique du protocole.",
      en: "The captions describe a working visit in Gabon, with Mr Alpha Cissé, Africa representative of Numan Groupe, the minister of Youth and Sports and Lieutenant-Colonel Loïc. A memorandum with the ministry is photographed. The document does not give a date or the legal content of the memorandum.",
      tr: "Açıklamalar Gabon’da bir çalışma ziyaretini anlatır; Numan Groupe Afrika temsilcisi Alpha Cissé, Gençlik ve Spor Bakanı ve yarbay Loïc anılır. Bakanlıkla bir protokol fotoğraflanmıştır. Belgede tarih ve protokolün hukuki içeriği yoktur.",
    },
    seoTitle: {
      fr: "Gabon — ministère de la Jeunesse et des Sports",
      en: "Gabon — Ministry of Youth and Sports",
      tr: "Gabon — Gençlik ve Spor Bakanlığı",
    },
    seoDescription: {
      fr: "Visite de travail au ministère gabonais de la Jeunesse et des Sports, d’après les légendes du dossier photographique.",
      en: "Working visit to Gabon’s Ministry of Youth and Sports, from the photograph captions.",
      tr: "Fotoğraf açıklamalarına göre Gabon Gençlik ve Spor Bakanlığı’nda çalışma ziyareti.",
    },
    photos: [
      photo("image3.jpeg", "Signature du protocole d’accord entre Numan Groupe International et le Ministère de la Jeunesse et des Sports du Gabon", {
        fr: "Signature d’un protocole d’accord entre Numan Groupe International et le ministère de la Jeunesse et des Sports du Gabon.",
        en: "Signing of a memorandum of understanding between Numan Groupe International and Gabon’s Ministry of Youth and Sports.",
        tr: "Numan Groupe International ile Gabon Gençlik ve Spor Bakanlığı arasında bir protokolün imzası.",
      }, {
        fr: "Personnes autour d’une table signant un document, d’après la légende un protocole avec le ministère gabonais de la Jeunesse et des Sports.",
        en: "People at a table signing a document, according to the caption a memorandum with Gabon’s Ministry of Youth and Sports.",
        tr: "Açıklamaya göre Gabon Gençlik ve Spor Bakanlığı ile bir protokolün imzalandığı masa.",
      }),
      photo("image4.jpeg", "Mr le Ministre PAUL KESSANY et Mr Numan HATIPOGLU", {
        fr: "Le ministre Paul Kessany et M. Numan Hatipoglu.",
        en: "Minister Paul Kessany and Mr Numan Hatipoglu.",
        tr: "Bakan Paul Kessany ve Numan Hatipoglu.",
      }, {
        fr: "Deux hommes posant ensemble, d’après la légende le ministre Paul Kessany et Numan Hatipoglu.",
        en: "Two men posing together, according to the caption minister Paul Kessany and Numan Hatipoglu.",
        tr: "Açıklamaya göre Bakan Paul Kessany ve Numan Hatipoglu.",
      }),
      photo("image5.jpeg", "Visite de travail de Mr Numan PDG de Numan Groupe accompagné de Mr Alpha CISSE Représentant Afrique de Numan Groupe au Gabon accompagnés du Ministre de la jeunesse et des sports du", {
        fr: "Visite de travail au Gabon : M. Numan, PDG, M. Alpha Cissé, représentant Afrique, et le ministre de la Jeunesse et des Sports.",
        en: "Working visit in Gabon: Mr Numan, CEO, Mr Alpha Cissé, Africa representative, and the minister of Youth and Sports.",
        tr: "Gabon’da çalışma ziyareti: PDG Numan, Afrika temsilcisi Alpha Cissé ve Gençlik ve Spor Bakanı.",
      }, {
        fr: "Groupe en réunion au Gabon, d’après la légende le PDG, le représentant Afrique et le ministre des Sports.",
        en: "Group in a meeting in Gabon, according to the caption the CEO, the Africa representative and the sports minister.",
        tr: "Açıklamaya göre Gabon’da toplantı: PDG, Afrika temsilcisi ve spor bakanı.",
      }),
      photo("image28.jpeg", "Remise du maillot de l’équipe National du Gabon par le Ministre des Sports du Gabon Mr Paul Ulrich Kessany Zategwa à Mr Numan HATIPOGLU", {
        fr: "Remise d’un maillot de l’équipe nationale du Gabon par le ministre Paul Ulrich Kessany Zategwa à M. Numan Hatipoglu.",
        en: "Presentation of a Gabon national-team shirt by minister Paul Ulrich Kessany Zategwa to Mr Numan Hatipoglu.",
        tr: "Bakan Paul Ulrich Kessany Zategwa’nın Numan Hatipoglu’na Gabon millî takım formasını vermesi.",
      }, {
        fr: "Deux hommes tenant un maillot, d’après la légende le ministre des Sports du Gabon et Numan Hatipoglu.",
        en: "Two men holding a shirt, according to the caption Gabon’s sports minister and Numan Hatipoglu.",
        tr: "Açıklamaya göre Gabon spor bakanı ve Numan Hatipoglu’nun tuttuğu forma.",
      }),
      photo("image30.jpeg", "Séance de travail au Ministre de la Jeunesse et des Sports du Gabon avec Ministre Mr Paul Kessany et le Lieutenant-Colonel Mr LOIC", {
        fr: "Séance de travail au ministère de la Jeunesse et des Sports du Gabon, avec le ministre Paul Kessany et le lieutenant-colonel Loïc.",
        en: "Working session at Gabon’s Ministry of Youth and Sports, with minister Paul Kessany and Lieutenant-Colonel Loïc.",
        tr: "Gabon Gençlik ve Spor Bakanlığı’nda Bakan Paul Kessany ve yarbay Loïc ile çalışma oturumu.",
      }, {
        fr: "Réunion dans un bureau, d’après la légende au ministère gabonais de la Jeunesse et des Sports.",
        en: "Meeting in an office, according to the caption at Gabon’s Ministry of Youth and Sports.",
        tr: "Açıklamaya göre Gabon Gençlik ve Spor Bakanlığı’nda ofis toplantısı.",
      }),
    ],
    participants: [
      { fullName: "Numan Hatipoglu", role: { fr: "PDG de Numan Groupe International", en: "CEO of Numan Groupe International", tr: "Numan Groupe International PDG’si" } },
      { fullName: "Paul Ulrich Kessany Zategwa", role: { fr: "Ministre de la Jeunesse et des Sports du Gabon", en: "Minister of Youth and Sports of Gabon", tr: "Gabon Gençlik ve Spor Bakanı" } },
      { fullName: "Alpha Cissé", role: { fr: "Représentant Afrique de Numan Groupe", en: "Africa representative of Numan Groupe", tr: "Numan Groupe Afrika temsilcisi" } },
      { fullName: "Loïc", role: { fr: "Lieutenant-colonel", en: "Lieutenant-colonel", tr: "Yarbay" } },
    ],
    notes: "Même ministère et mêmes interlocuteurs ; regroupé. Le protocole n’est pas présenté comme un marché attribué.",
  },
  {
    key: "libreville-stade-omar-bongo",
    published: true,
    countryCode: "GA",
    city: { fr: "Libreville", en: "Libreville", tr: "Libreville" },
    host: { fr: "Stade Omar Bongo Ondimba", en: "Omar Bongo Ondimba Stadium", tr: "Omar Bongo Ondimba Stadyumu" },
    slug: { fr: "libreville-stade-omar-bongo", en: "libreville-omar-bongo-stadium", tr: "libreville-omar-bongo-stadyumu" },
    title: {
      fr: "Visite du stade Omar Bongo Ondimba à Libreville",
      en: "Visit to Omar Bongo Ondimba Stadium in Libreville",
      tr: "Libreville’de Omar Bongo Ondimba Stadyumu ziyareti",
    },
    summary: {
      fr: "Visite du stade Omar Bongo Ondimba à Libreville, présentée dans le document comme un examen en vue de travaux de réhabilitation, avec les équipes techniques.",
      en: "Visit to Omar Bongo Ondimba Stadium in Libreville, described in the document as a review with a view to rehabilitation works, with the technical teams.",
      tr: "Belgede rehabilitasyon çalışmalarına yönelik bir inceleme olarak anlatılan, teknik ekiplerle Libreville Omar Bongo Ondimba Stadyumu ziyareti.",
    },
    body: {
      fr: "Les légendes parlent d’une visite du stade et des équipes techniques. Aucune date, aucun contrat et aucun chantier engagé ne sont indiqués.",
      en: "The captions speak of a stadium visit and technical teams. No date, contract or commenced works are stated.",
      tr: "Açıklamalar stadyum ziyareti ve teknik ekipleri anlatır. Tarih, sözleşme veya başlamış bir şantiye belirtilmez.",
    },
    seoTitle: { fr: "Libreville — stade Omar Bongo Ondimba", en: "Libreville — Omar Bongo Ondimba Stadium", tr: "Libreville — Omar Bongo Ondimba Stadyumu" },
    seoDescription: {
      fr: "Visite du stade Omar Bongo Ondimba à Libreville, d’après les légendes photographiques.",
      en: "Visit to Omar Bongo Ondimba Stadium in Libreville, from the photograph captions.",
      tr: "Fotoğraf açıklamalarına göre Libreville Omar Bongo Ondimba Stadyumu ziyareti.",
    },
    photos: [
      photo("image6.jpeg", "Visite du stade Omar Bongo Ondimba à Libreville en vue des prochains travaux de réhabilitation", {
        fr: "Visite du stade Omar Bongo Ondimba à Libreville, en vue de travaux de réhabilitation.",
        en: "Visit to Omar Bongo Ondimba Stadium in Libreville, with a view to rehabilitation works.",
        tr: "Libreville Omar Bongo Ondimba Stadyumu ziyareti; belgede rehabilitasyon çalışmalarına yönelik olduğu yazılır.",
      }, {
        fr: "Personnes dans les gradins d’un stade à Libreville, d’après la légende le stade Omar Bongo Ondimba.",
        en: "People in the stands of a stadium in Libreville, according to the caption Omar Bongo Ondimba Stadium.",
        tr: "Açıklamaya göre Libreville’de Omar Bongo Ondimba Stadyumu tribünleri.",
      }),
      photo("image7.jpeg", "Visite du Stade Omar Bongo de Libreville avec les équipes techniques", {
        fr: "Visite du stade Omar Bongo de Libreville avec les équipes techniques.",
        en: "Visit to Omar Bongo Stadium in Libreville with the technical teams.",
        tr: "Teknik ekiplerle Libreville Omar Bongo Stadyumu ziyareti.",
      }, {
        fr: "Groupe sur la pelouse d’un stade, d’après la légende les équipes techniques au stade Omar Bongo.",
        en: "Group on a stadium pitch, according to the caption technical teams at Omar Bongo Stadium.",
        tr: "Açıklamaya göre Omar Bongo Stadyumu’nda teknik ekipler.",
      }),
    ],
    participants: [{ fullName: "Numan Hatipoglu", role: { fr: "PDG de Numan Groupe International", en: "CEO of Numan Groupe International", tr: "Numan Groupe International PDG’si" } }],
    notes: "Même stade, légendes complémentaires. La réhabilitation n’est pas présentée comme un chantier attribué.",
  },
  {
    key: "bangui-presidence",
    published: true,
    countryCode: "CF",
    city: { fr: "Bangui", en: "Bangui", tr: "Bangui" },
    host: { fr: "Présidence de la République centrafricaine", en: "Presidency of the Central African Republic", tr: "Orta Afrika Cumhuriyeti Cumhurbaşkanlığı" },
    slug: { fr: "bangui-presidence-faustin-archange-touadera", en: "bangui-presidency-faustin-archange-touadera", tr: "bangui-cumhurbaskanligi-faustin-archange-touadera" },
    title: {
      fr: "Audience à la Présidence de la République centrafricaine",
      en: "Audience at the Presidency of the Central African Republic",
      tr: "Orta Afrika Cumhuriyeti Cumhurbaşkanlığı’nda kabul",
    },
    summary: {
      fr: "Audience et séance de travail à Bangui avec le chef de l’État, son Excellence Faustin-Archange Touadéra.",
      en: "Audience and working session in Bangui with the head of State, His Excellency Faustin-Archange Touadéra.",
      tr: "Bangui’de devlet başkanı Faustin-Archange Touadéra ile kabul ve çalışma oturumu.",
    },
    body: {
      fr: "Les légendes nomment une audience avec le chef de l’État et une séance de travail à la Présidence. Aucune date, décision ou accord n’est indiqué.",
      en: "The captions name an audience with the head of State and a working session at the Presidency. No date, decision or agreement is stated.",
      tr: "Açıklamalar devlet başkanı ile bir kabul ve Cumhurbaşkanlığı’nda bir çalışma oturumunu anar. Tarih, karar veya anlaşma belirtilmez.",
    },
    seoTitle: { fr: "Bangui — audience à la Présidence", en: "Bangui — audience at the Presidency", tr: "Bangui — Cumhurbaşkanlığı’nda kabul" },
    seoDescription: {
      fr: "Audience à Bangui auprès du président Faustin-Archange Touadéra, d’après les légendes.",
      en: "Audience in Bangui with President Faustin-Archange Touadéra, from the captions.",
      tr: "Fotoğraf açıklamalarına göre Bangui’de Cumhurbaşkanı Faustin-Archange Touadéra ile kabul.",
    },
    photos: [
      photo("image8.jpeg", "Audience avec le Chef de l’État son Excellence Mr FAUSTIN ARCHANGE TOUADERA", {
        fr: "Audience avec le chef de l’État, son Excellence Faustin-Archange Touadéra.",
        en: "Audience with the head of State, His Excellency Faustin-Archange Touadéra.",
        tr: "Devlet başkanı Faustin-Archange Touadéra ile kabul.",
      }, {
        fr: "Rencontre protocolaire, d’après la légende une audience avec le président centrafricain.",
        en: "Formal meeting, according to the caption an audience with the Central African president.",
        tr: "Açıklamaya göre Orta Afrika cumhurbaşkanı ile resmî kabul.",
      }),
      photo("image14.jpeg", "Le PDG de Numan Groupe International et le Président de la République de la Centrafrique son Excellence Mr FAUSTIN ARCHANGE TOUADERA", {
        fr: "Le PDG de Numan Groupe International et le président de la République centrafricaine, son Excellence Faustin-Archange Touadéra.",
        en: "The CEO of Numan Groupe International and the President of the Central African Republic, His Excellency Faustin-Archange Touadéra.",
        tr: "Numan Groupe International PDG’si ve Orta Afrika Cumhuriyeti Cumhurbaşkanı Faustin-Archange Touadéra.",
      }, {
        fr: "Deux hommes posant, d’après la légende le PDG de Numan Groupe et le président centrafricain.",
        en: "Two men posing, according to the caption the CEO of Numan Groupe and the Central African president.",
        tr: "Açıklamaya göre Numan Groupe PDG’si ve Orta Afrika cumhurbaşkanı.",
      }),
      photo("image25.jpeg", "Séance de travail à la Présidence de la République Centrafricaine", {
        fr: "Séance de travail à la Présidence de la République centrafricaine.",
        en: "Working session at the Presidency of the Central African Republic.",
        tr: "Orta Afrika Cumhuriyeti Cumhurbaşkanlığı’nda çalışma oturumu.",
      }, {
        fr: "Réunion dans un salon officiel, d’après la légende à la Présidence centrafricaine.",
        en: "Meeting in an official salon, according to the caption at the Central African Presidency.",
        tr: "Açıklamaya göre Orta Afrika Cumhurbaşkanlığı’nda resmî salonda toplantı.",
      }),
    ],
    participants: [
      { fullName: "Numan Hatipoglu", role: { fr: "PDG de Numan Groupe International", en: "CEO of Numan Groupe International", tr: "Numan Groupe International PDG’si" } },
      { fullName: "Faustin-Archange Touadéra", role: { fr: "Président de la République centrafricaine", en: "President of the Central African Republic", tr: "Orta Afrika Cumhuriyeti Cumhurbaşkanı" } },
    ],
    notes: "Même institution et même interlocuteur. Ce n’est pas présenté comme un partenariat d’État.",
  },
];

export const ALFA_VISITS: AlfaVisit[] = [...ALFA_VISITS_PRIMARY, ...ALFA_VISITS_REST];

export const ALFA_EXPECTED_PHOTO_FILES = Array.from({ length: 41 }, (_, index) => `image${index + 1}.jpeg`);

export function alfaAccountedPhotoFiles(): string[] {
  return [ALFA_HQ_PHOTO.file, ...ALFA_VISITS.flatMap((visit) => visit.photos.map((item) => item.file))];
}


