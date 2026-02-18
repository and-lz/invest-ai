ALTER TYPE "public"."tipo_tarefa" ADD VALUE 'enriquecer-item-plano';--> statement-breakpoint
ALTER TYPE "public"."tipo_tarefa" ADD VALUE 'explicar-conclusoes';--> statement-breakpoint
ALTER TABLE "itens_plano_acao" ALTER COLUMN "recomendacao_enriquecida" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "itens_plano_acao" ALTER COLUMN "fundamentacao" DROP NOT NULL;