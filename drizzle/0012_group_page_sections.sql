ALTER TYPE "page_key" ADD VALUE IF NOT EXISTS 'vision';--> statement-breakpoint
ALTER TYPE "page_key" ADD VALUE IF NOT EXISTS 'history';--> statement-breakpoint
ALTER TYPE "page_key" ADD VALUE IF NOT EXISTS 'principles';--> statement-breakpoint
ALTER TYPE "page_key" ADD VALUE IF NOT EXISTS 'finance';--> statement-breakpoint
ALTER TYPE "page_key" ADD VALUE IF NOT EXISTS 'regions';--> statement-breakpoint
ALTER TYPE "page_key" ADD VALUE IF NOT EXISTS 'organization';--> statement-breakpoint
ALTER TYPE "page_key" ADD VALUE IF NOT EXISTS 'future';--> statement-breakpoint
ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "group_sections" jsonb DEFAULT '[]'::jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "site_settings" ADD CONSTRAINT "site_settings_group_sections" CHECK (jsonb_typeof("group_sections") = 'array');
