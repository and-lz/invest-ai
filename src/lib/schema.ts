import {
  pgTable,
  pgEnum,
  text,
  boolean,
  timestamp,
  jsonb,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";

// ============================================================
// Enums PostgreSQL (alinhados com Zod enums dos schemas)
// ============================================================

export const statusExtracaoEnum = pgEnum("status_extracao", [
  "pendente",
  "processando",
  "concluido",
  "erro",
]);

export const origemDadosEnum = pgEnum("origem_dados", [
  "upload-automatico",
  "importacao-manual",
]);

export const tipoNotificacaoEnum = pgEnum("tipo_notificacao", [
  "success",
  "error",
  "warning",
  "info",
]);

export const tipoTarefaEnum = pgEnum("tipo_tarefa", [
  "upload-pdf",
  "gerar-insights",
  "gerar-insights-consolidados",
  "analisar-ativo",
  "enriquecer-item-plano",
  "explicar-conclusoes",
]);

export const statusTarefaEnum = pgEnum("status_tarefa", [
  "processando",
  "concluido",
  "erro",
  "cancelada",
]);

export const identificadorPaginaEnum = pgEnum("identificador_pagina", [
  "dashboard",
  "reports",
  "insights",
  "trends",
  "desempenho",
  "aprender",
]);

// ============================================================
// Tabela: relatorios_metadados
// Substitui: data/extracted/{id}-metadata.json
// ============================================================

export const relatoriosMetadados = pgTable(
  "relatorios_metadados",
  {
    identificador: text("identificador").notNull(), // YYYY-MM
    usuarioId: text("usuario_id").notNull(),
    mesReferencia: text("mes_referencia").notNull(),
    nomeArquivoOriginal: text("nome_arquivo_original").notNull(),
    caminhoArquivoPdf: text("caminho_arquivo_pdf"), // URL do Vercel Blob
    statusExtracao: statusExtracaoEnum("status_extracao").notNull().default("pendente"),
    origemDados: origemDadosEnum("origem_dados").notNull().default("upload-automatico"),
    erroExtracao: text("erro_extracao"),
    dataUpload: timestamp("data_upload", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("idx_relatorios_usuario_identificador").on(
      table.usuarioId,
      table.identificador,
    ),
    index("idx_relatorios_usuario_id").on(table.usuarioId),
    index("idx_relatorios_mes_referencia").on(table.usuarioId, table.mesReferencia),
  ],
);

// ============================================================
// Tabela: relatorios_extraidos
// Substitui: data/extracted/{id}.json
// JSONB: RelatorioExtraido completo (229-line schema, muito complexo para normalizar)
// ============================================================

export const relatoriosExtraidos = pgTable(
  "relatorios_extraidos",
  {
    identificador: text("identificador").notNull(), // YYYY-MM
    usuarioId: text("usuario_id").notNull(),
    dados: jsonb("dados").notNull(), // RelatorioExtraido
    atualizadoEm: timestamp("atualizado_em", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("idx_extraidos_usuario_identificador").on(
      table.usuarioId,
      table.identificador,
    ),
    index("idx_extraidos_usuario_id").on(table.usuarioId),
  ],
);

// ============================================================
// Tabela: relatorios_insights
// Substitui: data/insights/{id}.json e data/insights/consolidado.json
// JSONB: InsightsResponse completo
// ============================================================

export const relatoriosInsights = pgTable(
  "relatorios_insights",
  {
    identificador: text("identificador").notNull(), // YYYY-MM ou "consolidado"
    usuarioId: text("usuario_id").notNull(),
    dados: jsonb("dados").notNull(), // InsightsResponse
    atualizadoEm: timestamp("atualizado_em", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("idx_insights_usuario_identificador").on(
      table.usuarioId,
      table.identificador,
    ),
    index("idx_insights_usuario_id").on(table.usuarioId),
  ],
);

// ============================================================
// Tabela: conversas
// Substitui: data/conversations/{userId}/index.json (FIFO queue)
// mensagens armazenadas como JSONB (max 100 mensagens por conversa)
// ============================================================

export const conversas = pgTable(
  "conversas",
  {
    identificador: text("identificador").primaryKey(), // UUID
    usuarioId: text("usuario_id").notNull(),
    titulo: text("titulo").notNull(),
    identificadorPagina: identificadorPaginaEnum("identificador_pagina").notNull(),
    mensagens: jsonb("mensagens").notNull().default("[]"), // MensagemChat[]
    criadaEm: timestamp("criada_em", { withTimezone: true }).notNull().defaultNow(),
    atualizadaEm: timestamp("atualizada_em", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("idx_conversas_usuario_id").on(table.usuarioId),
    index("idx_conversas_usuario_atualizada").on(table.usuarioId, table.atualizadaEm),
  ],
);

// ============================================================
// Tabela: notificacoes
// Substitui: data/notifications/index.json (FIFO queue de 50)
// Agora isoladas por usuário
// ============================================================

export const notificacoes = pgTable(
  "notificacoes",
  {
    identificador: text("identificador").primaryKey(), // UUID
    usuarioId: text("usuario_id").notNull(),
    tipo: tipoNotificacaoEnum("tipo").notNull(),
    titulo: text("titulo").notNull(),
    descricao: text("descricao"),
    acao: jsonb("acao"), // { label: string, url: string } | null
    visualizada: boolean("visualizada").notNull().default(false),
    criadaEm: timestamp("criada_em", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("idx_notificacoes_usuario_id").on(table.usuarioId),
    index("idx_notificacoes_usuario_criada").on(table.usuarioId, table.criadaEm),
  ],
);

// ============================================================
// Tabela: tarefas_background
// Substitui: data/tasks/{uuid}.json (um arquivo por tarefa)
// ============================================================

export const tarefasBackground = pgTable(
  "tarefas_background",
  {
    identificador: text("identificador").primaryKey(), // UUID
    usuarioId: text("usuario_id"), // nullable: retrocompatibilidade
    tipo: tipoTarefaEnum("tipo").notNull(),
    status: statusTarefaEnum("status").notNull().default("processando"),
    iniciadoEm: timestamp("iniciado_em", { withTimezone: true }).notNull().defaultNow(),
    concluidoEm: timestamp("concluido_em", { withTimezone: true }),
    erro: text("erro"),
    descricaoResultado: text("descricao_resultado"),
    urlRedirecionamento: text("url_redirecionamento"),
    tentativaAtual: text("tentativa_atual"), // armazenado como text para evitar int migration
    maximoTentativas: text("maximo_tentativas"),
    erroRecuperavel: boolean("erro_recuperavel"),
    proximaTentativaEm: timestamp("proxima_tentativa_em", { withTimezone: true }),
    parametros: jsonb("parametros"), // Record<string, string>
    canceladaEm: timestamp("cancelada_em", { withTimezone: true }),
    canceladaPor: text("cancelada_por"), // "usuario" | "timeout"
  },
  (table) => [
    index("idx_tarefas_status").on(table.status),
    index("idx_tarefas_usuario_id").on(table.usuarioId),
    index("idx_tarefas_iniciado_em").on(table.iniciadoEm),
  ],
);

// ============================================================
// Tabela: analise_ativos
// Substitui: data/asset-analysis/{ticker}.json
// Cache de 24h com TTL controlado pela aplicação via dataAnalise
// ============================================================

// ============================================================
// Tabela: itens_plano_acao
// Action plan items: takeaway conclusions enriched by AI
// with contextual investment recommendations
// ============================================================

export const statusItemPlanoEnum = pgEnum("status_item_plano", [
  "pendente",
  "concluida",
  "ignorada",
]);

export const origemItemPlanoEnum = pgEnum("origem_item_plano", [
  "takeaway-dashboard",
  "insight-acao-sugerida",
]);

export const tipoConclusaoPlanoEnum = pgEnum("tipo_conclusao_plano", [
  "positivo",
  "neutro",
  "atencao",
]);

export const itensPlanoAcao = pgTable(
  "itens_plano_acao",
  {
    identificador: text("identificador").primaryKey(), // UUID
    usuarioId: text("usuario_id").notNull(),
    textoOriginal: text("texto_original").notNull(),
    tipoConclusao: tipoConclusaoPlanoEnum("tipo_conclusao").notNull(),
    origem: origemItemPlanoEnum("origem").notNull(),
    recomendacaoEnriquecida: text("recomendacao_enriquecida"),
    fundamentacao: text("fundamentacao"),
    ativosRelacionados: jsonb("ativos_relacionados").notNull().default("[]"), // string[]
    status: statusItemPlanoEnum("status").notNull().default("pendente"),
    criadoEm: timestamp("criado_em", { withTimezone: true }).notNull().defaultNow(),
    atualizadoEm: timestamp("atualizado_em", { withTimezone: true }).notNull().defaultNow(),
    concluidoEm: timestamp("concluido_em", { withTimezone: true }),
  },
  (table) => [
    index("idx_plano_acao_usuario_id").on(table.usuarioId),
    index("idx_plano_acao_usuario_status").on(table.usuarioId, table.status),
    index("idx_plano_acao_usuario_criado").on(table.usuarioId, table.criadoEm),
  ],
);

// ============================================================
// Tabela: analise_ativos
// Substitui: data/asset-analysis/{ticker}.json
// Cache de 24h com TTL controlado pela aplicação via dataAnalise
// ============================================================

export const analiseAtivos = pgTable(
  "analise_ativos",
  {
    usuarioId: text("usuario_id").notNull(),
    codigoAtivo: text("codigo_ativo").notNull(), // UPPERCASE normalizado
    dados: jsonb("dados").notNull(), // AnaliseAtivoResponse completo
    dataAnalise: timestamp("data_analise", { withTimezone: true }).notNull(),
    atualizadoEm: timestamp("atualizado_em", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("idx_analise_usuario_ativo").on(table.usuarioId, table.codigoAtivo),
    index("idx_analise_usuario_id").on(table.usuarioId),
    index("idx_analise_data_analise").on(table.dataAnalise),
  ],
);

// ============================================================
// Tabela: configuracoes_usuario
// Armazena configuracoes sensíveis do usuario (ex: chaves de API)
// Chaves sao criptografadas antes de armazenar
// ============================================================

export const configuracoesUsuario = pgTable(
  "configuracoes_usuario",
  {
    identificador: text("identificador").notNull().primaryKey(),
    usuarioId: text("usuario_id").notNull(),
    chaveApiGemini: text("chave_api_gemini"), // Criptografada
    modeloTier: text("modelo_tier"), // "economic" | "capable"
    criadaEm: timestamp("criada_em", { withTimezone: true }).notNull().defaultNow(),
    atualizadaEm: timestamp("atualizada_em", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("idx_configuracoes_usuario_id").on(table.usuarioId),
    index("idx_configuracoes_criada").on(table.criadaEm),
  ],
);
