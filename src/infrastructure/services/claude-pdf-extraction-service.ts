/**
 * Lazy-load pdf-parse to avoid its known top-level side-effect
 * (it tries to read a test fixture file at require-time).
 */
async function loadPdfParse(): Promise<(buffer: Buffer) => Promise<{ text: string }>> {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  return require("pdf-parse") as (buffer: Buffer) => Promise<{ text: string }>;
}
import { toJSONSchema } from "zod/v4";
import type { ExtractionService } from "@/domain/interfaces/extraction-service";
import type { ProvedorAi } from "@/domain/interfaces/ai-provider";
import type { RelatorioExtraido } from "@/schemas/report-extraction.schema";
import { RelatorioExtraidoSchema } from "@/schemas/report-extraction.schema";
import { PdfParsingError } from "@/domain/errors/app-errors";
import { SYSTEM_PROMPT_EXTRACAO, INSTRUCAO_USUARIO_EXTRACAO } from "@/lib/manual-extraction-prompt";

/**
 * Servico de extracao de PDFs usando texto extraido via pdf-parse + ProvedorAi (Claude).
 * Diferente do GeminiPdfExtractionService que envia o PDF binario, este servico
 * extrai o texto do PDF localmente e envia apenas texto para o modelo.
 */
export class ClaudePdfExtractionService implements ExtractionService {
  constructor(private readonly provedor: ProvedorAi) {}

  async extrairDadosDoRelatorio(pdfBase64: string): Promise<RelatorioExtraido> {
    console.info("[Claude PDF Extraction] Iniciando extracao via pdf-parse + ProvedorAi");

    const pdfBuffer = Buffer.from(pdfBase64, "base64");

    let pdfText: string;
    try {
      const pdfParse = await loadPdfParse();
      const pdfData = await pdfParse(pdfBuffer);
      pdfText = pdfData.text;
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      throw new PdfParsingError(`Falha ao extrair texto do PDF: ${message}`);
    }

    if (!pdfText.trim()) {
      throw new PdfParsingError("PDF nao contem texto extraivel. Tente com o provedor Gemini.");
    }

    console.info(
      `[Claude PDF Extraction] Texto extraido (${pdfText.length} chars). Enviando para IA...`,
    );

    const prompt = this.construirPrompt(pdfText);

    const resposta = await this.provedor.gerar({
      instrucaoSistema: SYSTEM_PROMPT_EXTRACAO,
      mensagens: [
        {
          papel: "usuario",
          partes: [{ tipo: "texto", dados: prompt }],
        },
      ],
      temperatura: 0.1,
      formatoResposta: "json",
    });

    const dadosBrutos: unknown = this.parseJsonSeguro(resposta.texto);

    console.info(
      "[Claude PDF Extraction] Dados extraidos (primeiros 500 chars):",
      JSON.stringify(dadosBrutos, null, 2).substring(0, 500),
    );

    const validacao = RelatorioExtraidoSchema.safeParse(dadosBrutos);

    if (!validacao.success) {
      console.error(
        "[Claude PDF Extraction] Erros de validacao:",
        JSON.stringify(validacao.error.issues, null, 2),
      );
      console.error("[Claude PDF Extraction] Dados completos:", JSON.stringify(dadosBrutos, null, 2));

      throw new PdfParsingError(
        `Dados extraidos nao correspondem ao schema: ${JSON.stringify(
          validacao.error.issues,
          null,
          2,
        )}`,
      );
    }

    console.info("[Claude PDF Extraction] Extracao concluida com sucesso");
    return validacao.data;
  }

  private parseJsonSeguro(texto: string): unknown {
    try {
      return JSON.parse(texto);
    } catch {
      throw new PdfParsingError(`Resposta nao e JSON valido: ${texto.substring(0, 200)}`);
    }
  }

  private construirPrompt(pdfText: string): string {
    const esquemaJson = toJSONSchema(RelatorioExtraidoSchema);

    let prompt = `O seguinte e o texto extraido de um relatorio de investimentos em PDF:\n\n`;
    prompt += `<texto_pdf>\n${pdfText}\n</texto_pdf>\n\n`;
    prompt += INSTRUCAO_USUARIO_EXTRACAO;

    prompt += "\n\n📋 SCHEMA JSON (OBRIGATÓRIO - SIGA EXATAMENTE):\n";
    prompt += "```json\n";
    prompt += JSON.stringify(esquemaJson, null, 2);
    prompt += "\n```\n\n";

    prompt += "⚠️  REGRAS CRÍTICAS DE FORMATAÇÃO:\n";
    prompt +=
      '- Valores monetários DEVEM ser objetos: { "valorEmCentavos": number, "moeda": "BRL" }\n';
    prompt += '- Percentuais DEVEM ser objetos: { "valor": number }\n';
    prompt += "- Datas no formato YYYY-MM-DD\n";
    prompt += "- Mês de referência no formato YYYY-MM\n";
    prompt += "- NÃO retorne valores como primitivos (números/strings simples)\n";
    prompt += "- Campos nullable podem ser null se não houver dados no PDF\n";
    prompt += "- Arrays podem estar vazios [] se não houver dados correspondentes\n";
    prompt += "- Se um campo obrigatório não estiver no PDF, use valores padrão sensatos\n\n";

    prompt += "⚠️  ATENÇÃO FINAL:\n";
    prompt += "- Retorne APENAS o JSON válido, sem texto adicional antes ou depois\n";
    prompt += "- NÃO use markdown ao redor do JSON final\n";
    prompt += "- Todos os valores monetários DEVEM ser em centavos (números inteiros)\n";

    return prompt;
  }
}
