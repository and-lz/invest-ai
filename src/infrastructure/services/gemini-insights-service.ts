import { GoogleGenerativeAI } from "@google/generative-ai";
import type { InsightsService } from "@/domain/interfaces/extraction-service";
import type { RelatorioExtraido } from "@/schemas/report-extraction.schema";
import type { InsightsResponse } from "@/schemas/insights.schema";
import { InsightsResponseSchema } from "@/schemas/insights.schema";
import { ClaudeApiError } from "@/domain/errors/app-errors";
import { SYSTEM_PROMPT_INSIGHTS, INSTRUCAO_USUARIO_INSIGHTS } from "@/lib/prompt-insights-manual";

/**
 * Serviço de geração de insights usando Google Gemini 2.5 Flash
 *
 * Vantagens sobre Claude:
 * - Rate limits generosos: 1500 requests/dia (gratuito)
 * - Custo: GRATUITO no tier gratuito, depois $0.30/1M output tokens
 * - Qualidade de análise comparável ao Claude Haiku
 * - Velocidade superior
 *
 * Rate limits (tier gratuito):
 * - 1500 requests por dia
 * - 15 requests por minuto
 * - 4M tokens por minuto
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
        throw new ClaudeApiError("Resposta do Gemini API não contém texto");
      }

      const dadosBrutos: unknown = JSON.parse(textoResposta);
      const validacao = InsightsResponseSchema.safeParse(dadosBrutos);

      if (!validacao.success) {
        throw new ClaudeApiError(
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
      if (erro instanceof ClaudeApiError) throw erro;

      throw new ClaudeApiError(
        `Falha na geração de insights via Gemini API: ${erro instanceof Error ? erro.message : String(erro)}`,
      );
    }
  }

  private construirPrompt(dadosParaAnalise: Record<string, unknown>): string {
    let prompt = INSTRUCAO_USUARIO_INSIGHTS;

    prompt += "\n\n📊 DADOS DA CARTEIRA:\n";
    prompt += "```json\n";
    prompt += JSON.stringify(dadosParaAnalise, null, 2);
    prompt += "\n```\n\n";

    prompt += "⚠️  REGRAS CRÍTICAS:\n";
    prompt += "- Retorne APENAS o JSON válido, sem texto adicional ou markdown\n";
    prompt += "- Insights devem ser práticos e acionáveis para o investidor\n";
    prompt += "- Use linguagem acessível, evite jargões técnicos excessivos\n";
    prompt += "- Compare com o mês anterior quando disponível para identificar tendências\n";
    prompt += "- Destaque riscos de concentração e oportunidades de diversificação\n";

    return prompt;
  }
}
