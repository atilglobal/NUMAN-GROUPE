import type { Locale } from "@/i18n/config";
import type { TeamPresentationGroup } from "@/content/types";

export type KadroMember = {
  key: string;
  matchNames: string[];
  displayName: string;
  existing: boolean;
  group: TeamPresentationGroup;
  sortOrder: number;
  photo: string;
  role: Record<Locale, string>;
  summary: Record<Locale, string>;
  bio: Record<Locale, string>;
  alt: Record<Locale, string>;
};

const loc = (fr: string, en: string, tr: string): Record<Locale, string> => ({ fr, en, tr });

export function normalizePersonName(value: string): string {
  return value
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/^(m|mr|mrs|ms|mme|maitre|maître)\.?\s+/iu, "")
    .replace(/[^a-z0-9]/gi, "")
    .toLowerCase();
}

export const KADRO_ROSTER: KadroMember[] = [
  {
    key: "numan-hatipoglu",
    matchNames: ["Numan Hatipoglu", "M. NUMAN HATIPOGLU", "M. Numan HATIPOGLU"],
    displayName: "Numan Hatipoglu",
    existing: true,
    group: "leadership",
    sortOrder: 10,
    photo: "image1.jpeg",
    role: loc("Président du Conseil d’administration", "Chairman of the Board", "Yönetim Kurulu Başkanı"),
    summary: loc(
      "Président du Conseil d’administration de Numan Groupe International, groupe fondé en 1987 et dont le siège est à Antalya.",
      "Chairman of the Board of Numan Groupe International, a group founded in 1987 and headquartered in Antalya.",
      "1987’de kurulmuş, merkezi Antalya’da bulunan Numan Groupe International’ın Yönetim Kurulu Başkanı.",
    ),
    bio: loc(
      "M. Numan Hatipoglu est le Président du Conseil d’administration de Numan Groupe International, groupe international fondé en 1987 et dont le siège social est situé à Antalya, en République de Türkiye. Il assure l’orientation stratégique du Groupe et accompagne son développement dans les infrastructures, la construction, le financement de projets et le développement international. Sous sa présidence, le Groupe vise des projets structurants en Afrique, en Asie et en Europe, notamment dans les infrastructures publiques, les établissements hospitaliers, les routes, les ports, les stades et les bâtiments institutionnels. Sa vision s’inscrit dans la coopération internationale, le développement de partenariats institutionnels et la recherche de solutions adaptées aux besoins des États et de leurs populations. Il représente la vision et les ambitions du Groupe, afin de renforcer son rayonnement international et de contribuer à des projets à fort impact économique et social.",
      "Mr Numan Hatipoglu is Chairman of the Board of Numan Groupe International, an international group founded in 1987 and headquartered in Antalya, Republic of Türkiye. He sets the Group’s strategic direction and supports its development in infrastructure, construction, project financing and international development. Under his chairmanship, the Group aims at structuring projects in Africa, Asia and Europe, including public infrastructure, hospitals, roads, ports, stadiums and institutional buildings. His outlook is framed by international cooperation, institutional partnerships and solutions adapted to the needs of States and their populations. He represents the Group’s vision and ambitions, to strengthen its international presence and contribute to projects with a strong economic and social impact.",
      "Numan Hatipoglu, 1987’de kurulmuş ve merkezi Antalya’da (Türkiye Cumhuriyeti) bulunan Numan Groupe International’ın Yönetim Kurulu Başkanı’dır. Grubun stratejik yönünü belirler; altyapı, inşaat, proje finansmanı ve uluslararası gelişim alanlarında gelişimini destekler. Başkanlığında Grup, Afrika, Asya ve Avrupa’da kamu altyapısı, hastaneler, yollar, limanlar, stadyumlar ve kurumsal binalar gibi yapılandırıcı projelere yönelir. Yaklaşımı uluslararası iş birliği, kurumsal ortaklıklar ve devletlerin ile toplumların ihtiyaçlarına uygun çözümler arayışına dayanır. Grubun vizyonunu ve hedeflerini temsil eder; uluslararası görünürlüğünü güçlendirmeyi ve ekonomik ile toplumsal etkisi yüksek projelere katkıda bulunmayı amaçlar.",
    ),
    alt: loc(
      "Portrait de Numan Hatipoglu, Président du Conseil d’administration.",
      "Portrait of Numan Hatipoglu, Chairman of the Board.",
      "Yönetim Kurulu Başkanı Numan Hatipoglu’nun portresi.",
    ),
  },
  {
    key: "halil-karabacak",
    matchNames: ["Halil Karabacak", "M. HALIL KARABACAK", "M. Halil KARABACAK"],
    displayName: "Halil Karabacak",
    existing: true,
    group: "leadership",
    sortOrder: 20,
    photo: "image2.jpeg",
    role: loc("Vice-Président de Numan Groupe International", "Vice-President of Numan Groupe International", "Numan Groupe International Başkan Yardımcısı"),
    summary: loc(
      "Vice-Président de Numan Groupe International ; il contribue au développement stratégique, à la coordination des activités et aux partenariats internationaux.",
      "Vice-President of Numan Groupe International; he contributes to strategic development, coordination of activities and international partnerships.",
      "Numan Groupe International Başkan Yardımcısı; stratejik gelişime, faaliyetlerin koordinasyonuna ve uluslararası ortaklıklara katkıda bulunur.",
    ),
    bio: loc(
      "M. Halil Karabacak occupe les fonctions de Vice-Président de Numan Groupe International. Il contribue au développement stratégique du Groupe, à la coordination de ses activités et au renforcement de ses partenariats internationaux. Il accompagne le développement du Groupe en Afrique, en Asie et en Europe, notamment dans la construction, les infrastructures publiques, le financement de projets et le développement économique. Il participe à la promotion des ambitions internationales du Groupe et au développement de relations de coopération avec les institutions publiques, les partenaires privés et les acteurs du développement.",
      "Mr Halil Karabacak is Vice-President of Numan Groupe International. He contributes to the Group’s strategic development, the coordination of its activities and the strengthening of its international partnerships. He supports the Group’s development in Africa, Asia and Europe, notably in construction, public infrastructure, project financing and economic development. He takes part in promoting the Group’s international ambitions and in developing cooperation with public institutions, private partners and development actors.",
      "Halil Karabacak, Numan Groupe International Başkan Yardımcısı’dır. Grubun stratejik gelişimine, faaliyetlerinin koordinasyonuna ve uluslararası ortaklıklarının güçlendirilmesine katkıda bulunur. Afrika, Asya ve Avrupa’da inşaat, kamu altyapısı, proje finansmanı ve ekonomik gelişim alanlarında Grubun gelişimini destekler. Grubun uluslararası hedeflerinin tanıtımına ve kamu kurumları, özel ortaklar ile kalkınma aktörleriyle iş birliği ilişkilerinin geliştirilmesine katılır.",
    ),
    alt: loc(
      "Portrait de Halil Karabacak, Vice-Président de Numan Groupe International.",
      "Portrait of Halil Karabacak, Vice-President of Numan Groupe International.",
      "Numan Groupe International Başkan Yardımcısı Halil Karabacak’ın portresi.",
    ),
  },
  {
    key: "alpha-cisse",
    matchNames: ["Alpha Cissé", "Alpha Cisse", "M. ALPHA CISSÉ", "M. Alpha CISSÉ"],
    displayName: "Alpha Cissé",
    existing: false,
    group: "international",
    sortOrder: 30,
    photo: "image3.png",
    role: loc("Représentant Afrique", "Africa Representative", "Afrika Temsilcisi"),
    summary: loc(
      "Représentant Afrique de Numan Groupe International ; professionnel du management, de la gouvernance et de la coopération internationale.",
      "Africa Representative of Numan Groupe International; a professional in management, governance and international cooperation.",
      "Numan Groupe International Afrika Temsilcisi; yönetim, yönetişim ve uluslararası iş birliği alanında çalışır.",
    ),
    bio: loc(
      "M. Alpha Cissé est un professionnel du management, de la gouvernance et de la coopération internationale, avec une expérience dans la gestion administrative et juridique ainsi que dans le développement de partenariats institutionnels. Titulaire d’un Master 2 en Gouvernance et Financement du Développement de l’Université Côte d’Azur, en France, et diplômé en commerce international d’une université turque, il possède une connaissance des environnements institutionnels africains et des relations de coopération entre l’Afrique et la Türkiye. En tant que Représentant Afrique de Numan Groupe International, il contribue au développement des activités du Groupe sur le continent, à l’identification d’opportunités d’investissement et de projets structurants, ainsi qu’aux relations avec les gouvernements, ministères, institutions publiques et partenaires économiques et financiers. Son parcours international et son engagement dans les relations internationales appuient la promotion de partenariats et la concrétisation de projets de développement. Il œuvre au renforcement de la présence du Groupe en Afrique et à la promotion de projets d’infrastructures, de construction et de développement économique, en favorisant les synergies entre partenaires africains et turcs.",
      "Mr Alpha Cissé is a professional in management, governance and international cooperation, with experience in administrative and legal management and in developing institutional partnerships. He holds a Master 2 in Governance and Development Financing from Université Côte d’Azur in France and a degree in international trade from a Turkish university, and is familiar with African institutional settings and cooperation between Africa and Türkiye. As Africa Representative of Numan Groupe International, he contributes to the Group’s activities on the continent, to identifying investment opportunities and structuring projects, and to relations with governments, ministries, public institutions and economic and financial partners. His international path and work in international relations support partnerships and development projects. He works to strengthen the Group’s presence in Africa and to promote infrastructure, construction and economic-development projects, fostering synergies between African and Turkish partners.",
      "Alpha Cissé; yönetim, yönetişim ve uluslararası iş birliği alanında çalışır. İdari ve hukuki yönetim ile kurumsal ortaklıkların geliştirilmesinde deneyimi vardır. Fransa’daki Université Côte d’Azur’de Yönetişim ve Kalkınma Finansmanı alanında Master 2 derecesine ve bir Türk üniversitesinden uluslararası ticaret diplomasına sahiptir; Afrika’daki kurumsal ortamları ve Afrika–Türkiye iş birliği ilişkilerini bilir. Numan Groupe International Afrika Temsilcisi olarak kıtadaki faaliyetlerin gelişimine, yatırım fırsatları ve yapılandırıcı projelerin belirlenmesine ve hükümetler, bakanlıklar, kamu kurumları ile ekonomik ve mali ortaklarla ilişkilere katkıda bulunur. Uluslararası geçmişi ve uluslararası ilişkilere katkısı, ortaklıkların ve kalkınma projelerinin hayata geçirilmesini destekler. Grubun Afrika’daki varlığını güçlendirmeye; altyapı, inşaat ve ekonomik gelişim projelerini tanıtmaya ve Afrika ile Türkiye’deki ortaklar arasında eşgüdümü artırmaya çalışır.",
    ),
    alt: loc(
      "Portrait d’Alpha Cissé, Représentant Afrique de Numan Groupe International.",
      "Portrait of Alpha Cissé, Africa Representative of Numan Groupe International.",
      "Numan Groupe International Afrika Temsilcisi Alpha Cissé’nin portresi.",
    ),
  },
  {
    key: "firat-ozen",
    matchNames: ["Firat Özen", "Firat Ozen", "M. FIRAT ÖZEN"],
    displayName: "Firat Özen",
    existing: false,
    group: "technical",
    sortOrder: 40,
    photo: "image4.jpeg",
    role: loc("Ingénieur en chef", "Chief Engineer", "Başmühendis"),
    summary: loc(
      "Ingénieur en chef de Numan Groupe International, chargé de la supervision technique et de la coordination des projets.",
      "Chief Engineer of Numan Groupe International, responsible for technical supervision and project coordination.",
      "Numan Groupe International başmühendisi; teknik denetim ve proje koordinasyonundan sorumludur.",
    ),
    bio: loc(
      "M. Firat Özen est l’ingénieur en chef de Numan Groupe International, chargé de la supervision technique et de la coordination des projets du Groupe. Il contribue à la planification, au suivi technique et à la mise en œuvre de projets dans la construction et les infrastructures. Au cours de son parcours, il a contribué à la réalisation de grands projets à travers le monde, au service de solutions techniques adaptées aux exigences des projets et aux objectifs de ses partenaires. Au sein du Groupe, il encadre le travail technique, coordonne les équipes d’ingénierie et recherche des solutions conformes aux standards de qualité, de sécurité et de performance. Son engagement s’inscrit dans l’ambition du Groupe de réaliser des infrastructures durables et des projets structurants en Afrique, en Asie et en Europe.",
      "Mr Firat Özen is Chief Engineer of Numan Groupe International, responsible for technical supervision and coordination of the Group’s projects. He contributes to planning, technical follow-up and delivery of projects in construction and infrastructure. In his career he has contributed to major projects around the world, applying technical solutions suited to project requirements and partners’ objectives. Within the Group he oversees technical work, coordinates engineering teams and seeks solutions that meet quality, safety and performance standards. His work supports the Group’s aim to deliver lasting infrastructure and structuring projects in Africa, Asia and Europe.",
      "Firat Özen, Numan Groupe International başmühendisidir; Grubun projelerinin teknik denetimi ve koordinasyonundan sorumludur. İnşaat ve altyapı projelerinin planlanmasına, teknik takibine ve uygulanmasına katkıda bulunur. Meslek yaşamında dünyanın çeşitli yerlerindeki büyük projelere katkıda bulunmuş; proje gereklerine ve ortakların hedeflerine uygun teknik çözümler üretmiştir. Grup içinde teknik çalışmayı yönlendirir, mühendislik ekiplerini koordine eder ve kalite, güvenlik ile performans standartlarına uygun çözümler arar. Çalışması, Grubun Afrika, Asya ve Avrupa’da kalıcı altyapılar ve yapılandırıcı projeler gerçekleştirme hedefiyle uyumludur.",
    ),
    alt: loc("Portrait de Firat Özen, ingénieur en chef.", "Portrait of Firat Özen, Chief Engineer.", "Başmühendis Firat Özen’in portresi."),
  },
  {
    key: "gultekin-varol",
    matchNames: ["Gültekin Varol", "Gultekin Varol", "M. GÜLTEKIN VAROL"],
    displayName: "Gültekin Varol",
    existing: false,
    group: "technical",
    sortOrder: 50,
    photo: "image5.jpeg",
    role: loc("Architecte en chef", "Chief Architect", "Başmimar"),
    summary: loc(
      "Architecte en chef de Numan Groupe International ; il contribue à la conception architecturale et au développement des projets.",
      "Chief Architect of Numan Groupe International; he contributes to architectural design and project development.",
      "Numan Groupe International başmimarı; mimari tasarıma ve projelerin geliştirilmesine katkıda bulunur.",
    ),
    bio: loc(
      "M. Gültekin Varol est l’architecte en chef de Numan Groupe International. Il contribue à la conception architecturale et au développement des projets du Groupe, en veillant à l’harmonie entre exigences fonctionnelles, contraintes techniques et ambitions esthétiques. Il participe à l’élaboration des concepts architecturaux, à la coordination des études et à la recherche de solutions pour des projets d’infrastructures et de construction de grande envergure. Son rôle porte notamment sur la conception de bâtiments institutionnels, d’établissements hospitaliers, de complexes sportifs et d’autres infrastructures structurantes, dans la perspective de développement et de modernisation des infrastructures à l’échelle internationale.",
      "Mr Gültekin Varol is Chief Architect of Numan Groupe International. He contributes to architectural design and to the development of the Group’s projects, keeping functional needs, technical constraints and aesthetic aims in balance. He takes part in developing architectural concepts, coordinating studies and seeking solutions for large infrastructure and construction projects. His role includes the design of institutional buildings, hospitals, sports complexes and other structuring infrastructure, in line with the international development and modernisation of infrastructure.",
      "Gültekin Varol, Numan Groupe International başmimarıdır. Grubun projelerinin mimari tasarımına ve geliştirilmesine katkıda bulunur; işlevsel ihtiyaçlar, teknik kısıtlar ve estetik hedefler arasında denge gözetir. Mimari kavramların hazırlanmasına, etütlerin koordinasyonuna ve büyük altyapı ile inşaat projeleri için çözüm arayışına katılır. Rolü kurumsal binaların, hastanelerin, spor komplekslerinin ve diğer yapılandırıcı altyapıların tasarımını kapsar; altyapının uluslararası ölçekte geliştirilmesi ve yenilenmesi hedefiyle uyumludur.",
    ),
    alt: loc("Portrait de Gültekin Varol, architecte en chef.", "Portrait of Gültekin Varol, Chief Architect.", "Başmimar Gültekin Varol’un portresi."),
  },
  {
    key: "ahmet-tahir-hatipoglu",
    matchNames: ["Ahmet Tahir Hatipoglu", "M. AHMET TAHIR HATIPOGLU"],
    displayName: "Ahmet Tahir Hatipoglu",
    existing: false,
    group: "technical",
    sortOrder: 60,
    photo: "image6.jpeg",
    role: loc("Ingénieur", "Engineer", "Mühendis"),
    summary: loc(
      "Ingénieur au sein de Numan Groupe International ; il participe aux activités techniques et à la mise en œuvre des projets.",
      "Engineer at Numan Groupe International; he takes part in technical work and in delivering projects.",
      "Numan Groupe International mühendisi; teknik çalışmalara ve projelerin uygulanmasına katılır.",
    ),
    bio: loc(
      "M. Ahmet Tahir Hatipoglu est ingénieur au sein de Numan Groupe International. Il contribue aux activités techniques du Groupe et participe au développement et à la mise en œuvre de projets de construction et d’infrastructures. Il met ses compétences en ingénierie au service de la préparation, du suivi et de l’exécution des projets, en collaboration avec les équipes techniques et les experts du Groupe. Son engagement contribue à la réalisation de projets structurants répondant aux exigences de qualité, de sécurité et de performance de Numan Groupe International.",
      "Mr Ahmet Tahir Hatipoglu is an engineer at Numan Groupe International. He contributes to the Group’s technical work and takes part in developing and delivering construction and infrastructure projects. He applies his engineering skills to preparing, monitoring and executing projects, together with the Group’s technical teams and experts. His work supports structuring projects that meet Numan Groupe International’s quality, safety and performance requirements.",
      "Ahmet Tahir Hatipoglu, Numan Groupe International bünyesinde mühendistir. Grubun teknik çalışmalarına katkıda bulunur; inşaat ve altyapı projelerinin geliştirilmesine ve uygulanmasına katılır. Mühendislik yetkinliğini projelerin hazırlanması, takibi ve yürütülmesinde, teknik ekipler ve Grubun uzmanlarıyla birlikte kullanır. Çalışması, Numan Groupe International’ın kalite, güvenlik ve performans gereklerine uygun yapılandırıcı projelerin gerçekleştirilmesine katkıda bulunur.",
    ),
    alt: loc("Portrait d’Ahmet Tahir Hatipoglu, ingénieur.", "Portrait of Ahmet Tahir Hatipoglu, engineer.", "Mühendis Ahmet Tahir Hatipoglu’nun portresi."),
  },
  {
    key: "emre-uzun",
    matchNames: ["Emre Uzun", "M. EMRE UZUN"],
    displayName: "Emre Uzun",
    existing: false,
    group: "technical",
    sortOrder: 70,
    photo: "image7.jpeg",
    role: loc("Spécialiste en sécurité et suivi de projets", "Security and project-monitoring specialist", "Güvenlik ve proje takip uzmanı"),
    summary: loc(
      "Spécialiste en sécurité et suivi de projets ; il suit le déroulement opérationnel des projets et la prévention des risques.",
      "Security and project-monitoring specialist; he follows the operational progress of projects and risk prevention.",
      "Güvenlik ve proje takip uzmanı; projelerin operasyonel ilerleyişini ve risk önlemeyi izler.",
    ),
    bio: loc(
      "M. Emre Uzun est spécialiste en sécurité et suivi de projets au sein de Numan Groupe International. Il contribue au suivi opérationnel des projets, en accordant une attention particulière à la sécurité, à la prévention des risques et au respect des procédures établies. Il participe à l’identification des risques, au suivi des mesures de sécurité et à la coordination des actions nécessaires au bon déroulement des activités sur les sites de projets. Son rôle contribue à la sécurité des opérations, à la maîtrise des risques et au suivi des projets de construction et d’infrastructures du Groupe à l’échelle internationale.",
      "Mr Emre Uzun is a security and project-monitoring specialist at Numan Groupe International. He contributes to the operational follow-up of projects, with particular attention to safety, risk prevention and established procedures. He takes part in identifying risks, monitoring safety measures and coordinating the actions needed for work to proceed on project sites. His role supports the safety of operations, control of risks and follow-up of the Group’s construction and infrastructure projects internationally.",
      "Emre Uzun, Numan Groupe International bünyesinde güvenlik ve proje takip uzmanıdır. Projelerin operasyonel takibine katkıda bulunur; güvenlik, risk önleme ve belirlenmiş usullere özel önem verir. Risklerin belirlenmesine, güvenlik önlemlerinin izlenmesine ve şantiyelerde işlerin yürümesi için gereken eylemlerin koordinasyonuna katılır. Rolü, operasyon güvenliğine, risklerin kontrolüne ve Grubun inşaat ile altyapı projelerinin uluslararası ölçekte takibine katkıda bulunur.",
    ),
    alt: loc(
      "Portrait d’Emre Uzun, spécialiste en sécurité et suivi de projets.",
      "Portrait of Emre Uzun, security and project-monitoring specialist.",
      "Güvenlik ve proje takip uzmanı Emre Uzun’un portresi.",
    ),
  },
  {
    key: "secer-akkus",
    matchNames: ["Seçer Akkuş", "Secer Akkus", "Maître SEÇER AKKUŞ", "Maître Seçer AKKUŞ"],
    displayName: "Seçer Akkuş",
    existing: false,
    group: "legal",
    sortOrder: 80,
    photo: "image8.jpeg",
    role: loc("Avocate principale", "Lead counsel", "Baş hukuk müşaviri"),
    summary: loc(
      "Avocate principale de Numan Groupe International ; elle accompagne les affaires juridiques et la sécurisation des activités.",
      "Lead counsel of Numan Groupe International; she supports legal affairs and the safeguarding of the Group’s activities.",
      "Numan Groupe International baş hukuk müşaviri; hukuki işleri ve faaliyetlerin güvence altına alınmasını destekler.",
    ),
    bio: loc(
      "Maître Seçer Akkuş est l’avocate principale de Numan Groupe International. Elle accompagne le Groupe dans la gestion de ses affaires juridiques et la sécurisation de ses activités à l’échelle internationale. Elle intervient dans l’analyse et la préparation des contrats, le conseil juridique, la gestion des risques et l’accompagnement des relations contractuelles avec les partenaires institutionnels et commerciaux. Son travail contribue à la protection des intérêts du Groupe, au respect des obligations légales et contractuelles et au développement de partenariats durables dans le cadre de projets internationaux. Elle joue un rôle essentiel dans l’accompagnement juridique et la consolidation des activités de Numan Groupe International.",
      "Seçer Akkuş is lead counsel of Numan Groupe International. She supports the Group in managing its legal affairs and safeguarding its activities internationally. She works on analysing and preparing contracts, legal advice, risk management and contractual relations with institutional and commercial partners. Her work helps protect the Group’s interests, meet legal and contractual obligations and develop lasting partnerships on international projects. She has an essential role in legal support and in consolidating the activities of Numan Groupe International.",
      "Seçer Akkuş, Numan Groupe International’ın baş hukuk müşaviridir. Grubun hukuki işlerinin yönetiminde ve faaliyetlerinin uluslararası ölçekte güvence altına alınmasında eşlik eder. Sözleşmelerin incelenmesi ve hazırlanması, hukuki danışmanlık, risk yönetimi ve kurumsal ile ticari ortaklarla sözleşme ilişkilerinde görev alır. Çalışması Grubun çıkarlarının korunmasına, yasal ve sözleşmesel yükümlülüklere uyulmasına ve uluslararası projelerde kalıcı ortaklıkların geliştirilmesine katkıda bulunur. Numan Groupe International’ın hukuki desteğinde ve faaliyetlerinin pekiştirilmesinde temel bir rol oynar.",
    ),
    alt: loc("Portrait de Seçer Akkuş, avocate principale.", "Portrait of Seçer Akkuş, lead counsel.", "Baş hukuk müşaviri Seçer Akkuş’un portresi."),
  },
  {
    key: "rabia-hatipoglu",
    matchNames: ["Rabia Hatipoglu", "Maître RABIA HATIPOGLU", "Maître Rabia HATIPOGLU"],
    displayName: "Rabia Hatipoglu",
    existing: false,
    group: "legal",
    sortOrder: 90,
    photo: "image9.jpeg",
    role: loc("Avocate", "Counsel", "Avukat"),
    summary: loc(
      "Avocate au sein de Numan Groupe International ; elle contribue à l’accompagnement juridique des activités du Groupe.",
      "Counsel at Numan Groupe International; she contributes to the legal support of the Group’s activities.",
      "Numan Groupe International avukatı; Grubun faaliyetlerinin hukuki desteğine katkıda bulunur.",
    ),
    bio: loc(
      "Maître Rabia Hatipoglu est avocate au sein de Numan Groupe International, où elle contribue à l’accompagnement juridique des activités du Groupe et à la protection de ses intérêts. Elle participe à l’analyse des dossiers juridiques, à la préparation et à la révision des documents contractuels ainsi qu’au suivi des relations juridiques avec les partenaires et les institutions. Son travail contribue à la sécurisation des opérations, au respect des obligations légales et contractuelles et au développement de partenariats dans le cadre des projets internationaux. Elle participe au renforcement du dispositif juridique de Numan Groupe International et à l’accompagnement de son développement en Afrique, en Asie et en Europe.",
      "Rabia Hatipoglu is counsel at Numan Groupe International, where she contributes to the legal support of the Group’s activities and to the protection of its interests. She takes part in reviewing legal files, preparing and revising contractual documents and following legal relations with partners and institutions. Her work supports the safeguarding of operations, compliance with legal and contractual obligations and the development of partnerships on international projects. She contributes to strengthening the legal framework of Numan Groupe International and to supporting its development in Africa, Asia and Europe.",
      "Rabia Hatipoglu, Numan Groupe International bünyesinde avukattır; Grubun faaliyetlerinin hukuki desteğine ve çıkarlarının korunmasına katkıda bulunur. Hukuki dosyaların incelenmesine, sözleşme belgelerinin hazırlanması ve gözden geçirilmesine ve ortaklar ile kurumlarla hukuki ilişkilerin takibine katılır. Çalışması operasyonların güvence altına alınmasına, yasal ve sözleşmesel yükümlülüklere uyulmasına ve uluslararası projelerde ortaklıkların geliştirilmesine katkıda bulunur. Numan Groupe International’ın hukuki düzeninin güçlendirilmesine ve Afrika, Asya ile Avrupa’daki gelişiminin desteklenmesine katılır.",
    ),
    alt: loc("Portrait de Rabia Hatipoglu, avocate.", "Portrait of Rabia Hatipoglu, counsel.", "Avukat Rabia Hatipoglu’nun portresi."),
  },
  {
    key: "omer-korkut",
    matchNames: ["Omer Korkut", "Ömer Korkut", "M. OMER KORKUT"],
    displayName: "Omer Korkut",
    existing: false,
    group: "finance",
    sortOrder: 100,
    photo: "image10.png",
    role: loc("Directeur financier", "Finance Director", "Finans Direktörü"),
    summary: loc(
      "Directeur financier de Numan Groupe International ; il contribue à la gestion financière et à la structuration financière des projets.",
      "Finance Director of Numan Groupe International; he contributes to financial management and to the financial structuring of projects.",
      "Numan Groupe International finans direktörü; mali yönetime ve projelerin finansal yapılandırılmasına katkıda bulunur.",
    ),
    bio: loc(
      "M. Omer Korkut est le directeur financier de Numan Groupe International. Il apporte son expertise en gestion financière, en analyse des investissements et en structuration financière des projets. Il contribue à la gestion des ressources financières du Groupe, à l’analyse des opportunités d’investissement et à l’élaboration de stratégies financières adaptées aux projets d’envergure internationale. Son travail accompagne le développement du Groupe, la gestion financière de ses activités et la réalisation de projets structurants en Afrique, en Asie et en Europe. À travers ses responsabilités, il contribue à la solidité financière et au développement durable de Numan Groupe International.",
      "Mr Omer Korkut is Finance Director of Numan Groupe International. He contributes expertise in financial management, investment analysis and the financial structuring of projects. He takes part in managing the Group’s financial resources, analysing investment opportunities and preparing financial strategies suited to international-scale projects. His work supports the Group’s development, the financial management of its activities and the delivery of structuring projects in Africa, Asia and Europe. Through these responsibilities he contributes to the financial soundness and lasting development of Numan Groupe International.",
      "Omer Korkut, Numan Groupe International finans direktörüdür. Mali yönetim, yatırım analizi ve projelerin finansal yapılandırılması konularında katkı sağlar. Grubun mali kaynaklarının yönetimine, yatırım fırsatlarının incelenmesine ve uluslararası ölçekli projelere uygun finansal stratejilerin hazırlanmasına katılır. Çalışması Grubun gelişimini, faaliyetlerinin mali yönetimini ve Afrika, Asya ile Avrupa’daki yapılandırıcı projelerin gerçekleştirilmesini destekler. Bu sorumluluklarla Numan Groupe International’ın mali sağlamlığına ve kalıcı gelişimine katkıda bulunur.",
    ),
    alt: loc("Portrait d’Omer Korkut, directeur financier.", "Portrait of Omer Korkut, Finance Director.", "Finans Direktörü Omer Korkut’un portresi."),
  },
  {
    key: "bulent-pakkan",
    matchNames: ["Bulent Pakkan", "Bülent Pakkan", "M. BULENT PAKKAN"],
    displayName: "Bulent Pakkan",
    existing: false,
    group: "finance",
    sortOrder: 110,
    photo: "image11.jpeg",
    role: loc("Financier", "Finance specialist", "Finans Uzmanı"),
    summary: loc(
      "Financier au sein de Numan Groupe International ; il contribue au suivi des opérations financières et à l’analyse des besoins des projets.",
      "Finance specialist at Numan Groupe International; he contributes to following financial operations and analysing project needs.",
      "Numan Groupe International finans uzmanı; mali işlemlerin takibine ve proje ihtiyaçlarının incelenmesine katkıda bulunur.",
    ),
    bio: loc(
      "M. Bulent Pakkan est financier au sein de Numan Groupe International. Il contribue à la gestion et au suivi des opérations financières du Groupe, ainsi qu’à l’analyse des besoins financiers liés à ses projets. Il participe à l’évaluation des opportunités d’investissement, au suivi des ressources financières et à l’élaboration de solutions adaptées aux exigences des projets de construction et d’infrastructures. Son rôle contribue à soutenir la gestion financière des activités du Groupe et le développement de ses projets internationaux en Afrique, en Asie et en Europe.",
      "Mr Bulent Pakkan is a finance specialist at Numan Groupe International. He contributes to managing and following the Group’s financial operations and to analysing the financial needs of its projects. He takes part in assessing investment opportunities, monitoring financial resources and preparing solutions suited to construction and infrastructure projects. His role supports the financial management of the Group’s activities and the development of its international projects in Africa, Asia and Europe.",
      "Bulent Pakkan, Numan Groupe International bünyesinde finans uzmanıdır. Grubun mali işlemlerinin yönetimine ve takibine ve projelerin mali ihtiyaçlarının incelenmesine katkıda bulunur. Yatırım fırsatlarının değerlendirilmesine, mali kaynakların izlenmesine ve inşaat ile altyapı projelerinin gereklerine uygun çözümlerin hazırlanmasına katılır. Rolü, Grubun faaliyetlerinin mali yönetimini ve Afrika, Asya ile Avrupa’daki uluslararası projelerinin gelişimini destekler.",
    ),
    alt: loc("Portrait de Bulent Pakkan, financier.", "Portrait of Bulent Pakkan, finance specialist.", "Finans Uzmanı Bulent Pakkan’ın portresi."),
  },
];

export function matchKadroMember(fullName: string): KadroMember | undefined {
  const normalized = normalizePersonName(fullName);
  const matches = KADRO_ROSTER.filter((member) =>
    member.matchNames.some((name) => normalizePersonName(name) === normalized) ||
    normalizePersonName(member.displayName) === normalized,
  );
  return matches.length === 1 ? matches[0] : undefined;
}
