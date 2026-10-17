# Yönetim paneli ve kimlik doğrulama (Faz 4)

Panel `/admin` altındadır, arayüz dili Türkçedir; içerik alanları FR / EN / TR sekmelerinde düzenlenir. Panelin kendi kök layout'u vardır (`src/app/admin/layout.tsx`, `lang="tr"`, `noindex`).

## İlk yönetici

```bash
npm run db:migrate        # 0001_auth_and_roles dahil
npm run admin:create      # ad, e-posta ve gizli girilen parola sorulur
```

- Parola en az 8, en fazla 128 karakter. Ekrana veya loga yazılmaz. Giriş alanı e-posta veya kullanıcı adı kabul eder.
- Etkileşimsiz ortamda `ADMIN_NAME`, `ADMIN_EMAIL`, `ADMIN_PASSWORD` değişkenleri kullanılabilir; hesap oluşunca kaldırılmalıdır.
- Belirli bir girişi oluşturmak veya parolasını güncellemek: `npm run admin:ensure` (`ADMIN_EMAIL`, `ADMIN_PASSWORD`). Parola loga yazılmaz; derlemede çalışmaz.
- `admin:create` bir yönetici zaten varsa çalışmaz. Sonraki kullanıcılar panelden (Kullanıcılar) açılır. Herkese açık kayıt yoktur.
- `BETTER_AUTH_SECRET` (en az 32 karakter, ortam başına farklı) zorunludur; `.env.example` üretme komutunu gösterir.

## Roller

| Yetki | Yönetici | Editör |
| --- | --- | --- |
| İçerik (`content:write`) | ✓ | ✓ |
| Medya (`media:write`, Faz 5) | ✓ | ✓ |
| Talepler (`inquiries:read`) | ✓ | — |
| Kullanıcılar (`users:manage`) | ✓ | — |
| Site ayarları (`settings:manage`) | ✓ | — |
| Tüm işlem kayıtları (`audit:read`) | ✓ | — (yalnız içerik işlemleri) |

Kaynak: `src/auth/permissions.ts`. Kurallar: kişi kendi rolünü değiştiremez, kendini devre dışı bırakamaz; en az bir etkin yönetici kalır. Rol değişikliği, devre dışı bırakma ve parola sıfırlama o kullanıcının bütün oturumlarını kapatır.

## Yetkilendirme nerede yapılır

- **Her sayfa** `requireUser()` / `requirePermission()` çağırır (`src/auth/session.ts`): oturum yoksa `/admin/giris`, yetki yoksa `/admin/yetkisiz`.
- **Her Server Action** `authorizeAction(permission)` ile başlar; yetkisizse hiçbir şey çalıştırmadan hata döner. Bağlanmış argümanlar (kayıt kimliği, dil) tarayıcıdan geri geldiği için form alanı gibi yeniden doğrulanır.
- Kullanıcı satırı her istekte yeniden okunur: rol değişikliği ve devre dışı bırakma hemen geçerlidir.
- Menüde yetkisiz bağlantıların gizlenmesi yalnızca görünümdür; koruma değildir.
- `src/proxy.ts` yalnızca iyimser bir kontroldür: hiç oturum çerezi olmayan panel isteğini HTTP 307 ile girişe yollar. Geçerlilik ve yetki her zaman sunucuda kontrol edilir.
- Ayrı bir API ucu yoktur; Better Auth'un HTTP işleyicisi bağlanmadı. Giriş, çıkış, parola değişikliği Server Action'lardan `auth.api` ile yapılır.

## Oturum ve çerez

- Better Auth 1.7.8, e-posta/parola; Drizzle adaptörü; oturumlar veritabanında (`sessions`).
- Oturum ömrü 12 saat; çerez önbelleği kapalı, böylece oturum silinince erişim hemen biter.
- Çerez `httpOnly`, `SameSite=Lax`, üretimde `Secure` (`__Secure-` önekli).
- Çıkış oturum satırını siler ve çerezi temizler. Hesabım sayfasından diğer oturumlar kapatılabilir; parola değişikliği diğer oturumları kapatır.
- Devre dışı hesap yeni oturum açamaz (`databaseHooks.session.create.before`).

## CSRF

Kimlik doğrulama çerezle yapılır ve bütün yazma işlemleri Server Action'dır. Next.js, `Origin` başlığı sunucu adresiyle eşleşmeyen Server Action isteklerini çalıştırmadan reddeder (yerel testte başka origin'den gelen istek "Invalid Server Actions request" ile durduruldu). Çerez `SameSite=Lax` olduğu için başka siteden gönderilen POST isteğine eklenmez. Uygulama başka bir alan adından çağrılacaksa `serverActions.allowedOrigins` bilinçli olarak ayarlanmalıdır.

## Giriş denemesi sınırı

`src/auth/rate-limit.ts`, veritabanında (`auth_rate_limits`), çok süreçli dağıtımda da ortak:

