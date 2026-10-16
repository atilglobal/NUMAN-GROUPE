# Uygulama planı

Faz disiplini: her fazdan önce kısa plan, yalnızca o faz, sonunda yapılanlar / kontroller / eksikler. Sonraki faz kendiliğinden başlamaz. Her fazda depo derlenir veya belgeler tutarlı kalır.

## Faz 0 — Kurallar (tamamlandı)

`AGENTS.md`. Klasör yeşil alandı.

## Faz 1 — Mimari ve içerik planı (tamamlandı)

Çıktılar:

- `docs/architecture.md`
- `docs/sitemap.md`
- `docs/content-model.md`
- `docs/implementation-plan.md`

Kod iskelesi yok. Bağımlılık kurulumu yok.

## Faz 2 — Tasarım sistemi ve public ana sayfa (tamamlandı)

Kullanıcı Faz 2'yi "iskele" yerine "tasarım sistemi + ana sayfanın ilk sürümü" olarak yeniden tanımladı. İskele bu fazın içinde kuruldu.

- `create-next-app@16.4.1` iskelesi kök dizine taşındı; sürüm sapmaları `architecture.md` içinde.
- `/` → `/fr` kalıcı yönlendirme (`next.config.ts`); kök layout `app/[locale]/layout.tsx`, geçersiz dil 404.
- Tasarım belirteçleri (`globals.css` `@theme`), ortak bileşenler (`components/ui`, `cards`, `layout`, `forms`).
- Ana sayfanın 10 bölümü; tüm görünür metin `i18n/dictionaries/{fr,en,tr}.json` üzerinden.
- İçerik yalnızca `content/service.ts` üzerinden okunur; şimdilik kod içi seed. Demo kayıtlar `isDemo` ile işaretli, `content/demo-policy.ts` kuralına bağlı.
- İç sayfalar (`[section]`, `[section]/[slug]`) dürüst "En préparation" durumu, `noindex`.
- `.env.example`: `SITE_ENV`, `ALLOW_DEMO_CONTENT`, `SITE_URL`. Veritabanı/kimlik değişkenleri ilgili fazda eklenecek.
- Testler (Vitest): rota çözümü/çevirisi, sözlük anahtar eşliği, demo politikası, demo kapalıyken içerik süzgeci.
- Bilinen kısıt: önceden üretilmemiş bilinmeyen bir adrese ilk istek, Partial Prerender akışı nedeniyle 200 ile başlar (gövde 404 arayüzü + `noindex`); sonraki istekler 404 döner. Gerçek veri fazında yeniden ele alınacak.

Demo politikası: `SITE_ENV=production` → demo her zaman kapalı. Aksi hâlde `ALLOW_DEMO_CONTENT=true|false` belirleyicidir; tanımsızsa `next dev` açık, üretim derlemesi kapalı.

## Faz 3 — Veritabanı ve çok dilli içerik altyapısı (tamamlandı)

Ayrıntı: `database.md`; şema sapmaları: `content-model.md` sonu.

- Drizzle şeması (21 tablo) ve ilk SQL migration; slug benzersizliği/biçimi, yayın tarihi, tarih sırası, ülke kodu, HTTPS URL kontrolleri veritabanında.
- Yerel PostgreSQL: `npm run db:local` (gömülü, Docker gerekmez). Uygulama yalnızca `DATABASE_URL` bilir; sağlayıcı kilitlenmedi.
- Public okumalar veritabanından, etiketli önbellekle (`content/service.ts` → `content/queries.ts`). Dil fallback'i yok; alternatif bağlantılar yalnızca yayımlanmış dillere.
- Dil bazlı yayımlama servisi + işlem kaydı + önbellek yenileme (`content/publishing.ts`); çeviri kapsamı raporu (`content/coverage.ts`). Faz 4'ten itibaren panel Server Action'larından çağrılır.
- Temel seed ile demo seed ayrıldı; demo seed demo kapalı ortamda reddedilir; `db:demo:clear` tüm demo satırlarını siler.
- Detay ve kurumsal sayfalar yayımlanmış metni gösterir, yoksa "En préparation"; `sitemap.xml` yalnızca yayımlanmış dil sürümleri.
- Proje/ziyaret detayları kapak, galeri ve verilen bilgileri gösterir: uzmanlık, durum, şehir/ülke, tarihler, video bağlantısı, teknik bilgiler, katılımcılar ve unvanları. Boş alan, boş teknik satır, o dilde alt metni olmayan görsel ve o dilde verilmemiş unvan gösterilmez. Proje, uzmanlık ve ziyaret listeleri eklendi; kadro listesi sonraki faza kaldı.
- Plandan farklı: UI sözlüğü veritabanına taşınmadı (Faz 3 talimatı). `MediaStorage` yükleme arabirimi Faz 5'e kaldı; şimdilik yalnızca `mediaUrl()` (okuma).
- Testler: PGlite üzerinde gerçek migration ile kısıtlar, sorgular, yayımlama, kapsam, seed ayrımı.

