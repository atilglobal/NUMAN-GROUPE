import type { Locale } from "@/i18n/config";
import type { AlfaPhoto, AlfaVisit } from "./alfa-visits";

const loc = (fr: string, en: string, tr: string): Record<Locale, string> => ({ fr, en, tr });

function photo(file: string, sourceCaption: string, fr: string, en: string, tr: string): AlfaPhoto {
  return {
    file,
    sourceCaption,
    caption: loc(fr, en, tr),
    alt: loc(fr, en, tr),
  };
}

function visit(input: {
  key: string;
  published: boolean;
  countryCode: string | null;
  city: Record<Locale, string>;
  host: Record<Locale, string>;
  slug: Record<Locale, string>;
  title: Record<Locale, string>;
  summary: Record<Locale, string>;
  photos: AlfaPhoto[];
  participants: AlfaVisit["participants"];
  notes: string;
}): AlfaVisit {
  return {
    ...input,
    body: loc(
      `${input.summary.fr} Aucune date n’est indiquée dans le document source.`,
      `${input.summary.en} The source document gives no date.`,
      `${input.summary.tr} Kaynak belgede tarih yoktur.`,
    ),
    seoTitle: input.title,
    seoDescription: input.summary,
  };
}

export const ALFA_VISITS_REST: AlfaVisit[] = [
  visit({
    key: "conakry-visite-terrain",
    published: true,
    countryCode: "GN",
    city: loc("Conakry", "Conakry", "Conakry"),
    host: loc("Visite de terrain", "Field visit", "Saha ziyareti"),
    slug: loc("conakry-visite-de-terrain", "conakry-field-visit", "conakry-saha-ziyareti"),
    title: loc("Visite de terrain à Conakry", "Field visit in Conakry", "Conakry’de saha ziyareti"),
    summary: loc(
      "Visite de terrain à Conakry, en Guinée, d’après la légende photographique.",
      "Field visit in Conakry, Guinea, according to the photograph caption.",
      "Fotoğraf açıklamasına göre Gine’nin Conakry kentinde saha ziyareti.",
    ),
    photos: [
      photo(
        "image9.jpeg",
        "Visite de terrain à Conakry-Guinée",
        "Visite de terrain à Conakry, en Guinée.",
        "Field visit in Conakry, Guinea.",
        "Gine’nin Conakry kentinde saha ziyareti.",
      ),
    ],
    participants: [{ fullName: "Numan Hatipoglu", role: loc("PDG de Numan Groupe International", "CEO of Numan Groupe International", "Numan Groupe International PDG’si") }],
    notes: "Légende courte ; institution d’accueil non nommée.",
  }),
  visit({
    key: "gabon-travaux-publics",
    published: true,
    countryCode: "GA",
    city: loc("Libreville", "Libreville", "Libreville"),
    host: loc("Ministère des Travaux publics et de la Construction du Gabon", "Ministry of Public Works and Construction of Gabon", "Gabon Bayındırlık ve İnşaat Bakanlığı"),
    slug: loc("gabon-ministre-travaux-publics-edgard-moukoumbi", "gabon-public-works-minister-edgard-moukoumbi", "gabon-bayindirlik-bakani-edgard-moukoumbi"),
    title: loc(
      "Visite auprès du ministre des Travaux publics du Gabon",
      "Visit with Gabon’s Minister of Public Works",
      "Gabon Bayındırlık Bakanı ile ziyaret",
    ),
    summary: loc(
      "Visite de travail et d’amitié auprès de M. Edgard Moukoumbi, ministre des Travaux publics et de la Construction du Gabon, en présence du directeur national des sports du Gabon.",
      "Working and courtesy visit with Mr Edgard Moukoumbi, Minister of Public Works and Construction of Gabon, with the national director of sports of Gabon present.",
      "Gabon Bayındırlık ve İnşaat Bakanı Edgard Moukoumbi ile çalışma ve nezaket ziyareti; Gabon ulusal spor müdürü de belgede anılır.",
    ),
    photos: [
      photo(
        "image10.jpeg",
        "Le PDG de Numan Groupe International et le Ministre des Travaux Publics et de la Construction du Gabon MR Edgard MOUKOUMBI",
        "Le PDG de Numan Groupe International et le ministre des Travaux publics et de la Construction du Gabon, M. Edgard Moukoumbi.",
        "The CEO of Numan Groupe International and Gabon’s Minister of Public Works and Construction, Mr Edgard Moukoumbi.",
        "Numan Groupe International PDG’si ve Gabon Bayındırlık ve İnşaat Bakanı Edgard Moukoumbi.",
      ),
      photo(
        "image12.jpeg",
        "Visite de travail et d’amitié de Numan Groupe chez le Ministre des Travaux Publics et de la Construction du Gabon Mr Edgard MOUKOUMBI accompagné du Directeur National des Sports du Gabon",
        "Visite de travail et d’amitié chez le ministre Edgard Moukoumbi, en présence du directeur national des sports du Gabon.",
        "Working and courtesy visit with Minister Edgard Moukoumbi, with Gabon’s national director of sports present.",
        "Bakan Edgard Moukoumbi’ye çalışma ve nezaket ziyareti; Gabon ulusal spor müdürü de belgede anılır.",
      ),
    ],
    participants: [
      { fullName: "Numan Hatipoglu", role: loc("PDG de Numan Groupe International", "CEO of Numan Groupe International", "Numan Groupe International PDG’si") },
      { fullName: "Edgard Moukoumbi", role: loc("Ministre des Travaux publics et de la Construction du Gabon", "Minister of Public Works and Construction of Gabon", "Gabon Bayındırlık ve İnşaat Bakanı") },
    ],
    notes: "Même ministre ; le directeur national des sports est nommé sans autre détail.",
  }),
  visit({
    key: "gabon-partenaires",
    published: true,
    countryCode: "GA",
    city: loc("", "", ""),
    host: loc("Partenaires de Numan Groupe Gabon", "Partners of Numan Groupe Gabon", "Numan Groupe Gabon ortakları"),
    slug: loc("gabon-seance-partenaires", "gabon-working-session-partners", "gabon-ortaklarla-calisma-oturumu"),
    title: loc("Séance de travail avec les partenaires au Gabon", "Working session with partners in Gabon", "Gabon’da ortaklarla çalışma oturumu"),
    summary: loc(
      "Séance de travail avec les partenaires de Numan Groupe Gabon. Les interlocuteurs ne sont pas nommés.",
      "Working session with the partners of Numan Groupe Gabon. The counterparts are not named.",
      "Numan Groupe Gabon ortaklarıyla çalışma oturumu. Muhataplar adlandırılmaz.",
    ),
    photos: [
      photo(
        "image11.jpeg",
        "Séance de travail avec les partenaires de Numan Groupe Gabon",
        "Séance de travail avec les partenaires de Numan Groupe Gabon.",
        "Working session with the partners of Numan Groupe Gabon.",
        "Numan Groupe Gabon ortaklarıyla çalışma oturumu.",
      ),
    ],
    participants: [],
    notes: "Ville non précisée ; distinct de la légende « partenaires à Libreville » (image20).",
  }),
  visit({
    key: "dakar-mairie",
    published: true,
    countryCode: "SN",
    city: loc("Dakar", "Dakar", "Dakar"),
    host: loc("Mairie de Dakar", "City of Dakar", "Dakar Belediyesi"),
    slug: loc("dakar-maire-abass-fall", "dakar-mayor-abass-fall", "dakar-belediye-baskani-abass-fall"),
    title: loc("Visite de travail à la mairie de Dakar", "Working visit to Dakar City Hall", "Dakar Belediyesi’nde çalışma ziyareti"),
    summary: loc(
      "Visite de travail chez le maire de Dakar, M. Abass Fall.",
      "Working visit with the Mayor of Dakar, Mr Abass Fall.",
      "Dakar Belediye Başkanı Abass Fall ile çalışma ziyareti.",
    ),
    photos: [
      photo(
        "image13.jpeg",
        "Visite de travail de Numan Groupe chez le Maire de Dakar Mr Abass FALL",
        "Visite de travail chez le maire de Dakar, M. Abass Fall.",
        "Working visit with the Mayor of Dakar, Mr Abass Fall.",
        "Dakar Belediye Başkanı Abass Fall ile çalışma ziyareti.",
      ),
      photo(
        "image32.jpeg",
        "Mr le Maire de Dakar Mr Abass FALL et Mr Numan HATIPOGLU",
        "Le maire de Dakar, M. Abass Fall, et M. Numan Hatipoglu.",
        "The Mayor of Dakar, Mr Abass Fall, and Mr Numan Hatipoglu.",
        "Dakar Belediye Başkanı Abass Fall ve Numan Hatipoglu.",
      ),
    ],
    participants: [
      { fullName: "Numan Hatipoglu", role: loc("PDG de Numan Groupe International", "CEO of Numan Groupe International", "Numan Groupe International PDG’si") },
      { fullName: "Abass Fall", role: loc("Maire de Dakar", "Mayor of Dakar", "Dakar Belediye Başkanı") },
    ],
    notes: "Même interlocuteur et même institution.",
  }),
  visit({
    key: "kaloum-mairie",
    published: true,
    countryCode: "GN",
    city: loc("Kaloum", "Kaloum", "Kaloum"),
    host: loc("Mairie de Kaloum", "Municipality of Kaloum", "Kaloum Belediyesi"),
    slug: loc("kaloum-mairie-bangoura", "kaloum-municipality-bangoura", "kaloum-belediyesi-bangoura"),
    title: loc("Visite de travail à la mairie de Kaloum", "Working visit to Kaloum municipality", "Kaloum Belediyesi’nde çalışma ziyareti"),
    summary: loc(
      "Visite et séance de travail à la mairie de Kaloum avec M. Bangoura, président de la délégation spéciale.",
      "Visit and working session at Kaloum municipality with Mr Bangoura, president of the special delegation.",
      "Kaloum Belediyesi’nde özel heyet başkanı Bangoura ile ziyaret ve çalışma oturumu.",
    ),
    photos: [
      photo(
        "image15.jpeg",
        "Mr Numan PDG de Numan Groupe et le Président de la Délégation spécial de la Mairie de Kaloum Mr Bangoura",
        "M. Numan Hatipoglu et M. Bangoura, président de la délégation spéciale de la mairie de Kaloum.",
        "Mr Numan Hatipoglu and Mr Bangoura, president of the special delegation of Kaloum municipality.",
        "Numan Hatipoglu ve Kaloum Belediyesi özel heyet başkanı Bangoura.",
      ),
      photo(
        "image18.jpeg",
        "Visite de travail à la mairie de Kaloum",
        "Visite de travail à la mairie de Kaloum.",
        "Working visit to Kaloum municipality.",
        "Kaloum Belediyesi’nde çalışma ziyareti.",
      ),
      photo(
        "image37.jpeg",
        "Séance de travail à la Mairie de Kaloum",
        "Séance de travail à la mairie de Kaloum.",
        "Working session at Kaloum municipality.",
        "Kaloum Belediyesi’nde çalışma oturumu.",
      ),
    ],
    participants: [
      { fullName: "Numan Hatipoglu", role: loc("PDG de Numan Groupe International", "CEO of Numan Groupe International", "Numan Groupe International PDG’si") },
      { fullName: "Bangoura", role: loc("Président de la délégation spéciale de la mairie de Kaloum", "President of the special delegation of Kaloum municipality", "Kaloum Belediyesi özel heyet başkanı") },
    ],
    notes: "Prénom de M. Bangoura non indiqué dans le document.",
  }),
  visit({
    key: "libreville-mairie",
    published: true,
    countryCode: "GA",
    city: loc("Libreville", "Libreville", "Libreville"),
    host: loc("Hôtel de ville de Libreville", "Libreville City Hall", "Libreville Belediye Binası"),
    slug: loc("libreville-maire-matthieu-obame-etoughe", "libreville-mayor-matthieu-obame-etoughe", "libreville-belediye-baskani-matthieu-obame-etoughe"),
    title: loc("Séance de travail à l’hôtel de ville de Libreville", "Working session at Libreville City Hall", "Libreville Belediye Binası’nda çalışma oturumu"),
    summary: loc(
      "Rencontre avec le maire de Libreville, M. Matthieu Obame Etoughe, et séance de travail à l’hôtel de ville.",
      "Meeting with the Mayor of Libreville, Mr Matthieu Obame Etoughe, and a working session at City Hall.",
      "Libreville Belediye Başkanı Matthieu Obame Etoughe ile görüşme ve belediye binasında çalışma oturumu.",
    ),
    photos: [
      photo(
        "image16.jpeg",
        "Mr Nuamn PDG de Numan Groupe et le Maire de Libreville Mr Matthieu Obame ETOUGHE",
        "M. Numan Hatipoglu, PDG de Numan Groupe, et le maire de Libreville, M. Matthieu Obame Etoughe.",
        "Mr Numan Hatipoglu, CEO of Numan Groupe, and the Mayor of Libreville, Mr Matthieu Obame Etoughe.",
        "Numan Groupe PDG’si Numan Hatipoglu ve Libreville Belediye Başkanı Matthieu Obame Etoughe.",
      ),
      photo(
        "image24.jpeg",
        "Séance de travail à l’hôtel de ville de Libreville",
        "Séance de travail à l’hôtel de ville de Libreville.",
        "Working session at Libreville City Hall.",
        "Libreville Belediye Binası’nda çalışma oturumu.",
      ),
    ],
    participants: [
      { fullName: "Numan Hatipoglu", role: loc("PDG de Numan Groupe International", "CEO of Numan Groupe International", "Numan Groupe International PDG’si") },
      { fullName: "Matthieu Obame Etoughe", role: loc("Maire de Libreville", "Mayor of Libreville", "Libreville Belediye Başkanı") },
    ],
    notes: "Correction de « Nuamn » d’après le reste du document.",
  }),
  visit({
    key: "conakry-sejour",
    published: true,
    countryCode: "GN",
    city: loc("Conakry", "Conakry", "Conakry"),
    host: loc("Séjour de travail", "Working stay", "Çalışma ziyareti"),
    slug: loc("conakry-sejour-de-travail", "conakry-working-stay", "conakry-calisma-ziyareti"),
    title: loc("Séjour de travail à Conakry", "Working stay in Conakry", "Conakry’de çalışma ziyareti"),
    summary: loc(
      "Séjour de travail à Conakry. Les deux photographies portent la même légende ; l’institution d’accueil n’est pas nommée.",
      "Working stay in Conakry. Both photographs carry the same caption; the host institution is not named.",
      "Conakry’de çalışma ziyareti. İki fotoğrafın açıklaması aynıdır; ev sahibi kurum adlandırılmaz.",
    ),
    photos: [
      photo("image17.jpeg", "Séjour de travail à Conakry", "Séjour de travail à Conakry.", "Working stay in Conakry.", "Conakry’de çalışma ziyareti."),
      photo("image27.jpeg", "Séjour de travail à Conakry", "Séjour de travail à Conakry.", "Working stay in Conakry.", "Conakry’de çalışma ziyareti."),
    ],
    participants: [{ fullName: "Numan Hatipoglu", role: loc("PDG de Numan Groupe International", "CEO of Numan Groupe International", "Numan Groupe International PDG’si") }],
    notes: "Légendes identiques ; regroupé. Distinct de la visite de terrain et des partenaires.",
  }),
  visit({
    key: "conakry-partenaires",
    published: true,
    countryCode: "GN",
    city: loc("Conakry", "Conakry", "Conakry"),
    host: loc("Partenaires à Conakry", "Partners in Conakry", "Conakry’deki ortaklar"),
    slug: loc("conakry-partenaires-de-la-place", "conakry-local-partners", "conakry-yerel-ortaklar"),
    title: loc("Séjour de travail à Conakry avec les partenaires de la place", "Working stay in Conakry with local partners", "Conakry’de yerel ortaklarla çalışma ziyareti"),
    summary: loc(
      "Séjour de travail à Conakry avec les partenaires de Numan Groupe de la place. Les personnes ne sont pas nommées.",
      "Working stay in Conakry with Numan Groupe’s local partners. The people are not named.",
      "Conakry’de Numan Groupe’un yerel ortaklarıyla çalışma ziyareti. Kişiler adlandırılmaz.",
    ),
    photos: [
      photo(
        "image19.jpeg",
        "Séjour de travail à Conakry avec les partenaires de Numan Groupe de la place",
        "Séjour de travail à Conakry avec les partenaires de Numan Groupe de la place.",
        "Working stay in Conakry with Numan Groupe’s local partners.",
        "Conakry’de Numan Groupe’un yerel ortaklarıyla çalışma ziyareti.",
      ),
    ],
    participants: [],
    notes: "Légende distincte du séjour générique (images 17 et 27).",
  }),
  visit({
    key: "libreville-partenaires",
    published: true,
    countryCode: "GA",
    city: loc("Libreville", "Libreville", "Libreville"),
    host: loc("Partenaires à Libreville", "Partners in Libreville", "Libreville’deki ortaklar"),
    slug: loc("libreville-partenaires", "libreville-partners", "libreville-ortaklar"),
    title: loc("Séjour de travail à Libreville avec les partenaires", "Working stay in Libreville with partners", "Libreville’de ortaklarla çalışma ziyareti"),
    summary: loc(
      "Séjour de travail à Libreville avec les partenaires de Numan Groupe. Les interlocuteurs ne sont pas nommés.",
      "Working stay in Libreville with Numan Groupe partners. The counterparts are not named.",
      "Libreville’de Numan Groupe ortaklarıyla çalışma ziyareti. Muhataplar adlandırılmaz.",
    ),
    photos: [
      photo(
        "image20.jpeg",
        "Séjour de travail à Libreville avec les partenaires de Numan Groupe",
        "Séjour de travail à Libreville avec les partenaires de Numan Groupe.",
        "Working stay in Libreville with Numan Groupe partners.",
        "Libreville’de Numan Groupe ortaklarıyla çalışma ziyareti.",
      ),
    ],
    participants: [],
    notes: "Distinct de la séance « partenaires Gabon » (image11) faute de légende identique.",
  }),
  visit({
    key: "gabon-sante-melen",
    published: true,
    countryCode: "GA",
    city: loc("Melen", "Melen", "Melen"),
    host: loc("Hôpital de Melen / ministère de la Santé du Gabon", "Melen hospital / Ministry of Health of Gabon", "Melen Hastanesi / Gabon Sağlık Bakanlığı"),
    slug: loc("gabon-sante-hopital-melen", "gabon-health-melen-hospital", "gabon-saglik-melen-hastanesi"),
    title: loc("Séance de travail à l’hôpital de Melen", "Working session at Melen hospital", "Melen Hastanesi’nde çalışma oturumu"),
    summary: loc(
      "Séance de travail avec les responsables administratifs et techniques à l’hôpital de Melen, et rencontre avec Mme Elsa Nkana Joséphine Ayo, épouse Bivigou, ministre de la Santé du Gabon.",
      "Working session with administrative and technical officials at Melen hospital, and a meeting with Mrs Elsa Nkana Joséphine Ayo, wife Bivigou, Minister of Health of Gabon.",
      "Melen Hastanesi’nde idari ve teknik sorumlularla çalışma oturumu ve Gabon Sağlık Bakanı Elsa Nkana Joséphine Ayo (Bivigou) ile görüşme.",
    ),
    photos: [
      photo(
        "image21.jpeg",
        "Séance de travail avec les Responsables Administratifs et techniques à l’hôpital de MELEN",
        "Séance de travail avec les responsables administratifs et techniques à l’hôpital de Melen.",
        "Working session with administrative and technical officials at Melen hospital.",
        "Melen Hastanesi’nde idari ve teknik sorumlularla çalışma oturumu.",
      ),
      photo(
        "image22.jpeg",
        "Mr Numan PDG de Numan Groupe International et Mme la Ministre de la Santé du Gabon PR Elsa Nkana Joséphine Ayo, épouse BIVIGOU",
        "M. Numan Hatipoglu et Mme Elsa Nkana Joséphine Ayo, épouse Bivigou, ministre de la Santé du Gabon.",
        "Mr Numan Hatipoglu and Mrs Elsa Nkana Joséphine Ayo, wife Bivigou, Minister of Health of Gabon.",
        "Numan Hatipoglu ve Gabon Sağlık Bakanı Elsa Nkana Joséphine Ayo (Bivigou).",
      ),
    ],
    participants: [
      { fullName: "Numan Hatipoglu", role: loc("PDG de Numan Groupe International", "CEO of Numan Groupe International", "Numan Groupe International PDG’si") },
      { fullName: "Elsa Nkana Joséphine Ayo", role: loc("Ministre de la Santé du Gabon", "Minister of Health of Gabon", "Gabon Sağlık Bakanı") },
    ],
    notes: "Le titre « PR » de la légende est conservé comme écrit ; le lieu Melen n’est pas rattaché à une autre ville.",
  }),
  visit({
    key: "bangui-sejour",
    published: true,
    countryCode: "CF",
    city: loc("Bangui", "Bangui", "Bangui"),
    host: loc("Séjour de travail", "Working stay", "Çalışma ziyareti"),
    slug: loc("bangui-sejour-de-travail", "bangui-working-stay", "bangui-calisma-ziyareti"),
    title: loc("Séjour de travail à Bangui", "Working stay in Bangui", "Bangui’de çalışma ziyareti"),
    summary: loc(
      "Séjour de travail à Bangui. L’institution d’accueil n’est pas nommée ; distinct de l’audience à la Présidence.",
      "Working stay in Bangui. The host institution is not named; this is kept separate from the Presidency audience.",
      "Bangui’de çalışma ziyareti. Ev sahibi kurum adlandırılmaz; Cumhurbaşkanlığı kabulünden ayrı tutulur.",
    ),
    photos: [
      photo("image23.jpeg", "Séjour de travail à Bangui", "Séjour de travail à Bangui.", "Working stay in Bangui.", "Bangui’de çalışma ziyareti."),
    ],
    participants: [{ fullName: "Numan Hatipoglu", role: loc("PDG de Numan Groupe International", "CEO of Numan Groupe International", "Numan Groupe International PDG’si") }],
    notes: "Légende trop courte pour la rattacher à la Présidence.",
  }),
  visit({
    key: "gabon-habitat",
    published: true,
    countryCode: "GA",
    city: loc("", "", ""),
    host: loc("Ministère de l’Habitat du Gabon", "Ministry of Housing of Gabon", "Gabon İskân Bakanlığı"),
    slug: loc("gabon-ministre-habitat-mays-mouissi", "gabon-housing-minister-mays-mouissi", "gabon-iskan-bakani-mays-mouissi"),
    title: loc("Séance de travail au ministère de l’Habitat du Gabon", "Working session at Gabon’s Ministry of Housing", "Gabon İskân Bakanlığı’nda çalışma oturumu"),
    summary: loc(
      "Séance de travail au ministère de l’Habitat avec le ministre Mays Mouissi.",
      "Working session at the Ministry of Housing with Minister Mays Mouissi.",
      "İskân Bakanı Mays Mouissi ile bakanlıkta çalışma oturumu.",
    ),
    photos: [
      photo(
        "image29.jpeg",
        "Séance de travail au Ministère de l’habitat avec le Ministre Mays MOUISSI",
        "Séance de travail au ministère de l’Habitat avec le ministre Mays Mouissi.",
        "Working session at the Ministry of Housing with Minister Mays Mouissi.",
        "İskân Bakanı Mays Mouissi ile bakanlıkta çalışma oturumu.",
      ),
      photo(
        "image31.jpeg",
        "Mr le Ministre MAYS MOUISSI et Mr Numan HATIPOGLU",
        "Le ministre Mays Mouissi et M. Numan Hatipoglu.",
        "Minister Mays Mouissi and Mr Numan Hatipoglu.",
        "Bakan Mays Mouissi ve Numan Hatipoglu.",
      ),
    ],
    participants: [
      { fullName: "Numan Hatipoglu", role: loc("PDG de Numan Groupe International", "CEO of Numan Groupe International", "Numan Groupe International PDG’si") },
      { fullName: "Mays Mouissi", role: loc("Ministre de l’Habitat du Gabon", "Minister of Housing of Gabon", "Gabon İskân Bakanı") },
    ],
    notes: "Ville du ministère non précisée dans la légende.",
  }),
  visit({
    key: "bamako-tringa-oil",
    published: true,
    countryCode: "ML",
    city: loc("Bamako", "Bamako", "Bamako"),
    host: loc("Tringa Oil", "Tringa Oil", "Tringa Oil"),
    slug: loc("bamako-tringa-oil", "bamako-tringa-oil", "bamako-tringa-oil"),
    title: loc("Séance de travail à Tringa Oil à Bamako", "Working session at Tringa Oil in Bamako", "Bamako’da Tringa Oil’de çalışma oturumu"),
    summary: loc(
      "Rencontre à Bamako avec M. Iba Koita, PDG de Tringa Oil, et séance de travail dans l’entreprise.",
      "Meeting in Bamako with Mr Iba Koita, CEO of Tringa Oil, and a working session at the company.",
      "Bamako’da Tringa Oil PDG’si Iba Koita ile görüşme ve şirkette çalışma oturumu.",
    ),
    photos: [
      photo(
        "image33.jpeg",
        "Mr Numan HATIPOGLU PDG de Numan Groupe et Mr Iba KOITA PDG de TRINGA OIL à Bamako au MALI",
        "M. Numan Hatipoglu, PDG de Numan Groupe, et M. Iba Koita, PDG de Tringa Oil, à Bamako.",
        "Mr Numan Hatipoglu, CEO of Numan Groupe, and Mr Iba Koita, CEO of Tringa Oil, in Bamako.",
        "Numan Groupe PDG’si Numan Hatipoglu ve Tringa Oil PDG’si Iba Koita, Bamako’da.",
      ),
      photo(
        "image41.jpeg",
        "Séance de travail à TRINGA OIL",
        "Séance de travail à Tringa Oil.",
        "Working session at Tringa Oil.",
        "Tringa Oil’de çalışma oturumu.",
      ),
    ],
    participants: [
      { fullName: "Numan Hatipoglu", role: loc("PDG de Numan Groupe International", "CEO of Numan Groupe International", "Numan Groupe International PDG’si") },
      { fullName: "Iba Koita", role: loc("PDG de Tringa Oil", "CEO of Tringa Oil", "Tringa Oil PDG’si") },
    ],
    notes: "Même entreprise ; image41 n’indique pas la ville mais suit la légende Tringa Oil.",
  }),
  visit({
    key: "mali-cmdt",
    published: true,
    countryCode: "ML",
    city: loc("", "", ""),
    host: loc("CMDT", "CMDT", "CMDT"),
    slug: loc("mali-visite-cmdt", "mali-visit-cmdt", "mali-cmdt-ziyareti"),
    title: loc("Visite de travail à la CMDT au Mali", "Working visit to CMDT in Mali", "Mali’de CMDT’ye çalışma ziyareti"),
    summary: loc(
      "Visite de travail à la CMDT au Mali, avec le PDG de la CMDT. Le prénom du PDG n’est pas indiqué.",
      "Working visit to CMDT in Mali, with the CEO of CMDT. The CEO’s given name is not stated.",
      "Mali’de CMDT’ye çalışma ziyareti; CMDT PDG’sinin adı belgede belirtilmez.",
    ),
    photos: [
      photo(
        "image34.jpeg",
        "Visite de travail à la CMDT au Mali",
        "Visite de travail à la CMDT au Mali.",
        "Working visit to CMDT in Mali.",
        "Mali’de CMDT’ye çalışma ziyareti.",
      ),
      photo(
        "image39.jpeg",
        "Mr Numan HAtipoglu et le PDG de la CMDT",
        "M. Numan Hatipoglu et le PDG de la CMDT.",
        "Mr Numan Hatipoglu and the CEO of CMDT.",
        "Numan Hatipoglu ve CMDT PDG’si.",
      ),
    ],
    participants: [
      { fullName: "Numan Hatipoglu", role: loc("PDG de Numan Groupe International", "CEO of Numan Groupe International", "Numan Groupe International PDG’si") },
    ],
    notes: "Le PDG de la CMDT n’est pas nommé ; ville non précisée.",
  }),
  visit({
    key: "mali-bms",
    published: true,
    countryCode: "ML",
    city: loc("", "", ""),
    host: loc("Banque Malienne de Solidarité", "Malian Solidarity Bank", "Mali Dayanışma Bankası"),
    slug: loc("mali-banque-malienne-de-solidarite", "mali-malian-solidarity-bank", "mali-dayanisma-bankasi"),
    title: loc("Visite de travail à la Banque malienne de solidarité", "Working visit to the Malian Solidarity Bank", "Mali Dayanışma Bankası’nda çalışma ziyareti"),
    summary: loc(
      "Visite de travail à la direction générale de la Banque malienne de solidarité, avec M. Lanfia Koita, directeur général.",
      "Working visit to the head office of the Malian Solidarity Bank, with Mr Lanfia Koita, managing director.",
      "Mali Dayanışma Bankası genel müdürlüğünde Lanfia Koita ile çalışma ziyareti.",
    ),
    photos: [
      photo(
        "image35.jpeg",
        "Visite de travail à la Direction Générale de la Banque Malienne de Solidarité / Mr LANFIA KOITA, DG de la BMS et Mr Numan HATIPOGLU",
        "Visite de travail à la direction générale de la BMS, avec M. Lanfia Koita, directeur général, et M. Numan Hatipoglu.",
        "Working visit to the BMS head office, with Mr Lanfia Koita, managing director, and Mr Numan Hatipoglu.",
        "BMS genel müdürlüğünde genel müdür Lanfia Koita ve Numan Hatipoglu.",
      ),
    ],
    participants: [
      { fullName: "Numan Hatipoglu", role: loc("PDG de Numan Groupe International", "CEO of Numan Groupe International", "Numan Groupe International PDG’si") },
      { fullName: "Lanfia Koita", role: loc("Directeur général de la Banque malienne de solidarité", "Managing director of the Malian Solidarity Bank", "Mali Dayanışma Bankası genel müdürü") },
    ],
    notes: "Deux lignes de légende pour une seule photographie.",
  }),
  visit({
    key: "libreville-seance",
    published: true,
    countryCode: "GA",
    city: loc("Libreville", "Libreville", "Libreville"),
    host: loc("Séance de travail", "Working session", "Çalışma oturumu"),
    slug: loc("libreville-seance-de-travail", "libreville-working-session", "libreville-calisma-oturumu"),
    title: loc("Séance de travail à Libreville", "Working session in Libreville", "Libreville’de çalışma oturumu"),
    summary: loc(
      "Séance de travail à Libreville, au Gabon. L’institution et les interlocuteurs ne sont pas nommés.",
      "Working session in Libreville, Gabon. The institution and counterparts are not named.",
      "Gabon’un Libreville kentinde çalışma oturumu. Kurum ve muhataplar adlandırılmaz.",
    ),
    photos: [
      photo(
        "image36.jpeg",
        "Séance de travail à Libreville au Gabon",
        "Séance de travail à Libreville, au Gabon.",
        "Working session in Libreville, Gabon.",
        "Gabon’un Libreville kentinde çalışma oturumu.",
      ),
    ],
    participants: [{ fullName: "Numan Hatipoglu", role: loc("PDG de Numan Groupe International", "CEO of Numan Groupe International", "Numan Groupe International PDG’si") }],
    notes: "Légende trop générale pour la fusionner avec une autre visite de Libreville.",
  }),
  visit({
    key: "conakry-seance",
    published: true,
    countryCode: "GN",
    city: loc("Conakry", "Conakry", "Conakry"),
    host: loc("Séance de travail", "Working session", "Çalışma oturumu"),
    slug: loc("conakry-seance-de-travail", "conakry-working-session", "conakry-calisma-oturumu"),
    title: loc("Séance de travail à Conakry", "Working session in Conakry", "Conakry’de çalışma oturumu"),
    summary: loc(
      "Séance de travail à Conakry. L’institution et les interlocuteurs ne sont pas nommés.",
      "Working session in Conakry. The institution and counterparts are not named.",
      "Conakry’de çalışma oturumu. Kurum ve muhataplar adlandırılmaz.",
    ),
    photos: [
      photo(
        "image38.jpeg",
        "Séance de travail à Conakry",
        "Séance de travail à Conakry.",
        "Working session in Conakry.",
        "Conakry’de çalışma oturumu.",
      ),
    ],
    participants: [{ fullName: "Numan Hatipoglu", role: loc("PDG de Numan Groupe International", "CEO of Numan Groupe International", "Numan Groupe International PDG’si") }],
    notes: "Distinct du séjour et de la visite de terrain.",
  }),
  visit({
    key: "babalaye-ndaou",
    published: false,
    countryCode: null,
    city: loc("", "", ""),
    host: loc("", "", ""),
    slug: loc("rencontre-babalaye-ndaou", "meeting-babalaye-ndaou", "babalaye-ndaou-gorusmesi"),
    title: loc("Rencontre avec M. Babalaye Ndaou", "Meeting with Mr Babalaye Ndaou", "Babalaye Ndaou ile görüşme"),
    summary: loc(
      "Photographie de M. Babalaye Ndaou et de M. Numan Hatipoglu. Le lieu et l’institution ne sont pas indiqués.",
      "Photograph of Mr Babalaye Ndaou and Mr Numan Hatipoglu. Place and institution are not stated.",
      "Babalaye Ndaou ve Numan Hatipoglu’nun fotoğrafı. Yer ve kurum belirtilmez.",
    ),
    photos: [
      photo(
        "image40.jpeg",
        "Mr Babalaye NDAOU et Mr Numan HATIPOGLU",
        "M. Babalaye Ndaou et M. Numan Hatipoglu.",
        "Mr Babalaye Ndaou and Mr Numan Hatipoglu.",
        "Babalaye Ndaou ve Numan Hatipoglu.",
      ),
    ],
    participants: [
      { fullName: "Numan Hatipoglu", role: loc("PDG de Numan Groupe International", "CEO of Numan Groupe International", "Numan Groupe International PDG’si") },
      { fullName: "Babalaye Ndaou", role: loc("", "", "") },
    ],
    notes: "Taslak : lieu, institution et date absents. Légende parasite « q » ignorée.",
  }),
];
