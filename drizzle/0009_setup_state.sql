CREATE TABLE "setup_state" (
	"id" smallint PRIMARY KEY NOT NULL,
	"completed_at" timestamp with time zone,
	"completed_by_user_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "setup_state_singleton" CHECK ("setup_state"."id" = 1)
);
--> statement-breakpoint
ALTER TABLE "setup_state" ADD CONSTRAINT "setup_state_completed_by_user_id_users_id_fk" FOREIGN KEY ("completed_by_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