## Faz 4 — Kimlik ve panel kabuğu (tamamlandı)

Ayrıntı: `admin.md`.

- Better Auth 1.7.8 e-posta/parola, veritabanı oturumları (12 saat), `httpOnly` + `SameSite=Lax` + üretimde `Secure` çerez. Kayıt kapalı. Migration `0001_auth_and_roles`.
- Giriş/çıkış/parola değişikliği Server Action'larla; CSRF: Server Action origin kontrolü + SameSite çerez. Better Auth HTTP ucu bağlanmadı.
- Veritabanı tabanlı giriş sınırı (e-posta ve isteğe bağlı güvenilir IP başlığı); kullanıcı varlığını açığa vurmayan tek hata mesajı.
- Roller: yönetici, editör. Yetki her sayfada ve her Server Action'da sunucuda kontrol edilir; `proxy.ts` yalnızca çerezsiz isteği 307 ile girişe yollar.
- Türkçe panel: sidebar + üst bar + mobil menü; gösterge paneli (sayılar, taslak/eksik çeviri, son işlemler, yöneticiye yeni talepler); yükleniyor/hata/boş durumları; onay pencereleri.
- Gerçek CRUD ile ilk içerik ekranı: uzmanlık alanları (FR/EN/TR sekmeleri, dil başına kaydet/yayımla, silme onayı). Kullanıcılar, site ayarları, Hesabım.
- İşlem kaydı: içerik ekleme/değiştirme/yayımlama/silme, kullanıcı ve ayar işlemleri, giriş/çıkış.
- Güvenli Markdown alt kümesi ile zengin metin (HTML yok, yalnız https bağlantı); public sayfalar da bunu kullanır.
- İlk yönetici: `npm run admin:create` (gizli parola girişi veya env); yönetici varsa reddeder.
- Plandan farklı: panel dili Fransızca değil Türkçe (Faz 4 talimatı); yollar Türkçe (`/admin/giris`, `/admin/uzmanliklar` …); `viewer` rolü yok; editör talepleri görmez (talep ekranı Faz 7).
- Testler: giriş başarı/başarısızlık aynı mesaj, devre dışı hesap, sınır ve engelin bitişi, çerez nitelikleri, çıkış, sahte çerez, kayıt kapalı, rol kuralları, uzmanlık servisi + işlem kaydı, doğrulama, XSS, istemci modülü dışa aktarım kuralı.

## Faz 5 — Projeler, uzmanlıklar ve medya yazma (tamamlandı)

Kullanıcı bu fazı proje + uzmanlık uçtan uca (panel + public) olarak daralttı. Ziyaret, kadro, kurumsal sayfa düzenleyicileri sonraki faza kaldı.

- Medya yükleme (JPEG/PNG/WebP/GIF, 6 Mo, dil başına alt, `public/media/uploads/`). Ayrı medya kütüphanesi ekranı ve dosya silme yok; kapak/galeri seçimi kayıt formunda.
- Uzmanlık ve proje CRUD, FR/EN/TR, taslak + dil bazında yayımlama, SEO, kapak, proje galeri sırası, öne çıkarma, panel liste/arama/filtre/sayfalama.
- Public proje listesi: durum / uzmanlık slug / ülke filtreleri URL’de, paylaşılabilir bağlantı, sayfalama, boş durum. Detay: konum, durum, kapak, açıklama, teknik bilgiler, tarihler, galeri, ilgili projeler, proje talebi CTA (iletişim sayfasına). İlerleme yüzdesi yalnızca panelde girilmişse.
- Public uzmanlık listesi ve detayı: tanıtım, kapsam metni, ilgili projeler, iletişim CTA. Panelden yayımlanan yeni uzmanlık otomatik listelenir.
- Yetkili taslak önizleme `/admin/onizleme/...`; public sorgular taslağı göstermez.
- Silme: uzmanlık → projelerde `expertise_id` null; proje silinmez. Proje silinince çeviriler ve galeri cascade.
- Testler: public filtre/URL, taslak 404 vs önizleme, ilerleme uydurulmaz, uzmanlık silince proje kalır, galeri sırası, doğrulama.
- Ayrıntı: `admin.md` (Faz 5 bölümü).

## Faz 6 — Resmî ziyaretler (tamamlandı)

Kullanıcı bu fazı ziyaret modülü uçtan uca (panel + public + ana sayfa) olarak daralttı. Kadro, kurumsal sayfa ve form backend sonraki faza kaldı.

