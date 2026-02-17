import { executarTarefaEmBackground } from "@/lib/executor-tarefa-background";
import type { TarefaBackground } from "@/lib/tarefa-background";
import {
  obterGenerateInsightsUseCase,
  obterGenerateInsightsConsolidadosUseCase,
} from "@/lib/container";

/**
 * Despacha a re-execucao de uma tarefa em background com base no seu tipo.
 * Usado pelo endpoint de retry para re-disparar tarefas falhadas.
 *
 * Nota: upload-pdf NAO suporta retry (buffer do PDF nao e persistido na tarefa).
 */
export function despacharTarefaPorTipo(tarefa: TarefaBackground, usuarioId: string): boolean {
  switch (tarefa.tipo) {
    case "gerar-insights-consolidados":
      void executarTarefaEmBackground({
        tarefa,
        rotuloLog: "Insights Consolidados (retry)",
        usuarioId,
        executarOperacao: async () => {
          const useCase = await obterGenerateInsightsConsolidadosUseCase();
          await useCase.executar();
          return {
            descricaoResultado: "Insights consolidados gerados",
            urlRedirecionamento: "/insights?mesAno=consolidado",
          };
        },
      });
      return true;

    case "gerar-insights": {
      const identificadorRelatorio = tarefa.parametros?.identificadorRelatorio;

      if (!identificadorRelatorio) {
        console.warn(
          `[Despachar] Tarefa ${tarefa.identificador} nao tem parametros.identificadorRelatorio para retry`,
        );
        return false;
      }

      const identificadorRelatorioAnterior =
        tarefa.parametros?.identificadorRelatorioAnterior || undefined;

      void executarTarefaEmBackground({
        tarefa,
        rotuloLog: "Insights (retry)",
        usuarioId,
        executarOperacao: async () => {
          const useCase = await obterGenerateInsightsUseCase();
          await useCase.executar({
            identificadorRelatorio,
            identificadorRelatorioAnterior,
          });
          return {
            descricaoResultado: `Insights para ${identificadorRelatorio} gerados`,
            urlRedirecionamento: `/insights?mesAno=${encodeURIComponent(identificadorRelatorio)}`,
          };
        },
      });
      return true;
    }

    case "upload-pdf":
      console.warn(
        `[Despachar] Tipo upload-pdf nao suporta retry (buffer do PDF nao e persistido)`,
      );
      return false;

    default:
      console.warn(`[Despachar] Tipo desconhecido: ${tarefa.tipo}`);
      return false;
  }
}
