import { GoogleGenerativeAI } from "@google/generative-ai";
import { toJSONSchema } from "zod/v4";
import type { ExtractionService } from "@/domain/interfaces/extraction-service";
import type { RelatorioExtraido } from "@/schemas/report-extraction.schema";
import { RelatorioExtraidoSchema } from "@/schemas/report-extraction.schema";
import { PdfParsingError } from "@/domain/errors/app-errors";
import { SYSTEM_PROMPT_EXTRACAO, INSTRUCAO_USUARIO_EXTRACAO } from "@/lib/prompt-extracao-manual";

/**
 * Serviço de extração de PDFs usando Google Gemini 2.5 Flash
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
    const esquemaJson = toJSONSchema(RelatorioExtraidoSchema);

    let prompt = INSTRUCAO_USUARIO_EXTRACAO;

    prompt += "\n\n📋 SCHEMA JSON (OBRIGATÓRIO - SIGA EXATAMENTE):\n";
    prompt += "```json\n";
    prompt += JSON.stringify(esquemaJson, null, 2);
    prompt += "\n```\n\n";

    prompt += "⚠️  REGRAS CRÍTICAS DE FORMATAÇÃO:\n";
    prompt += '- Valores monetários DEVEM ser objetos: { "valorEmCentavos": number, "moeda": "BRL" }\n';
    prompt += "- Percentuais DEVEM ser objetos: { \"valor\": number }\n";
    prompt += "- Datas no formato YYYY-MM-DD\n";
    prompt += "- Mês de referência no formato YYYY-MM\n";
    prompt += "- NÃO retorne valores como primitivos (números/strings simples)\n";
    prompt += "- Campos nullable podem ser null se não houver dados no PDF\n";
    prompt += "- Arrays podem estar vazios [] se não houver dados correspondentes\n";
    prompt += "- Se um campo obrigatório não estiver no PDF, use valores padrão sensatos\n\n";

    prompt += "📋 EXEMPLO RESUMIDO DA ESTRUTURA ESPERADA:\n";
    prompt += "```json\n";
    prompt += JSON.stringify(
      {
        metadados: {
          mesReferencia: "2024-01",
          dataGeracao: "2024-02-01",
          instituicao: "Inter Prime",
        },
        resumo: {
          patrimonioTotal: { valorEmCentavos: 41533291, moeda: "BRL" },
          patrimonioMesAnterior: { valorEmCentavos: 40000000, moeda: "BRL" },
          ganhosFinanceirosNoMes: { valorEmCentavos: 500000, moeda: "BRL" },
          ganhosFinanceirosMesAnterior: { valorEmCentavos: 450000, moeda: "BRL" },
          aplicacoesNoMes: { valorEmCentavos: 1000000, moeda: "BRL" },
          resgatesNoMes: { valorEmCentavos: 0, moeda: "BRL" },
          eventosFinanceirosNoMes: { valorEmCentavos: 15000, moeda: "BRL" },
          eventosFinanceirosMesAnterior: { valorEmCentavos: 12000, moeda: "BRL" },
          rentabilidadeMensal: { valor: 1.23 },
          rentabilidadeMensalAnterior: { valor: 1.1 },
          rentabilidadeAnual: { valor: 8.5 },
          rentabilidadeAnoAnterior: { valor: 7.2 },
          rentabilidadeDesdeInicio: { valor: 45.6 },
          dataInicioCarteira: "2020-03-15",
        },
        evolucaoAlocacao: [
          {
            mesAno: "2024-01",
            categorias: [
              { nomeCategoria: "Liquidez", percentualDaCarteira: { valor: 15.0 } },
              { nomeCategoria: "Pos-fixado", percentualDaCarteira: { valor: 30.0 } },
              { nomeCategoria: "Inflacao", percentualDaCarteira: { valor: 20.0 } },
              { nomeCategoria: "Renda Variavel", percentualDaCarteira: { valor: 10.0 } },
              { nomeCategoria: "Fundos Listados", percentualDaCarteira: { valor: 5.0 } },
              { nomeCategoria: "Multimercado", percentualDaCarteira: { valor: 10.0 } },
              { nomeCategoria: "Global", percentualDaCarteira: { valor: 5.0 } },
              { nomeCategoria: "Alternativos", percentualDaCarteira: { valor: 3.0 } },
              { nomeCategoria: "Outros", percentualDaCarteira: { valor: 2.0 } },
            ],
          },
        ],
        evolucaoPatrimonial: [
          {
            mesAno: "2024-01",
            patrimonioTotal: { valorEmCentavos: 41533291, moeda: "BRL" },
            totalAportado: { valorEmCentavos: 35000000, moeda: "BRL" },
          },
        ],
        comparacaoPeriodos: [
          {
            periodo: "03 meses",
            rentabilidadeCarteira: { valor: 3.5 },
            rentabilidadeCDI: { valor: 3.2 },
            percentualDoCDI: { valor: 109.4 },
            volatilidade: { valor: 0.5 },
          },
        ],
        analiseRiscoRetorno: {
          mesesAcimaBenchmark: 30,
          mesesAbaixoBenchmark: 15,
          maiorRentabilidade: { valor: { valor: 3.2 }, mesAno: "2023-06" },
          menorRentabilidade: { valor: { valor: -0.5 }, mesAno: "2022-03" },
        },
        retornosMensais: [
          {
            ano: 2024,
            meses: [
              { mes: 1, rentabilidadeCarteira: { valor: 1.23 }, percentualDoCDI: { valor: 112.0 } },
            ],
            rentabilidadeAnual: { valor: 1.23 },
            rentabilidadeAcumulada: { valor: 45.6 },
          },
        ],
        comparacaoBenchmarks: [
          {
            periodo: "No mes",
            carteira: { valor: 1.23 },
            cdi: { valor: 1.1 },
            ibovespa: { valor: -0.5 },
            ipca: { valor: 0.4 },
          },
        ],
        rentabilidadePorCategoria: [
          { nomeCategoria: "Pos-fixado", rentabilidade12Meses: { valor: 12.5 } },
        ],
        eventosFinanceiros: [
          {
            tipoEvento: "Dividendo",
            nomeAtivo: "PETR4",
            codigoAtivo: "PETR4",
            valor: { valorEmCentavos: 5000, moeda: "BRL" },
            dataEvento: "2024-01-15",
          },
        ],
        ganhosPorEstrategia: [
          {
            nomeEstrategia: "Liquidez",
            ganhoNoMes: { valorEmCentavos: 50000, moeda: "BRL" },
            ganhoNoAno: { valorEmCentavos: 50000, moeda: "BRL" },
            ganho3Meses: { valorEmCentavos: 150000, moeda: "BRL" },
            ganho6Meses: { valorEmCentavos: 300000, moeda: "BRL" },
            ganho12Meses: { valorEmCentavos: 600000, moeda: "BRL" },
            ganhoDesdeInicio: { valorEmCentavos: 2000000, moeda: "BRL" },
          },
        ],
        faixasLiquidez: [
          {
            descricaoPeriodo: "0 a 1",
            diasMinimo: 0,
            diasMaximo: 1,
            percentualDaCarteira: { valor: 15.0 },
            valor: { valorEmCentavos: 6229994, moeda: "BRL" },
            valorAcumulado: { valorEmCentavos: 6229994, moeda: "BRL" },
            percentualAcumulado: { valor: 15.0 },
          },
        ],
        posicoesDetalhadas: [
          {
            nomeAtivo: "Tesouro IPCA+ 2035",
            codigoAtivo: "IPCA35",
            estrategia: "Inflacao",
            saldoAnterior: { valorEmCentavos: 4800000, moeda: "BRL" },
            aplicacoes: { valorEmCentavos: 100000, moeda: "BRL" },
            resgates: { valorEmCentavos: 0, moeda: "BRL" },
            eventosFinanceiros: { valorEmCentavos: 0, moeda: "BRL" },
            saldoBruto: { valorEmCentavos: 5000000, moeda: "BRL" },
            rentabilidadeMes: { valor: 1.5 },
            rentabilidade12Meses: { valor: 12.0 },
            rentabilidadeDesdeInicio: { valor: 35.0 },
            participacaoNaCarteira: { valor: 12.0 },
          },
        ],
        movimentacoes: [
          {
            data: "2024-01-10",
            tipoMovimentacao: "Aplicacao",
            nomeAtivo: "Tesouro IPCA+ 2035",
            codigoAtivo: "IPCA35",
            valor: { valorEmCentavos: 100000, moeda: "BRL" },
            descricao: "Aplicação mensal",
          },
        ],
      },
      null,
      2,
    );
    prompt += "\n```\n\n";

    prompt += "⚠️  ENUMS VÁLIDOS (use EXATAMENTE estes valores):\n\n";

    prompt += "Categorias de Alocação (nomeCategoria):\n";
    prompt += "  Liquidez, Fundos Listados, Renda Variavel, Global, Outros, Alternativos, Pos-fixado, Inflacao, Multimercado\n\n";

    prompt += "Tipos de Evento Financeiro (tipoEvento):\n";
    prompt += "  Dividendo, JCP, Rendimento, Amortizacao, Aluguel, Outro\n\n";

    prompt += "Tipos de Movimentação (tipoMovimentacao):\n";
    prompt += "  Aplicacao, Resgate, Dividendo, JCP, Rendimento, Amortizacao, Aluguel, Outro\n\n";

    prompt += "⚠️  ATENÇÃO FINAL:\n";
    prompt += "- Retorne APENAS o JSON válido, sem texto adicional antes ou depois\n";
    prompt += "- NÃO use markdown ao redor do JSON final\n";
    prompt += "- Todos os valores monetários DEVEM ser em centavos (números inteiros)\n";
    prompt += "- Todos os enums devem usar EXATAMENTE os valores listados acima\n";

    return prompt;
  }
}
