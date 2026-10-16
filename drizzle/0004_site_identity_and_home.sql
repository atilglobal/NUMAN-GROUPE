ALTER TABLE "site_settings" ADD COLUMN "whatsapp" text;--> statement-breakpoint
ALTER TABLE "site_settings" ADD COLUMN "logo_asset_id" uuid;--> statement-breakpoint
ALTER TABLE "site_settings" ADD COLUMN "favicon_asset_id" uuid;--> statement-breakpoint
ALTER TABLE "site_settings" ADD COLUMN "hero_video_url" text;--> statement-breakpoint
ALTER TABLE "site_settings" ADD COLUMN "home_sections" jsonb DEFAULT '[{"key":"hero","visible":true},{"key":"intro","visible":true},{"key":"expertises","visible":true},{"key":"projects","visible":true},{"key":"visits","visible":true},{"key":"team","visible":true},{"key":"cta","visible":true}]'::jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "site_settings" ADD CONSTRAINT "site_settings_home_sections" CHECK (jsonb_typeof("site_settings"."home_sections") = 'array');--> statement-breakpoint
ALTER TABLE "site_settings" ADD CONSTRAINT "site_settings_hero_video_url" CHECK ("site_settings"."hero_video_url" is null or "site_settings"."hero_video_url" ~ '^https://[^\s]+$');--> statement-breakpoint
ALTER TABLE "site_settings" ADD CONSTRAINT "site_settings_whatsapp" CHECK ("site_settings"."whatsapp" is null or "site_settings"."whatsapp" ~ '^\+?[0-9]{8,15}$');--> statement-breakpoint
ALTER TABLE "site_settings" ADD CONSTRAINT "site_settings_logo_asset_id_media_assets_id_fk" FOREIGN KEY ("logo_asset_id") REFERENCES "public"."media_assets"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "site_settings" ADD CONSTRAINT "site_settings_favicon_asset_id_media_assets_id_fk" FOREIGN KEY ("favicon_asset_id") REFERENCES "public"."media_assets"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE TABLE "site_setting_translations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"settings_id" smallint NOT NULL,
	"hero_title" text,
	"hero_description" text,
	"intro_title" text,
	"intro_body" text,
	"cta_title" text,
	"cta_description" text,
	"cta_label" text,
	"cta_href" text,
	"footer_tagline" text,
	"locale" "locale" NOT NULL,
	"status" "publication_status" DEFAULT 'draft' NOT NULL,
	"published_at" timestamp with time zone,
	"seo_title" text,
	"seo_description" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "site_setting_translations_published_at" CHECK ("site_setting_translations"."status" = 'draft' or "site_setting_translations"."published_at" is not null),
	CONSTRAINT "site_setting_translations_cta_href" CHECK ("site_setting_translations"."cta_href" is null or "site_setting_translations"."cta_href" ~ '^(/[^\s]*|https://[^\s]+)$')
);--> statement-breakpoint
ALTER TABLE "site_setting_translations" ADD CONSTRAINT "site_setting_translations_settings_id_site_settings_id_fk" FOREIGN KEY ("settings_id") REFERENCES "public"."site_settings"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "site_setting_translations_locale" ON "site_setting_translations" USING btree ("settings_id","locale");
