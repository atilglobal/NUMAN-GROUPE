# Dağıtım

Kaynak tarihi: 16 Ekim 2026. Bu belge **kilitlenmiş bir hosting sağlayıcısı varsaymaz**. Mimari belgesinde (`architecture.md`) uygulama barındırma, Postgres sağlayıcısı, nesne depolama, e-posta ve TLS hâlâ açık karardır. Aşağıda önce doğrulanan gerçekler, sonra eksikler ve yalnızca uyumlu bir hedefin adımları vardır.

Canlıya dağıtım, açık bir yayın talimatı olmadan yapılmaz.

## Doğrulanan gerçekler

| Konu | Durum |
| --- | --- |
| Node.js çalışma yöntemi | Next.js 16.4.1 App Router, `next start` veya `output: "standalone"` ile **uzun ömürlü Node süreci**. `engines.node`: `>=20.9.0` (hedef 24 LTS). Statik export yok; Server Action, oturum ve `next/image` süreç ister. |
| Veritabanı | PostgreSQL + `DATABASE_URL` + `pg`. `next build` yayımlanmış içeriği okur; **build ortamının veritabanına ağ erişimi gerekir.** Yerel `npm run db:local` (`embedded-postgres`) **yalnızca geliştirmedir; üretimde kullanılmaz.** Sağlayıcı (Neon, RDS, aynı VPS, vs.) seçilmemiştir. |
| Kalıcı medya | Byte’lar `MEDIA_STORAGE_DIR` (varsayılan `.data/media`) içindedir; `GET /media/[...key]`. S3/R2 **uygulanmamıştır.** Geçici dosya sistemine yazılan yüklemeler dağıtımda kaybolur. |
| Domain ve HTTPS | `SITE_URL` / `BETTER_AUTH_URL` boş bırakılabilir (yerel). Kanonik bağlantı ve dolu sitemap için https köken gerekir. DNS kaydı, sertifika ve alan adı **yoktur.** Üretimde oturum çerezi `Secure` olur (`NODE_ENV=production`). |
| E-posta | İsteğe bağlı Resend (`RESEND_API_KEY`, `INQUIRY_NOTIFY_TO` / sitedeki iletişim e-postası, `INQUIRY_NOTIFY_FROM`). Yoksa talep yine kaydedilir; bildirim `skipped`. Parola sıfırlama e-postası yoktur (panel yönetici parolayı sıfırlar). Gönderen domain / SPF / DKIM **yoktur.** |
| Ortam değişkenleri | `.env.example`. Host secret store seçilmemiştir. `npm run release:check-env` adları listeler, değer yazdırmaz. |
| Yedekleme | Uygulama yedek almaz. `docs/backup-restore.md` `pg_dump` ve medya kopyası tarif eder. Yönetilen yedek planı sağlayıcıya bağlıdır ve henüz yoktur. |

Kilitlenen kısıt: **Node 20.9+ süreç.** PHP-only Apache/PHP paylaşımlı hosting uyumsuzdur.

## Uyumsuz veya henüz hazır olmayan ortamlar

Bu yığın **şu anda** şu hedeflerde “çalışır” diye kurulamaz:

1. **Yalnızca PHP/statik FTP hosting** — Node süreci yok.
2. **Ephemeral diskli serverless (ör. varsayılan Vercel dosya sistemi) nesne depolama olmadan** — yüklenen medya kalıcı değildir. S3 uyumlu `MediaStorage` henüz yok; Vercel’e “şimdi yayın” talimatı yazılmaz.
3. **Veritabanına erişemeyen build** — `next build` başarısız olur veya boş içerik üretir.
4. **`embedded-postgres` / `npm run db:local` üretimde** — geliştirme ikilisi; yedekleme ve yüksek erişilebilirlik yok.

Uygulanabilir çözüm (sağlayıcı adı kilitlenmeden): **kalıcı diskli bir Node süreci** (VPS, VM veya volume’lu konteyner) + **yönetilen veya aynı makinedeki PostgreSQL** + **ters vekil ile TLS** + **`MEDIA_STORAGE_DIR` volume**. Nesne depolama istenirse önce kodda S3 uyumlu depo uygulanmalı, sonra ephemeral platform değerlendirilmelidir.

