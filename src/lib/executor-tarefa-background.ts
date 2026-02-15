import {
  salvarTarefa,
  lerTarefa,
  descreverTarefa,
  type TarefaBackground,
} from "@/lib/tarefa-background";
import { adicionarNotificacao } from "@/lib/notificacao";
import type { CriarNotificacao } from "@/lib/notificacao";
import { AppError } from "@/domain/errors/app-errors";

// ============================================================
// Executor generico de tarefas em background com retry e notificacoes.
// Substitui os 3 wrappers duplicados nos API routes.
// ============================================================

/** Resultado retornado pela operacao quando concluida com sucesso */
export interface ResultadoTarefaSucesso {
  readonly descricaoResultado: string;
  readonly urlRedirecionamento?: string;
}

/** Configuracao para executar uma tarefa em background */
export interface ConfiguracaoExecutorTarefa {
  readonly tarefa: TarefaBackground;
  readonly rotuloLog: string;
  readonly executarOperacao: () => Promise<ResultadoTarefaSucesso>;
}

const ATRASO_BASE_MILISSEGUNDOS = 2000;
const ATRASO_MAXIMO_MILISSEGUNDOS = 30_000;

function calcularAtrasoExponencial(tentativa: number): number {
  const atraso = ATRASO_BASE_MILISSEGUNDOS * Math.pow(2, tentativa);
  return Math.min(atraso, ATRASO_MAXIMO_MILISSEGUNDOS);
}

function aguardar(milissegundos: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, milissegundos));
}

/**
 * Verifica se a tarefa foi cancelada pelo usuário.
 * Lê do storage para pegar o status mais recente.
 */
async function tarefaFoiCancelada(identificadorTarefa: string): Promise<boolean> {
  const tarefaAtual = await lerTarefa(identificadorTarefa);
  return tarefaAtual?.status === "cancelada";
}

/**
 * Executa uma tarefa em background com retry automatico para erros transientes.
 *
 * - Sucesso: salva tarefa como "concluido" + cria notificacao server-side
 * - Erro transiente (recuperavel): retenta com backoff exponencial ate maximoTentativas
 * - Erro definitivo: salva tarefa como "erro" + cria notificacao de erro
 */
export async function executarTarefaEmBackground(
  configuracao: ConfiguracaoExecutorTarefa,
): Promise<void> {
  const { tarefa, rotuloLog, executarOperacao } = configuracao;
  const maximoTentativas = tarefa.maximoTentativas ?? 2;
  let tentativaAtual = tarefa.tentativaAtual ?? 0;

  for (;;) {
    // Verificar se a tarefa foi cancelada antes de executar
    const cancelada = await tarefaFoiCancelada(tarefa.identificador);
    if (cancelada) {
      console.info(
        `[${rotuloLog}] Tarefa ${tarefa.identificador} foi cancelada pelo usuario`,
      );
      return;
    }

    try {
      const resultado = await executarOperacao();

      await salvarTarefa({
        ...tarefa,
        status: "concluido",
        concluidoEm: new Date().toISOString(),
        descricaoResultado: resultado.descricaoResultado,
        urlRedirecionamento: resultado.urlRedirecionamento,
        tentativaAtual,
      });

      const descricaoTarefa = descreverTarefa(tarefa);
      await criarNotificacaoSilenciosa({
        tipo: "success",
        titulo: `${descricaoTarefa} — concluida!`,
        descricao: resultado.descricaoResultado,
        acao: resultado.urlRedirecionamento
          ? { rotulo: "Ver resultado", url: resultado.urlRedirecionamento }
          : undefined,
      });

      console.info(
        `[${rotuloLog}] Tarefa ${tarefa.identificador} concluida (tentativa ${tentativaAtual + 1})`,
      );
      return;
    } catch (erro) {
      const mensagemErro =
        erro instanceof Error ? erro.message : String(erro);
      const ehRecuperavel =
        erro instanceof AppError && erro.recuperavel;
      tentativaAtual++;

      // Pode retentar?
      if (ehRecuperavel && tentativaAtual < maximoTentativas) {
        const atrasoMilissegundos =
          calcularAtrasoExponencial(tentativaAtual);

        console.warn(
          `[${rotuloLog}] Tarefa ${tarefa.identificador} falhou (tentativa ${tentativaAtual}/${maximoTentativas}), ` +
            `retentando em ${atrasoMilissegundos}ms: ${mensagemErro}`,
        );

        await salvarTarefa({
          ...tarefa,
          tentativaAtual,
          erroRecuperavel: true,
          proximaTentativaEm: new Date(
            Date.now() + atrasoMilissegundos,
          ).toISOString(),
        });

        await aguardar(atrasoMilissegundos);
        continue;
      }

      // Falha definitiva
      const urlRetry = ehRecuperavel
        ? `/api/tasks/${tarefa.identificador}/retry`
        : undefined;

      await salvarTarefa({
        ...tarefa,
        status: "erro",
        concluidoEm: new Date().toISOString(),
        erro: mensagemErro,
        tentativaAtual,
        erroRecuperavel: ehRecuperavel,
      });

      const descricaoTarefa = descreverTarefa(tarefa);
      await criarNotificacaoSilenciosa({
        tipo: "error",
        titulo: `${descricaoTarefa} — erro`,
        descricao: mensagemErro,
        acao: urlRetry
          ? { rotulo: "Tentar novamente", url: urlRetry }
          : undefined,
      });

      console.error(
        `[${rotuloLog}] Tarefa ${tarefa.identificador} falhou definitivamente: ${mensagemErro}`,
      );
      return;
    }
  }
}

/** Cria notificacao server-side. Falha silenciosa - nunca lanca excecao. */
async function criarNotificacaoSilenciosa(
  dados: CriarNotificacao,
): Promise<void> {
  try {
    await adicionarNotificacao(dados);
  } catch (erroNotificacao) {
    console.error(
      "[ExecutorTarefa] Falha ao criar notificacao:",
      erroNotificacao,
    );
  }
}
