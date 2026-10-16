# Mimari

Kaynak tarihi: 14 Ekim 2026. Sürümler npm kayıt defteri, Node.js dağıtım indeksi ve üretici sürüm notlarından okundu; tahmin edilmedi.

Bu aşamada uygulama kodu yazılmaz. Mevcut çalışma klasörü yeşil alandır: yalnızca `AGENTS.md` ve bu `docs/` dosyaları vardır.

## Hedef

Tek bir Node.js uygulamasında:

- üç dilli public site (SEO için sunucu tarafında HTML),
- güvenli yönetim paneli,
- ilişkisel veritabanı,
- medya ve içerik yönetimi

birlikte çalışır. Klasik PHP hosting (yalnızca Apache + PHP, Node yok) bu yığını çalıştırmaz.

## Varsayılan yığın (şimdi kilitlenenler)

| Katman | Seçim | Gerekçe |
| --- | --- | --- |
| Framework | Next.js App Router **16.4.1** (`create-next-app` aynı sürüm) | Public + sunucu aynı süreçte; RSC / sunucu bileşenleri ile HTML üretimi; `engines.node`: `>=20.9.0`. 16.4 satırı React 19.3 ile birlikte yayımlanmıştır. |
| UI kütüphanesi | React **19.3.1** + `react-dom` **19.3.1** | Next 16.4.1 akran aralığı `^19.0.0` içerir. Tipler: `@types/react` **19.3.0**, `@types/react-dom` **19.3.0**. |
| Dil | TypeScript **7.0.2** (npm `latest`, 14 Ekim 2026) | JavaScript ekosistemi içinde. İskele kurulurken `create-next-app` şablonunun kilitlediği sürümle çatışma olursa şablon sürümü esas alınır; çatışma belgeye işlenir. |
| Çalışma zamanı | Node.js **24.22.0** (LTS kod adı Krypton; 14 Ekim 2026 güncel LTS) | Üretim için Current (v26) değil LTS. Next asgari `>=20.9.0`; 22 LTS (Jod, **22.23.3**) yedek asgari hat. |
| Veri modeli | PostgreSQL diyalekti, ilişkisel şema | Çok dilli içerik, yayımlama, ilişkiler ve denetim kaydı için uygun. Motor/sağlayıcı henüz kilitlenmez. |
| ORM | Drizzle ORM **0.45.4** + drizzle-kit **0.31.11** + `pg` **8.23.1** | Kararlı `latest` (RC değil). SQL migrasyonları, ek sorgu motoru yok. Better Auth akranları: `drizzle-orm ^0.45.2`, `drizzle-kit >=0.31.4`, `pg ^8`. |
| Kimlik | Better Auth **1.7.8** | E-posta/parola ve oturum tabloları; Next 16 ve React 19 akranları var; Drizzle adaptörü var. `next-auth` npm `latest` hâlâ **4.24.15** (Pages Router dönemi); v5 ayrı/beta hattı. |
| Doğrulama | Zod **4.6.7** | Better Auth `zod ^4.5.4` kullanır. Form ve servis girdileri ortak şemalarla doğrulanır. |
| Stil | Tailwind CSS **4.3.3** (iskelede `create-next-app` ile hizalanır) | Mobil öncelikli düzen için yeterli; ek UI kit eklenmez. |
| Test | Vitest **5.0.4** | Servis ve yayımlama kuralları için. Better Auth akranı Vitest 5’i kapsar. |

### Kurulu sürümler ve plandan sapmalar (Faz 2)

Kaynak: `package.json` ve `package-lock.json`. Şablon sürümü esas alındı.

- React / `react-dom`: **19.3.0** (`create-next-app@16.4.1` şablon sabiti; planda 19.3.1).
- TypeScript: şablon aralığı `^5`, kurulu **5.9.3** (planda 7.0.2). Next 16.4.1 şablonunun tip üretimi bu hatla doğrulandı; 7.x geçişi ayrı karar.
- `@types/node`: **24.x** — Vitest 5 akran aralığı `^20` ile uyuşmadığı için şablondaki `^20` yükseltildi.
- Tailwind CSS v4: `@tailwindcss/turbopack` yükleyicisi ile (PostCSS yapılandırması yok).
- Next yapılandırması: `cacheComponents` ve `partialPrefetching` (şablon varsayılanı), `experimental.globalNotFound`.
- Yerel geliştirme Node **24.18.0** ile doğrulandı.

### Faz 3 eklenen bağımlılıklar

Sürümler `npm view` ile doğrulandı; kaynak `package.json` / lockfile.

