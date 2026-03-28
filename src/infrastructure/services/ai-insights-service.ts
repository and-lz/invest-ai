import { toJSONSchema } from "zod/v4";
import type { InsightsService } from "@/domain/interfaces/extraction-service";
import type { ProvedorAi } from "@/domain/interfaces/ai-provider";
import type { RelatorioExtraido } from "@/schemas/report-extraction.schema";
import type { InsightsResponse } from "@/schemas/insights.schema";
import { InsightsResponseSchema } from "@/schemas/insights.schema";
import { AiApiError } from "@/domain/errors/app-errors";
import {
  SYSTEM_PROMPT_INSIGHTS,
  INSTRUCAO_USUARIO_INSIGHTS,
  SYSTEM_PROMPT_INSIGHTS_CONSOLIDADO,
  INSTRUCAO_USUARIO_INSIGHTS_CONSOLIDADO,
} from "@/lib/insights-prompts";
import {
  serializarRelatorioMarkdown,
  serializarRelatoriosConsolidadoMarkdown,
} from "@/lib/serialize-report-markdown";

/**
 * Servico de geracao de insights usando ProvedorAi.
 * Responsabilidade: construir prompts + validar schema.
 * Criacao de cliente, log de tokens e classificacao de erros ficam no ProvedorAi.
 */
export class AiInsightsService implements InsightsService {
  constructor(private readonly provedor: ProvedorAi) {}

  async gerarInsights(
    relatorioAtual: RelatorioExtraido,
    relatorioAnterior: RelatorioExtraido | null,
  ): Promise<InsightsResponse> {
    const prompt = this.construirPrompt(relatorioAtual, relatorioAnterior);

    const resposta = await this.provedor.gerar({
      instrucaoSistema: SYSTEM_PROMPT_INSIGHTS,
      mensagens: [
        {
          papel: "usuario",
          partes: [{ tipo: "texto", dados: prompt }],
        },
      ],
      temperatura: 0.7,
      formatoResposta: "json",
    });

    const dadosBrutos = this.parseJsonSeguro(resposta.texto);
    const validacao = InsightsResponseSchema.safeParse(dadosBrutos);

    if (!validacao.success) {
      throw new AiApiError(
        `Insights nao correspondem ao schema: ${JSON.stringify(validacao.error.issues.slice(0, 5))}`,
      );
    }

    // Sobrescrever dataGeracao com a data atual do sistema para garantir precisao
    const dataAtual = new Date().toISOString().split("T")[0] ?? "";
    return {
      ...validacao.data,
      dataGeracao: dataAtual,
    };
  }

  async gerarInsightsConsolidados(todosRelatorios: RelatorioExtraido[]): Promise<InsightsResponse> {
    const prompt = this.construirPromptConsolidado(todosRelatorios);

    const resposta = await this.provedor.gerar({
      instrucaoSistema: SYSTEM_PROMPT_INSIGHTS_CONSOLIDADO,
      mensagens: [
        {
          papel: "usuario",
          partes: [{ tipo: "texto", dados: prompt }],
        },
      ],
      temperatura: 0.7,
      formatoResposta: "json",
    });

    const dadosBrutos = this.parseJsonSeguro(resposta.texto);
    const validacao = InsightsResponseSchema.safeParse(dadosBrutos);

    if (!validacao.success) {
      throw new AiApiError(
        `Insights consolidados nao correspondem ao schema: ${JSON.stringify(validacao.error.issues.slice(0, 5))}`,
      );
    }

    // Sobrescrever dataGeracao com a data atual do sistema para garantir precisao
    const dataAtual = new Date().toISOString().split("T")[0] ?? "";
    return {
      ...validacao.data,
      dataGeracao: dataAtual,
    };
  }

  private parseJsonSeguro(texto: string): unknown {
    try {
      return JSON.parse(texto);
    } catch {
      throw new AiApiError(`Resposta nao e JSON valido: ${texto.substring(0, 200)}`);
    }
  }

  private construirPrompt(
    relatorioAtual: RelatorioExtraido,
    relatorioAnterior: RelatorioExtraido | null,
  ): string {
    const esquemaJson = toJSONSchema(InsightsResponseSchema);

    const dadosAtualMarkdown = serializarRelatorioMarkdown(relatorioAtual);
    const dadosAnteriorMarkdown = relatorioAnterior
      ? serializarRelatorioMarkdown(relatorioAnterior)
      : "Não disponível (primeiro relatório)";

    let prompt = INSTRUCAO_USUARIO_INSIGHTS;

    prompt += "\n\n📋 SCHEMA JSON DA RESPOSTA (OBRIGATÓRIO):\n";
    prompt += "```json\n";
    prompt += JSON.stringify(esquemaJson, null, 2);
    prompt += "\n```\n\n";

    prompt += "📊 DADOS DA CARTEIRA:\n\n";
    prompt += "### Relatório Atual:\n\n";
    prompt += dadosAtualMarkdown;
    prompt += "\n\n### Relatório Anterior:\n\n";
    prompt += dadosAnteriorMarkdown;
    prompt += "\n\n";

    prompt += "⚠️  REGRAS CRÍTICAS:\n";
    prompt += "- Retorne APENAS o JSON válido, sem texto adicional ou markdown\n";
    prompt += "- Siga EXATAMENTE o schema JSON fornecido acima\n";
    prompt += "- Insights devem ser práticos e acionáveis para o investidor\n";
    prompt += "- Use linguagem acessível, evite jargões técnicos excessivos\n";
    prompt += "- Compare com o mês anterior quando disponível para identificar tendências\n";
    prompt += "- Destaque riscos de concentração e oportunidades de diversificação\n";
    prompt +=
      "- Os campos concluida e statusAcao são controle do usuário: SEMPRE use concluida=false e statusAcao='pendente'\n";

    return prompt;
  }

  private construirPromptConsolidado(todosRelatorios: RelatorioExtraido[]): string {
    const esquemaJson = toJSONSchema(InsightsResponseSchema);

    const dadosMarkdown = serializarRelatoriosConsolidadoMarkdown(todosRelatorios);

    let prompt = INSTRUCAO_USUARIO_INSIGHTS_CONSOLIDADO;

    prompt += "\n\n📋 SCHEMA JSON DA RESPOSTA (OBRIGATÓRIO):\n";
    prompt += "```json\n";
    prompt += JSON.stringify(esquemaJson, null, 2);
    prompt += "\n```\n\n";

    prompt += "📊 DADOS HISTÓRICOS DA CARTEIRA:\n\n";
    prompt += dadosMarkdown;
    prompt += "\n\n";

    prompt += "⚠️  REGRAS CRÍTICAS:\n";
    prompt += "- Retorne APENAS o JSON válido, sem texto adicional ou markdown\n";
    prompt += "- Siga EXATAMENTE o schema JSON fornecido acima\n";
    prompt += "- Analise a EVOLUÇÃO ao longo de todos os meses disponíveis\n";
    prompt += "- Identifique tendências, padrões e decisões passadas boas/ruins\n";
    prompt += "- Use linguagem acessível, evite jargões técnicos excessivos\n";
    prompt += "- No campo mesReferencia, use 'consolidado' como valor\n";
    prompt +=
      "- Os campos concluida e statusAcao são controle do usuário: SEMPRE use concluida=false e statusAcao='pendente'\n";

    return prompt;
  }
}
