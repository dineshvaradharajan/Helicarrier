CREATE TABLE "approvals" (
	"id" varchar(21) PRIMARY KEY NOT NULL,
	"app_id" varchar(21) NOT NULL,
	"requester_id" varchar(21) NOT NULL,
	"type" varchar(30) NOT NULL,
	"status" varchar(20) DEFAULT 'pending' NOT NULL,
	"payload" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"resolver_id" varchar(21),
	"resolved_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "apps" (
	"id" varchar(21) PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"slug" varchar(255) NOT NULL,
	"recipe_id" varchar(21) NOT NULL,
	"status" varchar(30) DEFAULT 'draft' NOT NULL,
	"resolved_config" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"additional_libs" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"owner_id" varchar(21) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "apps_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "audit_log" (
	"id" varchar(21) PRIMARY KEY NOT NULL,
	"actor_id" varchar(21) NOT NULL,
	"action" varchar(100) NOT NULL,
	"resource_type" varchar(50) NOT NULL,
	"resource_id" varchar(21) NOT NULL,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "compliance_checks" (
	"id" varchar(21) PRIMARY KEY NOT NULL,
	"app_id" varchar(21) NOT NULL,
	"agent_id" varchar(100) NOT NULL,
	"status" varchar(20) NOT NULL,
	"findings" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"score" integer,
	"triggered_by" varchar(50) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "environments" (
	"id" varchar(21) PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"type" varchar(20) NOT NULL,
	"provider" varchar(100) NOT NULL,
	"config" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"status" varchar(20) DEFAULT 'active' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "environments_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "recipes" (
	"id" varchar(21) PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"version" varchar(50) DEFAULT '1.0.0' NOT NULL,
	"definition" jsonb NOT NULL,
	"agent_ids" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"theme_id" varchar(21),
	"pipeline_stages" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "recipes_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "settings" (
	"key" varchar(255) PRIMARY KEY NOT NULL,
	"value" jsonb NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "themes" (
	"id" varchar(21) PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"label" varchar(255) NOT NULL,
	"colors" jsonb NOT NULL,
	"is_default" boolean DEFAULT false NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "themes_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" varchar(21) PRIMARY KEY NOT NULL,
	"external_id" text,
	"email" varchar(255) NOT NULL,
	"display_name" varchar(255) NOT NULL,
	"role" varchar(20) DEFAULT 'developer' NOT NULL,
	"api_key_hash" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_external_id_unique" UNIQUE("external_id"),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "approvals" ADD CONSTRAINT "approvals_app_id_apps_id_fk" FOREIGN KEY ("app_id") REFERENCES "public"."apps"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "approvals" ADD CONSTRAINT "approvals_requester_id_users_id_fk" FOREIGN KEY ("requester_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "approvals" ADD CONSTRAINT "approvals_resolver_id_users_id_fk" FOREIGN KEY ("resolver_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "apps" ADD CONSTRAINT "apps_recipe_id_recipes_id_fk" FOREIGN KEY ("recipe_id") REFERENCES "public"."recipes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "apps" ADD CONSTRAINT "apps_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "compliance_checks" ADD CONSTRAINT "compliance_checks_app_id_apps_id_fk" FOREIGN KEY ("app_id") REFERENCES "public"."apps"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recipes" ADD CONSTRAINT "recipes_theme_id_themes_id_fk" FOREIGN KEY ("theme_id") REFERENCES "public"."themes"("id") ON DELETE no action ON UPDATE no action;