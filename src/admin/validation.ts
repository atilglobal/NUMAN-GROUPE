import { z } from "zod";
import { PASSWORD_MAX_LENGTH, PASSWORD_MIN_LENGTH } from "../auth/config";
import { HOME_SECTION_KEYS } from "../content/home-layout";
import { locales } from "../i18n/config";
import { SLUG_PATTERN } from "../db/schema";

/*
 * Server-side validation for every panel form. Messages are Turkish and
 * shown next to the field.
 */

const trimmed = (max: number, label: string) =>
  z
    .string()
    .trim()
    .max(max, `${label} en fazla ${max} karakter olabilir.`);

const required = (max: number, label: string) => trimmed(max, label).min(1, `${label} zorunludur.`);

/** Empty input becomes null so optional text is stored as "not provided". */
const optional = (max: number, label: string) =>
  trimmed(max, label).transform((value) => (value === "" ? null : value));

const USERNAME_PATTERN = /^[a-z][a-z0-9._-]{2,31}$/;

export const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .max(254, "E-posta adresi çok uzun.")
  .refine((value) => value.includes("@") ? z.email().safeParse(value).success : USERNAME_PATTERN.test(value), {
    message: "Geçerli bir e-posta veya kullanıcı adı girin.",
  });

export const passwordSchema = z
  .string()
  .min(PASSWORD_MIN_LENGTH, `Parola en az ${PASSWORD_MIN_LENGTH} karakter olmalıdır.`)
  .max(PASSWORD_MAX_LENGTH, `Parola en fazla ${PASSWORD_MAX_LENGTH} karakter olabilir.`);

export const signInSchema = z.object({
  email: z.string().trim().toLowerCase().max(254),
  password: z.string().max(PASSWORD_MAX_LENGTH),
});

export const roleSchema = z.enum(["admin", "editor"], "Geçersiz rol.");
export const localeSchema = z.enum(locales, "Geçersiz dil.");
export const idSchema = z.uuid("Geçersiz kayıt.");
export const userIdSchema = z.string().min(1).max(100);

export const createUserSchema = z.object({
  name: required(120, "Ad soyad"),
  email: emailSchema,
  role: roleSchema,
  password: passwordSchema,
});

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Mevcut parolanızı girin.").max(PASSWORD_MAX_LENGTH),
    newPassword: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((value) => value.newPassword === value.confirmPassword, {
    path: ["confirmPassword"],
    message: "Parolalar eşleşmiyor.",
  });

export const sortOrderSchema = z.coerce
  .number("Sıra bir sayı olmalıdır.")
  .int("Sıra tam sayı olmalıdır.")
  .min(0, "Sıra 0 veya daha büyük olmalıdır.")
  .max(100000, "Sıra çok büyük.");

export const slugSchema = z
  .string()
  .trim()
  .toLowerCase()
  .min(1, "Bağlantı adı zorunludur.")
  .max(160, "Bağlantı adı en fazla 160 karakter olabilir.")
  .regex(
    new RegExp(SLUG_PATTERN),
    "Yalnızca küçük harf (a-z), rakam ve tire kullanın; örnek: stade-national.",
  );

export const seoTitleSchema = optional(70, "SEO başlığı");
export const seoDescriptionSchema = optional(200, "SEO açıklaması");

export const expertiseTranslationSchema = z.object({
  name: required(160, "Ad"),
  slug: slugSchema,
  summary: optional(500, "Kısa açıklama"),
  body: optional(20000, "Ayrıntılı içerik"),
  seoTitle: seoTitleSchema,
  seoDescription: seoDescriptionSchema,
});

export type ExpertiseTranslationInput = z.infer<typeof expertiseTranslationSchema>;

export const featuredSchema = z
  .union([z.literal("on"), z.literal("true"), z.literal("false")])
  .optional()
  .transform((value) => value === "on" || value === "true");

export const projectStatusSchema = z.enum(["in_progress", "completed"], "Geçersiz proje durumu.");

export const countryCodeSchema = z
  .string()
  .trim()
  .transform((value) => (value === "" ? null : value.toUpperCase()))
  .pipe(z.union([z.null(), z.string().regex(/^[A-Z]{2}$/, "Ülke kodu iki harf olmalıdır (ISO 3166-1).")]));

