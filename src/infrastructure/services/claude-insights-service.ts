import type Anthropic from "@anthropic-ai/sdk";
import { toJSONSchema } from "zod/v4";
import type { InsightsService } from "@/domain/interfaces/extraction-service";
import type { RelatorioExtraido } from "@/schemas/report-extraction.schema";
import type { InsightsResponse } from "@/schemas/insights.schema";
import { InsightsResponseSchema } from "@/schemas/insights.schema";
import { ClaudeApiError } from "@/domain/errors/app-errors";
import {
  SYSTEM_PROMPT_INSIGHTS,
  INSTRUCAO_USUARIO_INSIGHTS,
  SYSTEM_PROMPT_INSIGHTS_CONSOLIDADO,
  INSTRUCAO_USUARIO_INSIGHTS_CONSOLIDADO,
} from "@/lib/prompt-insights-manual";
import { CLAUDE_MODEL_INSIGHTS, CLAUDE_MAX_TOKENS_INSIGHTS } from "@/lib/claude-config";

export class ClaudeInsightsService implements InsightsService {
  constructor(private readonly anthropicClient: Anthropic) {}

  async gerarInsights(
    relatorioAtual: RelatorioExtraido,
    relatorioAnterior: RelatorioExtraido | null,
  ): Promise<InsightsResponse> {
    try {
      const dadosParaAnalise = {
        relatorioAtual,
        relatorioAnterior: relatorioAnterior ?? "Nao disponivel (primeiro relatorio)",
      };

      const esquemaJson = toJSONSchema(InsightsResponseSchema);
      const promptComSchema = this.construirPromptComSchema(
        INSTRUCAO_USUARIO_INSIGHTS,
        esquemaJson as Record<string, unknown>,
        dadosParaAnalise,
      );

      const resposta = await this.anthropicClient.messages.create({
        model: CLAUDE_MODEL_INSIGHTS,
        max_tokens: CLAUDE_MAX_TOKENS_INSIGHTS,
        system: SYSTEM_PROMPT_INSIGHTS,
        messages: [
          {
            role: "user",
            content: promptComSchema,
          },
        ],
      });

      const conteudoResposta = resposta.content[0];
      if (!conteudoResposta || conteudoResposta.type !== "text") {
        throw new ClaudeApiError("Resposta da Claude API nao contem texto");
      }

      const textoJson = this.extrairJsonDaResposta(conteudoResposta.text);
      const dadosBrutos: unknown = JSON.parse(textoJson);
      const resultado = InsightsResponseSchema.safeParse(dadosBrutos);

      if (!resultado.success) {
        throw new ClaudeApiError(
          `Insights nao correspondem ao schema: ${JSON.stringify(resultado.error.issues.slice(0, 5))}`,
        );
      }

      return resultado.data;
    } catch (erro) {
      if (erro instanceof ClaudeApiError) throw erro;

      throw new ClaudeApiError(
        `Falha na geracao de insights via Claude API: ${erro instanceof Error ? erro.message : String(erro)}`,
      );
    }
  }

  async gerarInsightsConsolidados(
    todosRelatorios: RelatorioExtraido[],
  ): Promise<InsightsResponse> {
    try {
      const dadosParaAnalise = {
        quantidadeMeses: todosRelatorios.length,
        relatorios: todosRelatorios,
      };

      const esquemaJson = toJSONSchema(InsightsResponseSchema);
      const promptComSchema = this.construirPromptComSchema(
        INSTRUCAO_USUARIO_INSIGHTS_CONSOLIDADO,
        esquemaJson as Record<string, unknown>,
        dadosParaAnalise,
      );

      const resposta = await this.anthropicClient.messages.create({
        model: CLAUDE_MODEL_INSIGHTS,
        max_tokens: CLAUDE_MAX_TOKENS_INSIGHTS,
        system: SYSTEM_PROMPT_INSIGHTS_CONSOLIDADO,
        messages: [
          {
            role: "user",
            content: promptComSchema,
          },
        ],
      });

      const conteudoResposta = resposta.content[0];
      if (!conteudoResposta || conteudoResposta.type !== "text") {
        throw new ClaudeApiError("Resposta da Claude API nao contem texto");
      }

      const textoJson = this.extrairJsonDaResposta(conteudoResposta.text);
      const dadosBrutos: unknown = JSON.parse(textoJson);
      const resultado = InsightsResponseSchema.safeParse(dadosBrutos);

      if (!resultado.success) {
        throw new ClaudeApiError(
          `Insights consolidados nao correspondem ao schema: ${JSON.stringify(resultado.error.issues.slice(0, 5))}`,
        );
      }

      return resultado.data;
    } catch (erro) {
      if (erro instanceof ClaudeApiError) throw erro;

      throw new ClaudeApiError(
        `Falha na geracao de insights consolidados via Claude API: ${erro instanceof Error ? erro.message : String(erro)}`,
      );
    }
  }

  private construirPromptComSchema(
    instrucaoOriginal: string,
    esquemaJson: Record<string, unknown>,
    dadosParaAnalise: Record<string, unknown>,
  ): string {
    let prompt = instrucaoOriginal;

    prompt += `\n\n📋 SCHEMA JSON DA RESPOSTA (OBRIGATÓRIO - SIGA EXATAMENTE):\n`;
    prompt += "```json\n";
    prompt += JSON.stringify(esquemaJson, null, 2);
    prompt += "\n```\n\n";

    prompt += "📊 DADOS DA CARTEIRA:\n";
    prompt += "```json\n";
    prompt += JSON.stringify(dadosParaAnalise, null, 2);
    prompt += "\n```";

    return prompt;
  }

  private extrairJsonDaResposta(texto: string): string {
    const correspondenciaBloco = texto.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (correspondenciaBloco?.[1]) {
      return correspondenciaBloco[1].trim();
    }

    const inicioObjeto = texto.indexOf("{");
    const fimObjeto = texto.lastIndexOf("}");
    if (inicioObjeto !== -1 && fimObjeto !== -1) {
      return texto.slice(inicioObjeto, fimObjeto + 1);
    }

    return texto;
  }
}
