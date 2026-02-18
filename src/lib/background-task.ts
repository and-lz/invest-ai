import { db } from "@/lib/db";
import { tarefasBackground as tabelaTarefas } from "@/lib/schema";
import { eq, and, desc } from "drizzle-orm";

// ============================================================
// Funções para tarefas de processamento em background.
// Persiste status no PostgreSQL via Drizzle (Neon).
// ============================================================

// Re-exportar tipos e funções compartilhadas do arquivo tarefa-descricao.ts
// (separado para permitir uso em componentes cliente sem importar filesystem)
export {
  TipoTarefaEnum,
  StatusTarefaEnum,
  TarefaBackgroundSchema,
  LABELS_TIPO_TAREFA,
  descreverTarefa,
  type TarefaBackground,
  type TipoTarefa,
  type StatusTarefa,
} from "@/lib/task-description";

import type { TarefaBackground } from "@/lib/task-description";
import { TarefaBackgroundSchema } from "@/lib/task-description";

export async function salvarTarefa(tarefa: TarefaBackground): Promise<void> {
  await db
    .insert(tabelaTarefas)
    .values({
      identificador: tarefa.identificador,
      usuarioId: tarefa.usuarioId,
      tipo: tarefa.tipo,
      status: tarefa.status,
      iniciadoEm: new Date(tarefa.iniciadoEm),
      concluidoEm: tarefa.concluidoEm ? new Date(tarefa.concluidoEm) : undefined,
      erro: tarefa.erro,
      descricaoResultado: tarefa.descricaoResultado,
      urlRedirecionamento: tarefa.urlRedirecionamento,
      tentativaAtual:
        tarefa.tentativaAtual !== undefined ? String(tarefa.tentativaAtual) : undefined,
      maximoTentativas:
        tarefa.maximoTentativas !== undefined ? String(tarefa.maximoTentativas) : undefined,
      erroRecuperavel: tarefa.erroRecuperavel,
      proximaTentativaEm: tarefa.proximaTentativaEm
        ? new Date(tarefa.proximaTentativaEm)
        : undefined,
      parametros: tarefa.parametros as Record<string, string> | undefined,
      canceladaEm: tarefa.canceladaEm ? new Date(tarefa.canceladaEm) : undefined,
      canceladaPor: tarefa.canceladaPor,
    })
    .onConflictDoUpdate({
      target: [tabelaTarefas.identificador],
      set: {
        usuarioId: tarefa.usuarioId,
        status: tarefa.status,
        concluidoEm: tarefa.concluidoEm ? new Date(tarefa.concluidoEm) : undefined,
        erro: tarefa.erro,
        descricaoResultado: tarefa.descricaoResultado,
        urlRedirecionamento: tarefa.urlRedirecionamento,
        tentativaAtual:
          tarefa.tentativaAtual !== undefined ? String(tarefa.tentativaAtual) : undefined,
        maximoTentativas:
          tarefa.maximoTentativas !== undefined ? String(tarefa.maximoTentativas) : undefined,
        erroRecuperavel: tarefa.erroRecuperavel,
        proximaTentativaEm: tarefa.proximaTentativaEm
          ? new Date(tarefa.proximaTentativaEm)
          : undefined,
        parametros: tarefa.parametros as Record<string, string> | undefined,
        canceladaEm: tarefa.canceladaEm ? new Date(tarefa.canceladaEm) : undefined,
        canceladaPor: tarefa.canceladaPor,
      },
    });
}

export async function lerTarefa(identificador: string): Promise<TarefaBackground | null> {
  const rows = await db
    .select()
    .from(tabelaTarefas)
    .where(eq(tabelaTarefas.identificador, identificador))
    .limit(1);

  if (rows.length === 0) return null;

  const row = rows[0]!;
  const resultado = TarefaBackgroundSchema.safeParse({
    identificador: row.identificador,
    usuarioId: row.usuarioId ?? undefined,
    tipo: row.tipo,
    status: row.status,
    iniciadoEm: row.iniciadoEm.toISOString(),
    concluidoEm: row.concluidoEm?.toISOString(),
    erro: row.erro ?? undefined,
    descricaoResultado: row.descricaoResultado ?? undefined,
    urlRedirecionamento: row.urlRedirecionamento ?? undefined,
    tentativaAtual:
      row.tentativaAtual !== null ? Number(row.tentativaAtual) : undefined,
    maximoTentativas:
      row.maximoTentativas !== null ? Number(row.maximoTentativas) : undefined,
    erroRecuperavel: row.erroRecuperavel ?? undefined,
    proximaTentativaEm: row.proximaTentativaEm?.toISOString(),
    parametros: row.parametros ?? undefined,
    canceladaEm: row.canceladaEm?.toISOString(),
    canceladaPor: row.canceladaPor ?? undefined,
  });

  if (!resultado.success) {
    console.warn(`[TarefaBackground] Dados invalidos para ${identificador}:`, resultado.error);
    return null;
  }

  return resultado.data;
}

/**
 * Cancela uma tarefa em andamento.
 * Marca como "cancelada" no banco de dados.
 */
export async function cancelarTarefa(
  identificador: string,
  canceladaPor: "usuario" | "timeout" = "usuario",
): Promise<boolean> {
  const tarefaAtual = await lerTarefa(identificador);

  if (!tarefaAtual || tarefaAtual.status !== "processando") {
    return false;
  }

  const tarefaCancelada: TarefaBackground = {
    ...tarefaAtual,
    status: "cancelada",
    concluidoEm: new Date().toISOString(),
    canceladaEm: new Date().toISOString(),
    canceladaPor,
  };

  await salvarTarefa(tarefaCancelada);
  return true;
}

/**
 * Lists all active ("processando") tasks for a given user.
 * Used by the Activity Center to poll active tasks from the DB
 * instead of relying on localStorage.
 */
export async function listActiveTasksByUser(
  usuarioId: string,
): Promise<TarefaBackground[]> {
  const rows = await db
    .select()
    .from(tabelaTarefas)
    .where(
      and(
        eq(tabelaTarefas.usuarioId, usuarioId),
        eq(tabelaTarefas.status, "processando"),
      ),
    )
    .orderBy(desc(tabelaTarefas.iniciadoEm));

  const tarefas: TarefaBackground[] = [];

  for (const row of rows) {
    const resultado = TarefaBackgroundSchema.safeParse({
      identificador: row.identificador,
      usuarioId: row.usuarioId ?? undefined,
      tipo: row.tipo,
      status: row.status,
      iniciadoEm: row.iniciadoEm.toISOString(),
      concluidoEm: row.concluidoEm?.toISOString(),
      erro: row.erro ?? undefined,
      descricaoResultado: row.descricaoResultado ?? undefined,
      urlRedirecionamento: row.urlRedirecionamento ?? undefined,
      tentativaAtual:
        row.tentativaAtual !== null ? Number(row.tentativaAtual) : undefined,
      maximoTentativas:
        row.maximoTentativas !== null ? Number(row.maximoTentativas) : undefined,
      erroRecuperavel: row.erroRecuperavel ?? undefined,
      proximaTentativaEm: row.proximaTentativaEm?.toISOString(),
      parametros: row.parametros ?? undefined,
      canceladaEm: row.canceladaEm?.toISOString(),
      canceladaPor: row.canceladaPor ?? undefined,
    });

    if (resultado.success) {
      tarefas.push(resultado.data);
    }
  }

  return tarefas;
}
