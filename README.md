# NUMAN GROUPE

Uluslararası inşaat ve mühendislik sitesi: üç dilli public site (FR, EN, TR), yönetim paneli, PostgreSQL ve medya kütüphanesi. Ana dil Fransızcadır. Panel arayüzü Türkçedir.

Bu depo bir frontend demo değildir. Public içerik yalnızca yayımlanmış kayıtlardan okunur. Demo satırlar `isDemo` ile işaretlidir ve `SITE_ENV=production` iken asla gösterilmez.

**Hedef hosting sağlayıcısı kilitlenmemiştir.** Canlı dağıtım adımları için `docs/deployment.md` dosyasına bakın; sağlayıcı uydurulmaz.

## Gereksinimler (yerel)

- Node.js 20.9 veya üzeri (geliştirme Node 24 LTS ile doğrulanmıştır)
- npm (lockfile ile)
- Yerel PostgreSQL: `npm run db:local` (Docker gerekmez) **veya** `DATABASE_URL` ile erişilen başka bir PostgreSQL

Klasik PHP-only paylaşımlı hosting bu yığını çalıştırmaz.

## Yerel kurulum

1. Bağımlılıklar: `npm install`
2. `.env.example` dosyasını `.env.local` olarak kopyalayın. Gerçek sırları kaynak koda yazmayın.
3. `DATABASE_URL` ve `BETTER_AUTH_SECRET` doldurun. Gizli üretmek için:

   ```
   node -e "console.log(require('crypto').randomBytes(32).toString('base64url'))"
   ```

4. Ayrı bir terminalde: `npm run db:local` (gömülü PostgreSQL; açık kalır).
5. `npm run db:migrate`
6. `npm run db:seed`
7. İlk yönetici: `npm run admin:create` (parola ekrana yazılmaz)
8. İsteğe bağlı arayüz örnekleri: `npm run db:seed:demo` (üretimde reddedilir)
9. `npm run dev` → http://localhost:3000 (`/` kalıcı olarak `/fr` olur). Panel: http://localhost:3000/admin

Başka bir PostgreSQL kullanıyorsanız 4. adımı atlayın; yalnızca `DATABASE_URL` değişir. Ayrıntı: `docs/database.md`.

## Komutlar

| Komut | İş |
| --- | --- |
| `npm run dev` | Geliştirme sunucusu |
| `npm run build` | Üretim derlemesi + standalone kopyası (veritabanı gerekir) |
| `npm run start` | Standalone Node süreci (önce kök `.env.local`; `PORT`, `HOSTNAME`; `next start` kullanılmaz) |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript |
| `npm test` | Vitest (PGlite; harici veritabanı gerekmez) |
| `npm run db:local` | Yerel gömülü PostgreSQL |
| `npm run db:migrate` | Bekleyen SQL migration |
| `npm run db:seed` | Temel uzmanlıklar ve boş sayfa yuvaları |
| `npm run db:seed:demo` | Demo içerik (`isDemo`) |
| `npm run db:demo:clear` | Demo satır ve demo medya kayıtlarını siler |
| `npm run admin:create` | İlk yönetici |
| `npm run release:check-env` | Yayın değişkenlerini kontrol eder; sır yazdırmaz |

## Belgeler

- `docs/deployment.md` — gerçek dağıtım kısıtları ve eksik go-live bilgileri
- `docs/admin.md` — panel teknik ayrıntı
- `docs/admin-guide.md` — içerik yönetimi
- `docs/database.md` — şema, seed, demo politikası
- `docs/backup-restore.md` — veritabanı ve medya yedeği
- `docs/release-checklist.md` — yayın öncesi liste

## Güvenlik notu

`.env.local`, `.data/` ve yüklenen medya git dışıdır. Üretim sırlarını commit etmeyin.
