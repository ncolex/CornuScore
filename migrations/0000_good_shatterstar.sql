CREATE TABLE "personas" (
	"id" serial PRIMARY KEY NOT NULL,
	"nombre" varchar(255) NOT NULL,
	"pais" varchar(255),
	"instagram" varchar(255),
	"celular" varchar(50),
	"email" varchar(255),
	"apodo" varchar(255)
);
--> statement-breakpoint
CREATE TABLE "reseñas" (
	"id" serial PRIMARY KEY NOT NULL,
	"persona_id" integer,
	"fecha" timestamp DEFAULT now(),
	"categoria" varchar(50),
	"calificacion" varchar(10),
	"puntaje" integer,
	"texto" text,
	"autor_pseudo" varchar(255),
	"evidencia" varchar(1024),
	"confirmaciones" integer DEFAULT 0
);
--> statement-breakpoint
ALTER TABLE "reseñas" ADD CONSTRAINT "reseñas_persona_id_personas_id_fk" FOREIGN KEY ("persona_id") REFERENCES "public"."personas"("id") ON DELETE no action ON UPDATE no action;