- E-posta başına (SHA-256 ile anahtarlanır): 15 dakikada 5 başarısız deneme → 15 dakika engel.
- IP başına: 15 dakikada 20 başarısız deneme → 15 dakika engel. Yalnızca `AUTH_IP_HEADER` ayarlıysa; istemcinin gönderdiği başlıklara varsayılan olarak güvenilmez. Liste başlıklarında (`x-forwarded-for`) en sağdaki, yani en yakın proxy'nin eklediği değer kullanılır.
- Engel, var olmayan adresler için de aynı biçimde işler; sayaçlar hesabın varlığını açığa vurmaz.
- Better Auth'un kendi hız sınırı yalnızca HTTP işleyicisinde çalışır; bu yüzden uygulama katmanında ayrıca yapılır.

## Hata mesajları ve kayıtlar

- Yanlış parola, bilinmeyen adres ve devre dışı hesap aynı mesajı alır: "E-posta adresi veya parola hatalı."
- İşlem kaydı (`audit_logs`): giriş, başarısız giriş, engellenen giriş, çıkış, kullanıcı oluşturma/rol/durum/parola/oturum işlemleri, ayar değişikliği, içerik ekleme/değiştirme/yayımlama/yayından kaldırma/silme. Parola, oturum anahtarı, denenen e-posta adresi kaydedilmez; başarısız denemede kimlik yazılmaz.
- Better Auth logger yalnızca `error` seviyesinde; telemetri kapalı.

## Doğrulama ve XSS

- Bütün form girdileri sunucuda Zod ile doğrulanır (`src/admin/validation.ts`); hata mesajları alanın yanında Türkçe gösterilir, girilen değer kaybolmaz.
- Zengin metin (gövde alanları) güvenli bir Markdown alt kümesidir (`src/content/rich-text.tsx`): `##`/`###` başlık, `-` ve `1.` liste, `**kalın**`, `*italik*`, `[metin](https://…)`. React öğelerine dönüştürülür; HTML yorumlanmaz, yalnızca `https` bağlantılar oluşur (`rel="noopener noreferrer nofollow"`).

## Ekranlar

| Ekran | Yol | Yetki |
| --- | --- | --- |
| Giriş | `/admin/giris` | herkese açık (oturum varsa panele yönlendirir) |
| Gösterge paneli | `/admin` | tüm roller |
| Uzmanlık alanları | `/admin/uzmanliklar`, `/yeni`, `/[id]` | içerik |
| Uzmanlık önizleme | `/admin/onizleme/uzmanliklar/[id]?dil=` | içerik |
| Projeler | `/admin/projeler`, `/yeni`, `/[id]` | içerik |
| Proje önizleme | `/admin/onizleme/projeler/[id]?dil=` | içerik |
| Resmî ziyaretler | `/admin/ziyaretler`, `/yeni`, `/[id]` | içerik |
| Ziyaret önizleme | `/admin/onizleme/ziyaretler/[id]?dil=` | içerik |
| Kadro | `/admin/kadro`, `/yeni`, `/[id]` | içerik |
| Kurumsal içerikler | `/admin/sayfalar`, `/[id]` | içerik |
| Ana sayfa | `/admin/ana-sayfa` | içerik |
| Medya kütüphanesi | `/admin/medya`, `/[id]` | medya |
| Talepler | `/admin/talepler`, `/[id]` | yönetici |
| Kullanıcılar | `/admin/kullanicilar` | yönetici |
| Site ayarları | `/admin/ayarlar` | yönetici |
| Hesabım | `/admin/hesap` | tüm roller |
| Yetkisiz erişim | `/admin/yetkisiz` | tüm roller |

Gösterge paneli: içerik sayıları, taslaklar ve eksik çeviriler, son işlemler, yöneticiye yeni talepler. Silme, devre dışı bırakma, rol ve parola değişikliği, oturum kapatma açık bir onay penceresinden (yerel `<dialog>`) geçer.

Proje, uzmanlık, resmî ziyaret, kadro, kurumsal sayfa, ana sayfa, medya kütüphanesi ve talep düzenleyicileri eklendi. Görsel yükleme kayıt formlarından ve `/admin/medya` üzerinden yapılır.

## Projeler ve uzmanlık alanları (Faz 5)

- Liste: arama, durum/uzmanlık filtresi (projeler), sayfalama.
- Kayıt: FR taslak oluşturma, EN/TR ekleme, dil bazında yayımlama, silme (onay penceresi).
- Proje kök alanları: inşaat durumu, uzmanlık (isteğe bağlı), ülke, tarihler, video (yalnızca https), öne çıkarma, sıra, isteğe bağlı ilerleme yüzdesi (0–100; tarihlerden üretilmez), kapak ve sıralı galeri.
- Uzmanlık silinince bağlı projeler durur; `expertise_id` boşaltılır (`ON DELETE SET NULL`). Proje silinmez.
- Taslak önizleme yalnızca panel oturumu ve `content:write` ile `/admin/onizleme/...` altında. Public `findDetail` taslak ve yayımlanmamış slug için 404 döner.
- Medya: JPEG/PNG/WebP/GIF, en fazla 6 Mo. Tür sihirli baytlardan okunur (uzantıya güvenilmez); SVG ve çalıştırılabilirler reddedilir. Byte'lar `MEDIA_STORAGE_DIR` (varsayılan `.data/media`) içine rastgele adla yazılır ve `GET /media/[...key]` ile sunulur. Public uygulama dizini kalıcı depo değildir. Alt metin dil başına; bir dilde alt yoksa o dilde görsel gösterilmez. Ziyaret galerisinde dil başına isteğe bağlı açıklama (`caption`) vardır.

