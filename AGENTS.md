# NUMAN GROUPE — Agent ve geliştirme kuralları

Bu dosya, projedeki tüm ajanlar ve geliştiriciler için bağlayıcı çalışma kurallarıdır. Altyapı anlaşılmadan dosya değiştirilmez. Verilen fazın dışına çıkılmaz; bir sonraki faz kendi kendine başlatılmaz.

## Proje

NUMAN GROUPE uluslararası bir inşaat ve mühendislik firmasıdır. Üretilecek ürün, yalnızca tasarım veya frontend demo değildir. Public website, yönetim paneli, sunucu tarafı, veritabanı, medya yönetimi ve içerik yönetimi birlikte çalışmalıdır.

## Dil ve kimlik

- Ana dil: Fransızca.
- Ek diller: İngilizce ve Türkçe.
- Kimlik: uluslararası inşaat ve mühendislik firması.
- Uzmanlık alanları (başlangıç): stadyumlar, hastaneler, spor köyleri, lojmanlar. Bu alanlar yönetim panelinden artırılabilir olmalıdır.

## Kapsam (ürün)

- Tamamlanan ve yapım aşamasındaki projeler.
- Bakanlıklar ve cumhurbaşkanlıkları gibi kurumlara yapılan resmî ziyaretler.
- Yönetim ve ekip üyeleri.
- İletişim ve proje talebi formu.
- İçeriklerin yönetileceği güvenli yönetim paneli.

## Faz disiplini

1. Her fazdan önce kısa bir uygulama planı çıkar; sonra yalnızca o fazı uygula.
2. Her fazın sonunda şunları belirt: yapılanlar, çalıştırılan kontroller, kalan eksikler.
3. Bir sonraki fazı kendi kendine başlatma; yalnızca verilen fazı tamamla.
4. Her fazda projeyi çalışır durumda tut.
5. Bütün projeyi birden yazma.

## Gerçek işlevler

- Çalışmayan buton, sahte form başarı mesajı veya yalnızca frontend’de varmış gibi görünen yönetim işlevi bırakma.
- Kritik iş akışlarını anlamlı testlerle doğrula.
- Tekrarlanan işlevleri ortak bileşen ve servislerle çöz.
- Gereksiz bağımlılık ve aşırı mühendislik ekleme.

## İçerik doğruluğu

Firma hakkında ülke, proje, müşteri, sertifika, çalışan sayısı, tamamlanan iş sayısı veya resmî ortaklık **uydurma**.

Resmî ziyaretleri devlet desteği veya resmî ortaklık olarak **sunma**. Ziyaret, ziyaret olarak kalır.

Demo içerikleri açıkça işaretle ve üretim yayınına taşınmasını engelle.

## Güvenlik

Gizli anahtarları, parolaları ve kişisel verileri kaynak koduna koyma. Ortam değişkenleri ve sunucu tarafı sırlar kaynak kontrolünün dışında tutulur.

## Mevcut durum

