CREATE TABLE "content_slug_redirects" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"locale" "locale" NOT NULL,
	"section" text NOT NULL,
	"old_slug" text NOT NULL,
	"entity_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "content_slug_redirects_slug_format" CHECK ("content_slug_redirects"."old_slug" ~ '^[a-z0-9]+(-[a-z0-9]+)*$' AND char_length("content_slug_redirects"."old_slug") <= 160),
	CONSTRAINT "content_slug_redirects_section" CHECK ("content_slug_redirects"."section" in ('projects','expertises','visits'))
);
--> statement-breakpoint
CREATE UNIQUE INDEX "content_slug_redirects_lookup" ON "content_slug_redirects" USING btree ("locale","section","old_slug");
