import type { Locale } from "@/i18n/config";

export type LocalizedBlock = Record<
  Locale,
  { title: string; summary: string; body: string; seoTitle: string; seoDescription: string }
>;

export const expertiseBodies: Record<string, Record<Locale, string>> = {
  stades: {
    fr: `Un stade n’est pas seulement une jauge : c’est un lieu de flux, de sécurité, d’image et d’exploitation quotidienne. NUMAN GROUPE aborde cet équipement comme un projet d’ingénierie et de construction où l’architecture, la structure, les réseaux et le confort des publics doivent rester lisibles jusqu’à la remise.

Notre travail commence par le programme. Combien de publics, quels usages hors match, quelles exigences d’accessibilité, quels locaux techniques ? Ces questions précèdent tout dessin. Elles évitent de figer trop tôt une forme qui ne tiendrait pas l’exploitation.

Le périmètre type couvre la conception des tribunes et des circulations, les accès contrôlés, les locaux médias et hospitalité, les vestiaires, les parkings et les espaces de service. Nous coordonnons aussi les interfaces avec l’éclairage, l’audiovisuel et la sécurité incendie, sans prétendre remplacer les bureaux spécialisés lorsque le marché l’exige.

La méthode privilégie des lots clairs, des maquettes de coordination et des points de contrôle avant chaque phase sensible. Les exemples publiés sur ce site sont des projets de démonstration : ils illustrent une manière de raconter un stade, pas une jauge livrée ni un contrat signé.

Si vous préparez un équipement sportif, le plus utile est de partager le programme, le site et les contraintes d’exploitation. Nous pourrons alors indiquer comment structurer les études, sans inventer un calendrier que le terrain n’a pas encore validé.`,
    en: `A stadium is more than a seating figure: it is a place of flows, safety, image and day-to-day operations. NUMAN GROUPE treats this facility as a construction and engineering project in which architecture, structure, services and public comfort must remain readable through to handover.

Work starts with the brief. How many publics, which uses outside match days, which accessibility requirements, which plant rooms? Those questions come before any drawing. They prevent locking a form that would not survive operations.

A typical scope covers stands and circulation, controlled access, media and hospitality rooms, changing areas, parking and service yards. We also coordinate interfaces with lighting, audiovisual systems and fire safety, without claiming to replace specialist consultants when the contract requires them.

The method favours clear packages, coordination models and hold points before each sensitive phase. The examples on this site are demonstration projects: they show how a stadium can be presented, not a delivered capacity or a signed contract.

If you are preparing a sports venue, the most useful first step is to share the programme, the site and the operating constraints. We can then outline how to structure the studies, without inventing a timetable the ground has not yet confirmed.`,
    tr: `Stadyum yalnızca bir seyirci sayısı değildir: akış, güvenlik, imaj ve günlük işletmenin bir arada tutulduğu bir tesistir. NUMAN GROUPE bu yapıyı, mimari, strüktür, tesisat ve kamu konforunun teslime kadar okunaklı kaldığı bir inşaat ve mühendislik işi olarak ele alır.

İş programla başlar. Kaç kullanıcı, maç dışı hangi kullanımlar, erişilebilirlik gerekleri, hangi teknik hacimler? Bu sorular çizimden önce gelir. İşletmeye dayanamayacak bir formu erken kilitlemeyi önler.

Tipik kapsam tribün ve dolaşım, kontrollü girişler, medya ve ağırlama mekânları, soyunma alanları, otopark ve servis avlularını kapsar. Aydınlatma, görüntü-ses ve yangın güvenliği arayüzlerini de koordine ederiz; sözleşme uzman danışman gerektirdiğinde onların yerini aldığımızı iddia etmeyiz.

Yöntem, net iş paketleri, koordinasyon modelleri ve hassas evrelerden önce durak noktalarını öne alır. Bu sitedeki örnekler gösterim projeleridir: bir stadyumun nasıl anlatılabileceğini gösterir, teslim edilmiş kapasite veya imzalı sözleşme değildir.

Spor tesisi hazırlıyorsanız ilk adım programı, yeri ve işletme kısıtlarını paylaşmaktır. Arazi doğrulamadan takvim uydurmadan, etütlerin nasıl kurgulanacağını birlikte netleştirebiliriz.`,
  },
  hopitaux: {
    fr: `Un hôpital impose une discipline que peu d’équipements partagent : continuité de service, hygiène, flux séparés et capacité à évoluer sans arrêter les soins. NUMAN GROUPE aborde le bâtiment hospitalier comme un ouvrage technique autant qu’architectural.

Le programme médical guide tout le reste. Consultations, hospitalisation, imagerie, blocs, logistique et locaux du personnel ne peuvent pas être dessinés comme des pièces interchangeables. Chaque circuit — public, soignant, technique, déchets — doit rester distinct.

Le périmètre habituel comprend la structure, les enveloppes, les plateaux techniques, les réseaux médicaux et les espaces d’accueil. La coordination avec les équipements biomédicaux et les exigences de sûreté fait partie du suivi, dans le respect des missions confiées aux spécialistes.

Nous privilégions une planification par phases, des zones tampons et une documentation claire des interfaces. Les établissements présentés ici sont des scénarios de démonstration : aucun lit, aucun plateau ni aucune mise en service réelle n’est allégué.

Pour un projet de santé, transmettez le schéma directeur, les contraintes de site et le niveau d’activité visé. Nous indiquerons comment organiser les études et le chantier, sans inventer une capacité ou un agrément.`,
    en: `A hospital demands a discipline few facilities share: continuity of service, hygiene, separated flows and the ability to change without stopping care. NUMAN GROUPE treats the hospital building as a technical work as much as an architectural one.

The clinical brief leads everything else. Outpatients, inpatient wards, imaging, theatres, logistics and staff rooms cannot be drawn as interchangeable boxes. Each circuit — public, clinical, technical, waste — must stay distinct.

Typical scope includes structure, envelopes, technical floors, medical services and reception spaces. Coordination with biomedical equipment and security requirements is part of the follow-up, within the missions given to specialists.

We favour phased planning, buffer zones and clear interface records. The facilities shown here are demonstration scenarios: no bed count, no theatre suite and no real commissioning is claimed.

For a healthcare project, share the master plan, site constraints and the intended activity level. We will outline how to organise studies and the works, without inventing a capacity or an approval.`,
    tr: `Hastane, az tesisin paylaştığı bir disiplin ister: hizmet sürekliliği, hijyen, ayrılmış akışlar ve bakımı durdurmadan evrilebilme. NUMAN GROUPE hastane yapısını mimari olduğu kadar teknik bir eser olarak ele alır.

Klinik program geri kalan her şeyi yönlendirir. Poliklinik, yatan hasta, görüntüleme, ameliyathane, lojistik ve personel mekânları birbirinin yerine geçen kutular gibi çizilemez. Kamu, klinik, teknik ve atık devreleri ayrı kalmalıdır.

Tipik kapsam strüktür, kabuk, teknik katlar, tıbbi tesisat ve karşılama alanlarını içerir. Biyomedikal ekipman ve güvenlik gerekleriyle koordinasyon, uzmanlara verilen görevler çerçevesinde takibin parçasıdır.

Aşamalı planlama, tampon bölgeler ve net arayüz kayıtlarını tercih ederiz. Burada gösterilen tesisler gösterim senaryolarıdır: yatak sayısı, ameliyathane paketi veya gerçek bir devreye alma iddia edilmez.

Sağlık projesi için master planı, yer kısıtlarını ve hedeflenen faaliyet düzeyini iletin. Kapasite veya ruhsat uydurmadan, etüt ve uygulamanın nasıl kurgulanacağını birlikte netleştiririz.`,
  },
  "villages-sportifs": {
    fr: `Un village sportif rassemble des usages qui ne vivent pas au même rythme : entraînement, hébergement, restauration, soins et parfois compétition. NUMAN GROUPE le traite comme un campus : des bâtiments distincts, une voirie partagée, des réseaux communs et une exploitation quotidienne.

La première tâche est de hiérarchiser les flux. Athlètes, staff, prestataires et visiteurs ne doivent pas se croiser au mauvais endroit. Les distances, les horaires et les accès de service comptent autant que l’image des façades.

Le périmètre peut inclure salles, terrains, logements temporaires, restauration, locaux médicaux légers et espaces de récupération. L’enjeu n’est pas d’empiler des équipements, mais de les faire fonctionner ensemble sans surdimensionner ce qui ne sera utilisé que quelques semaines.

La méthode insiste sur un plan masse lisible, des phasages possibles et une maintenance simple. Les villages présentés sur ce site sont des exemples pédagogiques : aucun événement réel, aucune délégation ni aucun village olympique n’est évoqué.

Si vous préparez un ensemble sportif, décrivez les disciplines, la durée d’occupation et le devenir des bâtiments après l’événement. Nous aiderons à cadrer le programme, sans inventer une jauge ou un calendrier officiel.`,
    en: `A sports village gathers uses that do not live at the same pace: training, lodging, catering, care and sometimes competition. NUMAN GROUPE treats it as a campus: distinct buildings, shared roads, common networks and daily operations.

The first task is to rank the flows. Athletes, staff, suppliers and visitors must not meet in the wrong place. Distances, hours and service access matter as much as the look of the façades.

Scope may include halls, pitches, temporary housing, catering, light medical rooms and recovery spaces. The point is not to stack facilities, but to make them work together without oversizing what will be used for only a few weeks.

The method insists on a readable master plan, possible phasing and simple maintenance. Villages shown here are teaching examples: no real event, no host-city role and no Olympic village is implied.

If you are preparing a sports ensemble, describe the disciplines, the occupation period and what the buildings become afterwards. We will help frame the brief, without inventing a capacity or an official timetable.`,
    tr: `Spor köyü, aynı ritimde yaşamayan kullanımları bir araya getirir: antrenman, konaklama, yemek, bakım ve bazen yarışma. NUMAN GROUPE bunu bir kampüs gibi ele alır: ayrı binalar, ortak yollar, ortak şebekeler ve günlük işletme.

İlk iş akışları sıralamaktır. Sporcular, ekip, tedarikçiler ve ziyaretçiler yanlış yerde kesişmemelidir. Mesafe, saat ve servis erişimi, cephe görünümü kadar önemlidir.

Kapsam salonlar, sahalar, geçici konut, yemek, hafif tıbbi odalar ve toparlanma alanlarını içerebilir. Amaç tesis yığmak değil; birkaç hafta kullanılacak olanı şişirmeden birlikte çalıştırmaktır.

Yöntem okunaklı bir vaziyet planı, olası etaplama ve sade bakımı vurgular. Buradaki köyler öğretici örneklerdir: gerçek bir etkinlik, ev sahipliği veya olimpiyat köyü ima edilmez.

Spor yerleşkesi hazırlıyorsanız branşları, kullanım süresini ve binaların sonrasını anlatın. Resmî takvim veya kapasite uydurmadan programı çerçevelemeye yardımcı oluruz.`,
  },
  logements: {
    fr: `Un ensemble de logements — notamment un campus résidentiel ou des logements de fonction — doit tenir dans la durée : confort, entretien, stationnement, espaces communs et relation au quartier. NUMAN GROUPE aborde ce type de projet comme un tissu habité, pas comme une série de blocs isolés.

Le programme précise d’abord qui habite, pour combien de temps, et quels services sont partagés. Logements de personnel, familles d’accueil temporaire ou résidence liée à un équipement n’ont pas les mêmes exigences de surface ni de gestion.

Le périmètre couvre généralement les bâtiments, les voiries internes, les locaux communs, les locaux techniques et les aménagements extérieurs. La qualité se joue autant dans les seuils, la lumière et l’acoustique que dans le nombre de logements — un chiffre que nous ne fabriquons pas ici.

La méthode privilégie des typologies claires, des circulations sûres et une maintenance réaliste. Les campus présentés sont des projets de démonstration : aucun maître d’ouvrage nommé, aucune capacité habitée, aucune date de livraison réelle.

Pour un projet résidentiel, transmettez le site, le type d’occupation et les contraintes de gestion. Nous indiquerons comment structurer les études, sans inventer un quartier ou un volume de ventes.`,
    en: `A housing ensemble — especially a residential campus or staff housing — must last: comfort, upkeep, parking, shared spaces and a relationship to the neighbourhood. NUMAN GROUPE treats this as inhabited fabric, not a row of isolated blocks.

The brief first states who lives there, for how long, and which services are shared. Staff housing, short-stay families or a residence tied to a facility do not share the same area or management needs.

Scope usually covers buildings, internal roads, shared rooms, plant and outdoor works. Quality sits as much in thresholds, light and acoustics as in a dwelling count — a figure we do not invent here.

The method favours clear types, safe circulation and realistic maintenance. Campuses shown are demonstration projects: no named client, no occupied capacity, no real handover date.

For a residential project, share the site, the occupation type and the management constraints. We will outline how to structure the studies, without inventing a district or a sales volume.`,
    tr: `Bir konut yerleşkesi — özellikle lojman veya görev konutları — süreklilik ister: konfor, bakım, otopark, ortak alanlar ve çevreyle ilişki. NUMAN GROUPE bunu yalıtılmış bloklar dizisi değil, yaşanan bir doku olarak ele alır.

Program önce kimlerin, ne kadar süre ve hangi ortak hizmetlerle oturacağını belirtir. Personel lojmanı, kısa konaklama veya bir tesise bağlı konut aynı alan ve işletme ihtiyacını paylaşmaz.

Kapsam genelde binaları, iç yolları, ortak mekânları, teknik hacimleri ve dış düzenlemeyi içerir. Kalite, burada uydurmadığımız konut sayısı kadar eşikler, ışık ve akustikte belirir.

Yöntem net tipolojiler, güvenli dolaşım ve gerçekçi bakımı öne alır. Gösterilen yerleşkeler örnek projelerdir: adlı işveren, dolu kapasite veya gerçek teslim tarihi yoktur.

Konut projesi için yeri, kullanım türünü ve işletme kısıtlarını iletin. Mahalle veya satış hacmi uydurmadan etütlerin nasıl kurgulanacağını netleştiririz.`,
  },
};

