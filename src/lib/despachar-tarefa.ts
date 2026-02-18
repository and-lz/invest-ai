import { after } from "next/server";
import { executarTarefaEmBackground } from "@/lib/executor-tarefa-background";
import type { TarefaBackground } from "@/lib/tarefa-background";
import {
  obterGenerateInsightsUseCase,
  obterGenerateInsightsConsolidadosUseCase,
  obterAnalyzeAssetPerformanceUseCase,
  obterPlanoAcaoRepository,
  criarProvedorAi,
} from "@/lib/container";
import { salvarAnaliseAtivo } from "@/lib/analise-ativo-storage";
import { EnriquecimentoAiSchema } from "@/schemas/plano-acao.schema";
import { SYSTEM_PROMPT_ENRIQUECER_ACAO, buildEnrichUserPrompt } from "@/lib/prompt-enriquecer-acao";

/**
 * Despacha a re-execucao de uma tarefa em background com base no seu tipo.
 * Usado pelo endpoint de retry para re-disparar tarefas falhadas.
 *
 * Nota: upload-pdf NAO suporta retry (buffer do PDF nao e persistido na tarefa).
 */
export function despacharTarefaPorTipo(tarefa: TarefaBackground, usuarioId: string): boolean {
  switch (tarefa.tipo) {
    case "gerar-insights-consolidados":
      after(executarTarefaEmBackground({
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
      }));
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

      after(executarTarefaEmBackground({
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
      }));
      return true;
    }

    case "analisar-ativo": {
      const codigoAtivo = tarefa.parametros?.codigoAtivo;

      if (!codigoAtivo) {
        console.warn(
          `[Despachar] Tarefa ${tarefa.identificador} nao tem parametros.codigoAtivo para retry`,
        );
        return false;
      }

      after(executarTarefaEmBackground({
        tarefa,
        rotuloLog: "Analise Ativo (retry)",
        usuarioId,
        executarOperacao: async () => {
          const useCase = await obterAnalyzeAssetPerformanceUseCase();
          const analise = await useCase.executar({ codigoAtivo });
          await salvarAnaliseAtivo(analise, usuarioId);
          return {
            descricaoResultado: `Analise de ${codigoAtivo} concluida`,
            urlRedirecionamento: `/desempenho?ticker=${encodeURIComponent(codigoAtivo)}`,
          };
        },
      }));
      return true;
    }

    case "enriquecer-item-plano": {
      const identificadorItem = tarefa.parametros?.identificadorItem;
      const textoOriginal = tarefa.parametros?.textoOriginal;
      const tipoConclusao = tarefa.parametros?.tipoConclusao;

      if (!identificadorItem || !textoOriginal || !tipoConclusao) {
        console.warn(
          `[Despachar] Tarefa ${tarefa.identificador} nao tem parametros completos para retry`,
        );
        return false;
      }

      after(executarTarefaEmBackground({
        tarefa,
        rotuloLog: "Enriquecer Item Plano (retry)",
        usuarioId,
        executarOperacao: async () => {
          const repository = await obterPlanoAcaoRepository();
          const provider = criarProvedorAi();
          const aiResponse = await provider.gerar({
            instrucaoSistema: SYSTEM_PROMPT_ENRIQUECER_ACAO,
            mensagens: [
              {
                papel: "usuario",
                partes: [
                  {
                    tipo: "texto",
                    dados: buildEnrichUserPrompt(textoOriginal, tipoConclusao),
                  },
                ],
              },
            ],
            temperatura: 0.4,
            formatoResposta: "json",
          });

          const parsed: unknown = JSON.parse(aiResponse.texto);
          const enrichValidation = EnriquecimentoAiSchema.safeParse(parsed);

          if (!enrichValidation.success) {
            return { descricaoResultado: "Recomendação IA indisponível" };
          }

          await repository.atualizarEnriquecimento(usuarioId, identificadorItem, enrichValidation.data);

          return {
            descricaoResultado: "Recomendação IA gerada",
            urlRedirecionamento: "/plano-acao",
          };
        },
      }));
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