- Çalışma zamanı: `drizzle-orm` **0.45.4**, `pg` **8.23.1**.
- Geliştirme: `drizzle-kit` **0.31.11**, `@types/pg` **8.23.1**, `@electric-sql/pglite` **0.5.10** (testlerde bellek içi PostgreSQL), `embedded-postgres` **18.4.0-beta.17** (yerel geliştirme sunucusu; PostgreSQL 18.4 ikilileri, paket etiketi beta — üretimde kullanılmaz), `tsx` **4.23.15** (scriptler), `@next/env` **16.4.1** (scriptlerde `.env.local` okuma).
- Zod Faz 4'te eklendi (aşağıda).
- `npm audit`: 9 bulgu, tümü geliştirme zincirinde (`eslint-config-next` bağımlılıkları ve `drizzle-kit` içindeki eski esbuild). Önerilen düzeltmeler büyük sürüm geri düşüşü olduğu için uygulanmadı; çalışma zamanı paketlerinde bulgu yok.
- Public okumalar `'use cache'` + `cacheTag` ile; build sırasında veritabanına erişim gerekir (`database.md`).

### Faz 4 eklenen bağımlılıklar

- Çalışma zamanı: `better-auth` **1.7.8**, `zod` **4.6.7** (`npm view` ile doğrulandı).
- Better Auth yalnızca kütüphane olarak kullanılır (`auth.api`); HTTP işleyicisi (`/api/auth/*`) bağlanmadı. Parola karması Better Auth'un `hashPassword` (scrypt) işlevidir. Ayrıntı: `admin.md`.

### Bilinçli olarak seçilmeyenler

- **Prisma 8**: npm `prisma@latest` = **8.0.0-rc.22** (RC). Prisma belgelerine göre bu CLI `schema.prisma` / klasik `migrate` hattı değildir.
- **Prisma 7.10.0**: `@prisma/client` ve `prisma@7.10.0` kararlıdır; ancak `npm install prisma` yanlışlıkla RC 8’e düşer. Bu projede Drizzle tercih edilir.
- **SQLite üretimde**: Yerel geliştirme için geçici olabilir; üretim içerik/medya meta verisi için PostgreSQL hedefi korunur.
- **Ayrı admin uygulaması / mikroservisler**: Tek ekip, tek içerik modeli; aşırı mühendislik.
- **next-intl zorunluluğu**: İçerik veritabanında. Dil yönlendirmesi App Router `[locale]` + ince yardımcı ile yapılır; ekstra i18n çerçevesi gerekmedikçe eklenmez.

## Uygulama biçimi

Tek Next.js uygulaması:

```
app/
  [locale]/          public sayfalar (fr | en | tr)
  admin/             yönetim paneli (oturum zorunlu, Türkçe, ayrı kök layout)
  api/               yalnızca gerekirse (Faz 4'te yok; yazmalar Server Action)
lib/
  services/          content, translation, media, authz
  db/                drizzle şema + istemci
  storage/           medya saklama arabirimi
```

- `/` → `/fr` (kalıcı yönlendirme).
- Public HTML sunucuda üretilir (App Router sunucu bileşenleri). Liste ve detay sayfaları yayımlanmış çeviriye göre dinamiktir; agresif statik önbellek, yayımlama sonrası geçersiz kılınır.
- `/admin` dil öneki taşımaz ve ayrı kök layout'a sahiptir. Panel arayüz dili Türkçe (Faz 4 kararı); içerik alanları FR / EN / TR sekmelerinde düzenlenir.
- Cache Components (Next 16.4 önerisi) iskelede varsayılan şablon ne veriyorsa onunla hizalanır; bilinçsizce experimental bayrak açılmaz.

## Servis sınırları

Tekrarlayan işler sayfa veya form içinde dağılmaz.

| Servis | Sorumluluk |
| --- | --- |
| `content` | Proje, ziyaret, uzmanlık, kadro, kurumsal sayfa, ana sayfa blokları; yayımlama; `isDemo` süzgeci. |
| `translation` | Yerel slugs, dil görünürlüğü, dil değiştiricide eş içerik, `hreflang`. |
| `media` | Yükleme, silme, varyant meta, URL üretimi; depolama arabiriminin arkasında. |
| `authz` | Oturum, roller, panel izinleri, işlem kaydı yazımı. |

Public sorgular yalnızca **yayımlanmış** ve **o dilde var olan** kayıtları döner. Demo kayıtlar üretim ortamında public sorgudan çıkar (`NODE_ENV=production` veya `ALLOW_DEMO_CONTENT` kapalı).

## Yetkilendirme

Roller (Faz 4):

- `admin` (Yönetici): kullanıcılar, site ayarları, her içerik, talepler, bütün işlem kayıtları.
- `editor` (Editör): içerik ve medya; kullanıcı, rol, ayar ve talep ekranlarına erişemez.