const pages = {
  about: {
    fr: {
      title: "Le Groupe",
      summary:
        "NUMAN GROUPE est une entreprise internationale de construction et d’ingénierie, centrée sur les stades, les hôpitaux, les villages sportifs et les logements.",
      body: `NUMAN GROUPE conçoit et réalise des équipements publics et des ensembles résidentiels. Notre métier relie l’ingénierie, la coordination de chantier et le respect du programme confié par le maître d’ouvrage.

Nous intervenons aujourd’hui sur quatre familles d’ouvrages : stades, hôpitaux, villages sportifs et logements — notamment les campus résidentiels et les logements de fonction. Ces domaines peuvent être enrichis depuis l’espace d’administration ; ils ne prétendent pas couvrir tout le bâtiment.

Cette page décrit une manière de travailler, pas un palmarès. Aucun pays d’implantation, aucun effectif, aucun chiffre d’affaires et aucune alliance officielle ne sont avancés ici. Les projets et visites publiés en démonstration portent une mention explicite : ce sont des exemples de présentation, pas des références livrées.

Le Groupe s’adresse à des maîtres d’ouvrage qui ont besoin d’un interlocuteur capable de tenir ensemble le dessin, les interfaces techniques et le suivi d’exécution. Lorsque le dossier l’exige, nous travaillons avec des bureaux spécialisés plutôt que d’élargir artificiellement notre rôle.`,
      seoTitle: "Le Groupe — NUMAN GROUPE",
      seoDescription:
        "Présentation de NUMAN GROUPE : construction et ingénierie, stades, hôpitaux, villages sportifs et logements.",
    },
    en: {
      title: "The Group",
      summary:
        "NUMAN GROUPE is an international construction and engineering company focused on stadiums, hospitals, sports villages and housing.",
      body: `NUMAN GROUPE designs and builds public facilities and residential ensembles. The work joins engineering, site coordination and respect for the brief given by the client.

We currently work across four families of buildings: stadiums, hospitals, sports villages and housing — including residential campuses and staff housing. These fields can be extended from the admin panel; they do not claim to cover every building type.

This page describes a way of working, not a track record. No country of establishment, headcount, turnover or official alliance is stated here. Demonstration projects and visits carry a clear label: they are presentation examples, not delivered references.

The Group speaks to clients who need one counterpart able to hold drawing, technical interfaces and site follow-up together. When the file requires it, we work with specialist offices rather than stretching our role.`,
      seoTitle: "The Group — NUMAN GROUPE",
      seoDescription:
        "About NUMAN GROUPE: construction and engineering for stadiums, hospitals, sports villages and housing.",
    },
    tr: {
      title: "Grup",
      summary:
        "NUMAN GROUPE, stadyum, hastane, spor köyü ve lojman odaklı uluslararası bir inşaat ve mühendislik firmasıdır.",
      body: `NUMAN GROUPE kamu tesisleri ve konut yerleşkeleri tasarlar ve uygular. İşimiz mühendisliği, şantiye koordinasyonunu ve işverenin verdiği programa bağlılığı bir arada tutar.

Bugün dört yapı ailesinde çalışıyoruz: stadyumlar, hastaneler, spor köyleri ve konutlar — özellikle lojman ve görev konutları. Bu alanlar yönetim panelinden genişletilebilir; her yapı türünü kapsadığımız iddiası yoktur.

Bu sayfa bir çalışma biçimini anlatır, bir başarı listesi değildir. Kuruluş ülkesi, çalışan sayısı, ciro veya resmî ittifak belirtilmez. Gösterim projeleri ve ziyaretler açık etiket taşır: bunlar sunum örnekleridir, teslim edilmiş referans değildir.

Grup, çizimi, teknik arayüzleri ve uygulama takibini birlikte tutacak bir muhatap arayan işverenlere hitap eder. Dosya gerektirdiğinde rolümüzü şişirmek yerine uzman ofislerle çalışırız.`,
      seoTitle: "Grup — NUMAN GROUPE",
      seoDescription:
        "NUMAN GROUPE hakkında: stadyum, hastane, spor köyü ve lojman için inşaat ve mühendislik.",
    },
  },
  mission: {
    fr: {
      title: "Mission",
      summary: "Tenir le programme, coordonner les métiers et livrer un ouvrage exploitable.",
      body: `Notre mission est de transformer un programme en ouvrage constructible, puis en lieu exploitable. Cela suppose d’écouter le maître d’ouvrage, de nommer les contraintes tôt et de ne pas promettre ce que les études n’ont pas encore établi.

Nous nous engageons à documenter les choix, à signaler les interfaces sensibles et à garder une chaîne de décision lisible. La mission n’inclut pas de garantir un label, une subvention ou un partenariat public.`,
      seoTitle: "Mission — NUMAN GROUPE",
      seoDescription: "Mission de NUMAN GROUPE : programme, coordination et ouvrage exploitable.",
    },
    en: {
      title: "Mission",
      summary: "Hold the brief, coordinate the trades and deliver a building that can be operated.",
      body: `Our mission is to turn a brief into a buildable work, then into a place that can be run. That means listening to the client, naming constraints early and not promising what studies have not yet established.

We commit to recording choices, flagging sensitive interfaces and keeping a readable decision chain. The mission does not include guaranteeing a label, a grant or a public partnership.`,
      seoTitle: "Mission — NUMAN GROUPE",
      seoDescription: "NUMAN GROUPE mission: brief, coordination and an operable building.",
    },
    tr: {
      title: "Misyon",
      summary: "Programı tutmak, meslekleri koordine etmek ve işletilebilir bir yapı teslim etmek.",
      body: `Misyonumuz bir programı inşa edilebilir bir esere, ardından işletilebilir bir yere dönüştürmektir. Bu, işvereni dinlemek, kısıtları erken adlandırmak ve etütlerin henüz kurmadığı şeyi vaat etmemek demektir.

Seçimleri belgelemek, hassas arayüzleri işaretlemek ve okunaklı bir karar zinciri tutmak taahhüdümüzdür. Misyon bir belge, hibe veya kamu ortaklığı garanti etmeyi kapsamaz.`,
      seoTitle: "Misyon — NUMAN GROUPE",
      seoDescription: "NUMAN GROUPE misyonu: program, koordinasyon ve işletilebilir yapı.",
    },
  },
  approach: {
    fr: {
      title: "Principes de travail",
      summary: "Clarté du programme, coordination des interfaces, prudence sur ce qui n’est pas encore prouvé.",
      body: `Nous travaillons avec quatre principes simples.

Premier : le programme précède la forme. Un dessin élégant qui ne tient pas les flux n’est pas un projet abouti.

Deuxième : les interfaces se nomment. Structure, fluides, enveloppe et exploitation doivent se parler avant le chantier, pas après un désordre.

Troisième : la sécurité n’est pas un chapitre décoratif. Elle conditionne les accès, les phasages et les contrôles.

Quatrième : ce qui n’est pas documenté n’est pas annoncé comme un fait. Les contenus de démonstration de ce site portent donc une mention visible.`,
      seoTitle: "Principes de travail — NUMAN GROUPE",
      seoDescription: "Principes de travail de NUMAN GROUPE : programme, interfaces, sécurité, honnêteté.",
    },
    en: {
      title: "Working principles",
      summary: "A clear brief, coordinated interfaces, and caution about what is not yet proven.",
      body: `We work with four simple principles.

First: the brief precedes form. An elegant drawing that fails the flows is not a finished project.

Second: interfaces are named. Structure, services, envelope and operations must talk before site works, not after a clash.

Third: safety is not a decorative chapter. It shapes access, phasing and checks.

Fourth: what is not documented is not announced as fact. Demonstration content on this site therefore carries a visible label.`,
      seoTitle: "Working principles — NUMAN GROUPE",
      seoDescription: "NUMAN GROUPE principles: brief, interfaces, safety, honesty.",
    },
    tr: {
      title: "Çalışma ilkeleri",
      summary: "Net program, koordine arayüzler ve henüz kanıtlanmayan konusunda ihtiyat.",
      body: `Dört yalın ilkeyle çalışırız.

Bir: program biçimden önce gelir. Akışları tutmayan zarif bir çizim bitmiş proje değildir.

İki: arayüzler adlandırılır. Strüktür, tesisat, kabuk ve işletme şantiyeden önce konuşmalıdır.

Üç: güvenlik süs bir bölüm değildir. Erişimi, etaplamayı ve kontrolleri belirler.

Dört: belgelenmeyen, olgu gibi duyurulmaz. Bu yüzden sitedeki gösterim içerikleri görünür etiket taşır.`,
      seoTitle: "Çalışma ilkeleri — NUMAN GROUPE",
      seoDescription: "NUMAN GROUPE ilkeleri: program, arayüz, güvenlik, dürüstlük.",
    },
  },
  quality: {
    fr: {
      title: "Qualité, sécurité et coordination",
      summary: "Contrôles, interfaces et suivi de chantier — sans certificat inventé.",
      body: `La qualité, pour nous, est d’abord une affaire de méthode : points d’arrêt, revue des plans d’exécution, suivi des non-conformités et clarté de qui décide.

La sécurité conditionne les circulations de chantier, les co-activités et la réception des ouvrages. Elle n’est pas présentée ici comme un label obtenu.

La coordination relie les lots. Un stade, un hôpital ou un campus résidentiel échoue souvent aux joints — entre structure et enveloppe, entre fluides et second œuvre, entre bâtiment et exploitation.

Aucun certificat, aucune norme nominative et aucun audit tiers ne sont cités sur cette page : ils n’ont pas été fournis comme faits vérifiables.`,
      seoTitle: "Qualité et coordination — NUMAN GROUPE",
      seoDescription: "Approche qualité, sécurité et coordination de NUMAN GROUPE, sans certificat inventé.",
    },
    en: {
      title: "Quality, safety and coordination",
      summary: "Checks, interfaces and site follow-up — without an invented certificate.",
      body: `Quality, for us, is first a matter of method: hold points, review of shop drawings, follow-up of non-conformities and clarity about who decides.

Safety shapes site circulation, concurrent work and reception of the works. It is not presented here as a label already earned.

Coordination ties the packages together. A stadium, a hospital or a residential campus often fails at the joints — between structure and envelope, services and finishes, building and operations.

No certificate, named standard or third-party audit is cited on this page: they have not been supplied as verifiable facts.`,
      seoTitle: "Quality and coordination — NUMAN GROUPE",
      seoDescription: "NUMAN GROUPE quality, safety and coordination — no invented certificate.",
    },
    tr: {
      title: "Kalite, güvenlik ve koordinasyon",
      summary: "Kontroller, arayüzler ve şantiye takibi — uydurma sertifika olmadan.",
      body: `Kalite bizim için önce yöntemdir: durak noktaları, imalat resmi incelemesi, uygunsuzluk takibi ve kimin karar verdiğinin açıklığı.

Güvenlik şantiye dolaşımını, eşzamanlı işleri ve kabulü belirler. Burada kazanılmış bir belge gibi sunulmaz.

Koordinasyon iş paketlerini bağlar. Stadyum, hastane veya konut yerleşkesi çoğu zaman ek yerlerinde — strüktür ile kabuk, tesisat ile ince iş, yapı ile işletme arasında — zayıflar.

Bu sayfada sertifika, adlı standart veya üçüncü taraf denetim anılmaz: doğrulanabilir olgu olarak verilmemiştir.`,
      seoTitle: "Kalite ve koordinasyon — NUMAN GROUPE",
      seoDescription: "NUMAN GROUPE kalite, güvenlik ve koordinasyon — uydurma sertifika yok.",
    },
  },
  contact: {
    fr: {
      title: "Contact",
      summary: "Décrivez votre projet. Nous revenons vers vous avec une suite de travail, pas un devis inventé.",
      body: `Utilisez le formulaire pour une demande de projet ou une question de coordination. Indiquez l’usage visé (stade, hôpital, village sportif, logements), le site s’il est connu, et le niveau d’études déjà réalisé.

Aucun numéro, aucune adresse postale et aucun courriel public n’est publié ici tant qu’ils n’ont pas été fournis comme informations officielles. Les réseaux absents ne sont pas remplacés par des liens factices.

Après envoi, votre message est enregistré. Un membre de l’équipe le traite depuis l’espace d’administration. Ce n’est pas une confirmation automatique de mission.`,
      seoTitle: "Contact — NUMAN GROUPE",
      seoDescription: "Contacter NUMAN GROUPE pour un projet de construction ou d’ingénierie.",
    },
    en: {
      title: "Contact",
      summary: "Describe your project. We will reply with a next working step, not an invented quote.",
      body: `Use the form for a project request or a coordination question. State the intended use (stadium, hospital, sports village, housing), the site if known, and the study level already done.

No phone number, postal address or public email is published here until they are supplied as official details. Missing social profiles are not replaced with dummy links.

After you send, the message is stored. A team member handles it from the admin panel. This is not an automatic award of work.`,
      seoTitle: "Contact — NUMAN GROUPE",
      seoDescription: "Contact NUMAN GROUPE about a construction or engineering project.",
    },
    tr: {
      title: "İletişim",
      summary: "Projenizi anlatın. Uydurma teklif değil, sonraki çalışma adımıyla döneriz.",
      body: `Proje talebi veya koordinasyon sorusu için formu kullanın. Hedef kullanımı (stadyum, hastane, spor köyü, lojman), biliniyorsa yeri ve mevcut etüt düzeyini yazın.

Resmî bilgi olarak verilmedikçe telefon, posta adresi veya genel e-posta yayımlanmaz. Eksik sosyal profiller sahte bağlantıyla doldurulmaz.

Gönderimden sonra ileti kaydedilir. Bir ekip üyesi onu yönetim panelinden işler. Bu, işin otomatik verildiği anlamına gelmez.`,
      seoTitle: "İletişim — NUMAN GROUPE",
      seoDescription: "İnşaat veya mühendislik projesi için NUMAN GROUPE ile iletişim.",
    },
  },
} satisfies Record<string, LocalizedBlock>;

