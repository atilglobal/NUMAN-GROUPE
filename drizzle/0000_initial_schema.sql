CREATE TYPE "public"."locale" AS ENUM('fr', 'en', 'tr');--> statement-breakpoint
CREATE TYPE "public"."publication_status" AS ENUM('draft', 'published');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('admin', 'editor', 'viewer');--> statement-breakpoint
CREATE TYPE "public"."project_status" AS ENUM('in_progress', 'completed');--> statement-breakpoint
CREATE TYPE "public"."page_key" AS ENUM('about', 'contact', 'privacy', 'legal', 'cookies');--> statement-breakpoint
CREATE TYPE "public"."inquiry_status" AS ENUM('new', 'read', 'archived');--> statement-breakpoint
CREATE TYPE "public"."inquiry_type" AS ENUM('contact', 'project_request');--> statement-breakpoint
CREATE TABLE "users" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"email_verified" boolean DEFAULT false NOT NULL,
	"image" text,
	"role" "user_role" DEFAULT 'viewer' NOT NULL,
	"disabled_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "media_asset_translations" (
	"asset_id" uuid NOT NULL,
	"locale" "locale" NOT NULL,
	"alt" text NOT NULL,
	"caption" text,
	CONSTRAINT "media_asset_translations_asset_id_locale_pk" PRIMARY KEY("asset_id","locale"),
	CONSTRAINT "media_asset_translations_alt" CHECK (char_length(btrim("media_asset_translations"."alt")) > 0)
);
--> statement-breakpoint
CREATE TABLE "media_assets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"storage_key" text NOT NULL,
	"mime_type" text NOT NULL,
	"byte_size" integer NOT NULL,
	"width" integer,
	"height" integer,
	"original_filename" text,
	"is_demo" boolean DEFAULT false NOT NULL,
	"created_by_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "media_assets_storage_key_unique" UNIQUE("storage_key"),
	CONSTRAINT "media_assets_byte_size" CHECK ("media_assets"."byte_size" > 0),
	CONSTRAINT "media_assets_dimensions" CHECK (("media_assets"."width" is null or "media_assets"."width" > 0) and ("media_assets"."height" is null or "media_assets"."height" > 0))
);
--> statement-breakpoint
CREATE TABLE "expertise_translations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"expertise_id" uuid NOT NULL,
	"slug" text NOT NULL,
	"name" text NOT NULL,
	"summary" text,
	"body" text,
	"locale" "locale" NOT NULL,
	"status" "publication_status" DEFAULT 'draft' NOT NULL,
	"published_at" timestamp with time zone,
	"seo_title" text,
	"seo_description" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "expertise_translations_slug_format" CHECK ("expertise_translations"."slug" ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and char_length("expertise_translations"."slug") <= 160),
	CONSTRAINT "expertise_translations_published_at" CHECK ("expertise_translations"."status" = 'draft' or "expertise_translations"."published_at" is not null),
	CONSTRAINT "expertise_translations_name" CHECK (char_length(btrim("expertise_translations"."name")) > 0)
);
--> statement-breakpoint
CREATE TABLE "expertises" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"is_seed" boolean DEFAULT false NOT NULL,
	"is_demo" boolean DEFAULT false NOT NULL,
	"cover_asset_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "project_gallery" (
	"project_id" uuid NOT NULL,
	"asset_id" uuid NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "project_gallery_project_id_asset_id_pk" PRIMARY KEY("project_id","asset_id")
);
--> statement-breakpoint
CREATE TABLE "project_translations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid NOT NULL,
	"slug" text NOT NULL,
	"title" text NOT NULL,
	"summary" text,
	"body" text,
	"city" text,
	"technical_details" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"locale" "locale" NOT NULL,
	"status" "publication_status" DEFAULT 'draft' NOT NULL,
	"published_at" timestamp with time zone,
	"seo_title" text,
	"seo_description" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "project_translations_slug_format" CHECK ("project_translations"."slug" ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and char_length("project_translations"."slug") <= 160),
	CONSTRAINT "project_translations_published_at" CHECK ("project_translations"."status" = 'draft' or "project_translations"."published_at" is not null),
	CONSTRAINT "project_translations_title" CHECK (char_length(btrim("project_translations"."title")) > 0),
	CONSTRAINT "project_translations_technical_details" CHECK (jsonb_typeof("project_translations"."technical_details") = 'array')
);
--> statement-breakpoint
CREATE TABLE "projects" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"expertise_id" uuid,
	"country_code" char(2),
	"status" "project_status" NOT NULL,
	"started_on" date,
	"completed_on" date,
	"cover_asset_id" uuid,
	"video_url" text,
	"is_featured" boolean DEFAULT false NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"is_demo" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "projects_country_code" CHECK ("projects"."country_code" is null or "projects"."country_code" ~ '^[A-Z]{2}$'),
	CONSTRAINT "projects_video_url" CHECK ("projects"."video_url" is null or "projects"."video_url" ~ '^https://[^\s]+$'),
	CONSTRAINT "projects_dates_order" CHECK ("projects"."started_on" is null or "projects"."completed_on" is null or "projects"."completed_on" >= "projects"."started_on")
);
--> statement-breakpoint
CREATE TABLE "official_visit_gallery" (
	"visit_id" uuid NOT NULL,
	"asset_id" uuid NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "official_visit_gallery_visit_id_asset_id_pk" PRIMARY KEY("visit_id","asset_id")
);
--> statement-breakpoint
CREATE TABLE "official_visit_participant_translations" (
	"participant_id" uuid NOT NULL,
	"locale" "locale" NOT NULL,
	"role_title" text NOT NULL,
	CONSTRAINT "visit_participant_translations_pk" PRIMARY KEY("participant_id","locale"),
	CONSTRAINT "official_visit_participant_translations_role" CHECK (char_length(btrim("official_visit_participant_translations"."role_title")) > 0)
);
--> statement-breakpoint
CREATE TABLE "official_visit_participants" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"visit_id" uuid NOT NULL,
	"full_name" text NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "official_visit_participants_name" CHECK (char_length(btrim("official_visit_participants"."full_name")) > 0)
);
--> statement-breakpoint
CREATE TABLE "official_visit_translations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"visit_id" uuid NOT NULL,
	"slug" text NOT NULL,
	"title" text NOT NULL,
	"host_institution" text,
	"location" text,
	"summary" text,
	"body" text,
	"locale" "locale" NOT NULL,
	"status" "publication_status" DEFAULT 'draft' NOT NULL,
	"published_at" timestamp with time zone,
	"seo_title" text,
	"seo_description" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "official_visit_translations_slug_format" CHECK ("official_visit_translations"."slug" ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and char_length("official_visit_translations"."slug") <= 160),
	CONSTRAINT "official_visit_translations_published_at" CHECK ("official_visit_translations"."status" = 'draft' or "official_visit_translations"."published_at" is not null),
	CONSTRAINT "official_visit_translations_title" CHECK (char_length(btrim("official_visit_translations"."title")) > 0)
);
--> statement-breakpoint
CREATE TABLE "official_visits" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"visited_on" date,
	"country_code" char(2),
	"cover_asset_id" uuid,
	"is_featured" boolean DEFAULT false NOT NULL,
	"is_demo" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "official_visits_country_code" CHECK ("official_visits"."country_code" is null or "official_visits"."country_code" ~ '^[A-Z]{2}$')
);
--> statement-breakpoint
CREATE TABLE "team_member_links" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"member_id" uuid NOT NULL,
	"label" text NOT NULL,
	"url" text NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "team_member_links_label" CHECK (char_length(btrim("team_member_links"."label")) > 0),
	CONSTRAINT "team_member_links_url" CHECK ("team_member_links"."url" is null or "team_member_links"."url" ~ '^https://[^\s]+$')
);
--> statement-breakpoint
CREATE TABLE "team_member_translations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"member_id" uuid NOT NULL,
	"role_title" text NOT NULL,
	"bio" text,
	"locale" "locale" NOT NULL,
	"status" "publication_status" DEFAULT 'draft' NOT NULL,
	"published_at" timestamp with time zone,
	"seo_title" text,
	"seo_description" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "team_member_translations_published_at" CHECK ("team_member_translations"."status" = 'draft' or "team_member_translations"."published_at" is not null),
	CONSTRAINT "team_member_translations_role" CHECK (char_length(btrim("team_member_translations"."role_title")) > 0)
);
--> statement-breakpoint
CREATE TABLE "team_members" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"full_name" text NOT NULL,
	"photo_asset_id" uuid,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"is_visible" boolean DEFAULT true NOT NULL,
	"is_demo" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "team_members_full_name" CHECK (char_length(btrim("team_members"."full_name")) > 0)
);
--> statement-breakpoint
CREATE TABLE "page_content_translations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"page_id" uuid NOT NULL,
	"title" text NOT NULL,
	"summary" text,
	"body" text,
	"locale" "locale" NOT NULL,
	"status" "publication_status" DEFAULT 'draft' NOT NULL,
	"published_at" timestamp with time zone,
	"seo_title" text,
	"seo_description" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "page_content_translations_published_at" CHECK ("page_content_translations"."status" = 'draft' or "page_content_translations"."published_at" is not null),
	CONSTRAINT "page_content_translations_title" CHECK (char_length(btrim("page_content_translations"."title")) > 0)
);
--> statement-breakpoint
CREATE TABLE "page_contents" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"key" "page_key" NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "page_contents_key_unique" UNIQUE("key")
);
--> statement-breakpoint
CREATE TABLE "site_settings" (
	"id" smallint PRIMARY KEY DEFAULT 1 NOT NULL,
	"company_name" text,
	"contact_email" text,
	"contact_phone" text,
	"postal_address" text,
	"social_links" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"hero_image_asset_id" uuid,
	"call_to_action_image_asset_id" uuid,
	"updated_by_id" text,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "site_settings_single_row" CHECK ("site_settings"."id" = 1),
	CONSTRAINT "site_settings_social_links" CHECK (jsonb_typeof("site_settings"."social_links") = 'array')
);
--> statement-breakpoint
CREATE TABLE "inquiries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"type" "inquiry_type" NOT NULL,
	"locale" "locale" NOT NULL,
	"full_name" text NOT NULL,
	"email" text NOT NULL,
	"phone" text,
	"organization" text,
	"message" text NOT NULL,
	"related_expertise_id" uuid,
	"related_project_id" uuid,
	"privacy_consent_at" timestamp with time zone NOT NULL,
	"status" "inquiry_status" DEFAULT 'new' NOT NULL,
	"handled_by_id" text,
	"handled_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "inquiries_full_name" CHECK (char_length(btrim("inquiries"."full_name")) > 0),
	CONSTRAINT "inquiries_email" CHECK (char_length(btrim("inquiries"."email")) > 0),
	CONSTRAINT "inquiries_message" CHECK (char_length(btrim("inquiries"."message")) > 0)
);
--> statement-breakpoint
CREATE TABLE "audit_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"actor_user_id" text,
	"action" text NOT NULL,
	"entity_type" text NOT NULL,
	"entity_id" text NOT NULL,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"ip" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "media_asset_translations" ADD CONSTRAINT "media_asset_translations_asset_id_media_assets_id_fk" FOREIGN KEY ("asset_id") REFERENCES "public"."media_assets"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "media_assets" ADD CONSTRAINT "media_assets_created_by_id_users_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "expertise_translations" ADD CONSTRAINT "expertise_translations_expertise_id_expertises_id_fk" FOREIGN KEY ("expertise_id") REFERENCES "public"."expertises"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "expertises" ADD CONSTRAINT "expertises_cover_asset_id_media_assets_id_fk" FOREIGN KEY ("cover_asset_id") REFERENCES "public"."media_assets"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_gallery" ADD CONSTRAINT "project_gallery_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_gallery" ADD CONSTRAINT "project_gallery_asset_id_media_assets_id_fk" FOREIGN KEY ("asset_id") REFERENCES "public"."media_assets"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_translations" ADD CONSTRAINT "project_translations_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "projects" ADD CONSTRAINT "projects_expertise_id_expertises_id_fk" FOREIGN KEY ("expertise_id") REFERENCES "public"."expertises"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "projects" ADD CONSTRAINT "projects_cover_asset_id_media_assets_id_fk" FOREIGN KEY ("cover_asset_id") REFERENCES "public"."media_assets"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "official_visit_gallery" ADD CONSTRAINT "official_visit_gallery_visit_id_official_visits_id_fk" FOREIGN KEY ("visit_id") REFERENCES "public"."official_visits"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "official_visit_gallery" ADD CONSTRAINT "official_visit_gallery_asset_id_media_assets_id_fk" FOREIGN KEY ("asset_id") REFERENCES "public"."media_assets"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "official_visit_participant_translations" ADD CONSTRAINT "visit_participant_translations_participant_fk" FOREIGN KEY ("participant_id") REFERENCES "public"."official_visit_participants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "official_visit_participants" ADD CONSTRAINT "official_visit_participants_visit_id_official_visits_id_fk" FOREIGN KEY ("visit_id") REFERENCES "public"."official_visits"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "official_visit_translations" ADD CONSTRAINT "official_visit_translations_visit_id_official_visits_id_fk" FOREIGN KEY ("visit_id") REFERENCES "public"."official_visits"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "official_visits" ADD CONSTRAINT "official_visits_cover_asset_id_media_assets_id_fk" FOREIGN KEY ("cover_asset_id") REFERENCES "public"."media_assets"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "team_member_links" ADD CONSTRAINT "team_member_links_member_id_team_members_id_fk" FOREIGN KEY ("member_id") REFERENCES "public"."team_members"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "team_member_translations" ADD CONSTRAINT "team_member_translations_member_id_team_members_id_fk" FOREIGN KEY ("member_id") REFERENCES "public"."team_members"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "team_members" ADD CONSTRAINT "team_members_photo_asset_id_media_assets_id_fk" FOREIGN KEY ("photo_asset_id") REFERENCES "public"."media_assets"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "page_content_translations" ADD CONSTRAINT "page_content_translations_page_id_page_contents_id_fk" FOREIGN KEY ("page_id") REFERENCES "public"."page_contents"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "site_settings" ADD CONSTRAINT "site_settings_hero_image_asset_id_media_assets_id_fk" FOREIGN KEY ("hero_image_asset_id") REFERENCES "public"."media_assets"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "site_settings" ADD CONSTRAINT "site_settings_call_to_action_image_asset_id_media_assets_id_fk" FOREIGN KEY ("call_to_action_image_asset_id") REFERENCES "public"."media_assets"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "site_settings" ADD CONSTRAINT "site_settings_updated_by_id_users_id_fk" FOREIGN KEY ("updated_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inquiries" ADD CONSTRAINT "inquiries_related_expertise_id_expertises_id_fk" FOREIGN KEY ("related_expertise_id") REFERENCES "public"."expertises"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inquiries" ADD CONSTRAINT "inquiries_related_project_id_projects_id_fk" FOREIGN KEY ("related_project_id") REFERENCES "public"."projects"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inquiries" ADD CONSTRAINT "inquiries_handled_by_id_users_id_fk" FOREIGN KEY ("handled_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_actor_user_id_users_id_fk" FOREIGN KEY ("actor_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "users_email_unique" ON "users" USING btree (lower("email"));--> statement-breakpoint
