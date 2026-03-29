CREATE TABLE IF NOT EXISTS "mensagens_salvas" (
  "identificador" text PRIMARY KEY NOT NULL,
  "usuario_id" text NOT NULL,
  "conversa_id" text NOT NULL,
  "titulo_conversa" text NOT NULL,
  "mensagem_id" text NOT NULL,
  "papel" text NOT NULL,
  "conteudo" text NOT NULL,
  "salvada_em" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "idx_salvas_usuario_mensagem" ON "mensagens_salvas" USING btree ("usuario_id","mensagem_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_salvas_usuario_id" ON "mensagens_salvas" USING btree ("usuario_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_salvas_usuario_salvada" ON "mensagens_salvas" USING btree ("usuario_id","salvada_em");
