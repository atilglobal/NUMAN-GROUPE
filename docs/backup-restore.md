# Yedekleme ve geri yükleme

Uygulama otomatik yedek almaz. Yönetilen Postgres yedekleri (PITR, anlık görüntü) sağlayıcı seçilince operatör tarafından açılır; şu an sağlayıcı yoktur.

İki parça birlikte yedeklenir: **PostgreSQL** (içerik, oturumlar, talepler, medya meta) ve **`MEDIA_STORAGE_DIR`** (dosya baytları). Yalnızca veritabanı geri yüklenirse kapak URL’leri 404 olur. Yalnızca disk geri yüklenirse kayıtsız dosyalar kütüphanede görünmez.

Aşağıdaki komutlar standart PostgreSQL istemcisi varsayar. Host, kullanıcı ve yollar örnektir; gerçek değerler `DATABASE_URL` ve `MEDIA_STORAGE_DIR` ile değiştirilir. Parolayı komut satırında bırakmayın (`PGPASSWORD` veya `.pgpass`).

## Veritabanı yedeği

Özel biçim (`custom`), sıkıştırılmış:

```
pg_dump --format=custom --no-owner --no-acl --file=numan-$(date +%Y%m%d).dump "$DATABASE_URL"
```

Windows PowerShell’de tarih biçimini kendiniz adlandırın. Döküm dosyası sır içerir (içerik ve kişisel talepler); şifreli depoda tutulur.

Düz SQL istenirse `--format=plain`. Büyük kümede custom + `pg_restore` tercih edilir.

## Medya yedeği

Volume’u dosya olarak kopyalayın (uygulama dururken veya tutarlı anlık görüntü ile):

```
tar -C "$MEDIA_STORAGE_DIR" -czf numan-media-$(date +%Y%m%d).tgz .
```

Varsayılan yerel yol `.data/media`. `content/demo` kaynakta duran illüstrasyondur; üretim yedeğine gerekmez ve `SITE_ENV=production` iken sunulmaz.

## Geri yükleme (aynı veya yeni boş küme)

1. Node sürecini durdurun (yazma olmasın).
2. Hedef veritabanını oluşturun (boş).
3. Dökümü yükleyin:

   ```
   pg_restore --clean --if-exists --no-owner --no-acl --dbname="$DATABASE_URL" numan-YYYYMMDD.dump
   ```

   Döküm şema + veriyi içeriyorsa **`npm run db:migrate` çalıştırmayın** (nesneler zaten vardır). Döküm yalnızca veri ise önce `npm run db:migrate`, sonra veri yükleyin.

4. Medya arşivini `MEDIA_STORAGE_DIR` içine açın. Sahiplik, Node sürecinin okuyup yazacağı kullanıcıya ait olmalıdır.
5. `BETTER_AUTH_SECRET` yedek alınan ortamla **aynı değilse** mevcut oturum çerezleri doğrulanmaz; kullanıcılar yeniden giriş yapar. Parola karmaları Better Auth scrypt ile veritabanındadır; secret değişince hesaplar silinmez.
6. Uygulamayı başlatın. Panel dışı SQL gibi, geri yükleme `updateTag` tetiklemez; gerekirse süreci yeniden başlatın veya `next build` alın.

## Geri alma (kötü bir yayından sonra)

- **İçerik:** önceki `pg_dump` + medya tarball ile yukarıdaki geri yükleme.
- **Yalnızca bir kayıt:** panelden taslağa alma veya silme; tüm kümeyi geri sarmayın.
- **Migration sonrası:** uygulanmış SQL dosyası düzenlenmez. Geri alma, migration öncesi döküme dönüş veya yeni ileri migration ile yapılır. `drizzle/` geçmişi dökümle birlikte saklayın.

## Talepler ve kişisel veri

`inquiries` tablosu ad, e-posta, mesaj içerir. Yedekler kişisel veridir; erişim yönetici ile sınırlı tutulur. Yedeği uygulama loguna veya sohbet dökümüne yapıştırmayın.

## Yerel geliştirme kümesi

`.data/postgres` gömülü geliştirme verisidir; üretim yedeği değildir. Üretime `.data` kopyalamayın.