## Resmî ziyaretler (Faz 6)

- Liste: arama, yıl filtresi, sayfalama. Kayıt: FR taslak, EN/TR, dil bazında yayımlama, silme (onay).
- Kök alanlar: tarih, ülke, öne çıkarma (ana sayfa), kapak, sıralı galeri, katılımcılar (ad dil bağımsız; unvan dil başına).
- Çeviri: başlık, slug, kurum, şehir, özet (amaç), gövde, SEO.
- Public liste: `visitedOn` azalan; ülke ve yıl filtreleri; sayfalama. Detay: konum, kurum, katılımcılar, galeri açıklamaları, aynı ülkedeki diğer ziyaretler.
- Ana sayfa yalnızca `isFeatured` ve yayımlanmış ziyaretleri gösterir; doldurma yapılmaz.
- Metin ve görseller ziyareti ortaklık, devlet desteği veya ihale olarak sunmaz. Demo görseller boş salon / genel bina illüstrasyonudur; `isDemo` üretimde gizlenir.
- Eski FR/EN yollar (`/visites-officielles`, `/official-visits`) kanonik bölüme 301 yönlendirilir.

## Kadro, kurumsal içerikler ve ana sayfa (Faz 7)

- Kadro: ad soyad, üç dilde unvan ve biyografi, fotoğraf, sıra, görünürlük, isteğe bağlı https profil bağlantısı. Uydurma kişi eklenmez; public sitede yayımlanmamış veya gizlenmiş kayıt yoktur.
- Public kadro: sabit 3/4 portre; fotoğraf yoksa baş harfli yer tutucu. Biyografi `details` alanında açılır.
- Kurumsal bloklar sabit sayfa anahtarlarıdır (`about`, `mission`, `approach`, `quality`, `certificates` ve yasal sayfalar). Hakkımızda sayfası yayımlanmış blokları sırayla birleştirir. Sertifika metni yoksa blok gösterilmez; sözlükten sertifika uydurulmaz.
- Ana sayfa: dil başına hero/tanıtım/CTA/footer/SEO metinleri (`site_setting_translations`, yayımlanınca sözlüğün yerine geçer). Hero görseli veya doğrudan https video. Bölüm sırası ve görünürlüğü JSON düzenidir; sürükle-bırak sayfa oluşturucu yoktur. Ana sayfadaki projeler ve ziyaretler `isFeatured` işaretinden gelir.
- Site ayarları: logo, favicon, telefon, e-posta, adres, WhatsApp, sosyal bağlantılar. Boş alan public HTML'de bağlantı üretmez. WhatsApp yalnızca dolu numarada `wa.me` olur.

## Medya kütüphanesi ve talepler (Faz 8)

- Dil ve çeviri (`/admin/ceviriler`): geliştirici tanımlı arayüz anahtarları. Değerler panelde FR/EN/TR değiştirilir; anahtar silinmez. Kayıt yoksa JSON sözlük varsayılandır. `{page}` gibi yer tutucular korunur.
- İçerik sayfaları (`/admin/icerik-sayfalari`): tek kök + dil çevirileri, kontrollü bloklar, `/[locale]/p/[slug]`. Taslak önizleme `/admin/onizleme/icerik-sayfalari/[id]`.
- Menüler (`/admin/menuler`): üst ve alt; dahili öğeler bölüm veya sayfa kimliğine bağlıdır.
- Kütüphane: arama, önizleme, üç dilde alt/açıklama, kullanım listesi, kullanım bazında odak noktası. Kullanımdaki dosya silinemez.
- Türetilmiş görseller `GET /media/v/...` (Sharp); orijinal `MEDIA_STORAGE_DIR` içinde kalır. Profiller `src/media/profiles.ts`.
- Public görseller `next/image` ile optimize edilir (`images.localPatterns`: `/media/**`).
- İletişim formu: ad, kurum, e-posta, isteğe bağlı telefon, ülke, proje türü, mesaj, gönderim dili, gizlilik onayı, isteğe bağlı yeniden iletişim. Sunucu doğrulaması, honeypot, e-posta/IP kotası (15 dk), `idempotency_key` ile yinelenen gönderim. Başarı mesajı yalnızca INSERT veya aynı anahtarın tekrarı sonrası.
- Panel durumları: yeni / inceleniyor / yanıtlandı / arşivlendi. İç notlar public sitede yoktur. İşlem kaydına mesaj veya e-posta kopyalanmaz.
- E-posta bildirimi `RESEND_API_KEY` + `INQUIRY_NOTIFY_TO` (veya sitedeki iletişim e-postası) varsa Resend ile gider; hata `notify_status=failed` yazar, kaydı silmez.
- Public `submitInquiryAction` oturum gerektirmez. Panel talep yazmaları `inquiries:read` + `authorizeAction`.
