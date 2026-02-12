import type Anthropic from "@anthropic-ai/sdk";
import type { ExtractionService } from "@/domain/interfaces/extraction-service";
import type { RelatorioExtraido } from "@/schemas/report-extraction.schema";
import { RelatorioExtraidoSchema } from "@/schemas/report-extraction.schema";
import { ClaudeApiError, PdfParsingError } from "@/domain/errors/app-errors";
import { SYSTEM_PROMPT_EXTRACAO, INSTRUCAO_USUARIO_EXTRACAO } from "@/lib/prompt-extracao-manual";

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
                text: INSTRUCAO_USUARIO_EXTRACAO,
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
