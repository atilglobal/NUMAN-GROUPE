# Veritabanı ve içerik altyapısı

PostgreSQL + Drizzle ORM. Şema `src/db/schema/`, migration dosyaları `drizzle/` altındadır. Uygulama veritabanına her zaman `DATABASE_URL` üzerinden `pg` (node-postgres) ile bağlanır; sağlayıcı kilitlenmemiştir.

## Yerel kurulum (Windows / macOS / Linux)

Docker veya sistem PostgreSQL kurulumu gerekmez. `embedded-postgres` paketi PostgreSQL 18 ikili dosyalarını `node_modules` içinden çalıştırır (yalnızca geliştirme bağımlılığı).

1. `.env.example` dosyasını `.env.local` olarak kopyalayın ve `DATABASE_URL` değerini kendi seçtiğiniz yerel kullanıcı/parola ile doldurun:

   ```
   DATABASE_URL=postgres://KULLANICI:PAROLA@localhost:5433/numan_dev
   ```

   `.env.local` git dışıdır. Gerçek parola kaynak koda yazılmaz.

2. Ayrı bir terminalde yerel sunucuyu başlatın (açık kalır, Ctrl+C ile durur):

   ```
   npm run db:local
   ```

   İlk çalıştırmada `.data/postgres` altında küme oluşturur (git dışı) ve `DATABASE_URL` içindeki veritabanını yaratır. Küme `C` yerel ayarı ve UTF-8 ile başlatılır; Windows'ta ASCII dışı karakter içeren sistem yerel adları (ör. `Turkish_Türkiye.1254`) `initdb` tarafından reddedildiği için bu bilinçli bir seçimdir.

3. Şemayı uygulayın ve temel veriyi yükleyin:

   ```
   npm run db:migrate
   npm run db:seed
   ```

4. İsteğe bağlı demo içerik (yalnızca geliştirme / önizleme):

   ```
   npm run db:seed:demo
   npm run db:demo:clear     # demo satırlarını ve demo medyayı tamamen siler
   ```

5. `npm run dev`.

Başka bir PostgreSQL (yerel kurulum, Docker, yönetilen servis) kullanılacaksa yalnızca `DATABASE_URL` değişir; 2. adım atlanır.

## Komutlar

| Komut | İş |
| --- | --- |
| `npm run db:local` | Geliştirme için gömülü PostgreSQL sunucusu. |
| `npm run db:generate` | Şema değişikliğinden yeni SQL migration üretir (`drizzle/`). |
| `npm run db:migrate` | Bekleyen migration'ları `DATABASE_URL` üzerine uygular. |
| `npm run db:seed` | Temel veri: 4 uzmanlık (üç dilde, `isSeed`), 9 kurumsal sayfa yuvası (metinsiz), boş site ayarları satırı. Tekrar çalıştırılabilir; mevcut satırlara dokunmaz. |
| `npm run db:seed:demo` | Demo veri; demo kapalı ortamda reddedilir. Var olan demo satırlarını silip yeniden yazar. |
| `npm run db:demo:clear` | Tüm demo satırlarını ve demo medya kayıtlarını siler. |
| `npm run admin:create` | İlk yöneticiyi oluşturur (`admin.md`); yönetici varsa reddeder. |

Migration akışı: şemayı değiştir, `npm run db:generate -- --name kisa_aciklama` ile dosya üret, SQL'i incele, `npm run db:migrate`. Uygulanmış bir migration dosyası düzenlenmez; yeni dosya eklenir.

## Ortam değişkenleri

| Değişken | Açıklama |
| --- | --- |
| `DATABASE_URL` | Zorunlu (`dev`, `build`, `start`, seed ve migration). |
| `DATABASE_POOL_MAX` | Süreç başına bağlantı havuzu (varsayılan 5). |
| `MEDIA_PUBLIC_BASE_URL` | Medya dosyalarının public kökü. Varsayılan `/media` (`GET /media/[...key]`). Harici bir köke geçildiğinde `next.config.ts` içine `images.remotePatterns` eklenmelidir. |
| `MEDIA_STORAGE_DIR` | Yüklenen byte'ların kalıcı dizini. Varsayılan `.data/media`. Üretimde bağlı bir birim. |
| `RESEND_API_KEY`, `INQUIRY_NOTIFY_TO`, `INQUIRY_NOTIFY_FROM` | İsteğe bağlı talep bildirimi. Yoksa talep yine kaydedilir. |
| `SITE_URL` | Kanonik/hreflang ve sitemap mutlak adresleri. Boşsa sitemap boş döner. |
| `SITE_ENV`, `ALLOW_DEMO_CONTENT` | Demo politikası (aşağıda). |
| `BETTER_AUTH_SECRET` | Zorunlu (panel oturumları), en az 32 karakter rastgele değer. |
| `BETTER_AUTH_URL` | Panelin public adresi; boşsa `SITE_URL`. |
| `AUTH_IP_HEADER` | Güvenilir proxy'nin istemci IP'sini koyduğu başlık; boşsa IP tabanlı giriş sınırı kapalı. |

Kimlik tabloları (`sessions`, `accounts`, `verifications`, `auth_rate_limits`) ve `user_role` (`admin`, `editor`) `drizzle/0001_auth_and_roles.sql` ile gelir. E-posta adresleri küçük harfle saklanır (veritabanı kontrolü).

