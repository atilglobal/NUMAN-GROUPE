ALTER TABLE "media_assets" ADD COLUMN "focal_x" double precision DEFAULT 0.5 NOT NULL;--> statement-breakpoint
ALTER TABLE "media_assets" ADD COLUMN "focal_y" double precision DEFAULT 0.5 NOT NULL;--> statement-breakpoint
ALTER TABLE "media_assets" ADD CONSTRAINT "media_assets_focal" CHECK ("focal_x" between 0 and 1 and "focal_y" between 0 and 1);--> statement-breakpoint
CREATE TABLE "media_placements" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"asset_id" uuid NOT NULL,
	"context" text NOT NULL,
	"focal_x" double precision DEFAULT 0.5 NOT NULL,
	"focal_y" double precision DEFAULT 0.5 NOT NULL,
	"mobile_asset_id" uuid,
	"decorative" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "media_placements_focal" CHECK ("focal_x" between 0 and 1 and "focal_y" between 0 and 1)
);
--> statement-breakpoint
ALTER TABLE "media_placements" ADD CONSTRAINT "media_placements_asset_id_media_assets_id_fk" FOREIGN KEY ("asset_id") REFERENCES "public"."media_assets"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "media_placements" ADD CONSTRAINT "media_placements_mobile_asset_id_media_assets_id_fk" FOREIGN KEY ("mobile_asset_id") REFERENCES "public"."media_assets"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "media_placements_context" ON "media_placements" USING btree ("context");--> statement-breakpoint
CREATE TABLE "ui_string_overrides" (
	"key" text NOT NULL,
	"locale" "locale" NOT NULL,
	"value" text NOT NULL,
	"updated_by_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "ui_string_overrides_value" CHECK (char_length(btrim("value")) > 0),
	CONSTRAINT "ui_string_overrides_pkey" PRIMARY KEY ("key","locale")
);
--> statement-breakpoint
ALTER TABLE "ui_string_overrides" ADD CONSTRAINT "ui_string_overrides_updated_by_id_users_id_fk" FOREIGN KEY ("updated_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE TYPE "public"."cms_template" AS ENUM('standard');--> statement-breakpoint
CREATE TABLE "cms_pages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"template" "cms_template" DEFAULT 'standard' NOT NULL,
	"layout" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"cover_asset_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "cms_pages_layout_array" CHECK (jsonb_typeof("layout") = 'array')
);
--> statement-breakpoint
ALTER TABLE "cms_pages" ADD CONSTRAINT "cms_pages_cover_asset_id_media_assets_id_fk" FOREIGN KEY ("cover_asset_id") REFERENCES "public"."media_assets"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE TABLE "cms_page_translations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"page_id" uuid NOT NULL,
	"slug" text NOT NULL,
	"title" text NOT NULL,
	"summary" text,
	"og_title" text,
	"og_description" text,
	"og_image_asset_id" uuid,
	"blocks" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"locale" "locale" NOT NULL,
	"status" "publication_status" DEFAULT 'draft' NOT NULL,
	"published_at" timestamp with time zone,
	"seo_title" text,
	"seo_description" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "cms_page_translations_slug_format" CHECK ("slug" ~ '^[a-z0-9]+(-[a-z0-9]+)*$' AND char_length("slug") <= 160),
	CONSTRAINT "cms_page_translations_published_at" CHECK ("status" = 'draft' or "published_at" is not null),
	CONSTRAINT "cms_page_translations_title" CHECK (char_length(btrim("title")) > 0)
);
--> statement-breakpoint
ALTER TABLE "cms_page_translations" ADD CONSTRAINT "cms_page_translations_page_id_cms_pages_id_fk" FOREIGN KEY ("page_id") REFERENCES "public"."cms_pages"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cms_page_translations" ADD CONSTRAINT "cms_page_translations_og_image_asset_id_media_assets_id_fk" FOREIGN KEY ("og_image_asset_id") REFERENCES "public"."media_assets"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "cms_page_translations_entity_locale" ON "cms_page_translations" USING btree ("page_id","locale");--> statement-breakpoint
CREATE UNIQUE INDEX "cms_page_translations_locale_slug" ON "cms_page_translations" USING btree ("locale","slug");--> statement-breakpoint
CREATE TYPE "public"."menu_location" AS ENUM('header','footer');--> statement-breakpoint
CREATE TYPE "public"."menu_item_kind" AS ENUM('section','cms_page','url');--> statement-breakpoint
CREATE TABLE "menus" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"location" "menu_location" NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX "menus_location_unique" ON "menus" USING btree ("location");--> statement-breakpoint
CREATE TABLE "menu_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"menu_id" uuid NOT NULL,
	"parent_id" uuid,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"kind" "menu_item_kind" NOT NULL,
	"section_key" text,
	"cms_page_id" uuid,
	"external_url" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "menu_items_kind_payload" CHECK (
		(kind = 'section' and section_key is not null and cms_page_id is null and external_url is null)
		or (kind = 'cms_page' and cms_page_id is not null and section_key is null and external_url is null)
		or (kind = 'url' and external_url is not null and section_key is null and cms_page_id is null)
	),
	CONSTRAINT "menu_items_external_url" CHECK (external_url is null or external_url ~ '^https://[^\\s]+$')
);
--> statement-breakpoint
ALTER TABLE "menu_items" ADD CONSTRAINT "menu_items_menu_id_menus_id_fk" FOREIGN KEY ("menu_id") REFERENCES "public"."menus"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "menu_items" ADD CONSTRAINT "menu_items_parent_id_menu_items_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."menu_items"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "menu_items" ADD CONSTRAINT "menu_items_cms_page_id_cms_pages_id_fk" FOREIGN KEY ("cms_page_id") REFERENCES "public"."cms_pages"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE TABLE "menu_item_translations" (
	"item_id" uuid NOT NULL,
	"locale" "locale" NOT NULL,
	"label" text NOT NULL,
	CONSTRAINT "menu_item_translations_label" CHECK (char_length(btrim("label")) > 0),
	CONSTRAINT "menu_item_translations_pkey" PRIMARY KEY ("item_id","locale")
);
--> statement-breakpoint
ALTER TABLE "menu_item_translations" ADD CONSTRAINT "menu_item_translations_item_id_menu_items_id_fk" FOREIGN KEY ("item_id") REFERENCES "public"."menu_items"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
INSERT INTO "menus" ("id", "location") VALUES (gen_random_uuid(), 'header'), (gen_random_uuid(), 'footer');--> statement-breakpoint
ALTER TABLE "content_slug_redirects" DROP CONSTRAINT "content_slug_redirects_section";--> statement-breakpoint
ALTER TABLE "content_slug_redirects" ADD CONSTRAINT "content_slug_redirects_section" CHECK ("section" in ('projects','expertises','visits','cms'));
