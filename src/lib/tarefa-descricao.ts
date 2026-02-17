import { z } from "zod/v4";

// ============================================================
// Tipos e funções de descrição de tarefas compartilhadas
// entre client e server (sem dependências de filesystem).
// ============================================================

export const TipoTarefaEnum = z.enum([
  "upload-pdf",
  "gerar-insights",
  "gerar-insights-consolidados",
  "analisar-ativo",
]);

export const StatusTarefaEnum = z.enum(["processando", "concluido", "erro", "cancelada"]);

export const TarefaBackgroundSchema = z.object({
  identificador: z.string().uuid(),
  usuarioId: z.string().optional(),
  tipo: TipoTarefaEnum,
  status: StatusTarefaEnum,
  iniciadoEm: z.string().datetime(),
  concluidoEm: z.string().datetime().optional(),
  erro: z.string().optional(),
  descricaoResultado: z.string().optional(),
  urlRedirecionamento: z.string().optional(),
  // Campos de retry (todos opcionais para retrocompatibilidade com tarefas existentes)
  tentativaAtual: z.number().int().nonnegative().optional(),
  maximoTentativas: z.number().int().nonnegative().optional(),
  erroRecuperavel: z.boolean().optional(),
  proximaTentativaEm: z.string().datetime().optional(),
  // Contexto generico para re-despacho (ex: identificadorRelatorio para retry de insights)
  parametros: z.record(z.string(), z.string()).optional(),
  // Campos de cancelamento (opcionais para retrocompatibilidade)
  canceladaEm: z.string().datetime().optional(),
  canceladaPor: z.enum(["usuario", "timeout"]).optional(),
});

export type TarefaBackground = z.infer<typeof TarefaBackgroundSchema>;
export type TipoTarefa = z.infer<typeof TipoTarefaEnum>;
export type StatusTarefa = z.infer<typeof StatusTarefaEnum>;

/** Labels user-facing para cada tipo de tarefa */
export const LABELS_TIPO_TAREFA: Record<TipoTarefa, string> = {
  "upload-pdf": "Processando PDF",
  "gerar-insights": "Gerando insights",
  "gerar-insights-consolidados": "Gerando insights consolidados",
  "analisar-ativo": "Analisando ativo",
};

/**
 * Gera descrição contextual da tarefa usando parametros.
 * Exemplos:
 * - "Processando PDF"
 * - "Gerando insights — 2025-01"
 * - "Analisando ativo — PETR4"
 */
export function descreverTarefa(tarefa: TarefaBackground): string {
  const labelBase = LABELS_TIPO_TAREFA[tarefa.tipo];

  // Upload PDF: sem contexto adicional (parametros não disponível)
  if (tarefa.tipo === "upload-pdf") {
    return labelBase;
  }

  // Gerar insights: mostrar mês/ano do relatório
  if (tarefa.tipo === "gerar-insights" && tarefa.parametros?.identificadorRelatorio) {
    return `${labelBase} — ${tarefa.parametros.identificadorRelatorio}`;
  }

  // Insights consolidados: sem parâmetro específico
  if (tarefa.tipo === "gerar-insights-consolidados") {
    return labelBase;
  }

  // Analisar ativo: mostrar ticker
  if (tarefa.tipo === "analisar-ativo" && tarefa.parametros?.codigoAtivo) {
    return `${labelBase} — ${tarefa.parametros.codigoAtivo}`;
  }

  // Fallback: label genérico
  return labelBase;
}
