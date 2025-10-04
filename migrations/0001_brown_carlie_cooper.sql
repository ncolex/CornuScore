CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"phone_number" varchar(50),
	"password" varchar(255),
	"google_id" varchar(255),
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "users_phone_number_unique" UNIQUE("phone_number"),
	CONSTRAINT "users_google_id_unique" UNIQUE("google_id")
);
--> statement-breakpoint
ALTER TABLE "reseñas" ADD COLUMN "user_id" integer;--> statement-breakpoint
ALTER TABLE "reseñas" ADD COLUMN "status" varchar(50) DEFAULT 'published';--> statement-breakpoint
ALTER TABLE "reseñas" ADD CONSTRAINT "reseñas_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;