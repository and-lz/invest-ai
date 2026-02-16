import { obterFileManager } from "@/lib/container";

// ============================================================
// Schema e utilitários para tarefas de processamento em background.
// Persiste status em data/tasks/{uuid}.json (dev) ou Vercel Blob (prod).
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
} from "@/lib/tarefa-descricao";

import type { TarefaBackground } from "@/lib/tarefa-descricao";
import { TarefaBackgroundSchema } from "@/lib/tarefa-descricao";

// ---- Funções públicas ----

const SUBDIRETORIO_TAREFAS = "tasks";

export async function salvarTarefa(tarefa: TarefaBackground): Promise<void> {
  const fileManager = await obterFileManager();
  await fileManager.salvarJson(`${SUBDIRETORIO_TAREFAS}/${tarefa.identificador}.json`, tarefa);
}

export async function lerTarefa(identificador: string): Promise<TarefaBackground | null> {
  const fileManager = await obterFileManager();
  const caminhoRelativo = `${SUBDIRETORIO_TAREFAS}/${identificador}.json`;
  const existe = await fileManager.arquivoExiste(caminhoRelativo);

  if (!existe) return null;

  const dadosBrutos = await fileManager.lerJson<unknown>(caminhoRelativo);
  const resultado = TarefaBackgroundSchema.safeParse(dadosBrutos);

  if (!resultado.success) {
    console.warn(`[TarefaBackground] JSON inválido em ${caminhoRelativo}:`, resultado.error);
    return null;
  }

  return resultado.data;
}

/**
 * Cancela uma tarefa em andamento.
 * Marca como "cancelada" no storage para que o executor detecte e aborte.
 */
export async function cancelarTarefa(
  identificador: string,
  canceladaPor: "usuario" | "timeout" = "usuario",
): Promise<boolean> {
  const tarefaAtual = await lerTarefa(identificador);

  // Não existe ou já finalizou
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
