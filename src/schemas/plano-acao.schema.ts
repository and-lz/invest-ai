import { z } from "zod/v4";

// ============================================================
// Zod schemas for the Action Plan feature.
// Users can add takeaway conclusions to their action plan,
// which get enriched by AI with contextual recommendations.
// ============================================================

export const OrigemItemPlanoEnum = z.enum([
  "takeaway-dashboard",
  "insight-acao-sugerida",
]);

export const TipoConclusaoPlanoEnum = z.enum([
  "positivo",
  "neutro",
  "atencao",
]);

export const StatusItemPlanoEnum = z.enum([
  "pendente",
  "concluida",
  "ignorada",
]);

// === Full entity ===

export const ItemPlanoAcaoSchema = z.object({
  identificador: z.string().uuid(),
  usuarioId: z.string(),

  // Original content from the source
  textoOriginal: z.string().min(1).max(500),
  tipoConclusao: TipoConclusaoPlanoEnum,
  origem: OrigemItemPlanoEnum,

  // AI-enriched recommendation
  recomendacaoEnriquecida: z.string().min(1).max(1000),
  fundamentacao: z.string().min(1).max(500),

  // Related context
  ativosRelacionados: z.array(z.string()).default([]),

  // Status tracking
  status: StatusItemPlanoEnum.default("pendente"),

  // Timestamps
  criadoEm: z.string().datetime(),
  atualizadoEm: z.string().datetime(),
  concluidoEm: z.string().datetime().nullable().default(null),
});

// === Creation (sent by client — AI enrichment happens server-side) ===

export const CriarItemPlanoSchema = z.object({
  textoOriginal: z.string().min(1).max(500),
  tipoConclusao: TipoConclusaoPlanoEnum,
  origem: OrigemItemPlanoEnum,
  ativosRelacionados: z.array(z.string()).optional().default([]),
});

// === Update (status changes only) ===

export const AtualizarItemPlanoSchema = z.object({
  status: StatusItemPlanoEnum,
});

// === AI enrichment response validation ===

export const EnriquecimentoAiSchema = z.object({
  recomendacaoEnriquecida: z.string().min(1).max(1000),
  fundamentacao: z.string().min(1).max(500),
});

// === Inferred types ===

export type ItemPlanoAcao = z.infer<typeof ItemPlanoAcaoSchema>;
export type CriarItemPlano = z.infer<typeof CriarItemPlanoSchema>;
export type AtualizarItemPlano = z.infer<typeof AtualizarItemPlanoSchema>;
export type EnriquecimentoAi = z.infer<typeof EnriquecimentoAiSchema>;
export type OrigemItemPlano = z.infer<typeof OrigemItemPlanoEnum>;
export type StatusItemPlano = z.infer<typeof StatusItemPlanoEnum>;
export type TipoConclusaoPlano = z.infer<typeof TipoConclusaoPlanoEnum>;
