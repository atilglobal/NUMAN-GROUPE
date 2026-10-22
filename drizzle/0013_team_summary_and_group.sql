ALTER TABLE "team_members" ADD COLUMN IF NOT EXISTS "presentation_group" text;--> statement-breakpoint
ALTER TABLE "team_members" DROP CONSTRAINT IF EXISTS "team_members_presentation_group";--> statement-breakpoint
ALTER TABLE "team_members" ADD CONSTRAINT "team_members_presentation_group" CHECK (
  "presentation_group" is null
  or "presentation_group" in ('leadership', 'international', 'technical', 'legal', 'finance')
);--> statement-breakpoint
ALTER TABLE "team_member_translations" ADD COLUMN IF NOT EXISTS "summary" text;
