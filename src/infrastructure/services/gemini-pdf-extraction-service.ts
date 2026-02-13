import { GoogleGenerativeAI } from "@google/generative-ai";
import { toJSONSchema } from "zod/v4";
import type { ExtractionService } from "@/domain/interfaces/extraction-service";
import type { RelatorioExtraido } from "@/schemas/report-extraction.schema";
import { RelatorioExtraidoSchema } from "@/schemas/report-extraction.schema";
import { PdfParsingError } from "@/domain/errors/app-errors";
import { SYSTEM_PROMPT_EXTRACAO, INSTRUCAO_USUARIO_EXTRACAO } from "@/lib/prompt-extracao-manual";

/**
 * Serviço de extração de PDFs usando Google Gemini 2.5 Flash
 *
 * Vantagens sobre Claude:
 * - Rate limits generosos: 1500 requests/dia (gratuito)
 * - Custo: GRATUITO no tier gratuito, depois $0.075/1M input tokens
 * - Suporte nativo a PDFs
 * - Velocidade similar ao Claude Haiku
 *
 * Rate limits (tier gratuito):
 * - 1500 requests por dia
 * - 15 requests por minuto
 * - 4M tokens por minuto
 */
export class GeminiPdfExtractionService implements ExtractionService {
  private readonly modelo: string = "models/gemini-2.5-flash";
  private readonly client: GoogleGenerativeAI;

  constructor(apiKey: string) {
    this.client = new GoogleGenerativeAI(apiKey);
  }

  async extrairDadosDoRelatorio(pdfBase64: string): Promise<RelatorioExtraido> {
    const tempoInicio = Date.now();

    try {
      console.info(`[PDF Extraction] Iniciando extração com ${this.modelo} (Gemini)`);

      const model = this.client.getGenerativeModel({
        model: this.modelo,
        systemInstruction: SYSTEM_PROMPT_EXTRACAO,
        generationConfig: {
          responseMimeType: "application/json",
          temperature: 0.1, // Baixa temperatura para extração precisa
        },
      });

      const prompt = this.construirPrompt();

      const resultado = await model.generateContent([
        {
          inlineData: {
            mimeType: "application/pdf",
            data: pdfBase64,
          },
        },
        { text: prompt },
      ]);

      const tempoDecorrido = Date.now() - tempoInicio;

      const resposta = resultado.response;
      const textoResposta = resposta.text();

      if (!textoResposta) {
        throw new PdfParsingError("Resposta do Gemini API não contém conteúdo");
      }

      const dadosBrutos: unknown = JSON.parse(textoResposta);

      // Debug: log dos dados extraídos
      console.info(
        "[PDF Extraction] Dados extraídos (primeiros 500 chars):",
        JSON.stringify(dadosBrutos, null, 2).substring(0, 500),
      );

      const validacao = RelatorioExtraidoSchema.safeParse(dadosBrutos);

      if (!validacao.success) {
        console.error(
          "[PDF Extraction] Erros de validação:",
          JSON.stringify(validacao.error.issues, null, 2),
        );
        console.error("[PDF Extraction] Dados completos:", JSON.stringify(dadosBrutos, null, 2));

        throw new PdfParsingError(
          `Dados extraídos não correspondem ao schema: ${JSON.stringify(
            validacao.error.issues,
            null,
            2,
          )}`,
        );
      }

      console.info(`[PDF Extraction] Sucesso com ${this.modelo} em ${tempoDecorrido}ms`);

      // Log de uso de tokens (se disponível)
      if (resultado.response.usageMetadata) {
        const usage = resultado.response.usageMetadata;
        console.info(
          `[PDF Extraction] Tokens: ${usage.promptTokenCount} input, ${usage.candidatesTokenCount} output`,
        );
      }

      return validacao.data;
    } catch (erro) {
      if (erro instanceof PdfParsingError) throw erro;

      throw new PdfParsingError(
        `Falha na extração via Gemini API: ${erro instanceof Error ? erro.message : String(erro)}`,
      );
    }
  }