- Mimari ve içerik planı: `docs/` (Faz 1).
- Uygulama: Next.js App Router + TypeScript + Tailwind CSS (sürümler `package.json` / lockfile'da; tahmin edilmez).
- Faz 2 tamamlandı: tasarım sistemi, çok dilli public ana sayfa, iç sayfalar için dürüst "hazırlanıyor" durumu.
- Faz 3 tamamlandı: PostgreSQL + Drizzle şeması ve migration (`src/db/schema/`, `drizzle/`), dil başına içerik ve yayımlama, etiketli public önbellek, seed/demo ayrımı. Kurulum ve komutlar: `docs/database.md`.
- Faz 4 tamamlandı: Better Auth ile e-posta/parola girişi (kayıt kapalı), veritabanı oturumları, giriş sınırı, roller (yönetici/editör), Türkçe panel (`src/app/admin/`), uzmanlık alanları için FR/EN/TR düzenleme + yayımlama, kullanıcılar, site ayarları, işlem kaydı, güvenli Markdown zengin metin. Ayrıntı: `docs/admin.md`.
- Panel kuralları: her sayfa `requireUser()`/`requirePermission()`, her Server Action `authorizeAction()` ile başlar (`src/auth/session.ts`); servisler `src/admin/*`, Server Action'lar `src/admin/actions/*`. `"use client"` dosyaları yalnızca bileşen ve hook dışa aktarır (testle denetlenir).
- İlk yönetici: `npm run admin:create`. `BETTER_AUTH_SECRET` zorunlu.
- Faz 5 tamamlandı: proje ve uzmanlık uçtan uca (panel CRUD, üç dil, yayımlama, kapak/galeri, SEO, önizleme; public liste/filtre/detay). Medya yükleme kayıt formlarından. Ayrıntı: `docs/admin.md`.
- Faz 6 tamamlandı: resmî ziyaretler uçtan uca (panel CRUD, katılımcılar, üç dil, yayımlama, kapak/galeri + açıklama, öne çıkarma; public liste ülke/yıl/sayfalama, detay, ilgili ziyaretler; ana sayfada yalnızca öne çıkanlar). Ayrıntı: `docs/admin.md`.
- Faz 7 tamamlandı: kadro, kurumsal içerikler, ana sayfa CMS ve site kimliği (logo/favicon/iletişim/sosyal, dil bazında SEO). Tam sayfa oluşturucu yok. Ayrıntı: `docs/admin.md`.
- Faz 8 tamamlandı: medya kütüphanesi (sniff, kalıcı depo `MEDIA_STORAGE_DIR`, kullanım takibi, kontrollü silme) ve iletişim/proje talebi (kayıt, kota, panel durumları/notlar, isteğe bağlı e-posta). Public form `submitInquiryAction` yetki denetimi olmadan çalışır; panel yazmaları `authorizeAction` ile. Ayrıntı: `docs/admin.md`.
- Faz 9 tamamlandı: dil bazında SEO (lang, title/description, canonical, yayımlanmış hreflang, Open Graph, sitemap, admin/taslak noindex, yapılandırılmış veri yalnızca yapılandırılmış alanlardan), slug 308, 404; hero önceliği ve mobilde poster; public önbellek panelle yenilenir; klavye/odak/kontrast. Ayrıntı: `docs/implementation-plan.md`.
- Faz 10 tamamlandı: yayın belgeleri (`README.md`, `.env.example`, `docs/deployment.md`, `docs/admin-guide.md`, `docs/backup-restore.md`, `docs/release-checklist.md`). Hosting sağlayıcısı kilitli değil; PHP-only ve nesne deposuz ephemeral disk uyumsuz yazıldı. `output: "standalone"`, demo medya üretimde 404, gizlilik/yasal yer tutucu hukuki belge değil. Canlı dağıtım yapılmadı.
- Dil/CMS/medya genişlemesi: UI overlay (`ui_string_overrides`, `/admin/ceviriler`), içerik sayfaları (`cms_*`, `/admin/icerik-sayfalari`, public `/[locale]/p/[slug]`), menüler, Sharp türevleri (`/media/v/...`, `src/media/profiles.ts`), kullanım bazında odak (`media_placements`). Mevcut sözlük ve `*_translations` korundu. Migration `0008_cms_i18n_media`.
- Henüz yok: hosting/DNS/TLS hesabı, nesne depolama sağlayıcısı, resmî logo dosyası (panelden yüklenebilir), hukuk danışmanı gizlilik/yasal metinleri.
- Public içerik yalnızca `src/content/service.ts` (önbellekli) → `src/content/queries.ts` üzerinden okunur. Yazma/yayımlama `src/content/publishing.ts` üzerinden yapılır. Demo kayıtlar `isDemo` ile işaretlidir; `SITE_ENV=production` iken asla gösterilmez (`src/content/demo-policy.ts`).
- `next dev` / `next build` için `DATABASE_URL` gerekir (yerelde `npm run db:local`); panel için `BETTER_AUTH_SECRET`.
- Kontroller: `npm run lint`, `npm run typecheck`, `npm test`, `npm run build`.
- Git deposu veya uzak depo henüz kurulmadı.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
