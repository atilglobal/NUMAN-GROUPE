# İçerik yönetimi

Panel adresi: `/admin` (dil öneki yok). Arayüz Türkçe; her kaydın metinleri FR, EN ve TR sekmelerinde ayrıdır. Eksik dil başka dilden doldurulmaz: o dilde yayımlanmamış kayıt o dilin public listesinde yoktur.

Teknik yetki ve oturum: `docs/admin.md`. Bu kılavuz editör ve yönetici işidir.

## Giriş

- Kayıt kapalıdır. Canlıda ilk yönetici `/setup` ile açılır (kurulum anahtarı + seçtiğiniz kullanıcı adı, e-posta ve parola). Yerelde `npm run admin:create` de kullanılabilir. Sonrakiler **Kullanıcılar** ekranından.
- Roller: **Yönetici** (her şey) ve **Editör** (içerik + medya). Editör talepler, kullanıcılar ve site ayarlarına giremez; menü gizlense de sunucu da reddeder.
- Oturum 12 saat. Çıkış ve parola değişikliği oturumları kapatır.

## Yayımlama kuralı

1. Kaydı oluşturun (FR taslak).
2. EN ve TR sekmelerini doldurun.
3. Dil başına **Yayımla**. Public site yalnızca `published` satırı gösterir.
4. Taslağı görmek için panel önizleme yolları (`/admin/onizleme/...`). Public 404 verir.
5. Slug değişince eski public adres 308 ile yeni sluga gider; silinen kayıt 404 olur.

Doğrulanmamış ülke, müşteri, sertifika, çalışan sayısı veya resmî ortaklık yazmayın. Resmî ziyaret ortaklık veya devlet desteği olarak sunulmaz.

## Ekranlar (editör)

| Ne | Nerede | Not |
| --- | --- | --- |
| Uzmanlık alanları | `/admin/uzmanliklar` | Başlangıçta dört yuva seed ile gelir; yenisi eklenebilir. |
| Projeler | `/admin/projeler` | Durum, ülke, tarihler, kapak, galeri, öne çıkarma, isteğe bağlı ilerleme yüzdesi. |
| Resmî ziyaretler | `/admin/ziyaretler` | Tarih, ülke, katılımcılar, kapak, galeri + dil bazında açıklama. Ana sayfada yalnızca öne çıkanlar. |
| Kadro | `/admin/kadro` | Gerçek kişiler; uydurma isim eklemeyin. Gizli kayıt public’te yok. |
| Kurumsal içerikler | `/admin/sayfalar` | Hakkımızda blokları, gizlilik, yasal (sabit anahtarlar). |
| Sayfalar | `/admin/icerik-sayfalari` | Yeni kurumsal sayfa, bloklar, dil bazında yayımlama. Adres: `/fr/p/...`. |
| Dil ve çeviri | `/admin/ceviriler` | Menü, düğme, form metinleri. Anahtarlar kilitli. |
| Menüler | `/admin/menuler` | Üst ve alt menü. |
| Ana sayfa | `/admin/ana-sayfa` | Dil bazında metin, hero görsel/video, bölüm sırası. Tam sayfa oluşturucu yok. |
| Medya | `/admin/medya` | JPEG/PNG/WebP/GIF, en fazla 6 Mo. SVG yok. Kullanımdaki dosya silinmez. Odak noktası kırpmayı yönlendirir. |

## Ekranlar (yalnız yönetici)

| Ne | Nerede |
| --- | --- |
| İletişim / proje talepleri | `/admin/talepler` |
| Kullanıcılar | `/admin/kullanicilar` |
| Site kimliği (logo, favicon, telefon, e-posta, adres, sosyal) | `/admin/ayarlar` |

Boş iletişim alanı public HTML’de bağlantı üretmez. Logo yoksa yer tutucu harf gösterilir; bu resmî logo değildir.

## Medya

Dosyalar uygulama paketinde değil; yerelde `MEDIA_STORAGE_DIR` volume’unda, Vercel’de S3 uyumlu nesne depoda (`MEDIA_S3_*`) durur. Kullanımdaki görsel silinince kapaklar boşalır; public URL bilinçli olarak kırılır. Demo görseller üretimde hem listeden hem `/media/demo/...` yolundan çıkar.

## İletişim formu

Public form kayıt olmadan çalışır. Başarı mesajı yalnızca veritabanına yazıldıktan sonra çıkar. E-posta bildirimi yapılandırılmamışsa talep yine listede görünür (`notify_status=skipped`). Panelde durum ve iç not public sitede yoktur. İşlem kaydına mesaj gövdesi kopyalanmaz.

## Gizlilik ve yasal metinler — yayıma hazır değil

`privacy` ve `legal` sayfa yuvaları seed ile boş gelir. Public’te yayımlanmış gövde yoksa sitede **hukuki belge yoktur** uyarısı çıkar. Sözlük yer tutucusu veya panel taslağı gizlilik politikası / mentions légales yerine **geçmez**.

Canlıya çıkmadan önce:

1. Hukuk danışmanı FR (ve yayımlanacak EN/TR) metinleri yazar.
2. Metinler `/admin/sayfalar` içinde kaydedilir ve yayımlanır.
3. İletişim formundaki onay kutusu bu yayımlanmış metne bağlanır.

Yayımlanmamış gizlilik sayfası ile formu açmak teknik olarak mümkündür; bu, yasal uyum anlamına gelmez.

## Demo içerik

`npm run db:seed:demo` üç dilde örnek projeler, ziyaretler, görev kartları, uzmanlık gövdeleri ve (yalnızca boşsa) kurumsal/ana sayfa metinleri ekler. Proje, ziyaret, kadro ve medya satırları `isDemo`dır. Metinler panelden FR/EN/TR sekmelerinde düzenlenir.

`SITE_ENV=production` iken public sorgular ve `/media/demo` kapalıdır; bu yüzden canlı site boş görünür. Sunum için Vercel’de `SITE_ENV=staging` ve `ALLOW_DEMO_CONTENT=true` kullanın (noindex açıktır). Veritabanına yazmak için, ortam hâlâ production ise geçici `ALLOW_DEMO_SEED=true` ile seed çalıştırıp değişkeni kaldırın.

Yayından önce: `npm run db:demo:clear` (yalnızca `is_demo` satırlar), `SITE_ENV=production`, `ALLOW_DEMO_CONTENT` kapalı. Site geneli noindex gerçek yayın için kapatılır (`SITE_ENV=production` ve demo kapalı).

## Çeviri kapsamı

Gösterge paneli dil başına `published | draft | missing` ve eksik alt metinleri listeler. Bir kaydı üç dilde yayımlamadan “site tamam” saymayın.
