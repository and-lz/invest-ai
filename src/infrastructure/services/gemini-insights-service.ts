import { GoogleGenerativeAI } from "@google/generative-ai";
import { toJSONSchema } from "zod/v4";
import type { InsightsService } from "@/domain/interfaces/extraction-service";
import type { RelatorioExtraido } from "@/schemas/report-extraction.schema";
import type { InsightsResponse } from "@/schemas/insights.schema";
import { InsightsResponseSchema } from "@/schemas/insights.schema";
import { AiApiError } from "@/domain/errors/app-errors";
import {
  SYSTEM_PROMPT_INSIGHTS,
  INSTRUCAO_USUARIO_INSIGHTS,
  SYSTEM_PROMPT_INSIGHTS_CONSOLIDADO,
  INSTRUCAO_USUARIO_INSIGHTS_CONSOLIDADO,
} from "@/lib/prompt-insights-manual";

/**
 * Serviço de geração de insights usando Google Gemini 2.5 Flash
 */
export class GeminiInsightsService implements InsightsService {
  private readonly modelo: string = "models/gemini-2.5-flash";
  private readonly client: GoogleGenerativeAI;

  constructor(apiKey: string) {
    this.client = new GoogleGenerativeAI(apiKey);
  }

  async gerarInsights(
    relatorioAtual: RelatorioExtraido,
    relatorioAnterior: RelatorioExtraido | null,
  ): Promise<InsightsResponse> {
    try {
      const model = this.client.getGenerativeModel({
        model: this.modelo,
        systemInstruction: SYSTEM_PROMPT_INSIGHTS,
        generationConfig: {
          responseMimeType: "application/json",
          temperature: 0.7, // Temperatura moderada para insights criativos mas fundamentados
        },
      });

      const dadosParaAnalise = {
        relatorioAtual,
        relatorioAnterior: relatorioAnterior ?? "Não disponível (primeiro relatório)",
      };

      const prompt = this.construirPrompt(dadosParaAnalise);

      const resultado = await model.generateContent(prompt);
      const resposta = resultado.response;
      const textoResposta = resposta.text();

      if (!textoResposta) {
        throw new AiApiError("Resposta do Gemini API não contém texto");
      }

      const dadosBrutos: unknown = JSON.parse(textoResposta);
      const validacao = InsightsResponseSchema.safeParse(dadosBrutos);

      if (!validacao.success) {
        throw new AiApiError(
          `Insights não correspondem ao schema: ${JSON.stringify(validacao.error.issues.slice(0, 5))}`,
        );
      }

      // Log de uso de tokens (se disponível)
      if (resultado.response.usageMetadata) {
        const usage = resultado.response.usageMetadata;
        console.info(
          `[Insights] Tokens: ${usage.promptTokenCount} input, ${usage.candidatesTokenCount} output`,
        );
      }

      return validacao.data;
    } catch (erro) {
      if (erro instanceof AiApiError) throw erro;

      throw new AiApiError(
        `Falha na geração de insights via Gemini API: ${erro instanceof Error ? erro.message : String(erro)}`,
      );
    }
  }

