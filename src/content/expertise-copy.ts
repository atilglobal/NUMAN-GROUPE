import type { Locale, Localized } from "@/i18n/config";

export type ExpertiseLocaleCopy = {
  body: string;
  seoTitle: string;
  seoDescription: string;
  coverAlt: string;
};

export type ExpertiseDetailCopy = {
  slugs: Localized;
  locales: Record<Locale, ExpertiseLocaleCopy>;
};

export const expertiseDetailCopy: ExpertiseDetailCopy[] = [
  {
    slugs: { fr: "stades", en: "stadiums", tr: "stadyumlar" },
    locales: {
      fr: {
        seoTitle: "Stades et enceintes sportives",
        seoDescription:
          "Stades et enceintes sportives : analyse du besoin, coordination technique et suivi de réalisation selon le contrat. Sans catalogue d’ouvrages livrés.",
        coverAlt: "Illustration : tribunes et pelouse d’un stade, visuel de catégorie et non un ouvrage livré.",
        body: `Les enceintes sportives demandent une lecture claire du programme avant toute décision de forme. Le type de sport, le mode d’exploitation, les flux de public et les exigences de sécurité déterminent le périmètre plus sûrement qu’un modèle-type. NUMAN GROUPE aborde les stades comme un travail de développement de projet : préciser le besoin, coordonner les études et les partenaires techniques, puis suivre la réalisation dans le cadre fixé par le contrat.

Cette page ne décrit pas un catalogue de stades livrés, ni une capacité d’accueil, ni un pays d’intervention. Elle n’avance aucune année d’expérience sectorielle, aucun certificat et aucune garantie de financement. Le Groupe peut, selon le mandat, contribuer à une construction nouvelle, à une rénovation ou à une réhabilitation. Ce choix n’est pas un principe appliqué par défaut : il dépend du site, de l’état de l’existant, des contraintes d’exploitation et des documents contractuels.

La planification du terrain de jeu et des tribunes s’appuie sur le sport pratiqué, le niveau de compétition visé et, le cas échéant, les usages hors match demandés par le maître d’ouvrage. La visibilité depuis les places, les cheminements du public, la séparation des flux sportifs, personnels et de service, ainsi que l’accès des personnes à mobilité réduite font partie des questions à instruire avec les bureaux compétents. L’éclairage, la maintenance et les conditions d’exploitation quotidienne sont examinés comme des exigences de projet, non comme des performances déjà démontrées sur un ouvrage du Groupe.

NUMAN GROUPE ne se substitue pas aux concepteurs ni aux entreprises titulaires. Lorsqu’une mission lui est confiée, elle consiste à clarifier le besoin, à tenir la cohérence entre les parties prenantes et à suivre l’avancement au regard des livrables convenus. Les thèmes ci-dessous sont des champs de travail possibles. Ils ne deviennent un engagement de livraison que s’ils sont retenus dans le programme et le contrat.

Les échanges avec le maître d’ouvrage portent d’abord sur ce qui est déjà connu — site, usages, contraintes, calendrier indicatif — et sur ce qui reste à instruire. Le passage d’une étape à la suivante dépend des informations disponibles, de la validation des parties et des conditions prévues aux documents. Rien dans ce texte n’élargit à lui seul le mandat.

## Périmètre de travail possible
- Planification du terrain de jeu et des tribunes, selon le sport et le programme.
- Visibilité des spectateurs et lisibilité des cheminements du public.
- Locaux des sportifs, du personnel et des services, avec séparation des flux.
- Accessibilité et besoins de sûreté à instruire avec le maître d’ouvrage.
- Éclairage, maintenance et exigences d’exploitation quotidienne.
- Construction nouvelle, rénovation ou réhabilitation, selon le projet et le contrat.

## Priorités de conception et de planification
- Confort visuel et orientation dans l’enceinte, sans modèle unique imposé.
- Parcours clairs pour le public, les sportifs, le personnel et la logistique.
- Sûreté et accessibilité traitées comme des exigences de programme.
- Entretien et exploitation pris en compte dès les arbitrages de projet.
- Décisions documentées et validées par les parties avant exécution.

## Approche de travail
1. Qualification du besoin et des contraintes du site.
2. Coordination des études et des partenaires techniques.
3. Alignement des responsabilités dans les documents de projet.
4. Suivi de réalisation au regard du contrat, sans élargir le périmètre par défaut.
`,
      },
      en: {
        seoTitle: "Stadiums and sports venues",
        seoDescription:
          "Stadiums and sports venues: needs analysis, technical coordination and delivery follow-up under the contract. Not a catalogue of completed works.",
        coverAlt: "Illustration: stands and pitch of a stadium; a category visual, not a completed NUMAN GROUPE venue.",
        body: `Sports venues require a clear reading of the brief before any formal decision. The sport, the operating model, public flows and safety requirements define the scope more reliably than a standard template. NUMAN GROUPE approaches stadiums as project development work: clarifying the need, coordinating studies and technical partners, then following delivery within the frame set by the contract.

This page does not list completed stadiums, seating capacity, a country of operation, a certificate or a sector track record. It gives no financing guarantee. Depending on the mandate, the Group may contribute to new build, renovation or rehabilitation. That choice is not a default principle: it depends on the site, the condition of what exists, operating constraints and the contractual documents.

Planning of the field of play and stands is based on the sport, the intended competition level and, where requested, non-match uses. Sightlines, public circulation, separation of athlete, staff and service flows, and access for people with reduced mobility are matters to examine with the client and competent consultants. Lighting, maintenance and day-to-day operation are treated as project requirements, not as performance already proven on a Group-delivered venue.

NUMAN GROUPE does not replace designers or the contractors appointed for the works. When a brief is entrusted to the Group, the role is to clarify the need, keep parties aligned and follow progress against agreed deliverables. The topics below are possible fields of work. They become a delivery commitment only if they are retained in the programme and the contract.

Discussions with the client start from what is already known — the site, intended uses, constraints and an indicative timetable — and from what still has to be examined. Moving from one step to the next depends on the information available, validation by the parties and the conditions set in the documents. Nothing in this text widens the mandate on its own. The Group may connect public authorities, technical partners and construction firms around a documented brief; that role is coordination, not a claim of official partnership or of works already completed.

## Possible scope of work
- Planning of the field of play and stands, according to the sport and the brief.
- Spectator sightlines and readable public circulation.
- Athlete, staff and service rooms, with separated flows.
- Accessibility and security needs to be examined with the client.
- Lighting, maintenance and day-to-day operating requirements.
- New build, renovation or rehabilitation, according to the project and the contract.

## Design and planning priorities
- Visual comfort and orientation in the venue, without a single imposed model.
- Clear routes for the public, athletes, staff and logistics.
- Safety and accessibility treated as programme requirements.
- Maintenance and operation considered when project choices are made.
- Decisions recorded and approved by the parties before execution.

## Working approach
1. Qualify the need and the constraints of the site.
2. Coordinate studies and technical partners.
3. Align responsibilities in the project documents.
4. Follow delivery against the contract, without widening the scope by default.
`,
      },
      tr: {
        seoTitle: "Stadyumlar ve spor yapıları",
        seoDescription:
          "Stadyum ve spor yapıları: ihtiyaç analizi, teknik koordinasyon ve sözleşmeye göre uygulama takibi. Teslim edilmiş iş kataloğu değildir.",
        coverAlt: "İllüstrasyon: bir stadyumun tribünleri ve sahası; kategori görseli, teslim edilmiş bir yapı değil.",
        body: `Spor yapıları, biçim kararı verilmeden önce programın net okunmasını ister. Spor türü, işletme modeli, seyirci akışları ve güvenlik gerekleri, hazır bir şablondan daha güvenilir biçimde kapsamı belirler. NUMAN GROUPE stadyumları proje geliştirme işi olarak ele alır: ihtiyacı netleştirmek, etütleri ve teknik ortakları koordine etmek, ardından sözleşmeyle çizilen çerçevede uygulamayı izlemek.

Bu sayfa teslim edilmiş stadyum listesi, seyirci kapasitesi, ülke, sertifika veya sektör tecrübe yılı ileri sürmez. Finansman garantisi vermez. Görev tanımına göre Grup, yeni yapım, yenileme veya rehabilitasyona katkı verebilir. Bu tercih varsayılan bir ilke değildir; yere, mevcut yapıya, işletme kısıtlarına ve sözleşme belgelerine bağlıdır.

Oyun alanı ve tribün planlaması, oynanan spora, hedeflenen müsabaka düzeyine ve istenirse maç dışı kullanımlara dayanır. Koltuklardan görüş, seyirci dolaşımı, sporcu–personel–servis akışlarının ayrılması ve erişilebilirlik, işveren ve yetkin bürolarla birlikte incelenecek konulardır. Aydınlatma, bakım ve günlük işletme, Grup tarafından teslim edilmiş bir yapıda kanıtlanmış performans olarak değil, proje gereksinimi olarak ele alınır.

NUMAN GROUPE, tasarımcıların veya işi üstlenen yüklenicilerin yerini almaz. Kendisine bir görev verildiğinde rolü; ihtiyacı netleştirmek, taraflar arasında tutarlılığı korumak ve kararlaştırılan teslimlere göre ilerlemeyi izlemektir. Aşağıdaki başlıklar olası çalışma alanlarıdır. Programa ve sözleşmeye yazılmadıkça teslim taahhüdü sayılmaz.

İşverenle görüşmeler önce bilinenlerden başlar: yer, kullanım niyeti, kısıtlar ve varsa gösterge niteliğinde bir takvim. Henüz incelenmesi gereken konular ayrıca yazılır. Bir adımdan sonrakine geçiş, bilgilerin mevcut olmasına, tarafların onayına ve belgelerdeki koşullara bağlıdır. Bu metindeki hiçbir cümle tek başına görev tanımını genişletmez. Grup; kamu idareleri, teknik ortaklar ve inşaat firmalarını belgelenmiş bir program etrafında bir araya getirebilir. Bu rol koordinasyondur: resmî ortaklık veya tamamlanmış stadyum iddiası değildir. Finansman, yalnızca imzalı belgelerde yer aldığı ölçüde ve o belgelerdeki koşullarla ele alınır. Seyirci sayısı, tribün tipi veya aydınlatma düzeyi bu sayfada sabitlenmez; bunlar program ve sözleşme yazılınca belirlenir. Ziyaretler ve kurumsal görüşmeler, bu sayfada devlet desteği veya resmî ortaklık olarak okunmamalıdır. Kesin teslim listesi ancak imzalı belgelerde yer alır.

## Olası çalışma kapsamı
- Spora ve programa göre oyun alanı ile tribün planlaması.
- Seyirci görüşü ve okunaklı dolaşım.
- Sporcu, personel ve servis mekânları; akışların ayrılması.
- Erişilebilirlik ve güvenlik ihtiyaçlarının işverenle incelenmesi.
- Aydınlatma, bakım ve günlük işletme gereksinimleri.
- Projeye ve sözleşmeye göre yeni yapım, yenileme veya rehabilitasyon.

## Tasarım ve planlama öncelikleri
- Tek bir model dayatmadan görsel konfor ve yönlendirme.
- Seyirci, sporcu, personel ve lojistik için açık güzergâhlar.
- Güvenlik ve erişilebilirliğin program gereksinimi olarak ele alınması.
- Bakım ve işletmenin proje kararlarında dikkate alınması.
- Uygulamadan önce belgelenmiş ve taraflarca onaylanmış kararlar.

## Çalışma yaklaşımı
1. İhtiyacın ve yer kısıtlarının netleştirilmesi.
2. Etütlerin ve teknik ortakların koordinasyonu.
3. Proje belgelerinde sorumlulukların hizalanması.
4. Sözleşmeye göre uygulama takibi; kapsamın kendiliğinden genişletilmemesi.
`,
      },
    },
  },
  {
    slugs: { fr: "hopitaux", en: "hospitals", tr: "hastaneler" },
    locales: {
      fr: {
        seoTitle: "Hôpitaux et établissements de santé",
        seoDescription:
          "Établissements de santé : programmation, flux et coordination technique selon le contrat. Sans liste d’hôpitaux livrés ni garantie de financement.",
        coverAlt: "Illustration : façade d’un bâtiment hospitalier contemporain, visuel de catégorie.",
        body: `Un établissement de santé se construit d’abord autour du programme de soins, non autour d’une forme imposée. Les consultations, l’hospitalisation, les plateaux techniques et les locaux de soutien n’ont de cohérence que si les flux des patients, du personnel, des visiteurs et de la logistique sont pensés ensemble. NUMAN GROUPE aborde les hôpitaux comme un travail de développement et de coordination : clarifier le besoin avec le maître d’ouvrage, aligner les partenaires techniques et suivre la réalisation dans le cadre du contrat.

Cette page n’invente aucun hôpital livré, aucun nombre de lits, aucun client, aucun pays et aucun certificat. Elle ne présente pas de principes généraux de conception comme des caractéristiques déjà vérifiées sur des établissements du Groupe. Elle ne donne aucune garantie de financement. Selon le mandat, l’intervention peut porter sur tout ou partie des études de programmation, de la coordination technique et du suivi d’exécution.

L’hygiène, l’accessibilité et la maintenance sont des exigences de projet à instruire avec les spécialistes compétents. Les besoins en infrastructures techniques et en équipements médicaux doivent être coordonnés sans les confondre : le Groupe n’est pas, sur cette page, présenté comme fournisseur d’équipement. Les évolutions futures — extension, réorganisation d’un plateau, changement de parcours — sont des hypothèses à discuter, non des engagements d’évolutivité déjà démontrés.

NUMAN GROUPE ne remplace pas les architectes, les ingénieurs hospitaliers ni les entreprises titulaires. Lorsqu’une mission lui est confiée, elle vise à tenir le fil entre le programme, les études et le chantier, et à documenter les arbitrages. Les champs ci-dessous restent des domaines possibles, arrêtés besoin par besoin et contrat par contrat.

Les échanges portent d’abord sur le programme de soins déjà formulé, sur les contraintes du site et sur ce qui n’a pas encore été tranché. Le passage d’une étape à la suivante dépend des informations disponibles, de la validation des parties et des conditions prévues aux documents. Rien dans ce texte n’élargit à lui seul le mandat. La coordination des partenaires n’est ni une alliance officielle ni la preuve qu’un établissement a déjà été livré.

## Périmètre de travail possible
- Programmation des espaces selon le programme de soins retenu.
- Coordination entre consultations, hospitalisation et locaux de soutien.
- Flux des patients, du personnel, des visiteurs et de la logistique.
- Hygiène, accessibilité et besoins de maintenance à instruire.
- Coordination entre infrastructures techniques et besoins d’équipement médical.
- Hypothèses d’évolution ou d’extension, si le maître d’ouvrage les demande.

## Priorités de conception et de planification
- Lisibilité des parcours cliniques et non cliniques.
- Séparation utile des flux, sans modèle unique imposé.
- Conditions d’hygiène et d’entretien intégrées aux arbitrages.
- Accessibilité traitée comme une exigence de programme.
- Décisions tracées et validées avant exécution.

## Approche de travail
1. Lecture du programme de soins et des contraintes du site.
2. Coordination des études et des partenaires techniques.
3. Clarification des responsabilités dans les documents de projet.
4. Suivi de réalisation au regard du contrat et des livrables convenus.
`,
      },
      en: {
        seoTitle: "Hospitals and healthcare buildings",
        seoDescription:
          "Healthcare buildings: briefing, flows and technical coordination under the contract. Not a list of delivered hospitals or a financing guarantee.",
        coverAlt: "Illustration: facade of a contemporary hospital building; a category visual, not a delivered project.",
        body: `A healthcare building is organised around the care programme, not around an imposed form. Outpatient care, inpatient units, technical platforms and support rooms only hold together if patient, staff, visitor and logistics flows are considered together. NUMAN GROUPE approaches hospitals as development and coordination work: clarifying the need with the client, aligning technical partners and following delivery within the contract.

This page invents no delivered hospital, bed count, client, country or certificate. It does not present general design principles as features already verified on Group facilities. It gives no financing guarantee. Depending on the mandate, the intervention may cover all or part of briefing studies, technical coordination and construction follow-up.

Hygiene, accessibility and maintenance are project requirements to be examined with competent specialists. Technical infrastructure and medical-equipment needs must be coordinated without being confused: this page does not present the Group as an equipment supplier. Future change — extension, reorganisation of a platform, a new pathway — is a hypothesis to discuss, not a proven promise of flexibility.

NUMAN GROUPE does not replace hospital architects, engineers or the contractors appointed for the works. When a brief is entrusted to the Group, the aim is to keep the thread between programme, studies and site, and to record decisions. The fields below remain possible areas of work, fixed need by need and contract by contract.

Talks start from the care programme already stated, from the constraints of the site and from what has not yet been decided. Moving from one step to the next depends on the information available, validation by the parties and the conditions set in the documents. Nothing in this text widens the mandate on its own. Coordinating partners is neither an official alliance nor evidence that a hospital has already been delivered. Financing, if it forms part of the mandate, remains whatever the signed documents say.

## Possible scope of work
- Spatial briefing according to the agreed care programme.
- Coordination of outpatient, inpatient and support areas.
- Patient, staff, visitor and logistics flows.
- Hygiene, accessibility and maintenance needs to be examined.
- Coordination of technical infrastructure with medical-equipment requirements.
- Options for change or extension, if the client asks for them.

## Design and planning priorities
- Readable clinical and non-clinical routes.
- Useful separation of flows, without a single imposed model.
- Hygiene and upkeep considered when choices are made.
- Accessibility treated as a programme requirement.
- Decisions recorded and approved before execution.

## Working approach
1. Read the care programme and the constraints of the site.
2. Coordinate studies and technical partners.
3. Clarify responsibilities in the project documents.
4. Follow delivery against the contract and the agreed deliverables.
`,
      },
      tr: {
        seoTitle: "Hastaneler ve sağlık yapıları",
        seoDescription:
          "Sağlık yapıları: program, akışlar ve sözleşmeye göre teknik koordinasyon. Teslim edilmiş hastane listesi veya finansman garantisi yoktur.",
        coverAlt: "İllüstrasyon: çağdaş bir hastane cephesi; kategori görseli, teslim edilmiş proje değil.",
        body: `Bir sağlık yapısı, dayatılmış bir biçimden önce bakım programının etrafında kurulur. Poliklinik, yataklı tedavi, teknik katlar ve destek mekânları; hasta, personel, ziyaretçi ve lojistik akışları birlikte düşünülmeden tutarlı olmaz. NUMAN GROUPE hastaneleri geliştirme ve koordinasyon işi olarak ele alır: işverenle ihtiyacı netleştirmek, teknik ortakları hizalamak ve sözleşmenin çerçevesinde uygulamayı izlemek.

Bu sayfa teslim edilmiş hastane, yatak sayısı, müşteri, ülke veya sertifika uydurmaz. Genel tasarım ilkelerini, Grup tesislerinde doğrulanmış özellikler gibi sunmaz. Finansman garantisi vermez. Görev tanımına göre müdahale; program etütlerinin, teknik koordinasyonun ve uygulama takibinin tamamını veya bir kısmını kapsayabilir.

Hijyen, erişilebilirlik ve bakım, yetkin uzmanlarla incelenecek proje gereksinimleridir. Teknik altyapı ile tıbbi ekipman ihtiyaçları karıştırılmadan koordine edilmelidir: bu sayfa Grubu ekipman tedarikçisi olarak göstermez. Gelecekteki değişim — genişleme, bir katın yeniden düzenlenmesi, yeni bir güzergâh — tartışılacak varsayımdır; kanıtlanmış bir esneklik vaadi değildir.

NUMAN GROUPE, hastane mimarlarının, mühendislerinin veya işi üstlenen yüklenicilerin yerini almaz. Kendisine görev verildiğinde amaç; program, etüt ve şantiye arasındaki bağı korumak ve kararları belgelemektir. Aşağıdaki alanlar, ihtiyaç ve sözleşmeye göre belirlenecek olası çalışma başlıklarıdır.

Görüşmeler önce yazılmış bakım programından, yerin kısıtlarından ve henüz karara bağlanmamış konulardan başlar. Bir adımdan sonrakine geçiş, bilgilerin mevcut olmasına, tarafların onayına ve belgelerdeki koşullara bağlıdır. Bu metin tek başına görev tanımını genişletmez. Ortakların koordinasyonu, resmî bir ittifak veya teslim edilmiş bir hastanenin kanıtı değildir. Finansman, görev tanımının parçasıysa bile yalnızca imzalı belgelerdeki koşullarla ele alınır. Hijyen ve tıbbi ekipman konularında Grup, yetkin uzmanların ve tedarikçilerin yerini aldığını iddia etmez. Yatak sayısı, poliklinik hacmi veya cihaz listesi bu sayfada yer almaz; bunlar işverenin programı ve sözleşme belirlendikten sonra yazılır. Genel hastane şemaları, bu projelerde uygulanmış ve doğrulanmış özellik gibi sunulmaz. Kurumsal ziyaretler devlet desteği anlamına gelmez. Kesin teslim listesi yalnızca imzalı belgelerde yer alır. Bu sayfa bir hastane referans listesi değildir. Hasta, personel ve ziyaretçi akışları işveren programı olmadan varsayılmaz.

Genişleme ihtiyacı yalnızca talep edilirse incelenir.

## Olası çalışma kapsamı
- Kararlaştırılan sağlık programına göre mekân programı.
- Poliklinik, yataklı tedavi ve destek alanlarının koordinasyonu.
- Hasta, personel, ziyaretçi ve lojistik akışları.
- Hijyen, erişilebilirlik ve bakım ihtiyaçlarının incelenmesi.
- Teknik altyapı ile tıbbi ekipman gereksinimlerinin koordinasyonu.
- İşveren isterse değişim veya genişleme seçenekleri.

## Tasarım ve planlama öncelikleri
- Klinik ve klinik dışı güzergâhların okunaklılığı.
- Tek model dayatmadan akışların yararlı ayrılması.
- Hijyen ve bakımın proje kararlarında dikkate alınması.
- Erişilebilirliğin program gereksinimi olarak ele alınması.
- Uygulamadan önce kayda geçmiş ve onaylanmış kararlar.

## Çalışma yaklaşımı
1. Bakım programının ve yer kısıtlarının okunması.
2. Etütlerin ve teknik ortakların koordinasyonu.
3. Proje belgelerinde sorumlulukların netleştirilmesi.
4. Sözleşmeye ve kararlaştırılan teslimlere göre uygulama takibi.
`,
      },
    },
  },
  {
    slugs: { fr: "villages-sportifs", en: "sports-villages", tr: "spor-koyleri" },
    locales: {
      fr: {
        seoTitle: "Villages sportifs et ensembles",
        seoDescription:
          "Villages sportifs : sport, hébergement et espaces communs, coordination et suivi selon le contrat. Sans ensemble livré inventé.",
        coverAlt: "Illustration : piste d’athlétisme devant des résidences, visuel de catégorie.",
        body: `Un village sportif n’est pas seulement une collection d’équipements. Sa qualité tient à l’articulation entre les lieux d’entraînement ou de compétition, l’hébergement, les espaces communs, la restauration, le repos et les fonctions de soutien. NUMAN GROUPE aborde ces ensembles comme un travail de développement de projet : clarifier le programme, coordonner les partenaires techniques et suivre la réalisation dans le cadre du contrat.

Cette page n’attribue au Groupe aucun village livré, aucune capacité d’accueil, aucun calendrier de compétition et aucun pays. Elle ne présente pas de principes d’urbanisme sportif comme des résultats déjà obtenus. Elle ne garantit aucun financement. Selon le mandat, l’intervention peut porter sur un ensemble conçu d’un seul tenant ou sur un développement par étapes, si le maître d’ouvrage le demande et si les documents le prévoient.

Les cheminements piétons et véhicules, les espaces extérieurs et les conditions d’exploitation quotidienne font partie des sujets à instruire. La maintenance et la capacité à faire évoluer le site par phases sont des questions de projet, non des performances déjà démontrées. Le Groupe ne se substitue pas aux urbanistes, architectes et entreprises titulaires : il tient, lorsqu’il est missionné, le fil entre le besoin, les études et le suivi d’exécution.

Les champs ci-dessous décrivent des domaines possibles. Leur inclusion dépend du programme, du site et du contrat. Rien n’est livré par le seul fait d’apparaître sur cette page.

Les échanges portent sur le programme sportif et résidentiel, sur le site et sur l’éventuel phasage. Le passage d’une étape à la suivante dépend des informations disponibles, de la validation des parties et des conditions prévues aux documents. Rien dans ce texte n’élargit à lui seul le mandat. Relier des partenaires autour d’un programme documenté n’est pas une alliance officielle et n’implique aucun village déjà construit. La taille du site, le nombre de lits ou le niveau de compétition ne sont pas fixés ici : ils le seront, le cas échéant, dans le programme et le contrat.

## Périmètre de travail possible
- Cohérence entre sport, hébergement et espaces communs.
- Implantation adaptée à l’entraînement et, le cas échéant, à la compétition.
- Restauration, repos et locaux de soutien.
- Circulation piétonne et véhiculaire, ainsi que les espaces extérieurs.
- Exploitation, maintenance et développement par étapes s’il est prévu au contrat.

## Priorités de conception et de planification
- Distances et liaisons lisibles entre les fonctions du site.
- Confort d’usage au quotidien, pas seulement les jours d’événement.
- Espaces extérieurs pensés avec les flux, sans modèle unique.
- Entretien et phasage discutés avant les arbitrages lourds.
- Décisions documentées et validées par les parties.

## Approche de travail
1. Qualification du programme sportif et résidentiel.
2. Coordination des études et des partenaires techniques.
3. Alignement des responsabilités et des étapes éventuelles.
4. Suivi de réalisation au regard du contrat, sans élargir le périmètre par défaut.
`,
      },
      en: {
        seoTitle: "Sports villages and campuses",
        seoDescription:
          "Sports villages: sport, lodging and shared spaces, coordinated and followed under the contract. No invented completed campus.",
        coverAlt: "Illustration: athletics track in front of residences; a category visual, not a delivered campus.",
        body: `A sports village is more than a collection of facilities. Its quality depends on how training or competition venues, lodging, shared spaces, dining, rest and support functions fit together. NUMAN GROUPE approaches these ensembles as project development work: clarifying the brief, coordinating technical partners and following delivery within the contract.

This page assigns the Group no delivered village, bed count, competition calendar or country. It does not present sports-planning principles as results already achieved. It guarantees no financing. Depending on the mandate, the work may cover a single-phase ensemble or a staged development, if the client asks for it and the documents provide for it.

Pedestrian and vehicle routes, outdoor spaces and day-to-day operation are matters to examine. Maintenance and the ability to grow the site in phases are project questions, not proven performance. The Group does not replace planners, architects or the contractors appointed for the works: when commissioned, it keeps the thread between the need, the studies and delivery follow-up.

The fields below describe possible areas of work. Whether they are included depends on the brief, the site and the contract. Nothing is delivered merely because it appears on this page.

Talks cover the sports and residential brief, the site and any staging. Moving from one step to the next depends on the information available, validation by the parties and the conditions set in the documents. Nothing in this text widens the mandate on its own. Connecting partners around a documented brief is not an official alliance and does not imply that a village has already been built. Financing, if part of the mandate, remains whatever the signed documents say. Site size, bed numbers and competition level are not fixed here: they will be written, if at all, in the brief and the contract. General planning ideas are not presented as features already built and verified on a Group campus.

## Possible scope of work
- Coherence between sport, lodging and shared spaces.
- Layout suited to training and, where required, competition.
- Dining, rest and support rooms.
- Pedestrian and vehicle circulation, and outdoor spaces.
- Operation, maintenance and staged growth if the contract provides for it.

## Design and planning priorities
- Readable distances and links between the site’s functions.
- Everyday comfort, not only event days.
- Outdoor spaces considered with the flows, without a single model.
- Upkeep and phasing discussed before heavy choices.
- Decisions recorded and approved by the parties.

## Working approach
1. Qualify the sports and residential brief.
2. Coordinate studies and technical partners.
3. Align responsibilities and any stages.
4. Follow delivery against the contract, without widening the scope by default.
`,
      },
      tr: {
        seoTitle: "Spor köyleri ve yerleşkeler",
        seoDescription:
          "Spor köyleri: spor, konaklama ve ortak alanlar; sözleşmeye göre koordinasyon ve takip. Uydurulmuş teslim kampüs yoktur.",
        coverAlt: "İllüstrasyon: konutların önünde atletizm pisti; kategori görseli, teslim edilmiş yerleşke değil.",
        body: `Bir spor köyü, tesislerin yan yana dizilmesi değildir. Niteliği; antrenman veya müsabaka mekânları, konaklama, ortak alanlar, yemek, dinlenme ve destek işlevlerinin birbirine bağlanmasına bağlıdır. NUMAN GROUPE bu yerleşkeleri proje geliştirme işi olarak ele alır: programı netleştirmek, teknik ortakları koordine etmek ve sözleşmenin çerçevesinde uygulamayı izlemek.

Bu sayfa Gruba teslim edilmiş bir köy, yatak kapasitesi, müsabaka takvimi veya ülke atfetmez. Spor planlama ilkelerini elde edilmiş sonuçlar gibi sunmaz. Finansman garantisi vermez. Görev tanımına göre çalışma, işveren isterse ve belgeler öngörürse tek seferde veya etaplı bir gelişimi kapsayabilir.

Yaya ve araç güzergâhları, açık alanlar ve günlük işletme incelenecek konulardır. Bakım ve sitenin etaplar halinde gelişmesi, kanıtlanmış performans değil proje sorusudur. Grup, plancıların, mimarların veya yüklenicilerin yerini almaz; görevlendirildiğinde ihtiyaç, etüt ve uygulama takibi arasındaki bağı tutar.

Aşağıdaki başlıklar olası çalışma alanlarıdır. Dahil olup olmayacakları programa, yere ve sözleşmeye bağlıdır. Bu sayfada yer almak, tek başına teslim anlamına gelmez.

Görüşmeler spor ve konaklama programını, yeri ve varsa etaplamayı kapsar. Bir adımdan sonrakine geçiş, bilgilerin mevcut olmasına, tarafların onayına ve belgelerdeki koşullara bağlıdır. Bu metin tek başına görev tanımını genişletmez. Belgelenmiş bir program etrafında ortakları bir araya getirmek resmî ittifak değildir ve inşa edilmiş bir köy anlamına gelmez. Finansman, görev tanımındaysa bile yalnızca imzalı belgelerdeki koşullarla ele alınır. Antrenman veya müsabaka düzeyine ilişkin kararlar işverenin programına aittir; bu sayfa bir tesis standardı dayatmaz. Yerleşke büyüklüğü, konaklama adedi veya açık alan programı burada sabitlenmez. Genel spor planlama ilkeleri, Grup tarafından inşa edilip doğrulanmış özellik gibi sunulmaz. Etaplı gelişim yalnızca belgeler öngörürse ve işveren isterse konuşulur. Kurumsal ziyaretler devlet desteği veya resmî ortaklık olarak okunmamalıdır. Kesin teslim listesi yalnızca imzalı belgelerde yer alır. Bu sayfa bir spor köyü kataloğu değildir. Konaklama tipi, yemek düzeni ve açık alan kullanımı program yazılınca netleşir. Antrenman ve müsabaka ayrımı, işveren talep etmedikçe varsayılmaz. Yaya ve araç dolaşımı yer incelenmeden çizilmez.

## Olası çalışma kapsamı
- Spor, konaklama ve ortak alanların bütünlüğü.
- Antrenman ve gerektiğinde müsabakaya uygun yerleşim.
- Yemek, dinlenme ve destek mekânları.
- Yaya/araç dolaşımı ve açık alanlar.
- İşletme, bakım ve sözleşmede varsa etaplı gelişim.

## Tasarım ve planlama öncelikleri
- İşlevler arasında okunaklı mesafeler ve bağlantılar.
- Yalnızca etkinlik günü değil, günlük kullanım konforu.
- Tek model dayatmadan açık alanların akışlarla birlikte ele alınması.
- Ağır kararlardan önce bakım ve etaplamanın konuşulması.
- Taraflarca belgelenmiş ve onaylanmış kararlar.

## Çalışma yaklaşımı
1. Spor ve konaklama programının netleştirilmesi.
2. Etütlerin ve teknik ortakların koordinasyonu.
3. Sorumlulukların ve varsa etapların hizalanması.
4. Sözleşmeye göre uygulama takibi; kapsamın kendiliğinden genişletilmemesi.
`,
      },
    },
  },
  {
    slugs: { fr: "logements", en: "housing", tr: "lojmanlar" },
    locales: {
      fr: {
        seoTitle: "Logements et logements de fonction",
        seoDescription:
          "Logements et logements de fonction : programme, confort et suivi selon le contrat. Sans résidence livrée inventée ni garantie de performance.",
        coverAlt: "Illustration : immeubles de logements avec balcons, visuel de catégorie.",
        body: `Un programme de logements ou de logements de fonction commence par le profil des occupants et par le mode de gestion prévu, non par une typologie imposée. La taille des logements, le degré de privacité, les espaces communs et le rapport au site dépendent du maître d’ouvrage et du contrat. NUMAN GROUPE aborde ces opérations comme un travail de développement de projet : préciser le besoin, coordonner les partenaires techniques et suivre la réalisation dans le cadre convenu.

Cette page n’invente aucune résidence livrée, aucun nombre de logements, aucun client et aucun pays. Elle n’avance aucun certificat énergétique déjà obtenu et aucune garantie de performance. Les objectifs de durabilité, de facilité d’entretien ou d’efficacité énergétique, lorsqu’ils sont demandés, restent des cibles de projet à instruire, non des résultats déjà mesurés sur un ensemble du Groupe.

Le confort, la privacité et le plan utile des logements, les communs, le paysage, l’accès, le stationnement et les réseaux sont des champs possibles. La relation du site à son environnement immédiat — voisins, voies, usages existants — fait partie de l’analyse lorsque le mandat le prévoit. NUMAN GROUPE ne se substitue pas aux architectes, paysagistes et entreprises titulaires. Il tient, s’il est missionné, la cohérence entre le programme, les études et le suivi d’exécution.

Les thèmes ci-dessous ne constituent pas un forfait de livraison. Ils sont arrêtés besoin par besoin et contrat par contrat.

Les échanges portent sur le profil des occupants, le mode de gestion et les contraintes du site. Le passage d’une étape à la suivante dépend des informations disponibles, de la validation des parties et des conditions prévues aux documents. Rien dans ce texte n’élargit à lui seul le mandat. Relier des partenaires autour d’un programme documenté n’est pas une alliance officielle et n’implique aucune résidence déjà livrée. Le nombre de logements, le standing et les performances énergétiques ne sont pas fixés ici : ils le seront, le cas échéant, dans le programme et le contrat.

## Périmètre de travail possible
- Programme de logements selon le profil des occupants et le mode de gestion.
- Confort, privacité et plans utiles, sans typologie unique imposée.
- Espaces communs et traitement des abords, si le programme les prévoit.
- Accès, stationnement et besoins d’infrastructure.
- Cibles d’entretien, de durabilité et d’efficacité énergétique à instruire.
- Relation du site à son environnement immédiat.

## Priorités de conception et de planification
- Lisibilité des accès et des communs.
- Intimité des logements et qualité d’usage au quotidien.
- Entretien pris en compte dans les choix de projet.
- Cibles énergétiques traitées comme des objectifs, non comme des résultats acquis.
- Décisions documentées et validées avant exécution.

## Approche de travail
1. Qualification du programme résidentiel et des contraintes du site.
2. Coordination des études et des partenaires techniques.
3. Alignement des responsabilités dans les documents de projet.
4. Suivi de réalisation au regard du contrat et des livrables convenus.
`,
      },
      en: {
        seoTitle: "Housing and staff housing",
        seoDescription:
          "Housing and staff housing: briefing, comfort and follow-up under the contract. No invented completed residence or performance guarantee.",
        coverAlt: "Illustration: housing blocks with balconies; a category visual, not a delivered residence.",
        body: `A housing or staff-housing programme starts from the occupant profile and the intended management model, not from an imposed typology. Dwelling size, privacy, shared spaces and the relationship to the site depend on the client and the contract. NUMAN GROUPE approaches these operations as project development work: clarifying the need, coordinating technical partners and following delivery within the agreed frame.

This page invents no delivered residence, unit count, client or country. It claims no energy certificate already obtained and no performance guarantee. Durability, ease of maintenance or energy-efficiency aims, when requested, remain project targets to examine, not results already measured on a Group estate.

Comfort, privacy and usable plans, shared spaces, landscape, access, parking and utilities are possible fields. How the site meets its immediate surroundings — neighbours, roads, existing uses — is part of the analysis when the mandate includes it. NUMAN GROUPE does not replace architects, landscape designers or the contractors appointed for the works. When commissioned, it keeps the programme, the studies and delivery follow-up aligned.

The topics below are not a delivery package. They are fixed need by need and contract by contract.

Talks cover the occupant profile, the management model and the constraints of the site. Moving from one step to the next depends on the information available, validation by the parties and the conditions set in the documents. Nothing in this text widens the mandate on its own. Connecting partners around a documented brief is not an official alliance and does not imply that a residence has already been delivered. Energy or durability aims, when requested, remain targets to examine, not certificates already held. Unit count, tenure model and landscape extent are not fixed here: they will be written, if at all, in the brief and the contract. General housing ideas are not presented as features already built and verified on a Group estate.

## Possible scope of work
- Housing programme according to occupant profile and management model.
- Comfort, privacy and usable plans, without a single imposed typology.
- Shared spaces and immediate landscape, if the brief includes them.
- Access, parking and infrastructure needs.
- Maintenance, durability and energy-efficiency targets to be examined.
- Relationship of the site to its immediate surroundings.

## Design and planning priorities
- Readable access and shared spaces.
- Privacy of dwellings and everyday usability.
- Maintenance considered when project choices are made.
- Energy targets treated as aims, not as results already achieved.
- Decisions recorded and approved before execution.

## Working approach
1. Qualify the residential brief and the constraints of the site.
2. Coordinate studies and technical partners.
3. Align responsibilities in the project documents.
4. Follow delivery against the contract and the agreed deliverables.
`,
      },
      tr: {
        seoTitle: "Lojmanlar ve konut programları",
        seoDescription:
          "Konut ve lojman: program, konfor ve sözleşmeye göre takip. Uydurulmuş teslim konut veya performans garantisi yoktur.",
        coverAlt: "İllüstrasyon: balkonlu konut blokları; kategori görseli, teslim edilmiş konut değil.",
        body: `Konut veya lojman programı, dayatılmış bir tipolojiden önce kullanıcı profili ve öngörülen yönetim modeliyle başlar. Konut büyüklüğü, mahremiyet, ortak alanlar ve yerle ilişki işverene ve sözleşmeye bağlıdır. NUMAN GROUPE bu işleri proje geliştirme olarak ele alır: ihtiyacı netleştirmek, teknik ortakları koordine etmek ve kararlaştırılan çerçevede uygulamayı izlemek.

Bu sayfa teslim edilmiş konut, daire adedi, müşteri veya ülke uydurmaz. Elde edilmiş enerji sertifikası veya performans garantisi ileri sürmez. Dayanıklılık, bakım kolaylığı veya enerji verimliliği, istendiğinde incelenecek proje hedefleridir; Grup yerleşkesinde ölçülmüş sonuç değildir.

Konfor, mahremiyet ve işlevsel plan, ortak alanlar, peyzaj, ulaşım, otopark ve altyapı olası çalışma alanlarıdır. Yerleşkenin yakın çevresiyle ilişkisi — komşuluk, yollar, mevcut kullanımlar — görev tanımı kapsıyorsa analize girer. NUMAN GROUPE mimarların, peyzaj tasarımcılarının veya yüklenicilerin yerini almaz. Görevlendirildiğinde program, etüt ve uygulama takibini hizada tutar.

Aşağıdaki başlıklar teslim paketi değildir. İhtiyaç ve sözleşmeye göre belirlenir.

Görüşmeler kullanıcı profilini, yönetim modelini ve yerin kısıtlarını kapsar. Bir adımdan sonrakine geçiş, bilgilerin mevcut olmasına, tarafların onayına ve belgelerdeki koşullara bağlıdır. Bu metin tek başına görev tanımını genişletmez. Belgelenmiş bir program etrafında ortakları bir araya getirmek resmî ittifak değildir ve teslim edilmiş bir konut anlamına gelmez. Enerji veya dayanıklılık hedefleri istendiğinde incelenecek amaçlardır; elde edilmiş sertifika değillerdir. Finansman, görev tanımındaysa bile yalnızca imzalı belgelerdeki koşullarla ele alınır. Konut adedi, kullanıcı statüsü ve peyzaj kapsamı bu sayfada sabitlenmez; bunlar program ve sözleşme yazılınca belirlenir. Genel konut ilkeleri, Grup yerleşkesinde uygulanmış ve doğrulanmış özellik gibi sunulmaz. Kurumsal ziyaretler devlet desteği anlamına gelmez. Kesin teslim listesi yalnızca imzalı belgelerde yer alır. Lojman veya konut adedi burada bir referans proje gibi gösterilmez. Ortak alan ve otopark ihtiyacı, kullanıcı profili netleşmeden sabitlenmez. Mahremiyet ve konfor düzeyi, işveren programı yazılmadan varsayılmaz. Yerleşkenin çevresiyle ilişkisi, yer görülmeden varsayılmaz. Altyapı ihtiyacı mevcut şebeke ve sözleşme belgelerine göre incelenir. Bu sayfa bir konut referans listesi değildir. Peyzaj kapsamı program yazılmadan varsayılmaz.

## Olası çalışma kapsamı
- Kullanıcı profiline ve yönetim modeline göre konut programı.
- Tek tipoloji dayatmadan konfor, mahremiyet ve işlevsel plan.
- Programda varsa ortak alanlar ve yakın çevre düzeni.
- Ulaşım, otopark ve altyapı ihtiyaçları.
- Bakım, dayanıklılık ve enerji verimliliği hedeflerinin incelenmesi.
- Yerleşkenin yakın çevresiyle ilişkisi.

## Tasarım ve planlama öncelikleri
- Girişlerin ve ortak alanların okunaklılığı.
- Konut mahremiyeti ve günlük kullanım niteliği.
- Proje kararlarında bakımın dikkate alınması.
- Enerji hedeflerinin kazanılmış sonuç değil, amaç olarak ele alınması.
- Uygulamadan önce belgelenmiş ve onaylanmış kararlar.

## Çalışma yaklaşımı
1. Konut programının ve yer kısıtlarının netleştirilmesi.
2. Etütlerin ve teknik ortakların koordinasyonu.
3. Proje belgelerinde sorumlulukların hizalanması.
4. Sözleşmeye ve kararlaştırılan teslimlere göre uygulama takibi.
`,
      },
    },
  },
];

export function findExpertiseCopy(slugs: Iterable<string>): ExpertiseDetailCopy | undefined {
  const set = new Set(slugs);
  return expertiseDetailCopy.find((pack) => Object.values(pack.slugs).some((slug) => set.has(slug)));
}
