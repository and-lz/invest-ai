import type Anthropic from "@anthropic-ai/sdk";
import type { ExtractionService } from "@/domain/interfaces/extraction-service";
import type { RelatorioExtraido } from "@/schemas/report-extraction.schema";
import { RelatorioExtraidoSchema } from "@/schemas/report-extraction.schema";
import { ClaudeApiError, PdfParsingError } from "@/domain/errors/app-errors";

const SYSTEM_PROMPT_EXTRACAO = `Voce e um especialista em analise de relatorios financeiros de investimentos brasileiros.

Sua tarefa e extrair TODOS os dados estruturados do relatorio consolidado de rentabilidade do Inter Prime.

INSTRUCOES IMPORTANTES:
1. Extraia TODOS os valores numericos com precisao. Valores monetarios devem ser convertidos para centavos (inteiros). Ex: R$ 415.332,91 = 41533291
2. Percentuais devem ser numeros decimais. Ex: 14,56% = 14.56
3. Para o campo mesReferencia, identifique o mes/ano de referencia do relatorio no formato YYYY-MM
4. Extraia TODOS os ativos listados na posicao detalhada, nao pule nenhum
5. Para eventos financeiros (dividendos, JCP), extraia cada um individualmente
6. Se um campo nao existir no relatorio, use null
7. Mantenha a precisao dos nomes de ativos e codigos exatamente como aparecem no relatorio
8. Para a evolucao de alocacao, extraia os dados dos ultimos meses mostrados no grafico
9. Para rentabilidades mensais, extraia a tabela completa com todos os anos e meses disponiveis
10. Categorize as estrategias exatamente como aparecem: Liquidez, Pos-fixado, Inflacao, Multimercado, Alternativos, Renda Variavel, Global, Fundos Listados, Outros
11. Para movimentacoes, extraia cada transacao individual com data, tipo, ativo e valor
12. Moeda padrao e BRL

Retorne os dados no formato JSON seguindo exatamente o schema fornecido.`;

export class ClaudePdfExtractionService implements ExtractionService {
  constructor(private readonly anthropicClient: Anthropic) {}

  async extrairDadosDoRelatorio(pdfBase64: string): Promise<RelatorioExtraido> {
    try {
      const resposta = await this.anthropicClient.messages.create({
        model: "claude-sonnet-4-5-20250514",
        max_tokens: 16384,
        system: SYSTEM_PROMPT_EXTRACAO,
        messages: [
          {
            role: "user",
            content: [
              {
                type: "document",
                source: {
                  type: "base64",
                  media_type: "application/pdf",
                  data: pdfBase64,
                },
              },
              {
                type: "text",
                text: "Extraia todos os dados estruturados deste relatorio consolidado de rentabilidade de investimentos. Retorne APENAS o JSON valido, sem texto adicional. Siga o schema com extrema precisao.",
              },
            ],
          },
        ],
      });

      const conteudoResposta = resposta.content[0];
      if (!conteudoResposta || conteudoResposta.type !== "text") {
        throw new PdfParsingError("Resposta da Claude API nao contem texto");
      }

      const textoJson = this.extrairJsonDaResposta(conteudoResposta.text);
      const dadosBrutos: unknown = JSON.parse(textoJson);
      const resultado = RelatorioExtraidoSchema.safeParse(dadosBrutos);

      if (!resultado.success) {
        throw new PdfParsingError(
          `Dados extraidos nao correspondem ao schema: ${JSON.stringify(resultado.error.issues.slice(0, 5))}`,
        );
      }

      return resultado.data;
    } catch (erro) {
      if (erro instanceof PdfParsingError) throw erro;

      throw new ClaudeApiError(
        `Falha na extracao via Claude API: ${erro instanceof Error ? erro.message : String(erro)}`,
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