## Uygulanabilir hedef: Node süreci + kalıcı disk + PostgreSQL

Aşağıdaki adımlar yalnızca bu sınıf için geçerlidir. Somut hostname, bölge veya faturalama bilgisi yoktur.

### 1. Altyapı

- Node.js 20.9+ (tercihen 24 LTS), süreç yöneticisi (systemd, vs.).
- PostgreSQL 16+ (yerel küme 18 ile geliştirildi; diyalekt `pg`).
- `MEDIA_STORAGE_DIR` için dağıtımlar arasında duran bir dizin/volume.
- 443 üzerinde TLS sonlandıran ters vekil (nginx, Caddy, yük dengeleyici). İstemci IP’si için `AUTH_IP_HEADER` (ör. `x-forwarded-for`) vekilin yazdığı başlık olmalıdır.

### 2. Ortam

Host secret store’a `.env.example` değişkenlerini koyun. Üretimde en az:

- `SITE_ENV=production`
- `SITE_URL=https://<gerçek-alan>` (henüz yok)
- `DATABASE_URL`
- `BETTER_AUTH_SECRET` (ortam başına ayrı, ≥ 32 karakter)
- `BETTER_AUTH_URL` (tarayıcıdaki panel kökeni)
- `MEDIA_STORAGE_DIR` (volume yolu)
- İsteğe bağlı Resend ve `AUTH_IP_HEADER`

`ALLOW_DEMO_CONTENT` üretimde açılmaz. `npm run release:check-env -- --strict` eksik adları verir.

### 3. İlk kurulum

Uygulama dizininde (sırlar yüklüyken):

```
npm ci
npm run db:migrate
npm run db:seed
npm run db:demo:clear
npm run admin:create
npm run build
```

- `db:seed` dört uzmanlık yuvası ve boş kurumsal sayfalar yazar; firma ülkesi/proje uydurmaz.
- `db:seed:demo` `SITE_ENV=production` iken reddedilir.
- `admin:create` bir yönetici varken çalışmaz. Parola loga yazılmaz.
- `next build` `output: "standalone"` üretir ve `scripts/prepare-standalone.ts` `public`, `.next/static` ve `content/demo` dosyalarını `.next/standalone` içine kopyalar. `next start` bu çıktıyla uyumlu değildir. `npm run start` proje kökündeki `.env.local` / süreç ortamını yükler, sonra `node .next/standalone/server.js` çalıştırır. Üretimde sırları `.env.local` dosyasına değil host secret store / süreç ortamına koyun.
- Standalone süreç çalışma dizinini `.next/standalone` yapar. `MEDIA_STORAGE_DIR` **mutlak** bir volume yolu olmalıdır; göreli `.data/media` yanlış dizine yazar.

```
set PORT=3000
set HOSTNAME=0.0.0.0
set MEDIA_STORAGE_DIR=C:\path\to\media-volume
npm run start
```

Ters vekil bu porta HTTP ile bağlanır; uygulama TLS sonlandırmaz.

### 4. Süreç notları

- Birden fazla Node süreci: her biri `DATABASE_POOL_MAX` bağlantı açar; Postgres `max_connections` buna göre.
- Medya volume her örnekte aynı yolu görmelidir (tek örnek veya paylaşılan NFS/blok depo). Aksi hâlde bir sürecin yüklediği dosya diğerinde 404 olur.
- Yayımlama `updateTag` ile public önbelleği yeniler; panel dışı SQL değişikliği en geç `cacheLife("hours")` sonra görünür.

### 5. Bu belgenin bilerek yazmadığı şeyler

- Vercel / Railway / Fly / Render tıklama listesi
- Neon / RDS konsol sihirbazı
- Cloudflare DNS kayıt değerleri
- Resend domain doğrulama sihirbazı (hesap yok)

Bunlar operatör kararıdır. Karar verilince bu belge somut hostname ve secret store adıyla güncellenir.

## Go-live’dan önce içerik

Üretimde demo gizlenir; `db:demo:clear` satırları da siler. Logo, iletişim, gizlilik ve yasal metinler panelden girilmeden public sitede boş/dürüst yer tutucu kalır. Gizlilik sayfası hukuki belge olarak sunulmaz (`docs/admin-guide.md`).
