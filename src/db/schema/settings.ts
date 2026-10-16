import { sql } from "drizzle-orm";
import { check, jsonb, pgTable, smallint, text, timestamp, uniqueIndex, uuid } from "drizzle-orm/pg-core";
import type { HomeSectionLayout } from "../../content/home-layout";
import { DEFAULT_HOME_LAYOUT } from "../../content/home-layout";
import { id, publication, publishedAtCheck, timestamps } from "./common";
import { mediaAssets } from "./media";
import { users } from "./users";

export type SocialLink = { label: string; url: string };

/**
 * Single-row, language-independent settings. Every company detail is empty
 * until entered in the panel; nothing is shown publicly for an empty field.
 */
export const siteSettings = pgTable(
  "site_settings",
  {
    id: smallint("id").primaryKey().default(1),
    companyName: text("company_name"),
    contactEmail: text("contact_email"),
    contactPhone: text("contact_phone"),
    postalAddress: text("postal_address"),
    whatsapp: text("whatsapp"),
    socialLinks: jsonb("social_links").$type<SocialLink[]>().default(sql`'[]'::jsonb`).notNull(),
    logoAssetId: uuid("logo_asset_id").references(() => mediaAssets.id, { onDelete: "set null" }),
    faviconAssetId: uuid("favicon_asset_id").references(() => mediaAssets.id, { onDelete: "set null" }),
    heroImageAssetId: uuid("hero_image_asset_id").references(() => mediaAssets.id, {
      onDelete: "set null",
    }),
    heroVideoUrl: text("hero_video_url"),
    callToActionImageAssetId: uuid("call_to_action_image_asset_id").references(
      () => mediaAssets.id,
      { onDelete: "set null" },
    ),
    homeSections: jsonb("home_sections")
      .$type<HomeSectionLayout[]>()
      .default(sql`'[]'::jsonb`)
      .notNull(),
    updatedById: text("updated_by_id").references(() => users.id, { onDelete: "set null" }),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (t) => [
    check("site_settings_single_row", sql`${t.id} = 1`),
    check("site_settings_social_links", sql`jsonb_typeof(${t.socialLinks}) = 'array'`),
    check("site_settings_home_sections", sql`jsonb_typeof(${t.homeSections}) = 'array'`),
    check(
      "site_settings_hero_video_url",
      sql`${t.heroVideoUrl} is null or ${t.heroVideoUrl} ~ '^https://[^\\s]+$'`,
    ),
    check(
      "site_settings_whatsapp",
      sql`${t.whatsapp} is null or ${t.whatsapp} ~ '^\\+?[0-9]{8,15}$'`,
    ),
  ],
);

/** Per-language home copy, footer line and default SEO. Unpublished rows fall back to the UI dictionary. */
export const siteSettingTranslations = pgTable(
  "site_setting_translations",
  {
    id: id(),
    settingsId: smallint("settings_id")
      .notNull()
      .references(() => siteSettings.id, { onDelete: "cascade" }),
    heroTitle: text("hero_title"),
    heroDescription: text("hero_description"),
    introTitle: text("intro_title"),
    introBody: text("intro_body"),
    ctaTitle: text("cta_title"),
    ctaDescription: text("cta_description"),
    ctaLabel: text("cta_label"),
    ctaHref: text("cta_href"),
    footerTagline: text("footer_tagline"),
    ...publication(),
    ...timestamps(),
  },
  (t) => [
    uniqueIndex("site_setting_translations_locale").on(t.settingsId, t.locale),
    publishedAtCheck("site_setting_translations", t.status, t.publishedAt),
    check(
      "site_setting_translations_cta_href",
      sql`${t.ctaHref} is null or ${t.ctaHref} ~ '^(/[^\\s]*|https://[^\\s]+)$'`,
    ),
  ],
);

export { DEFAULT_HOME_LAYOUT };