Yetki her sayfada ve her Server Action'da sunucuda kontrol edilir (`src/auth/session.ts`); menü gizleme koruma sayılmaz. Parolalar Better Auth’un hash mekanizması ile saklanır. Gizli anahtarlar yalnızca ortam değişkenlerinde. Ayrıntı: `admin.md`.

## Medya

Kod, `MediaStorage` arabirimine bağlıdır:

- `put`, `delete`, `publicUrl`
- Yerel geliştirme: disk (`uploads/`, git dışı)
- Üretim: nesne depolama (S3 uyumlu) **veya** kalıcı disk — **dağıtım kararına bağlı, henüz kilitlenmez**

Veritabanında dosya baytı tutulmaz; `media_assets` meta tutar.

## Dağıtım — açık karar noktaları

Aşağıdakiler **şimdi kesinleştirilmez**. Geri dönüşü pahalıdır ve hosting bilinmeden kilitlenemez.

| Karar | Adaylar | Ne zaman |
| --- | --- | --- |
| Uygulama barındırma | Vercel; Node destekli VPS/Docker; Railway/Render/Fly | Hosting seçilince. `output: 'standalone'` VPS için uygun; Vercel için varsayılan. |
| PostgreSQL sağlayıcısı | Managed Postgres (Neon, RDS, Cloud SQL, provider eklentisi) veya aynı VPS’te Postgres | Ağ, yedekleme ve bağlantı havuzu hosting ile birlikte. |
| Medya | S3, Cloudflare R2, sağlayıcı volume | Ephemeral dosya sistemi olan platformlarda yerel disk **üretimde kullanılmaz**. |
| E-posta | Resend, SMTP, sağlayıcı e-postası | İletişim formu bildirimi ve parola sıfırlama için; şimdilik arabirim. |
| Özel alan ve TLS | Hosting DNS | Yayın fazı. |

**Kilitlenen dağıtım kısıtı:** Node.js 20.9+ (hedef 24 LTS) süreç gerekir. PHP-only paylaşımlı hosting varsayılmaz.

Faz 10: `next.config.ts` `output: "standalone"` (Node süreci paketleme). Bu bir Vercel/VPS kilidi değildir. Medya hâlâ disk volume’una bağlıdır; nesne depolama yok. Ayrıntı: `docs/deployment.md`.

## SEO ve erişilebilirlik

- `generateMetadata` dil bazlı başlık/açıklama (CMS; uydurma istatistik yok).
- `sitemap.xml` yalnızca yayımlanmış public URL’ler.
- `hreflang` yalnızca o kaydın yayımlanmış dilleri.
- Semantik HTML, klavye odağı, görünür odak, etiketli formlar, yeterli kontrast, `alt` metinleri CMS’den.
- JSON-LD: Organization ve CreativeWork/Project yalnızca panelde girilmiş alanlarla; boş veya demo ise üretilmez.

## Güvenlik özeti

- CSRF: bütün yazmalar Server Action; Next origin kontrolü + `SameSite=Lax` `httpOnly` oturum çerezi.
- Rate limit: giriş (Faz 4, veritabanında); iletişim/proje talebi (Faz 6/7). Sağlayıcı WAF sonra.
- Yükleme: tür/boyut sınırı, rastgele depolama adı.
- Panel: HTTPS varsayımı üretimde (`Secure` çerez); `BETTER_AUTH_SECRET` zorunlu; güvenilir proxy varsa `AUTH_IP_HEADER`.
- XSS: zengin metin HTML olarak yorumlanmaz (`src/content/rich-text.tsx`).
- Demo seed üretim yayınına taşınmaz.

## Sürüm doğrulama kaynakları (14 Ekim 2026)

- `https://registry.npmjs.org/next/latest` → 16.4.1
- `https://registry.npmjs.org/react/latest` → 19.3.1
- `https://registry.npmjs.org/typescript/latest` → 7.0.2
- `https://registry.npmjs.org/drizzle-orm/latest` → 0.45.4
- `https://registry.npmjs.org/pg/latest` → 8.23.1
- `https://registry.npmjs.org/better-auth/latest` → 1.7.8
- `https://registry.npmjs.org/zod/latest` → 4.6.7
- `https://registry.npmjs.org/vitest/latest` → 5.0.4
- `https://registry.npmjs.org/tailwindcss/latest` → 4.3.3
- `https://registry.npmjs.org/@prisma/client/latest` → 7.10.0 (Prisma 7); `prisma` latest → 8.0.0-rc.22
- `https://nodejs.org/dist/index.json` → LTS 24.22.0 Krypton
- Next.js 16.4 duyurusu: `https://nextjs.org/blog/next-16-4`
- drizzle-kit 0.31.11: GitHub `drizzle-kit@0.31.11` (21 Eylül 2026); Better Auth akranı `>=0.31.4`
