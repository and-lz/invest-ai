CREATE TABLE IF NOT EXISTS "configuracoes_usuario" (
	"identificador" text PRIMARY KEY NOT NULL,
	"usuario_id" text NOT NULL,
	"chave_api_gemini" text,
	"criada_em" timestamp with time zone NOT NULL DEFAULT now(),
	"atualizada_em" timestamp with time zone NOT NULL DEFAULT now(),
	CONSTRAINT "configuracoes_usuario_usuario_id_unique" UNIQUE("usuario_id")
);
--> statement-breakpoint
CREATE INDEX "idx_configuracoes_usuario_id" on "configuracoes_usuario" ("usuario_id");