export const pageCopy = pages;

export const homeCopy: Record<
  Locale,
  {
    heroTitle: string;
    heroDescription: string;
    introTitle: string;
    introBody: string;
    ctaTitle: string;
    ctaDescription: string;
    ctaLabel: string;
    ctaHref: string;
    footerTagline: string;
    seoTitle: string;
    seoDescription: string;
  }
> = {
  fr: {
    heroTitle: "Construire les infrastructures de demain.",
    heroDescription:
      "Stades, hôpitaux, villages sportifs et logements : une ingénierie internationale, exposée ici avec des exemples clairement identifiés comme démonstration.",
    introTitle: "Une entreprise internationale de construction et d’ingénierie.",
    introBody:
      "NUMAN GROUPE relie conception, planification, réalisation et remise. Les pages qui suivent présentent notre approche et des projets d’exemple — jamais un client nommé, jamais un chiffre inventé.",
    ctaTitle: "Parlons de votre prochain équipement.",
    ctaDescription:
      "Décrivez le programme et le site. Nous indiquerons une suite de travail, sans devis fictif ni délai improvisé.",
    ctaLabel: "Envoyer une demande",
    ctaHref: "/contact",
    footerTagline: "Construction et ingénierie — stades, hôpitaux, villages sportifs, logements.",
    seoTitle: "NUMAN GROUPE — Construction et ingénierie",
    seoDescription:
      "NUMAN GROUPE, entreprise internationale de construction et d’ingénierie : stades, hôpitaux, villages sportifs et logements.",
  },
  en: {
    heroTitle: "Building the infrastructures of tomorrow.",
    heroDescription:
      "Stadiums, hospitals, sports villages and housing: international engineering, shown here with examples clearly labelled as demonstration.",
    introTitle: "An international construction and engineering company.",
    introBody:
      "NUMAN GROUPE joins design, planning, delivery and handover. The pages that follow present our approach and sample projects — never a named client, never an invented figure.",
    ctaTitle: "Let’s talk about your next facility.",
    ctaDescription:
      "Describe the brief and the site. We will outline a next working step, without a fictional quote or an improvised deadline.",
    ctaLabel: "Send a request",
    ctaHref: "/en/contact",
    footerTagline: "Construction and engineering — stadiums, hospitals, sports villages, housing.",
    seoTitle: "NUMAN GROUPE — Construction and engineering",
    seoDescription:
      "NUMAN GROUPE, an international construction and engineering company: stadiums, hospitals, sports villages and housing.",
  },
  tr: {
    heroTitle: "Yarının altyapılarını inşa etmek.",
    heroDescription:
      "Stadyumlar, hastaneler, spor köyleri ve lojmanlar: uluslararası mühendislik; burada açıkça örnek olarak işaretlenen içeriklerle.",
    introTitle: "Uluslararası bir inşaat ve mühendislik firması.",
    introBody:
      "NUMAN GROUPE tasarım, planlama, uygulama ve teslimi birleştirir. İzleyen sayfalar yaklaşımımızı ve örnek projeleri sunar — adlı müşteri yok, uydurma rakam yok.",
    ctaTitle: "Bir sonraki tesisinizi konuşalım.",
    ctaDescription:
      "Programı ve yeri anlatın. Kurmaca teklif veya uydurma süre olmadan sonraki adımı belirtiriz.",
    ctaLabel: "Talep gönderin",
    ctaHref: "/tr/iletisim",
    footerTagline: "İnşaat ve mühendislik — stadyum, hastane, spor köyü, lojman.",
    seoTitle: "NUMAN GROUPE — İnşaat ve mühendislik",
    seoDescription:
      "NUMAN GROUPE, uluslararası inşaat ve mühendislik: stadyumlar, hastaneler, spor köyleri ve lojmanlar.",
  },
};
