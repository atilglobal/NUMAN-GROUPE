import type { Locale } from "../i18n/config";

/** Panel wording (Turkish). The public site keeps its own dictionaries. */

export const localeLabels: Record<Locale, string> = {
  fr: "Fransızca",
  en: "İngilizce",
  tr: "Türkçe",
};

export const entityLabels: Record<string, string> = {
  expertise: "Uzmanlık alanı",
  project: "Proje",
  visit: "Resmî ziyaret",
  team_member: "Ekip üyesi",
  page: "Sayfa",
  cms_page: "İçerik sayfası",
  ui: "Arayüz metni",
  menu: "Menü",
  media: "Medya",
  inquiry: "Talep",
  user: "Kullanıcı",
  settings: "Site ayarları",
  auth: "Giriş",
};

const actionLabels: Record<string, string> = {
  create: "oluşturuldu",
  update: "güncellendi",
  delete: "silindi",
  publish: "yayımlandı",
  unpublish: "yayından kaldırıldı",
  translation_create: "çevirisi eklendi",
  translation_update: "çevirisi güncellendi",
  role_change: "rolü değiştirildi",
  disable: "devre dışı bırakıldı",
  enable: "etkinleştirildi",
  sessions_revoke: "oturumları sonlandırıldı",
  password_reset: "parolası sıfırlandı",
  password_change: "parolasını değiştirdi",
  sign_in: "giriş yaptı",
  sign_out: "çıkış yaptı",
  sign_in_failed: "başarısız giriş denemesi",
  sign_in_throttled: "engellenen giriş denemesi",
  status: "durumu güncellendi",
  note: "notu eklendi",
};

export function describeAction(action: string, entityType: string): string {
  const verb = action.split(".").at(-1) ?? action;
  const entity = entityLabels[entityType] ?? entityType;
  return `${entity} ${actionLabels[verb] ?? verb}`;
}

/** Untranslated pages are labelled by their key in coverage rows. */
export const pageKeyLabels: Record<string, string> = {
  about: "Grup — karşılama ve biz kimiz",
  history: "Grup — tarihçe ve konumlandırma",
  mission: "Grup — misyon",
  vision: "Grup — vizyon",
  approach: "Grup — çalışma yaklaşımı",
  principles: "Grup — ilkeler ve taahhütler",
  finance: "Grup — proje geliştirme ve finansman",
  regions: "Grup — uluslararası faaliyetler",
  organization: "Grup — organizasyon",
  future: "Grup — gelecek yönelimleri",
  quality: "Kalite ve güvenlik",
  certificates: "Sertifikalar",
  contact: "İletişim sayfası",
  privacy: "Gizlilik politikası",
  legal: "Yasal bilgiler",
  cookies: "Çerez politikası",
};

export const roleOptions = [
  { value: "editor", label: "Editör — içerik ve medya" },
  { value: "admin", label: "Yönetici — bütün ayarlar ve kullanıcılar" },
];

export const statusLabels = {
  published: "Yayında",
  draft: "Taslak",
  missing: "Eksik",
} as const;

export const dateTimeFormat = new Intl.DateTimeFormat("tr-TR", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "Europe/Istanbul",
});
