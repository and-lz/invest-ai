import { z } from "zod/v4";
import { LocalFileManager } from "@/infrastructure/storage/local-file-manager";
import path from "path";

// ============================================================
// Schema e utilitários para tarefas de processamento em background.
// Persiste status em data/tasks/{uuid}.json para tracking entre páginas.
// ============================================================

export const TipoTarefaEnum = z.enum([
  "upload-pdf",
  "gerar-insights",
  "gerar-insights-consolidados",
]);

export const StatusTarefaEnum = z.enum(["processando", "concluido", "erro"]);

export const TarefaBackgroundSchema = z.object({
  identificador: z.string().uuid(),
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
});

export type TarefaBackground = z.infer<typeof TarefaBackgroundSchema>;
export type TipoTarefa = z.infer<typeof TipoTarefaEnum>;
export type StatusTarefa = z.infer<typeof StatusTarefaEnum>;

// ---- File Manager (singleton lazy) ----

const SUBDIRETORIO_TAREFAS = "tasks";

function obterFileManager(): LocalFileManager {
  const diretorioDados = path.resolve(process.env.DATA_DIRECTORY ?? "./data");
  return new LocalFileManager(diretorioDados);
}

// ---- Funções públicas ----

export async function salvarTarefa(tarefa: TarefaBackground): Promise<void> {
  const fileManager = obterFileManager();
  await fileManager.salvarJson(
    `${SUBDIRETORIO_TAREFAS}/${tarefa.identificador}.json`,
    tarefa,
  );
}

export async function lerTarefa(identificador: string): Promise<TarefaBackground | null> {
  const fileManager = obterFileManager();
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
