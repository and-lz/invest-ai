CREATE TYPE "public"."identificador_pagina" AS ENUM('dashboard', 'reports', 'insights', 'trends', 'desempenho', 'aprender');--> statement-breakpoint
CREATE TYPE "public"."origem_dados" AS ENUM('upload-automatico', 'importacao-manual');--> statement-breakpoint
CREATE TYPE "public"."status_extracao" AS ENUM('pendente', 'processando', 'concluido', 'erro');--> statement-breakpoint
CREATE TYPE "public"."status_tarefa" AS ENUM('processando', 'concluido', 'erro', 'cancelada');--> statement-breakpoint
CREATE TYPE "public"."tipo_notificacao" AS ENUM('success', 'error', 'warning', 'info');--> statement-breakpoint
CREATE TYPE "public"."tipo_tarefa" AS ENUM('upload-pdf', 'gerar-insights', 'gerar-insights-consolidados', 'analisar-ativo');--> statement-breakpoint
CREATE TABLE "analise_ativos" (
	"usuario_id" text NOT NULL,
	"codigo_ativo" text NOT NULL,
	"dados" jsonb NOT NULL,
	"data_analise" timestamp with time zone NOT NULL,
	"atualizado_em" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "conversas" (
	"identificador" text PRIMARY KEY NOT NULL,
	"usuario_id" text NOT NULL,
	"titulo" text NOT NULL,
	"identificador_pagina" "identificador_pagina" NOT NULL,
	"mensagens" jsonb DEFAULT '[]' NOT NULL,
	"criada_em" timestamp with time zone DEFAULT now() NOT NULL,
	"atualizada_em" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "notificacoes" (
	"identificador" text PRIMARY KEY NOT NULL,
	"usuario_id" text NOT NULL,
	"tipo" "tipo_notificacao" NOT NULL,
	"titulo" text NOT NULL,
	"descricao" text,
	"acao" jsonb,
	"visualizada" boolean DEFAULT false NOT NULL,
	"criada_em" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "relatorios_extraidos" (
	"identificador" text NOT NULL,
	"usuario_id" text NOT NULL,
	"dados" jsonb NOT NULL,
	"atualizado_em" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "relatorios_insights" (
	"identificador" text NOT NULL,
	"usuario_id" text NOT NULL,
	"dados" jsonb NOT NULL,
	"atualizado_em" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "relatorios_metadados" (
	"identificador" text NOT NULL,
	"usuario_id" text NOT NULL,
	"mes_referencia" text NOT NULL,
	"nome_arquivo_original" text NOT NULL,
	"caminho_arquivo_pdf" text,
	"status_extracao" "status_extracao" DEFAULT 'pendente' NOT NULL,
	"origem_dados" "origem_dados" DEFAULT 'upload-automatico' NOT NULL,
	"erro_extracao" text,
	"data_upload" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tarefas_background" (
	"identificador" text PRIMARY KEY NOT NULL,
	"usuario_id" text,
	"tipo" "tipo_tarefa" NOT NULL,
	"status" "status_tarefa" DEFAULT 'processando' NOT NULL,
	"iniciado_em" timestamp with time zone DEFAULT now() NOT NULL,
	"concluido_em" timestamp with time zone,
	"erro" text,
	"descricao_resultado" text,
	"url_redirecionamento" text,
	"tentativa_atual" text,
	"maximo_tentativas" text,
	"erro_recuperavel" boolean,
	"proxima_tentativa_em" timestamp with time zone,
	"parametros" jsonb,
	"cancelada_em" timestamp with time zone,
	"cancelada_por" text
);
--> statement-breakpoint
CREATE UNIQUE INDEX "idx_analise_usuario_ativo" ON "analise_ativos" USING btree ("usuario_id","codigo_ativo");--> statement-breakpoint
CREATE INDEX "idx_analise_usuario_id" ON "analise_ativos" USING btree ("usuario_id");--> statement-breakpoint
CREATE INDEX "idx_analise_data_analise" ON "analise_ativos" USING btree ("data_analise");--> statement-breakpoint
CREATE INDEX "idx_conversas_usuario_id" ON "conversas" USING btree ("usuario_id");--> statement-breakpoint
CREATE INDEX "idx_conversas_usuario_atualizada" ON "conversas" USING btree ("usuario_id","atualizada_em");--> statement-breakpoint
CREATE INDEX "idx_notificacoes_usuario_id" ON "notificacoes" USING btree ("usuario_id");--> statement-breakpoint
CREATE INDEX "idx_notificacoes_usuario_criada" ON "notificacoes" USING btree ("usuario_id","criada_em");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_extraidos_usuario_identificador" ON "relatorios_extraidos" USING btree ("usuario_id","identificador");--> statement-breakpoint
CREATE INDEX "idx_extraidos_usuario_id" ON "relatorios_extraidos" USING btree ("usuario_id");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_insights_usuario_identificador" ON "relatorios_insights" USING btree ("usuario_id","identificador");--> statement-breakpoint
CREATE INDEX "idx_insights_usuario_id" ON "relatorios_insights" USING btree ("usuario_id");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_relatorios_usuario_identificador" ON "relatorios_metadados" USING btree ("usuario_id","identificador");--> statement-breakpoint
CREATE INDEX "idx_relatorios_usuario_id" ON "relatorios_metadados" USING btree ("usuario_id");--> statement-breakpoint
CREATE INDEX "idx_relatorios_mes_referencia" ON "relatorios_metadados" USING btree ("usuario_id","mes_referencia");--> statement-breakpoint
CREATE INDEX "idx_tarefas_status" ON "tarefas_background" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_tarefas_usuario_id" ON "tarefas_background" USING btree ("usuario_id");--> statement-breakpoint
CREATE INDEX "idx_tarefas_iniciado_em" ON "tarefas_background" USING btree ("iniciado_em");