  private construirPrompt(): string {
    let prompt = INSTRUCAO_USUARIO_EXTRACAO;

    prompt += "\n\n⚠️  REGRAS CRÍTICAS DE FORMATAÇÃO:\n\n";

    prompt +=
      '1. Valores monetários DEVEM ser objetos: { valorEmCentavos: number, moeda: "BRL" }\n';
    prompt += '   Exemplo: { valorEmCentavos: 123456, moeda: "BRL" } representa R$ 1.234,56\n\n';

    prompt += "2. Percentuais DEVEM ser objetos: { valor: number }\n";
    prompt += "   Exemplo: { valor: 12.5 } representa 12,5%\n\n";

    prompt += "3. Datas no formato YYYY-MM-DD (ISO 8601)\n";
    prompt += '   Exemplo: "2024-01-15"\n\n';

    prompt += "4. Mês de referência no formato YYYY-MM\n";
    prompt += '   Exemplo: "2024-01"\n\n';

    prompt += "5. Tipos de Ativo (use EXATAMENTE um destes valores):\n";
    prompt += "   - RENDA_FIXA\n";
    prompt += "   - ACOES\n";
    prompt += "   - FIIS\n";
    prompt += "   - BDRS\n";
    prompt += "   - CRIPTOMOEDAS\n";
    prompt += "   - FUNDOS_INVESTIMENTO\n";
    prompt += "   - PREVIDENCIA\n";
    prompt += "   - OURO\n";
    prompt += "   - CAMBIO\n";
    prompt += "   - OUTRO\n\n";

    prompt += "6. Estratégias (use EXATAMENTE um destes valores):\n";
    prompt += "   - APOSENTADORIA\n";
    prompt += "   - RESERVA_EMERGENCIA\n";
    prompt += "   - EDUCACAO\n";
    prompt += "   - IMOVEL\n";
    prompt += "   - LIBERDADE_FINANCEIRA\n";
    prompt += "   - RENDA_PASSIVA\n";
    prompt += "   - ESPECULACAO\n";
    prompt += "   - DIVERSIFICACAO\n";
    prompt += "   - PROTECAO_PATRIMONIO\n";
    prompt += "   - OUTRO\n\n";

    prompt += "7. Tipos de Evento Financeiro (use EXATAMENTE um destes valores):\n";
    prompt += "   - DIVIDENDO\n";
    prompt += "   - JCP\n";
    prompt += "   - RENDIMENTO\n";
    prompt += "   - AMORTIZACAO\n";
    prompt += "   - VENCIMENTO\n";
    prompt += "   - RESGATE\n";
    prompt += "   - APORTE\n";
    prompt += "   - OUTRO\n\n";

    prompt += "8. Tipos de Movimentação (use EXATAMENTE um destes valores):\n";
    prompt += "   - Aplicacao\n";
    prompt += "   - Resgate\n";
    prompt += "   - Dividendo\n";
    prompt += "   - JCP\n";
    prompt += "   - Rendimento\n";
    prompt += "   - Amortizacao\n";
    prompt += "   - Aluguel\n";
    prompt += "   - Outro\n\n";

    prompt += "9. TODOS os arrays podem estar vazios [] se não houver dados no PDF\n\n";

    prompt += "10. Campos opcionais (podem ser omitidos se não estiverem no PDF):\n";
    prompt += "    - codigoAtivo, categoria, subTipo, observacoes, instituicaoFinanceira\n\n";

    prompt += "\n📋 EXEMPLO COMPLETO DE JSON (siga exatamente esta estrutura):\n";
    prompt += "```json\n";
    prompt += JSON.stringify(
      {
        mesReferencia: "2024-01",
        dataGeracao: "2024-02-01",
        patrimonioTotal: { valorEmCentavos: 10000000, moeda: "BRL" },
        totalAportado: { valorEmCentavos: 8000000, moeda: "BRL" },
        rendimentoBrutoTotal: { valorEmCentavos: 123456, moeda: "BRL" },
        rendimentoLiquidoTotal: { valorEmCentavos: 98765, moeda: "BRL" },
        ativos: [
          {
            nome: "Tesouro IPCA+ 2035",
            codigoAtivo: "IPCA35",
            tipo: "RENDA_FIXA",
            valorAtual: { valorEmCentavos: 5000000, moeda: "BRL" },
            rendimentoMes: { valorEmCentavos: 50000, moeda: "BRL" },
            percentualCarteira: { valor: 50.0 },
            estrategia: "APOSENTADORIA",
          },
        ],
        eventosFinanceiros: [
          {
            tipo: "DIVIDENDO",
            descricao: "Dividendos PETR4",
            valor: { valorEmCentavos: 5000, moeda: "BRL" },
            data: "2024-01-15",
          },
        ],
        movimentacoes: [
          {
            data: "2024-01-10",
            tipoMovimentacao: "Aplicacao",
            nomeAtivo: "Tesouro IPCA+ 2035",
            codigoAtivo: "IPCA35",
            valor: { valorEmCentavos: 100000, moeda: "BRL" },
          },
        ],
        resumoPorCategoria: [],
        resumoPorEstrategia: [],
        resumoPorTipoAtivo: [],
        metricasConsolidadas: {
          rentabilidadeMes: { valor: 1.2 },
          rentabilidadeAno: { valor: 8.5 },
        },
      },
      null,
      2,
    );
    prompt += "\n```\n\n";

    prompt += "⚠️  ATENÇÃO FINAL:\n";
    prompt += "- Retorne APENAS o JSON válido, sem texto adicional antes ou depois\n";
    prompt += "- NÃO use markdown (```json) ao redor do JSON final\n";
    prompt += "- Todos os valores monetários DEVEM ser em centavos (números inteiros)\n";
    prompt += "- Todos os enums devem usar EXATAMENTE os valores listados acima\n";
    prompt += "- Se um campo obrigatório não estiver no PDF, use valores padrão sensatos\n";

    return prompt;
  }
}
