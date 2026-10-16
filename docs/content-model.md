# İçerik modeli

İlişkisel PostgreSQL. Kimlikler UUID. Zaman damgaları UTC.

Uydurulmayacak alanlar: ülke iddiası, müşteri listesi, sertifika, çalışan sayısı, tamamlanan iş sayısı, resmî ortaklık. Bu alanlar şemaya “zorunlu pazarlama metriği” olarak **konmaz**. İleride gerçek belgeyle eklenirse ayrı, isteğe bağlı ve kaynak gösterilebilir alan olur.

Resmî ziyaret satırları sponsorluk, devlet desteği veya ortaklık olarak yorumlanmaz. Kopya kılavuzu panelde kısa uyarı metni olarak durur.

## Ortak yayın kuralları

Çoğu public varlık:

- kök kayıt (dil bağımsız),
- `translations` (locale başına bir satır),
- isteğe bağlı medya bağları.

Çeviri durumları: `draft` | `published`.  
Public: kök `isDemo = false` (veya üretimde demo kapalı) **ve** o locale `published`.

`isDemo`: açık işaret (panel rozeti, public’te “démo” yalnızca demo ortamında). Üretim seed’i demo satır yazmaz.

`isSeed`: uzmanlık gibi yapısal başlangıç satırları. Firma istatistiği değildir. Silinmeden önce panel uyarır.

Locale kodları: `fr`, `en`, `tr`.

## Tablolar

### `users` (Better Auth + uygulama alanları)

Better Auth’un kullanıcı/oturum/hesap tabloları Drizzle şemasına dahil edilir. Uygulama ek alanları:

- `role`: `admin` | `editor` | `viewer`
- `name`, `email` (benzersiz)
- `disabledAt` (isteğe bağlı)

İlk admin ortam değişkeni veya kontrollü seed ile; parola kaynak kodunda yok.

### `audit_logs`

- `id`, `actorUserId` (null: sistem)
- `action` (ör. `project.publish`)
- `entityType`, `entityId`
- `metadata` JSON (kişisel veri asgari; form mesajı tam kopyalanmaz)
- `createdAt`, `ip` (isteğe bağlı)

### `media_assets`

- `id`, `storageKey`, `mimeType`, `byteSize`, `width`, `height`
- `originalFilename` (yalnızca panel)
- `altFr` / `altEn` / `altTr` veya ayrı `media_asset_translations` — tercih: çeviri tablosu (alt zorunlu yayımlanan dilde)
- `createdById`, `createdAt`
- `isDemo`

Dosya baytı DB’de değil.

### `media_links`

- `assetId`, `entityType`, `entityId`
- `role`: `cover` | `gallery` | `portrait` | `og`
- `sortOrder`

### `site_settings`

Tek satır (veya anahtar/değer). Dil bağımsız:

- `defaultLocale` = `fr`
- `contactEmail` (ortam veya ayar; kaynakta sabit yok)
- `socialUrls` JSON (yalnızca doğrulanmış)
- `analyticsEnabled` (varsayılan false)
- `allowDemoContent` (üretimde false)

Firma unvanı, adres, telefon: **yalnızca panelden**; yoksa iletişim sayfasında gösterilmez (uydurulmaz).

### `ui_strings`

Navigasyon, buton, 404, form etiketleri. Anahtar + locale + metin. Kod içi sözlük yedek olabilir; panel `ui_strings` doldurunca onu kullanır. Eksik anahtar: `fr` yedeği, yoksa anahtar adı (üretimde log).

### `pages` (kurumsal)

Anahtar: `about` | `privacy` | `legal` | `cookies` | `contact_intro` (iletişim giriş metni).

`page_translations`: `locale`, `slug` (yol haritasındaki sabit slug’larla uyumlu; değiştirilebilir ama kırılma riski — ilk sürümde slug kodda sabit, gövde CMS).

Alanlar: `title`, `body` (zengin metin, sınırlı HTML), `seoTitle`, `seoDescription`, `status`.

### `home_blocks`

Ana sayfa bölümleri: `hero`, `intro`, `featured_expertises`, `featured_projects`, `featured_visits`, `cta`.

`home_block_translations`: başlık, özet, CTA etiket/hedef, `status`.

Öne çıkan proje/ziyaret: kayıt üzerindeki `isFeatured`. Yayımlanmamış öğeler public’te atlanır; yer tutucu kart basılmaz. Ana sayfa ziyaretleri yalnızca panelde işaretlenenlerden oluşur.

### `expertises`

Kök: `id`, `sortOrder`, `isSeed`, `isDemo`, `createdAt`, `updatedAt`.

`expertise_translations`: `locale`, `slug` (locale içinde benzersiz), `name`, `summary`, `body`, `seo*`, `status`.

Başlangıç seed (yapısal, uydurma proje değil): stadyumlar, hastaneler, spor köyleri, lojmanlar — üç dilde ad/özet. Gövde boş kalabilir; boş gövde public detayda “metin yok” veya yalnızca ad+özet. Panelden yeni uzmanlık eklenir.

`project_expertises`: çoktan çoğa.

### `projects`

Kök:

- `status`: `completed` | `in_progress` (işin inşaat durumu; çeviri `draft/published` değil)
- `startedOn`, `completedOn` (isteğe bağlı tarihler; yoksa gösterilmez)
- `countryCode` (ISO 3166-1; yoksa gösterilmez)
- `progressPercent` (isteğe bağlı 0–100; yoksa gösterilmez, tarihten üretilmez)
- `expertiseId` (isteğe bağlı; uzmanlık silinince null, proje kalır)
- `isFeatured`, `sortOrder`, `coverAssetId`, `isDemo`