  async gerarInsightsConsolidados(
    todosRelatorios: RelatorioExtraido[],
  ): Promise<InsightsResponse> {
    try {
      const model = this.client.getGenerativeModel({
        model: this.modelo,
        systemInstruction: SYSTEM_PROMPT_INSIGHTS_CONSOLIDADO,
        generationConfig: {
          responseMimeType: "application/json",
          temperature: 0.7,
        },
      });

      const dadosParaAnalise = {
        quantidadeMeses: todosRelatorios.length,
        relatorios: todosRelatorios,
      };

      const prompt = this.construirPromptConsolidado(dadosParaAnalise);

      const resultado = await model.generateContent(prompt);
      const resposta = resultado.response;
      const textoResposta = resposta.text();

      if (!textoResposta) {
        throw new AiApiError("Resposta do Gemini API não contém texto");
      }

      const dadosBrutos: unknown = JSON.parse(textoResposta);
      const validacao = InsightsResponseSchema.safeParse(dadosBrutos);

      if (!validacao.success) {
        throw new AiApiError(
          `Insights consolidados não correspondem ao schema: ${JSON.stringify(validacao.error.issues.slice(0, 5))}`,
        );
      }

      if (resultado.response.usageMetadata) {
        const usage = resultado.response.usageMetadata;
        console.info(
          `[Insights Consolidados] Tokens: ${usage.promptTokenCount} input, ${usage.candidatesTokenCount} output`,
        );
      }

      return validacao.data;
    } catch (erro) {
      if (erro instanceof AiApiError) throw erro;

      throw new AiApiError(
        `Falha na geração de insights consolidados via Gemini API: ${erro instanceof Error ? erro.message : String(erro)}`,
      );
    }
  }

  private construirPrompt(dadosParaAnalise: Record<string, unknown>): string {
    const esquemaJson = toJSONSchema(InsightsResponseSchema);

    let prompt = INSTRUCAO_USUARIO_INSIGHTS;

    prompt += "\n\n📋 SCHEMA JSON DA RESPOSTA (OBRIGATÓRIO):\n";
    prompt += "```json\n";
    prompt += JSON.stringify(esquemaJson, null, 2);
    prompt += "\n```\n\n";

    prompt += "📊 DADOS DA CARTEIRA:\n";
    prompt += "```json\n";
    prompt += JSON.stringify(dadosParaAnalise, null, 2);
    prompt += "\n```\n\n";

    prompt += "⚠️  REGRAS CRÍTICAS:\n";
    prompt += "- Retorne APENAS o JSON válido, sem texto adicional ou markdown\n";
    prompt += "- Siga EXATAMENTE o schema JSON fornecido acima\n";
    prompt += "- Insights devem ser práticos e acionáveis para o investidor\n";
    prompt += "- Use linguagem acessível, evite jargões técnicos excessivos\n";
    prompt += "- Compare com o mês anterior quando disponível para identificar tendências\n";
    prompt += "- Destaque riscos de concentração e oportunidades de diversificação\n";
    prompt += "- Os campos concluida e statusAcao são controle do usuário: SEMPRE use concluida=false e statusAcao='pendente'\n";

    return prompt;
  }

  private construirPromptConsolidado(dadosParaAnalise: Record<string, unknown>): string {
    const esquemaJson = toJSONSchema(InsightsResponseSchema);

    let prompt = INSTRUCAO_USUARIO_INSIGHTS_CONSOLIDADO;

    prompt += "\n\n📋 SCHEMA JSON DA RESPOSTA (OBRIGATÓRIO):\n";
    prompt += "```json\n";
    prompt += JSON.stringify(esquemaJson, null, 2);
    prompt += "\n```\n\n";

    prompt += "📊 DADOS HISTÓRICOS DA CARTEIRA:\n";
    prompt += "```json\n";
    prompt += JSON.stringify(dadosParaAnalise, null, 2);
    prompt += "\n```\n\n";

    prompt += "⚠️  REGRAS CRÍTICAS:\n";
    prompt += "- Retorne APENAS o JSON válido, sem texto adicional ou markdown\n";
    prompt += "- Siga EXATAMENTE o schema JSON fornecido acima\n";
    prompt += "- Analise a EVOLUÇÃO ao longo de todos os meses disponíveis\n";
    prompt += "- Identifique tendências, padrões e decisões passadas boas/ruins\n";
    prompt += "- Use linguagem acessível, evite jargões técnicos excessivos\n";
    prompt += "- No campo mesReferencia, use 'consolidado' como valor\n";
    prompt += "- Os campos concluida e statusAcao são controle do usuário: SEMPRE use concluida=false e statusAcao='pendente'\n";

    return prompt;
  }
}