export const dateSchema = z
  .string()
  .trim()
  .transform((value) => (value === "" ? null : value))
  .pipe(z.union([z.null(), z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Tarih YYYY-AA-GG biçiminde olmalıdır.")]));

export const progressPercentSchema = z
  .string()
  .trim()
  .transform((value) => (value === "" ? null : Number(value)))
  .pipe(
    z
      .number("İlerleme bir sayı olmalıdır.")
      .int("İlerleme tam sayı olmalıdır.")
      .min(0, "İlerleme 0 ile 100 arasında olmalıdır.")
      .max(100, "İlerleme 0 ile 100 arasında olmalıdır.")
      .nullable(),
  );

export const optionalUuid = z
  .string()
  .trim()
  .transform((value) => (value === "" ? null : value))
  .pipe(z.union([z.null(), z.uuid("Geçersiz kayıt.")]));

export const httpsOptional = z
  .string()
  .trim()
  .transform((value) => (value === "" ? null : value))
  .pipe(z.union([z.null(), z.url("Geçerli bir https adresi girin.")]))
  .refine((value) => value === null || value.startsWith("https://"), "Yalnızca https bağlantıları kabul edilir.");

export const technicalDetailsSchema = z
  .array(z.object({ label: trimmed(80, "Teknik etiket"), value: trimmed(200, "Teknik değer") }))
  .max(30, "En fazla 30 teknik satır.")
  .transform((rows) => rows.filter((row) => row.label !== "" || row.value !== ""));

export const projectRootSchema = z
  .object({
    status: projectStatusSchema,
    expertiseId: optionalUuid,
    countryCode: countryCodeSchema,
    startedOn: dateSchema,
    completedOn: dateSchema,
    videoUrl: httpsOptional,
    progressPercent: progressPercentSchema,
    isFeatured: featuredSchema,
    sortOrder: sortOrderSchema,
    coverAssetId: optionalUuid,
    gallery: z.array(z.uuid("Geçersiz görsel.")).max(24, "Galeride en fazla 24 görsel olabilir."),
  })
  .refine((value) => !value.startedOn || !value.completedOn || value.completedOn >= value.startedOn, {
    path: ["completedOn"],
    message: "Bitiş tarihi başlangıçtan önce olamaz.",
  });

export type ProjectRootInput = z.infer<typeof projectRootSchema>;

export const projectTranslationSchema = z.object({
  title: required(200, "Başlık"),
  slug: slugSchema,
  summary: optional(500, "Kısa açıklama"),
  body: optional(20000, "Ayrıntılı içerik"),
  city: optional(120, "Şehir"),
  seoTitle: seoTitleSchema,
  seoDescription: seoDescriptionSchema,
  technicalDetails: technicalDetailsSchema,
});

export type ProjectTranslationInput = z.infer<typeof projectTranslationSchema>;

export const mediaAltSchema = z.object({
  altFr: optional(200, "Fransızca alternatif metin"),
  altEn: optional(200, "İngilizce alternatif metin"),
  altTr: optional(200, "Türkçe alternatif metin"),
  captionFr: optional(240, "Fransızca açıklama"),
  captionEn: optional(240, "İngilizce açıklama"),
  captionTr: optional(240, "Türkçe açıklama"),
});

export const visitTranslationSchema = z.object({
  title: required(200, "Başlık"),
  slug: slugSchema,
  summary: optional(500, "Kısa açıklama"),
  body: optional(20000, "Ayrıntılı içerik"),
  hostInstitution: optional(200, "Kurum"),
  location: optional(120, "Şehir"),
  seoTitle: seoTitleSchema,
  seoDescription: seoDescriptionSchema,
});

export type VisitTranslationInput = z.infer<typeof visitTranslationSchema>;

export const visitParticipantSchema = z.object({
  fullName: trimmed(160, "Katılımcı adı"),
  roleFr: optional(160, "Fransızca unvan"),
  roleEn: optional(160, "İngilizce unvan"),
  roleTr: optional(160, "Türkçe unvan"),
});

export type VisitParticipantInput = z.infer<typeof visitParticipantSchema>;

export const visitRootSchema = z.object({
  visitedOn: dateSchema,
  countryCode: countryCodeSchema,
  isFeatured: featuredSchema,
  coverAssetId: optionalUuid,
  gallery: z.array(z.uuid("Geçersiz görsel.")).max(24, "Galeride en fazla 24 görsel olabilir."),
  participants: z
    .array(visitParticipantSchema)
    .max(40, "En fazla 40 katılımcı.")
    .transform((rows) => rows.filter((row) => row.fullName !== "")),
});

export type VisitRootInput = z.infer<typeof visitRootSchema>;

export const siteSettingsSchema = z.object({
  companyName: optional(160, "Firma adı"),
  contactEmail: z
    .string()
    .trim()
    .max(254, "E-posta adresi çok uzun.")
    .transform((value) => (value === "" ? null : value.toLowerCase()))
    .pipe(z.email("Geçerli bir e-posta adresi girin.").nullable()),
  contactPhone: optional(40, "Telefon"),
  postalAddress: optional(500, "Adres"),
  whatsapp: z
    .string()
    .trim()
    .transform((value) => value.replace(/[\s-]/g, ""))
    .transform((value) => (value === "" ? null : value))
    .pipe(z.union([z.null(), z.string().regex(/^\+?[0-9]{8,15}$/, "WhatsApp numarası uluslararası biçimde olmalıdır.")])),
  logoAssetId: optionalUuid,
  faviconAssetId: optionalUuid,
  socialLinks: z
    .array(z.object({ label: trimmed(80, "Bağlantı adı"), url: httpsOptional }))
    .max(12, "En fazla 12 sosyal bağlantı.")
    .transform((rows) =>
      rows.filter((row): row is { label: string; url: string } => Boolean(row.label && row.url)),
    ),
});

export type SiteSettingsInput = z.infer<typeof siteSettingsSchema>;

export const homeVisualsSchema = z.object({
  heroImageAssetId: optionalUuid,
  callToActionImageAssetId: optionalUuid,
  heroVideoUrl: httpsOptional,
  homeSections: z
    .array(
      z.object({
        key: z.enum(HOME_SECTION_KEYS),
        visible: z.boolean(),
      }),
    )
    .min(1),
});

export type HomeVisualsInput = z.infer<typeof homeVisualsSchema>;

export const homeCopySchema = z.object({
  heroTitle: optional(200, "Hero başlığı"),
  heroDescription: optional(500, "Hero açıklaması"),
  introTitle: optional(200, "Tanıtım başlığı"),
  introBody: optional(4000, "Şirket tanıtımı"),
  ctaTitle: optional(200, "CTA başlığı"),
  ctaDescription: optional(500, "CTA açıklaması"),
  ctaLabel: optional(80, "CTA metni"),
  ctaHref: z
    .string()
    .trim()
    .transform((value) => (value === "" ? null : value))
    .pipe(
      z.union([
        z.null(),
        z.string().regex(/^(\/[^\s]*|https:\/\/[^\s]+)$/, "Hedef bir site yolu (/…) veya https adresi olmalıdır."),
      ]),
    ),
  footerTagline: optional(200, "Footer metni"),
  seoTitle: seoTitleSchema,
  seoDescription: seoDescriptionSchema,
});

export type HomeCopyInput = z.infer<typeof homeCopySchema>;

export const teamTranslationSchema = z.object({
  roleTitle: required(160, "Görev / unvan"),
  bio: optional(4000, "Biyografi"),
});

export type TeamTranslationInput = z.infer<typeof teamTranslationSchema>;

export const teamRootSchema = z.object({
  fullName: required(160, "Ad soyad"),
  sortOrder: sortOrderSchema,
  isVisible: featuredSchema,
  photoAssetId: optionalUuid,
  linkLabel: optional(80, "Profil etiketi"),
  linkUrl: httpsOptional,
});

export type TeamRootInput = z.infer<typeof teamRootSchema>;

export const pageTranslationSchema = z.object({
  title: required(200, "Başlık"),
  summary: optional(500, "Kısa açıklama"),
  body: optional(20000, "Ayrıntılı içerik"),
  seoTitle: seoTitleSchema,
  seoDescription: seoDescriptionSchema,
});

export type PageTranslationInput = z.infer<typeof pageTranslationSchema>;

/** First message per field, for display next to inputs. */
export function fieldErrors(error: z.ZodError): Record<string, string> {
  const result: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.join(".") || "_form";
    if (!result[key]) result[key] = issue.message;
  }
  return result;
}