Müşteri adı yok sayılmaz; yoksa alan boş. “Fortune 500 / bakanlık müşterisi” gibi varsayılan yok.

`project_translations`: `locale`, `slug`, `title`, `summary`, `body`, `seo*`, `status`.

### `official_visits`

Kök:

- `visitedOn` (tarih)
- `countryCode`
- `coverAssetId`, `isFeatured`, `isDemo`

Kurum adı ve şehir çeviri satırındadır (`hostInstitution`, `location`). Uydurma host yok.

`official_visit_translations`: `locale`, `slug`, `title`, `summary`, `body`, `hostInstitution`, `location`, `seo*`, `status`.

`body` ve `summary` için panel yardımı: ziyareti ortaklık veya devlet desteği olarak tanımlamayın.

### `people` (kadro)

Kök: `sortOrder`, `photoAssetId`, `isDemo`, `isVisible`.

`person_translations`: `locale`, `fullName` (ad dilde değişmeyebilir; yine de satır), `roleTitle`, `bio`, `status`.

E-posta/telefon kişi üzerinde varsayılan yok (KVK / gizlilik). İleride isteğe bağlı ve panel onayıyla.

### `inquiries` (iletişim + proje talebi)

- `type`: `contact` | `project_request`
- `locale` (formun gönderildiği dil)
- `name`, `email`, `phone` (isteğe bağlı)
- `organization` (isteğe bağlı)
- `message`
- `relatedExpertiseId` / `relatedProjectId` (isteğe bağlı)
- `status`: `new` | `read` | `archived`
- `createdAt`, `handledById`, `handledAt`

Kişisel veri: panel erişimi rollü; log’da mesaj tam metin tutulmaz; yedekleme/retention politikası yayın fazında.

Doğrulama başarısızsa kayıt yazılmaz ve kullanıcıya gerçek hata gösterilir. Başarı ancak INSERT sonrası.

## Yayımlama akışı

1. Editör çeviriyi `draft` tutar.
2. `published` yapılınca public sorgu o dili görür.
3. Üç dilden biri taslaksa diğer yayımlanmış diller etkilenmez.
4. Kök `isDemo` üretim public sorgusunda elenir.

## Demo ve seed

| Tür | Örnek | Üretim |
| --- | --- | --- |
| Seed | 4 uzmanlık adı | Kalabilir (taksonomi) |
| Demo | Sahte proje/ziyaret/kişi | `ALLOW_DEMO_CONTENT` yoksa yüklenmez; yüklüyse public’te gizlenir |

## Dizinler (öneri)

- `(locale, slug)` benzersiz: her çeviri tablosu
- `status`, `visitedOn`, `project.status`
- `inquiries.status`, `createdAt`
- `audit_logs.createdAt`

## Faz 3 uygulaması ve bu plandan sapmalar

Uygulanan şema `src/db/schema/`, ilk migration `drizzle/0000_initial_schema.sql`. Kurulum ve işleyiş: `database.md`.

Tablolar: `users`, `media_assets`, `media_asset_translations`, `expertises` (+ `_translations`), `projects` (+ `_translations`, `project_gallery`), `official_visits` (+ `_translations`, `official_visit_participants`, `official_visit_participant_translations`, `official_visit_gallery`), `team_members` (+ `_translations`, `team_member_links`), `page_contents` (+ `_translations`), `site_settings`, `site_setting_translations`, `inquiries`, `audit_logs`.

Sapmalar:

- **Proje → uzmanlık tek ilişki** (`projects.expertise_id`, silinince `null`). Bir projenin birden fazla uzmanlığa bağlanması gerekirse ilişki tablosuna geçilir.
- **Genel `media_links` yerine** her varlıkta açık sütun (`cover_asset_id`, `photo_asset_id`) ve varlığa özel galeri tabloları. Yabancı anahtarlar veritabanında korunur.
- **Kadro adı kökte** (`team_members.full_name`, zorunlu): kişi adı dile göre değişmez. Unvan ve biyografi dil başına.
- **Ziyaret katılımcıları** ayrı tabloda; ad kökte, unvan dil başına ve yalnızca verilmişse. Kurum adı çeviri tablosunda (`host_institution`, boş olabilir).
- **Ülke** ISO 3166-1 alfa-2 kodu (`country_code`); ekranda `Intl.DisplayNames` ile dile göre adlandırılır, çeviri gerektirmez.
- **Teknik bilgiler** `project_translations.technical_details` (etiket/değer dizisi, dil başına); boş satırlar public'te gösterilmez.
- **Tarihler** `date` tipinde ve isteğe bağlı; bilinmiyorsa boş kalır. Bitiş başlangıçtan önce olamaz (veritabanı kontrolü).
- **`home_blocks` yok**: ana sayfa sabit bölümlerdir. Sıra ve görünürlük `site_settings.home_sections` JSON; yayımlanmış kopya `site_setting_translations` (yoksa sözlük). Görseller ve isteğe bağlı hero videosu `site_settings` üzerindedir. Öne çıkan proje/ziyaret `is_featured`.
- **`ui_strings` yok**: sabit arayüz metinleri sözlük dosyalarında kalır (Faz 3 talimatı).
- **Demo anahtarı `site_settings` içinde değil**, ortam değişkenindedir (`SITE_ENV`, `ALLOW_DEMO_CONTENT`); böylece veritabanı içeriği üretimde demoyu açamaz.
- **`users` tablosu** Better Auth ile uyumlu metin kimlik kullanır; oturum/hesap tabloları Faz 4'te kimlik kütüphanesiyle eklenecek.