**Build veritabanına ihtiyaç duyar.** Public sayfalar `next build` sırasında yayımlanmış içerikten önceden üretilir; build ortamı `DATABASE_URL` ile veritabanına erişebilmelidir. Bu, hosting seçiminde (build adımının veritabanına ağ erişimi) dikkate alınacak bir koşuldur.

## Çok dilli içerik

- Sabit arayüz metinleri `src/i18n/dictionaries/{fr,en,tr}.json` içinde varsayılan olarak kalır. Panel karşılıkları `ui_string_overrides` (anahtar kilitli).
- CMS sayfaları `cms_pages` + `cms_page_translations` (`/[locale]/p/[slug]`). Menüler `menus` / `menu_items`. Görsel kullanımları `media_placements`. Migration: `0008_cms_i18n_media`.
- Editoryal içerik kök tablo (dil bağımsız alanlar) + `*_translations` tablosunda dil başına bir satırdır. FR/EN/TR ayrı satırlar olarak ayrı düzenlenir.
- Her dil ayrı yayımlanır: `status` = `draft` | `published`; `published` ise `published_at` zorunludur (veritabanı kontrolü).
- Slug'lar dil başına benzersizdir (`unique(locale, slug)`), biçim kontrolü veritabanındadır (`^[a-z0-9]+(-[a-z0-9]+)*$`, en fazla 160 karakter). Bir kaydın bir dilde en fazla bir çevirisi olabilir.
- Eksik dil başka dilden **doldurulmaz**. O dilde yayımlanmış çeviri yoksa kayıt o dilin listelerinde, detayında ve sitemap'inde yoktur.
- Görsellerin alt metni de dil başınadır; bir dilde alt metni olmayan görsel o dilde gösterilmez.
- Dil değiştirici: sayfa, karşılığı yayımlanmış dillerin adreslerini bildirir; karşılık yoksa hedef dilin bölüm (liste) sayfasına gider.
- Panel için çeviri durumu: `getTranslationCoverage()` her kayıt ve dil için `published | draft | missing`, `getMissingAltText()` alt metni eksik görselleri döner (`src/content/coverage.ts`). Gösterge paneli çeviri durumunu gösterir.
- `projects.progress_percent` isteğe bağlıdır (0–100 veya null); migration `drizzle/0002_project_progress_percent.sql`. Tarihten türetilmez.
- Uzmanlık silinince `projects.expertise_id` `SET NULL` olur; proje satırı silinmez.

## Yayımlama ve önbellek

- Public okumalar `src/content/service.ts` içindedir: `'use cache'` + `cacheTag` + `cacheLife("hours")`. Etiketler `src/content/cache-tags.ts`.
- Dil bazlı yayımlama/taslağa alma `setTranslationStatus()` (`src/content/publishing.ts`) ile yapılır: tek işlemde durum + `published_at` + işlem kaydı (`audit_logs`), ardından ilgili etiketler `updateTag` ile geçersiz kılınır. Bu çağrı panelin Server Action'larından yapılmak üzere tasarlanmıştır (`updateTag` yalnızca Server Action içinde çalışır).
- Uzmanlık değişikliği proje kartlarındaki uzmanlık adını da etkilediği için proje etiketini de geçersiz kılar; medya değişikliği tüm görselli okumaları etkiler.
- Panel dışından yapılan doğrudan veritabanı değişiklikleri (seed, elle SQL) etiketi tetiklemez; en geç `cacheLife("hours")` süresi sonunda görünür olur. Hemen görmek için uygulama yeniden başlatılır veya yeniden build alınır.
- Sitemap (`/sitemap.xml`) istek anında üretilir ve yalnızca yayımlanmış dil sürümlerini listeler.

## Demo ve üretim ayrımı

- Demo satırlar `is_demo = true` ile işaretlidir (projeler, ziyaretler, kadro, uzmanlık, medya). Public sorgular demo kapalıyken bunları ve demo görselleri hiç döndürmez.
- `SITE_ENV=production` → demo her zaman kapalı. Aksi hâlde `ALLOW_DEMO_CONTENT=true|false`; tanımsızsa `next dev` açık, production build kapalı.
- `db:seed:demo`, demo kapalı bir ortamda çalışmayı reddeder. Temel seed hiçbir demo satırı yazmaz.
- Demo görseller `content/demo/` altındadır (public paketinde değil) ve yapay illüstrasyondur; NUMAN GROUPE fotoğrafı değildir. `SITE_ENV=production` (veya demo kapalı) iken `GET /media/demo/...` 404 döner. Üretime çıkmadan önce `db:demo:clear` çalıştırılır.

## Testler

`npm test`, gerçek migration'ları bellek içi PostgreSQL'e (PGlite) uygulayarak çalışır; harici veritabanı gerekmez. Kapsam: veritabanı kısıtları (slug benzersizliği/biçimi, tarih sırası, ülke kodu, URL, ilerleme yüzdesi, tek satırlı ayarlar), taslakların public okumadan dışlanması, dil fallback'i olmaması, yalnızca yayımlanmış dillere alternatif bağlantı, demo süzgeci, yayımlama + işlem kaydı + önbellek yenileme, çeviri kapsamı, seed ayrımı, proje/uzmanlık yazma yolları, public filtreler.
