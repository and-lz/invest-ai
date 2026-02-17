import { z } from "zod/v4";

// ============================================================
// Zod schemas para insights gerados pela Gemini API.
// ============================================================

export const InsightCategoriaEnum = z.enum([
  "performance_positiva",
  "performance_negativa",
  "acao_recomendada",
  "risco",
  "oportunidade",
  "diversificacao",
  "custos",
]);

export const InsightPrioridadeEnum = z.enum(["alta", "media", "baixa"]);

export const StatusAcaoEnum = z.enum(["pendente", "concluida", "ignorada"]);

export const InsightSchema = z.object({
  titulo: z.string(),
  descricao: z.string(),
  categoria: InsightCategoriaEnum,
  prioridade: InsightPrioridadeEnum,
  ativosRelacionados: z.array(z.string()),
  acaoSugerida: z.string().nullable(),
  impactoEstimado: z.string().nullable(),
  // @deprecated - usar statusAcao ao invés de concluida
  concluida: z.boolean().optional().default(false),
  statusAcao: StatusAcaoEnum.optional().default("pendente"),
});

export const AlertaSchema = z.object({
  tipo: z.enum(["urgente", "atencao", "informativo"]),
  mensagem: z.string(),
});

export const InsightsResponseSchema = z.object({
  mesReferencia: z.string(),
  dataGeracao: z
    .string()
    .describe("Data atual no formato YYYY-MM-DD (data em que os insights foram gerados)"),
  resumoExecutivo: z.string().describe("Paragrafo resumindo a saude geral da carteira"),
  insights: z.array(InsightSchema),
  alertas: z.array(AlertaSchema),
  recomendacoesLongoPrazo: z.array(z.string()),
});

// ---- Metadata (lightweight projection for listing) ----

export const InsightsMetadataSchema = z.object({
  identificador: z.string(),
  dataGeracao: z.string(),
  mesReferencia: z.string(),
  totalInsights: z.number(),
  totalAlertas: z.number(),
  atualizadoEm: z.string(),
});

// ---- Tipos inferidos ----

export type InsightsResponse = z.infer<typeof InsightsResponseSchema>;
export type Insight = z.infer<typeof InsightSchema>;
export type Alerta = z.infer<typeof AlertaSchema>;
export type StatusAcao = z.infer<typeof StatusAcaoEnum>;
export type InsightsMetadata = z.infer<typeof InsightsMetadataSchema>;
