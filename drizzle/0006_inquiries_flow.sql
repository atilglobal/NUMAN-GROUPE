CREATE TYPE "inquiry_notify_status" AS ENUM('skipped', 'sent', 'failed');--> statement-breakpoint
ALTER TABLE "inquiries" ADD COLUMN "country_code" text;--> statement-breakpoint
ALTER TABLE "inquiries" ADD COLUMN "preference_consent_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "inquiries" ADD COLUMN "idempotency_key" uuid;--> statement-breakpoint
ALTER TABLE "inquiries" ADD COLUMN "notify_status" "inquiry_notify_status" DEFAULT 'skipped' NOT NULL;--> statement-breakpoint
ALTER TABLE "inquiries" ADD COLUMN "notify_error" text;--> statement-breakpoint
UPDATE "inquiries" SET "idempotency_key" = gen_random_uuid() WHERE "idempotency_key" IS NULL;--> statement-breakpoint
ALTER TABLE "inquiries" ALTER COLUMN "idempotency_key" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "inquiries" ADD CONSTRAINT "inquiries_country" CHECK ("inquiries"."country_code" is null or "inquiries"."country_code" ~ '^[A-Z]{2}$');--> statement-breakpoint
CREATE UNIQUE INDEX "inquiries_idempotency" ON "inquiries" USING btree ("idempotency_key");--> statement-breakpoint
CREATE TABLE "inquiry_notes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"inquiry_id" uuid NOT NULL,
	"author_id" text,
	"body" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "inquiry_notes_body" CHECK (char_length(btrim("inquiry_notes"."body")) > 0)
);--> statement-breakpoint
ALTER TABLE "inquiry_notes" ADD CONSTRAINT "inquiry_notes_inquiry_id_inquiries_id_fk" FOREIGN KEY ("inquiry_id") REFERENCES "public"."inquiries"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inquiry_notes" ADD CONSTRAINT "inquiry_notes_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "inquiry_notes_inquiry" ON "inquiry_notes" USING btree ("inquiry_id","created_at");
