import type Anthropic from "@anthropic-ai/sdk";
import type { InsightsService } from "@/domain/interfaces/extraction-service";
import type { RelatorioExtraido } from "@/schemas/report-extraction.schema";
import type { InsightsResponse } from "@/schemas/insights.schema";
import { InsightsResponseSchema } from "@/schemas/insights.schema";
import { ClaudeApiError } from "@/domain/errors/app-errors";

const SYSTEM_PROMPT_INSIGHTS = `Voce e um consultor financeiro especializado em investimentos brasileiros, com profundo conhecimento do mercado de capitais brasileiro, renda fixa, fundos imobiliarios e fundos de investimento.

Analise os dados da carteira de investimentos e forneca insights acionaveis.

DIRETRIZES:
1. Compare a rentabilidade da carteira com benchmarks (CDI, Ibovespa, IPCA)
2. Identifique ativos com performance muito acima ou abaixo da media
3. Avalie a diversificacao da carteira (concentracao por estrategia)
4. Analise a liquidez da carteira vs necessidades
5. Identifique tendencias (se dados do mes anterior disponiveis)
6. Sugira acoes concretas: rebalancear, resgatar, aplicar mais
7. Considere o cenario macroeconomico brasileiro (Selic, inflacao)
8. Avalie o risco-retorno dos ativos
9. Para recomendacoes de longo prazo, considere horizonte de 12-36 meses
10. Seja direto e pratico. Evite jargao excessivo.
11. Priorize insights por impacto financeiro potencial.
12. Responda em portugues brasileiro.

Retorne os dados no formato JSON seguindo exatamente o schema fornecido.`;

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
            content: `Analise a seguinte carteira de investimentos e gere insights detalhados. Retorne APENAS JSON valido:\n\n${JSON.stringify(dadosParaAnalise, null, 2)}`,
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
