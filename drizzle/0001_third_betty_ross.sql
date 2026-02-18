CREATE TYPE "public"."origem_item_plano" AS ENUM('takeaway-dashboard', 'insight-acao-sugerida');--> statement-breakpoint
CREATE TYPE "public"."status_item_plano" AS ENUM('pendente', 'concluida', 'ignorada');--> statement-breakpoint
CREATE TYPE "public"."tipo_conclusao_plano" AS ENUM('positivo', 'neutro', 'atencao');--> statement-breakpoint
CREATE TABLE "itens_plano_acao" (
	"identificador" text PRIMARY KEY NOT NULL,
	"usuario_id" text NOT NULL,
	"texto_original" text NOT NULL,
	"tipo_conclusao" "tipo_conclusao_plano" NOT NULL,
	"origem" "origem_item_plano" NOT NULL,
	"recomendacao_enriquecida" text NOT NULL,
	"fundamentacao" text NOT NULL,
	"ativos_relacionados" jsonb DEFAULT '[]' NOT NULL,
	"status" "status_item_plano" DEFAULT 'pendente' NOT NULL,
	"criado_em" timestamp with time zone DEFAULT now() NOT NULL,
	"atualizado_em" timestamp with time zone DEFAULT now() NOT NULL,
	"concluido_em" timestamp with time zone
);
--> statement-breakpoint
CREATE INDEX "idx_plano_acao_usuario_id" ON "itens_plano_acao" USING btree ("usuario_id");--> statement-breakpoint
CREATE INDEX "idx_plano_acao_usuario_status" ON "itens_plano_acao" USING btree ("usuario_id","status");--> statement-breakpoint
CREATE INDEX "idx_plano_acao_usuario_criado" ON "itens_plano_acao" USING btree ("usuario_id","criado_em");