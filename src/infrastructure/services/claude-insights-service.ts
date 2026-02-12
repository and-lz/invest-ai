import type Anthropic from "@anthropic-ai/sdk";
import type { InsightsService } from "@/domain/interfaces/extraction-service";
import type { RelatorioExtraido } from "@/schemas/report-extraction.schema";
import type { InsightsResponse } from "@/schemas/insights.schema";
import { InsightsResponseSchema } from "@/schemas/insights.schema";
import { ClaudeApiError } from "@/domain/errors/app-errors";
import { SYSTEM_PROMPT_INSIGHTS, INSTRUCAO_USUARIO_INSIGHTS } from "@/lib/prompt-insights-manual";

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

      const resposta = await this.anthropicClient.messages.create({
        model: "claude-sonnet-4-5-20250514",
        max_tokens: 8192,
        system: SYSTEM_PROMPT_INSIGHTS,
        messages: [
          {
            role: "user",
            content: `${INSTRUCAO_USUARIO_INSIGHTS}\n\n${JSON.stringify(dadosParaAnalise, null, 2)}`,
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
