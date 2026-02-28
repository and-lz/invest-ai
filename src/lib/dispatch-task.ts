import { after } from "next/server";
import { executeBackgroundTask } from "@/lib/background-task-executor";
import type { TarefaBackground } from "@/lib/background-task";
import {
  obterGenerateInsightsUseCase,
  obterGenerateConsolidatedInsightsUseCase,
  obterAnalyzeAssetPerformanceUseCase,
  obterPlanoAcaoRepository,
  criarProvedorAi,
  resolverModeloDoUsuario,
} from "@/lib/container";
import { salvarAnaliseAtivo } from "@/lib/asset-analysis-storage";
import { EnriquecimentoAiSchema } from "@/schemas/action-plan.schema";
import { SYSTEM_PROMPT_ENRIQUECER_ACAO, buildEnrichUserPrompt } from "@/lib/enrich-action-prompt";

/**
 * Despacha a re-execucao de uma tarefa em background com base no seu tipo.
 * Usado pelo endpoint de retry para re-disparar tarefas falhadas.
 *
 * Nota: upload-pdf NAO suporta retry (buffer do PDF nao e persistido na tarefa).
 */
export function dispatchTaskByType(tarefa: TarefaBackground, usuarioId: string): boolean {
  switch (tarefa.tipo) {
    case "gerar-insights-consolidados":
      after(executeBackgroundTask({
        tarefa,
        rotuloLog: "Insights Consolidados (retry)",
        usuarioId,
        executarOperacao: async () => {
          const modelo = await resolverModeloDoUsuario(usuarioId);
          const useCase = await obterGenerateConsolidatedInsightsUseCase(modelo);
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

      after(executeBackgroundTask({
        tarefa,
        rotuloLog: "Insights (retry)",
        usuarioId,
        executarOperacao: async () => {
          const modelo = await resolverModeloDoUsuario(usuarioId);
          const useCase = await obterGenerateInsightsUseCase(modelo);
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

      after(executeBackgroundTask({
        tarefa,
        rotuloLog: "Analise Ativo (retry)",
        usuarioId,
        executarOperacao: async () => {
          const modelo = await resolverModeloDoUsuario(usuarioId);
          const useCase = await obterAnalyzeAssetPerformanceUseCase(modelo);
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

      after(executeBackgroundTask({
        tarefa,
        rotuloLog: "Enriquecer Item Plano (retry)",
        usuarioId,
        executarOperacao: async () => {
          const repository = await obterPlanoAcaoRepository();
          const modelo = await resolverModeloDoUsuario(usuarioId);
          const provider = criarProvedorAi(modelo);
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
            console.warn(
              "[Despachar] AI returned invalid JSON structure, writing fallback enrichment",
              enrichValidation.error.issues,
            );
            await repository.atualizarEnriquecimento(usuarioId, identificadorItem, {
              recomendacaoEnriquecida: textoOriginal,
              fundamentacao: "Recomendação automática indisponível no momento.",
            });
            return { descricaoResultado: "Recomendação Fortuna indisponível" };
          }

          await repository.atualizarEnriquecimento(usuarioId, identificadorItem, enrichValidation.data);

          return {
            descricaoResultado: "Recomendação Fortuna gerada",
            urlRedirecionamento: "/plano-acao",
          };
        },
        aoFalharDefinitivo: async () => {
          const repository = await obterPlanoAcaoRepository();
          await repository.atualizarEnriquecimento(usuarioId, identificadorItem, {
            recomendacaoEnriquecida: textoOriginal,
            fundamentacao: "Recomendação automática indisponível no momento.",
          });
        },
      }));
      return true;
    }

    case "upload-pdf":
      console.warn(
        `[Despachar] Tipo upload-pdf nao suporta retry (buffer do PDF nao e persistido)`,
      );
      return false;

    case "explicar-conclusoes":
      console.warn(
        `[Despachar] Tipo explicar-conclusoes nao suporta retry (parametros efemeros)`,
      );
      return false;

    default:
      console.warn(`[Despachar] Tipo desconhecido: ${tarefa.tipo}`);
      return false;
  }
}
