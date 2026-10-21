import type { Locale } from "@/i18n/config";
import type { PageKey } from "@/db/schema";

export type GroupPageCopy = Record<
  Locale,
  { title: string; summary: string; body: string; seoTitle: string; seoDescription: string }
>;

/** Official Group copy from the institutional document. Import fills empty slots only. */
export const groupPageCopy: Partial<Record<PageKey, GroupPageCopy>> = {
  about: {
    fr: {
      title: "Numan Groupe International",
      summary:
        "Groupe international fondé en 1987 à Antalya, en République de Türkiye. Développement, construction et structuration de projets d’infrastructures, avec des coopérations en Afrique, en Asie et en Europe.",
      body: `Numan Groupe International est un groupe international spécialisé dans le développement, le financement et la réalisation de projets structurants dans les infrastructures, la construction et le développement économique.

Le Groupe s’adresse aux États, aux institutions publiques, aux entreprises et aux investisseurs qui cherchent un partenaire pour préparer et réaliser des projets dans des secteurs stratégiques. Selon la nature de chaque opération, il peut assurer tout ou partie des missions de développement, d’études, de coordination technique, de préparation financière et de suivi de réalisation.

Il privilégie une organisation fondée sur la définition précise des besoins, l’évaluation de la faisabilité, la clarification des responsabilités et la formalisation des engagements contractuels.`,
      seoTitle: "Le Groupe — Numan Groupe International",
      seoDescription:
        "Numan Groupe International, fondé en 1987 à Antalya : développement, construction et structuration de projets d’infrastructures, en coopération avec l’Afrique, l’Asie et l’Europe.",
    },
    en: {
      title: "Numan Groupe International",
      summary:
        "An international group founded in 1987 in Antalya, Republic of Türkiye. Project development, construction and infrastructure structuring, with cooperation focused on Africa, Asia and Europe.",
      body: `Numan Groupe International is an international group specialised in the development, financing and delivery of structuring projects in infrastructure, construction and economic development.

The Group works with states, public institutions, companies and investors looking for a partner to prepare and carry out projects in strategic sectors. Depending on each operation, it may cover all or part of development, studies, technical coordination, financial preparation and delivery follow-up.

It favours an organisation based on a precise definition of needs, an assessment of feasibility, a clear allocation of responsibilities and formal contractual commitments.`,
      seoTitle: "The Group — Numan Groupe International",
      seoDescription:
        "Numan Groupe International, founded in 1987 in Antalya: infrastructure project development, construction and structuring, with cooperation focused on Africa, Asia and Europe.",
    },
    tr: {
      title: "Numan Groupe International",
      summary:
        "1987’de Antalya, Türkiye Cumhuriyeti’nde kurulmuş uluslararası grup. Proje geliştirme, inşaat ve altyapı yapılandırması; Afrika, Asya ve Avrupa odaklı iş birlikleri.",
      body: `Numan Groupe International, altyapı, inşaat ve ekonomik kalkınma alanlarında yapılandırıcı projelerin geliştirilmesi, finansmanı ve gerçekleştirilmesinde uzmanlaşmış uluslararası bir gruptur.

Grup; devletlere, kamu kurumlarına, şirketlere ve yatırımcılara, stratejik sektörlerde projelerin hazırlanması ve gerçekleştirilmesi için ortaklık sunar. Her işlemin niteliğine göre geliştirme, etüt, teknik koordinasyon, finansal hazırlık ve uygulama takibinin tamamını veya bir kısmını üstlenebilir.

İhtiyaçların net tanımlanması, fizibilitenin değerlendirilmesi, sorumlulukların açıklığa kavuşturulması ve sözleşmesel taahhütlerin resmiyet kazanması temel alınır.`,
      seoTitle: "Grup — Numan Groupe International",
      seoDescription:
        "1987’de Antalya’da kurulan Numan Groupe International: altyapı projelerinde geliştirme, inşaat ve yapılandırma; Türkiye merkezli, Afrika, Asya ve Avrupa odaklı iş birlikleri.",
    },
  },
  history: {
    fr: {
      title: "Historique et positionnement",
      summary:
        "Depuis 1987, le siège d’Antalya est l’ancrage administratif et opérationnel d’une activité tournée vers les infrastructures et la coopération internationale.",
      body: `Depuis sa création en 1987, Numan Groupe International développe ses activités autour des infrastructures, de la construction et de la coopération internationale.

Son siège social à Antalya, en République de Türkiye, constitue son principal ancrage administratif et opérationnel. Le Groupe développe des relations professionnelles et institutionnelles en Afrique, en Asie et en Europe.

Son positionnement repose sur la capacité à mettre en relation autorités publiques, partenaires techniques, entreprises de construction, investisseurs et institutions financières autour de projets identifiés et documentés. Les interventions s’inscrivent dans une logique de long terme : conformité réglementaire, maîtrise des risques, transparence des engagements et solutions adaptées à chaque opération.`,
      seoTitle: "Historique — Numan Groupe International",
      seoDescription: "Fondé en 1987, siège à Antalya : positionnement international de Numan Groupe International.",
    },
    en: {
      title: "History and positioning",
      summary:
        "Since 1987, the Antalya headquarters has been the administrative and operational base of work focused on infrastructure and international cooperation.",
      body: `Since its creation in 1987, Numan Groupe International has developed its work around infrastructure, construction and international cooperation.

Its registered office in Antalya, Republic of Türkiye, is its main administrative and operational base. The Group develops professional and institutional relations in Africa, Asia and Europe.

Its positioning is the ability to connect public authorities, technical partners, construction firms, investors and financial institutions around identified and documented projects. Interventions are intended for the long term: regulatory compliance, risk control, transparent commitments and solutions suited to each operation.`,
      seoTitle: "History — Numan Groupe International",
      seoDescription: "Founded in 1987, headquartered in Antalya: international positioning of Numan Groupe International.",
    },
    tr: {
      title: "Tarihçe ve konumlandırma",
      summary:
        "1987’den beri Antalya’daki merkez, altyapı ve uluslararası iş birliğine dönük faaliyetin idari ve operasyonel dayanağıdır.",
      body: `1987’deki kuruluşundan bu yana Numan Groupe International faaliyetlerini altyapı, inşaat ve uluslararası iş birliği etrafında geliştirir.

Türkiye Cumhuriyeti, Antalya’daki merkez ofisi başlıca idari ve operasyonel dayanağıdır. Grup, Afrika, Asya ve Avrupa’da mesleki ve kurumsal ilişkiler geliştirir.

Konumlandırması; kamu otoriteleri, teknik ortaklar, inşaat firmaları, yatırımcılar ve finans kurumlarını tanımlanmış ve belgelenmiş projeler etrafında bir araya getirme kapasitesine dayanır. Müdahaleler uzun vadeli bir mantıkla ele alınır: mevzuata uygunluk, risklerin kontrolü, taahhütlerde şeffaflık ve her işleme uygun çözümler.`,
      seoTitle: "Tarihçe — Numan Groupe International",
      seoDescription: "1987 kuruluşu, Antalya merkezi: Numan Groupe International’ın uluslararası konumlandırması.",
    },
  },
  mission: {
    fr: {
      title: "Mission",
      summary:
        "Accompagner la préparation et la réalisation de projets d’infrastructures alignés sur les priorités des pays et des institutions partenaires.",
      body: `La mission de Numan Groupe International consiste à accompagner la préparation et la réalisation de projets d’infrastructures répondant aux priorités des pays et des institutions partenaires.

Le Groupe peut intervenir dans l’identification et la qualification des opportunités, la définition des besoins fonctionnels et techniques, la préparation d’études et de propositions, la coordination des partenaires, la structuration des besoins de financement, la recherche de partenaires techniques et financiers, et le suivi de la mise en œuvre conformément aux accords conclus.

Les modalités d’intervention sont définies au cas par cas, selon le secteur, la taille du projet, le cadre juridique applicable, les capacités des partenaires et les conditions de financement.`,
      seoTitle: "Mission — Numan Groupe International",
      seoDescription: "Mission de Numan Groupe International : préparer et réaliser des projets d’infrastructures.",
    },
    en: {
      title: "Mission",
      summary:
        "Support the preparation and delivery of infrastructure projects that match the priorities of partner countries and institutions.",
      body: `The mission of Numan Groupe International is to support the preparation and delivery of infrastructure projects that respond to the priorities of partner countries and institutions.

The Group may take part in identifying and qualifying opportunities, defining functional and technical needs, preparing studies and proposals, coordinating partners, structuring financing needs, seeking technical and financial partners, and following implementation in line with the agreements concluded.

The form of intervention is defined case by case, according to the sector, the size of the project, the applicable legal framework, the capacities of the partners and the financing conditions.`,
      seoTitle: "Mission — Numan Groupe International",
      seoDescription: "Mission of Numan Groupe International: prepare and deliver infrastructure projects.",
    },
    tr: {
      title: "Misyon",
      summary:
        "Partner ülkelerin ve kurumların önceliklerine uygun altyapı projelerinin hazırlanması ve gerçekleştirilmesine eşlik etmek.",
      body: `Numan Groupe International’ın misyonu, partner ülkelerin ve kurumların önceliklerine yanıt veren altyapı projelerinin hazırlanması ve gerçekleştirilmesine eşlik etmektir.

Grup; fırsatların belirlenmesi ve nitelendirilmesi, işlevsel ve teknik ihtiyaçların tanımı, etüt ve tekliflerin hazırlanması, ortakların koordinasyonu, finansman ihtiyaçlarının yapılandırılması, teknik ve finansal ortak arayışı ile imzalanan anlaşmalara uygun uygulama takibinde yer alabilir.

Müdahale biçimi sektöre, proje büyüklüğüne, yürürlükteki hukuki çerçeveye, ortakların kapasitesine ve finansman koşullarına göre vaka bazında belirlenir.`,
      seoTitle: "Misyon — Numan Groupe International",
      seoDescription: "Numan Groupe International misyonu: altyapı projelerini hazırlamak ve gerçekleştirmek.",
    },
  },
  vision: {
    fr: {
      title: "Vision",
      summary:
        "Consolider un rôle d’opérateur et de partenaire de développement dans la construction et les infrastructures.",
      body: `Numan Groupe International souhaite consolider son positionnement comme opérateur et partenaire de développement dans la construction et les infrastructures.

Le Groupe privilégie des projets clairement définis, techniquement réalisables, financièrement structurés et compatibles avec les priorités publiques ou privées des pays concernés.

Cette vision implique une sélection rigoureuse des projets, une analyse préalable des besoins et des contraintes, une répartition claire des responsabilités, une évaluation réaliste des coûts, des délais et des risques, le respect des normes applicables et un suivi documenté de l’exécution.`,
      seoTitle: "Vision — Numan Groupe International",
      seoDescription: "Vision de Numan Groupe International : projets définis, réalisables et structurés.",
    },
    en: {
      title: "Vision",
      summary:
        "Strengthen a role as operator and development partner in construction and infrastructure.",
      body: `Numan Groupe International aims to strengthen its position as an operator and development partner in construction and infrastructure.

The Group favours projects that are clearly defined, technically feasible, financially structured and compatible with the public or private priorities of the countries concerned.

This vision implies a rigorous selection of projects, a prior analysis of needs and constraints, a clear allocation of responsibilities, a realistic assessment of costs, time and risks, compliance with applicable standards, and documented follow-up of delivery.`,
      seoTitle: "Vision — Numan Groupe International",
      seoDescription: "Vision of Numan Groupe International: defined, feasible and structured projects.",
    },
    tr: {
      title: "Vizyon",
      summary: "İnşaat ve altyapıda işletmeci ve kalkınma ortağı konumunu pekiştirmek.",
      body: `Numan Groupe International, inşaat ve altyapı sektörlerinde işletmeci ve kalkınma ortağı konumunu pekiştirmeyi amaçlar.

Grup; net tanımlanmış, teknik olarak uygulanabilir, finansal olarak yapılandırılmış ve ilgili ülkelerin kamu ya da özel öncelikleriyle uyumlu projeleri tercih eder.

Bu vizyon; projelerin titiz seçimini, ihtiyaç ve kısıtların ön analizini, sorumlulukların açık dağılımını, maliyet, süre ve risklerin gerçekçi değerlendirmesini, yürürlükteki kurallara uyumu ve uygulamanın belgelenmiş takibini gerektirir.`,
      seoTitle: "Vizyon — Numan Groupe International",
      seoDescription: "Numan Groupe International vizyonu: tanımlanmış, uygulanabilir ve yapılandırılmış projeler.",
    },
  },
  finance: {
    fr: {
      title: "Développement et structuration financière",
      summary:
        "Préparer les éléments nécessaires à l’examen de la faisabilité technique et financière — sans présenter un financement comme acquis.",
      body: `Le Groupe peut accompagner les porteurs de projets dans la préparation des éléments nécessaires à l’examen de leur faisabilité technique et financière : définition du périmètre et des objectifs, analyse préliminaire des besoins, estimation initiale des coûts, identification des risques, proposition technique et financière, calendrier prévisionnel, identification des besoins en fonds propres, dette ou financement institutionnel, recherche de partenaires financiers, coordination des échanges et suivi des conditions préalables à la contractualisation.

Aucune solution de financement ne peut être considérée comme acquise avant la réalisation des vérifications nécessaires, l’accord des parties concernées et la signature des documents contractuels et financiers applicables.

La faisabilité d’un financement dépend notamment de la qualité du projet, de sa rentabilité ou de son impact public, du cadre juridique, des garanties disponibles, de la capacité de l’emprunteur et des exigences des financeurs.`,
      seoTitle: "Structuration financière — Numan Groupe International",
      seoDescription:
        "Préparation financière de projets : examen, accord des parties et contrats. Aucun financement n’est garanti d’avance.",
    },
    en: {
      title: "Project development and financial structuring",
      summary:
        "Prepare the material needed to examine technical and financial feasibility — without presenting financing as secured.",
      body: `The Group can support project owners in preparing the material needed to examine technical and financial feasibility: defining scope and objectives, a preliminary needs analysis, an initial cost estimate, identifying risks, a technical and financial proposal, an indicative timetable, identifying needs for equity, debt or institutional financing, seeking financial partners, coordinating exchanges and following conditions precedent to contracting.

No financing solution can be treated as secured before the necessary checks, the agreement of the parties concerned and the signature of the applicable contractual and financial documents.

Whether financing is feasible depends in particular on the quality of the project, its return or public impact, the legal framework, available guarantees, the borrower’s capacity and the requirements of the financiers.`,
      seoTitle: "Financial structuring — Numan Groupe International",
      seoDescription:
        "Financial preparation of projects: review, agreement of the parties and contracts. Financing is not guaranteed in advance.",
    },
    tr: {
      title: "Proje geliştirme ve finansal yapılandırma",
      summary:
        "Teknik ve finansal fizibilitenin incelenmesi için gerekli unsurları hazırlamak — finansmanı kazanılmış gibi sunmadan.",
      body: `Grup, proje sahiplerine teknik ve finansal fizibilitenin incelenmesi için gerekli unsurların hazırlanmasında eşlik edebilir: kapsam ve hedeflerin tanımı, ihtiyaçların ön analizi, ilk maliyet tahmini, risklerin belirlenmesi, teknik ve finansal teklif, öngörülen takvim, özkaynak, borç veya kurumsal finansman ihtiyaçlarının tespiti, finansal ortak arayışı, taraflar arasındaki yazışmaların koordinasyonu ve sözleşmeden önceki koşulların takibi.

Gerekli incelemeler, ilgili tarafların onayı ve uygulanacak sözleşme ile finansman belgelerinin imzası gerçekleşmeden hiçbir finansman çözümü kazanılmış sayılamaz.

Bir finansmanın fizibilitesi özellikle projenin niteliğine, getirisinin veya kamusal etkisine, hukuki çerçeveye, mevcut teminatlara, borçlunun kapasitesine ve finansörlerin gereklerine bağlıdır.`,
      seoTitle: "Finansal yapılandırma — Numan Groupe International",
      seoDescription:
        "Projelerde finansal hazırlık: inceleme, taraf onayı ve sözleşmeler. Finansman önceden garanti edilmez.",
    },
  },
  regions: {
    fr: {
      title: "Activités internationales et coopérations",
      summary:
        "Une activité fondée en Türkiye, tournée vers des coopérations en Afrique, en Asie et en Europe.",
      body: `## Afrique
Le Groupe examine des opportunités dans les infrastructures publiques, la santé, les transports, la logistique, le sport et l’aménagement urbain. Les interventions sont envisagées en coordination avec les autorités compétentes, les partenaires locaux et les entreprises qualifiées.

## Asie
L’Asie est une zone de développement des relations commerciales, techniques et institutionnelles dans la construction et les infrastructures. Le Groupe peut y rechercher des partenaires, des fournisseurs, des entreprises spécialisées et des opportunités de coopération.

## Europe
Depuis son siège social situé à Antalya, en République de Türkiye, Numan Groupe International développe ses relations avec des partenaires européens et internationaux. Cette implantation facilite la coordination administrative, commerciale et institutionnelle des activités du Groupe.`,
      seoTitle: "Coopération internationale — Numan Groupe International",
      seoDescription:
        "Coopérations internationales de Numan Groupe International : Afrique, Asie et Europe, à partir d’Antalya.",
    },
    en: {
      title: "International activity and cooperation",
      summary: "Work based in Türkiye, focused on cooperation in Africa, Asia and Europe.",
      body: `## Africa
The Group reviews opportunities in public infrastructure, health, transport, logistics, sport and urban development. Interventions are considered in coordination with the competent authorities, local partners and qualified companies.

## Asia
Asia is an area for developing commercial, technical and institutional relations in construction and infrastructure. The Group may look there for partners, suppliers, specialised firms and opportunities for cooperation.

## Europe
From its registered office in Antalya, Republic of Türkiye, Numan Groupe International develops relations with European and international partners. This base supports the administrative, commercial and institutional coordination of the Group’s work.`,
      seoTitle: "International cooperation — Numan Groupe International",
      seoDescription:
        "International cooperation of Numan Groupe International: Africa, Asia and Europe, from Antalya.",
    },
    tr: {
      title: "Uluslararası faaliyetler ve iş birlikleri",
      summary: "Türkiye merkezli faaliyet; Afrika, Asya ve Avrupa odaklı uluslararası iş birlikleri.",
      body: `## Afrika
Grup; kamu altyapısı, sağlık, ulaştırma, lojistik, spor ve kentsel gelişim alanlarında fırsatları inceler. Müdahaleler yetkili makamlar, yerel ortaklar ve nitelikli firmalarla koordinasyon içinde ele alınır.

## Asya
Asya, inşaat ve altyapıda ticari, teknik ve kurumsal ilişkilerin geliştirildiği bir alandır. Grup burada ortak, tedarikçi, uzman firma ve iş birliği fırsatları arayabilir.

## Avrupa
Türkiye Cumhuriyeti, Antalya’daki merkezinden Numan Groupe International, Avrupalı ve uluslararası ortaklarla ilişkilerini geliştirir. Bu yerleşim, faaliyetlerin idari, ticari ve kurumsal koordinasyonunu kolaylaştırır.`,
      seoTitle: "Uluslararası iş birliği — Numan Groupe International",
      seoDescription:
        "Numan Groupe International’ın uluslararası iş birlikleri: Afrika, Asya ve Avrupa; merkez Antalya.",
    },
  },
  approach: {
    fr: {
      title: "Méthode d’intervention",
      summary:
        "Sept étapes pour vérifier la cohérence d’un projet et préciser les conditions de sa réalisation.",
      body: `Le passage d’une étape à la suivante dépend de la disponibilité des informations, de la validation des parties concernées et de la satisfaction des conditions préalables.`,
      seoTitle: "Méthode — Numan Groupe International",
      seoDescription: "Méthode d’intervention de Numan Groupe International, de la qualification à la clôture.",
    },
    en: {
      title: "Working method",
      summary: "Seven steps to check that a project is coherent and to specify the conditions for delivery.",
      body: `Moving from one step to the next depends on the information available, validation by the parties concerned and fulfilment of the conditions precedent.`,
      seoTitle: "Method — Numan Groupe International",
      seoDescription: "Working method of Numan Groupe International, from qualification to close-out.",
    },
    tr: {
      title: "Çalışma yaklaşımı",
      summary: "Bir projenin tutarlılığını doğrulamak ve gerçekleşme koşullarını netleştirmek için yedi adım.",
      body: `Bir adımdan sonrakine geçiş; bilgilerin mevcut olmasına, ilgili tarafların onayına ve ön koşulların sağlanmasına bağlıdır.`,
      seoTitle: "Yöntem — Numan Groupe International",
      seoDescription: "Numan Groupe International çalışma yöntemi: fırsatın değerlendirilmesinden kapanışa.",
    },
  },
  principles: {
    fr: {
      title: "Principes et engagements",
      summary: "Rigueur, transparence, conformité, responsabilité, coopération et pérennité.",
      body: `Les engagements définitifs du Groupe sont ceux qui figurent dans les contrats, conventions, lettres de mission et autres documents officiellement approuvés par les parties.`,
      seoTitle: "Principes — Numan Groupe International",
      seoDescription: "Principes de fonctionnement et engagements de Numan Groupe International.",
    },
    en: {
      title: "Principles and commitments",
      summary: "Rigour, transparency, compliance, responsibility, cooperation and long-term continuity.",
      body: `The Group’s definitive commitments are those set out in the contracts, agreements, engagement letters and other documents formally approved by the parties.`,
      seoTitle: "Principles — Numan Groupe International",
      seoDescription: "Operating principles and commitments of Numan Groupe International.",
    },
    tr: {
      title: "İlkeler ve taahhütler",
      summary: "Titizlik, şeffaflık, mevzuata uygunluk, sorumluluk, iş birliği ve uzun vadeli sürdürülebilirlik.",
      body: `Grubun kesin yükümlülükleri; taraflarca resmi olarak onaylanmış sözleşmelerde, mutabakatlerde, görev yazılarında ve diğer belgelerde yer alanlardır.`,
      seoTitle: "İlkeler — Numan Groupe International",
      seoDescription: "Numan Groupe International’ın çalışma ilkeleri ve taahhütleri.",
    },
  },
  organization: {
    fr: {
      title: "Organisation et gouvernance",
      summary:
        "Des fonctions mobilisables selon le projet — sans présenter ici un effectif ou un organigramme chiffré.",
      body: `Numan Groupe International s’appuie sur une organisation comprenant des fonctions de direction, de développement international, d’ingénierie, d’architecture, de finance, de droit et de suivi opérationnel. La gouvernance est assurée par ses organes dirigeants conformément aux statuts et aux règles applicables.

Les fonctions mobilisables comprennent notamment la direction générale et la stratégie, le développement international, les relations institutionnelles, la gestion de projets, l’ingénierie et la supervision technique, l’architecture et les études de conception, la finance et la structuration, le droit et la gestion contractuelle, la conformité et les risques, la sécurité et le suivi opérationnel.

Pour chaque projet, la composition de l’équipe et la répartition des responsabilités sont définies selon le périmètre, le calendrier, les exigences techniques et les obligations contractuelles.`,
      seoTitle: "Organisation — Numan Groupe International",
      seoDescription: "Organisation et gouvernance de Numan Groupe International : fonctions mobilisables par projet.",
    },
    en: {
      title: "Organisation and governance",
      summary: "Functions that can be mobilised by project — without stating a headcount or a numbered chart here.",
      body: `Numan Groupe International relies on an organisation that includes management, international development, engineering, architecture, finance, legal and operational follow-up functions. Governance is provided by its governing bodies in accordance with the articles and applicable rules.

Functions that may be mobilised include general management and strategy, international development, institutional relations, project management, engineering and technical supervision, architecture and design studies, finance and structuring, legal and contract management, compliance and risk, safety and operational follow-up.

For each project, the team composition and the allocation of responsibilities are defined according to the scope, the timetable, the technical requirements and the contractual obligations.`,
      seoTitle: "Organisation — Numan Groupe International",
      seoDescription: "Organisation and governance of Numan Groupe International: functions mobilised by project.",
    },
    tr: {
      title: "Organizasyon ve yönetim",
      summary: "Projeye göre seferber edilebilen işlevler — burada sayısal kadro veya şema sunulmaz.",
      body: `Numan Groupe International; yönetim, uluslararası geliştirme, mühendislik, mimarlık, finans, hukuk ve operasyonel takip işlevlerini içeren bir organizasyona dayanır. Yönetişim, yürürlükteki esas sözleşme ve kurallara göre yönetim organlarınca sağlanır.

Seferber edilebilecek işlevler arasında genel müdürlük ve strateji, uluslararası geliştirme, kurumsal ilişkiler, proje yönetimi, mühendislik ve teknik denetim, mimarlık ve tasarım etütleri, finans ve yapılandırma, hukuk ve sözleşme yönetimi, uyum ve risk, güvenlik ve operasyonel takip yer alır.

Her projede ekibin bileşimi ve sorumluluk dağılımı kapsam, takvim, teknik gerekler ve sözleşmesel yükümlülüklere göre belirlenir.`,
      seoTitle: "Organizasyon — Numan Groupe International",
      seoDescription: "Numan Groupe International organizasyonu: projeye göre seferber edilen işlevler.",
    },
  },
  future: {
    fr: {
      title: "Orientations futures",
      summary: "Un développement sélectif, aligné sur les capacités, l’expérience et les ressources disponibles.",
      body: `Numan Groupe International entend développer ses activités de manière sélective.

Les priorités sont d’améliorer la préparation des projets, de renforcer les compétences internes et les partenariats spécialisés, de nouer des relations durables avec les institutions publiques et privées, d’accroître le suivi technique, financier et contractuel, de sélectionner des opérations dont le cadre juridique et financier est identifiable, et de favoriser des projets compatibles avec les exigences environnementales, sociales et opérationnelles applicables.

Chaque opportunité est évaluée au regard de sa faisabilité, de ses risques, des ressources nécessaires et de la capacité des partenaires à respecter leurs engagements.`,
      seoTitle: "Orientations — Numan Groupe International",
      seoDescription: "Orientations stratégiques de Numan Groupe International : développement sélectif.",
    },
    en: {
      title: "Future directions",
      summary: "Selective development, aligned with available capacity, experience and resources.",
      body: `Numan Groupe International intends to develop its work selectively.

Priorities are to improve project preparation, strengthen internal skills and specialised partnerships, build lasting relations with public and private institutions, increase technical, financial and contractual follow-up, select operations with an identifiable legal and financial framework, and favour projects compatible with applicable environmental, social and operational requirements.

Each opportunity is assessed against its feasibility, its risks, the resources required and the partners’ ability to meet their commitments.`,
      seoTitle: "Directions — Numan Groupe International",
      seoDescription: "Strategic directions of Numan Groupe International: selective development.",
    },
    tr: {
      title: "Gelecek yönelimleri",
      summary: "Mevcut kapasite, deneyim ve kaynaklarla uyumlu, seçici gelişim.",
      body: `Numan Groupe International faaliyetlerini seçici biçimde geliştirmeyi amaçlar.

Öncelikler; proje hazırlığının niteliğini artırmak, iç yetkinlikleri ve uzman ortaklıkları güçlendirmek, kamu ve özel kurumlarla kalıcı ilişkiler kurmak, teknik, finansal ve sözleşmesel takibi artırmak, hukuki ve finansal çerçevesi tanımlanabilir işleri seçmek ve yürürlükteki çevresel, sosyal ve operasyonel gereklerle uyumlu projeleri öne almaktır.

Her fırsat fizibilitesi, riskleri, gereken kaynaklar ve ortakların taahhütlerini yerine getirme kapasitesi açısından değerlendirilir.`,
      seoTitle: "Yönelimler — Numan Groupe International",
      seoDescription: "Numan Groupe International’ın stratejik yönelimleri: seçici gelişim.",
    },
  },
};