- Panel CRUD: tarih, kurum, ülke, şehir, katılımcılar; FR/EN/TR başlık/özet/detay; kapak ve galeri; fotoğraf açıklaması ve alt metin; öne çıkarma; dil bazında yayın.
- Public liste: yeni tarihten eskiye, ülke/yıl filtreleri, sayfalama. Detay: amaç, açıklama, galeri açıklamaları, aynı ülkedeki ilgili ziyaretler.
- Ana sayfa yalnızca panelde işaretlenen (`isFeatured`) yayımlanmış ziyaretler.
- Bölüm adları: Visites institutionnelles / Institutional Visits / Resmî Ziyaretler. Eski FR/EN URL 301.
- Propaganda ve sahte devlet başkanı görseli yok; demo illüstrasyon veya boş durum.
- Ayrıntı: `admin.md` (Faz 6 bölümü).

## Faz 7 — Kadro, kurumsal içerikler, ana sayfa (tamamlandı)

Kullanıcı bu fazı kadro + kurumsal sayfalar + ana sayfa CMS + site kimliği olarak daralttı. Tam sayfa oluşturucu yok; sabit bloklarda kontrollü içerik. Form backend ve sertleştirme sonraki faza kaldı.

- Panel: kadro CRUD; kurumsal sayfa metinleri; ana sayfa görsel/video, kopya, bölüm sırası/görünürlük; logo/favicon/iletişim/sosyal.
- Public: kadro listesi, hakkımızda blokları, yönetilen ana sayfa, chrome (boş bağlantı yok).
- Ayrıntı: `admin.md` (Faz 7 bölümü).

## Faz 8 — Medya kütüphanesi ve iletişim akışı (tamamlandı)

- Medya: sniff (JPEG/PNG/WebP/GIF), SVG/çalıştırılabilir reddi, rastgele ad, boyut/önizleme, FR/EN/TR alt+açıklama, kullanım takibi, kontrollü silme, `next/image`, kalıcı `MEDIA_STORAGE_DIR`.
- Form: sunucu doğrulama, kota, honeypot, idempotency, DB kayıt, panel durumları + iç not, isteğe bağlı e-posta (hata kaydı silmez), başarı yalnızca gerçek kayıtta.
- Ayrıntı: `admin.md` (Faz 8 bölümü). Erişilebilirlik taraması ve hosting kilidi Faz 9.

## Faz 9 — SEO, performans ve erişilebilirlik (tamamlandı)

- SEO: `lang`, dil bazında title/description, canonical, yalnızca yayımlanmış hreflang, Open Graph, `/sitemap.xml` (listeler + yayımlanmış detay/kurumsal), `/robots.txt` (`/admin` disallow), demo ve panel `noindex`, JSON-LD yalnızca yapılandırılmış chrome alanlarından.
- Slug değişince eski public URL 308; silinen/yayımlanmamış 404. Taslak `findDetail` public’te yok.
- Performans: hero `preload` + yüksek öncelik; alt görseller tembel; responsive `sizes`; mobilde ve `prefers-reduced-motion` iken video yerine poster; font `display: swap`; public `use cache` + panel `updateTag`.
- A11y: h1/h2 sırası, atla bağlantısı, form etiketleri, mobil menü odak döngüsü, native dialog, kontrast (eyebrow/dil seçici), hareket azaltma.
- Go-live kararları (hosting, DNS, e-posta, nesne depolama) hâlâ açık; bu faz onları kilitlemez.

## Faz 10 — Yayına hazırlık (tamamlandı)

Hedef sağlayıcı doğrulanamadı (karar yok). Belgeler uyumsuz ortamı “çalışır” diye tarif etmez. Teslim: README, `.env.example`, deployment, admin-guide, backup-restore, release-checklist. Üretim: `SITE_ENV=production` demo satır + `/media/demo` kapalı, standalone Node çıktısı, gizlilik/yasal boş durum hukuki belge değil, loglarda sır yok. Canlı dağıtım yok.

## Kritik testler (fazlara yayılır)

1. Locale yönlendirme ve kök → `/fr`.
2. Taslak çeviri public 404.
3. Dil değiştirici eş kayıt / yoksa liste.
4. Form: geçersiz gönderim kayıt yazmaz; geçerli INSERT.
5. Authz matrisı.
6. Demo üretimde gizlenir.
7. Medya silinince public URL kırılır (kasıtlı) veya bağ kopar; hayalet kart yok.

## Bilinçli olarak sonraya bırakılanlar

- Hosting sağlayıcısı, managed Postgres, nesne depolama, e-posta, özel alan.
- Çok faktörlü kimlik, SSO.
- Tam metin arama motoru (Postgres yeterli).
- Çoklu bölge CDN politikası.
- Mobil native uygulama.

## Faz 1 başarı ölçütü

Dört belge var, sürümler kaynaklı, hosting açık karar, PHP hosting reddi yazılı, uydurma içerik modeli yok. Uygulama henüz çalışmaz; bu fazın teslimi belgedir.
