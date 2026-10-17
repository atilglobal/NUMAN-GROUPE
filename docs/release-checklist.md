# Yayın öncesi kontrol listesi

Hedef alan adı, TLS ve hosting hesabı **henüz yok**. Bu liste canlıya çıkmadan önce işaretlenir. `docs/deployment.md` sağlayıcı uydurmaz.

## Altyapı (operatör kararı bekleyenler)

- [ ] Node 20.9+ süreç + kalıcı `MEDIA_STORAGE_DIR` volume (ephemeral disk değil)
- [ ] Yönetilen veya yedeklenen PostgreSQL; `DATABASE_URL` build ve runtime’da erişilebilir
- [ ] HTTPS köken (`SITE_URL`, `BETTER_AUTH_URL`); HTTP public köken yok
- [ ] Ters vekil; `AUTH_IP_HEADER` vekilin yazdığı istemci IP başlığı
- [ ] Yedek: `pg_dump` veya sağlayıcı PITR + medya volume kopyası (`docs/backup-restore.md`)
- [ ] Sırlar host secret store’da; git’te yok
- [ ] `npm run release:check-env -- --strict` eksiksiz

## İlk kurulum (sunucuda, sırlar yüklüyken)

- [ ] `npm ci`
- [ ] `npm run db:migrate`
- [ ] `npm run db:seed` (firma uydurmaz)
- [ ] `npm run db:demo:clear` — demo satır yok
- [ ] `SITE_ENV=production` — `db:seed:demo` reddedilir
- [ ] İlk yönetici: Vercel Production `SETUP_KEY` + `/setup`, veya `npm run admin:create` — sonra `SETUP_KEY` / `ADMIN_PASSWORD` ortamdan silinir
- [ ] En az bir editör (isteğe bağlı) panelden, yönetici olmayan rolle
- [ ] `npm run build` ve süreç yöneticisi ile `next start` veya `node .next/standalone/server.js`

## İçerik (uydurma yok)

- [ ] Resmî logo ve favicon panelden
- [ ] İletişim: telefon / e-posta / adres yalnızca gerçekse
- [ ] Uzmanlık, proje, ziyaret, kadro: yayımlanacak diller dolu; taslak public’te yok
- [ ] Ana sayfa metinleri yayımlanmış veya sözlük varsayılanı kabul edilmiş
- [ ] Gizlilik ve yasal metinler **hukuk danışmanı** tarafından yazılmış ve üç dilde (veya yayımlanacak dillerde) yayımlanmış — yer tutucu “hazır” sayılmaz
- [ ] İletişim formu gizlilik onayının işaretlediği sayfa yayımlanmış

## Güvenlik ve günlük

- [ ] `BETTER_AUTH_SECRET` üretimde benzersiz
- [ ] Panel `/admin` robots ile `disallow`; çerez `Secure`
- [ ] Geliştirme hata overlay’i yok (`NODE_ENV=production`)
- [ ] Loglarda `DATABASE_URL`, parola, Resend anahtarı, talep mesajı yok
- [ ] Demo medya `/media/demo/...` 404

## Duman testi (gerçek içerikle, üretim sürecinde)

- [ ] Yeni proje panelden, üç dil, yayım → public detay
- [ ] Resmî ziyaret + galeri + üç dil
- [ ] Kadro üyesi
- [ ] Public iletişim formu → `/admin/talepler`
- [ ] Editör oturumu: `/admin/kullanicilar`, `/admin/ayarlar`, `/admin/talepler` yetkisiz
- [ ] `https://<alan>/sitemap.xml` dolu; `/admin` sitemap’te yok

## Bilerek yapılmayanlar

- Bu depodan canlı DNS / TLS / faturalı host’a yayın
- Demo veriyi üretimde “örnek portföy” olarak bırakmak
- Gizlilik yer tutucusunu yasal metin diye göstermek