CREATE UNIQUE INDEX "expertise_translations_entity_locale" ON "expertise_translations" USING btree ("expertise_id","locale");--> statement-breakpoint
CREATE UNIQUE INDEX "expertise_translations_locale_slug" ON "expertise_translations" USING btree ("locale","slug");--> statement-breakpoint
CREATE UNIQUE INDEX "project_translations_entity_locale" ON "project_translations" USING btree ("project_id","locale");--> statement-breakpoint
CREATE UNIQUE INDEX "project_translations_locale_slug" ON "project_translations" USING btree ("locale","slug");--> statement-breakpoint
CREATE INDEX "project_translations_public" ON "project_translations" USING btree ("locale","status");--> statement-breakpoint
CREATE INDEX "projects_listing" ON "projects" USING btree ("is_featured","sort_order");--> statement-breakpoint
CREATE INDEX "projects_expertise" ON "projects" USING btree ("expertise_id");--> statement-breakpoint
CREATE INDEX "official_visit_participants_visit" ON "official_visit_participants" USING btree ("visit_id");--> statement-breakpoint
CREATE UNIQUE INDEX "official_visit_translations_entity_locale" ON "official_visit_translations" USING btree ("visit_id","locale");--> statement-breakpoint
CREATE UNIQUE INDEX "official_visit_translations_locale_slug" ON "official_visit_translations" USING btree ("locale","slug");--> statement-breakpoint
CREATE INDEX "official_visit_translations_public" ON "official_visit_translations" USING btree ("locale","status");--> statement-breakpoint
CREATE INDEX "official_visits_listing" ON "official_visits" USING btree ("is_featured","visited_on");--> statement-breakpoint
CREATE INDEX "team_member_links_member" ON "team_member_links" USING btree ("member_id");--> statement-breakpoint
CREATE UNIQUE INDEX "team_member_translations_entity_locale" ON "team_member_translations" USING btree ("member_id","locale");--> statement-breakpoint
CREATE INDEX "team_members_listing" ON "team_members" USING btree ("is_visible","sort_order");--> statement-breakpoint
CREATE UNIQUE INDEX "page_content_translations_entity_locale" ON "page_content_translations" USING btree ("page_id","locale");--> statement-breakpoint
CREATE INDEX "inquiries_inbox" ON "inquiries" USING btree ("status","created_at");--> statement-breakpoint
CREATE INDEX "audit_logs_created_at" ON "audit_logs" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "audit_logs_entity" ON "audit_logs" USING btree ("entity_type","entity_id");