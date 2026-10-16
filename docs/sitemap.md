# Site haritası ve yönlendirme

Desteklenen diller: `fr` (varsayılan), `en`, `tr`.  
Kök: `GET /` → `308` veya `301` → `/fr`.

Yayımlanmamış dil sürümü public listelerde ve detayda yok sayılır (404). Dil değiştirici yalnızca hedef dilde yayımlanmış karşılığı olan bağlantıyı gösterir; yoksa o dilin bölüm ana sayfasına (ör. `/en/projets` değil, eşdeğer liste) veya dile ait ana sayfaya düşer — detay uydurulmaz.

Slug’lar dil bazlıdır. Dil değişiminde aynı `entityId` + hedef `locale` çözülür.

Fransızca yol adları kanonik public URL’dir (ana dil). İngilizce ve Türkçe yollar kendi dilindedir.

## Public

| Sayfa | `fr` | `en` | `tr` |
| --- | --- | --- | --- |
| Ana sayfa | `/fr` | `/en` | `/tr` |
| Hakkımızda | `/fr/a-propos` | `/en/about` | `/tr/hakkimizda` |
| Uzmanlık alanları | `/fr/expertises` | `/en/expertise` | `/tr/uzmanliklar` |
| Uzmanlık detay | `/fr/expertises/[slug]` | `/en/expertise/[slug]` | `/tr/uzmanliklar/[slug]` |
| Projeler | `/fr/projets` | `/en/projects` | `/tr/projeler` |
| Proje detay | `/fr/projets/[slug]` | `/en/projects/[slug]` | `/tr/projeler/[slug]` |
| Resmî ziyaretler | `/fr/visites-institutionnelles` | `/en/institutional-visits` | `/tr/resmi-ziyaretler` |
| Ziyaret detay | `/fr/visites-institutionnelles/[slug]` | `/en/institutional-visits/[slug]` | `/tr/resmi-ziyaretler/[slug]` |
| Kadromuz | `/fr/equipe` | `/en/team` | `/tr/kadro` |
| İletişim | `/fr/contact` | `/en/contact` | `/tr/iletisim` |
| Gizlilik | `/fr/confidentialite` | `/en/privacy` | `/tr/gizlilik` |
| Yasal bildirim (Mentions légales) | `/fr/mentions-legales` | `/en/legal-notice` | `/tr/yasal-bilgilendirme` |
| Çerezler | `/fr/cookies` | `/en/cookies` | `/tr/cerezler` |
| 404 | `app/[locale]/not-found.tsx` (dile göre) | aynı | aynı |

Liste sorguları:

- Projeler: durum (`completed` \| `in_progress`), uzmanlık, arama (yayımlanmış çeviri metni).
- Ziyaretler: tarih azalan; ülke ve yıl. Metin: ziyaret ziyarettir; devlet desteği / resmî ortaklık iddiası yok. Eski FR/EN slug’lar 301 ile kanonik yola gider.

Kadro: kişi detay URL’si ilk sürümde yok; tek liste sayfası. İleride gerekirse `/equipe/[slug]` eklenir.

Makine uçları:

- `/sitemap.xml` — yayımlanmış URL’ler + alternatif diller.
- `/robots.txt` — `/admin` `Disallow`; `SITE_URL` varsa sitemap adresi.
- Kimlik doğrulama için ayrı API ucu yok; giriş/çıkış Server Action'dır (`admin.md`).
- İletişim/talep: `submitInquiryAction` Server Action; sahte başarı yok.

## Yönetim paneli (`/admin`)

Panel Türkçedir; gerçekleşen ekranlar ve yetkiler: `admin.md`. Oturumsuz istek → `/admin/giris`. Faz 8 itibarıyla `/admin/medya` ve `/admin/talepler` (yalnız yönetici) vardır.

| Ekran | Yol (Faz 1 planı) | Rol |
| --- | --- | --- |
| Giriş | `/admin/login` | herkese açık (zaten oturum varsa dashboard) |
| Dashboard | `/admin` | tüm roller |
| Projeler | `/admin/projets` | editor+ |
| Proje düzenle | `/admin/projets/[id]` | editor+ |
| Resmî ziyaretler | `/admin/visites` | editor+ |
| Ziyaret düzenle | `/admin/visites/[id]` | editor+ |
| Uzmanlık alanları | `/admin/expertises` | editor+ |
| Uzmanlık düzenle | `/admin/expertises/[id]` | editor+ |
| Kadro | `/admin/equipe` | editor+ |
| Kadro düzenle | `/admin/equipe/[id]` | editor+ |
| Medya kütüphanesi | `/admin/medias` | editor+ |
| Ana sayfa yönetimi | `/admin/accueil` | editor+ |
| Kurumsal sayfalar | `/admin/pages` | editor+ |
| Gelen talepler | `/admin/demandes` | editor+ (silme: admin) |
| Talep detay | `/admin/demandes/[id]` | editor+ |
| Site ayarları | `/admin/parametres` | admin |
| Kullanıcılar | `/admin/utilisateurs` | admin |
| İşlem kayıtları | `/admin/journal` | admin |

Paneldeki her kayıt/güncelle/sil/yayımla gerçek mutasyon yapar; boş `onClick` veya sahte toast yok.

## Dil değiştirme

1. Mevcut pathname’den içerik türü ve `entityId` (veya kurumsal sayfa anahtarı) bulunur.
2. Hedef dilde `status = published` çeviri varsa o slug’a gidilir.
3. Yoksa hedef dilin aynı bölüm listesi veya ana sayfası; 404 içeriği “çevirisi varmış gibi” gösterilmez.

## 404 ve boş durum

- Bilinmeyen locale (`/de/...`) → 404.
- Yayımlanmamış veya demo (üretimde) kayıt → 404.
- Boş liste: “içerik yok” mesajı; uydurma kart yok.
