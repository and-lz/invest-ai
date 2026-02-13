import type Anthropic from "@anthropic-ai/sdk";
import type { Message } from "@anthropic-ai/sdk/resources/messages";
import { toJSONSchema } from "zod/v4";
import type { ExtractionService } from "@/domain/interfaces/extraction-service";
import type { RelatorioExtraido } from "@/schemas/report-extraction.schema";
import { RelatorioExtraidoSchema } from "@/schemas/report-extraction.schema";
import { ClaudeApiError, PdfParsingError } from "@/domain/errors/app-errors";
import {
  SYSTEM_PROMPT_EXTRACAO,
  INSTRUCAO_USUARIO_EXTRACAO,
} from "@/lib/prompt-extracao-manual";
import {
  CLAUDE_MODEL_EXTRACTION,
  CLAUDE_MAX_TOKENS_EXTRACTION,
} from "@/lib/claude-config";

export class ClaudePdfExtractionService implements ExtractionService {
  constructor(private readonly anthropicClient: Anthropic) {}

  async extrairDadosDoRelatorio(
    pdfBase64: string,
  ): Promise<RelatorioExtraido> {
    const tempoInicio = Date.now();

    try {
      console.info(
        `[PDF Extraction] Iniciando extração com ${CLAUDE_MODEL_EXTRACTION}`,
      );

      const esquemaJson = toJSONSchema(RelatorioExtraidoSchema) as Record<string, unknown>;
      const promptComSchema = this.construirPromptComSchema(
        INSTRUCAO_USUARIO_EXTRACAO,
        esquemaJson,
      );

      const resposta = (await this.anthropicClient.messages.create({
        model: CLAUDE_MODEL_EXTRACTION,
        max_tokens: CLAUDE_MAX_TOKENS_EXTRACTION,
        system: SYSTEM_PROMPT_EXTRACAO,
        stream: false,
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
                text: promptComSchema,
              },
            ],
          },
        ],
      })) as Message;

      const tempoDecorrido = Date.now() - tempoInicio;

      if (
        !resposta ||
        !resposta.content ||
        !Array.isArray(resposta.content) ||
        resposta.content.length === 0
      ) {
        throw new PdfParsingError(
          "Resposta da Claude API nao contem conteudo",
        );
      }

      const conteudoResposta = resposta.content[0];
      if (!conteudoResposta || conteudoResposta.type !== "text") {
        throw new PdfParsingError("Resposta da Claude API nao contem texto");
      }

      const textoJson = this.extrairJsonDaResposta(conteudoResposta.text);
      const dadosBrutos: unknown = JSON.parse(textoJson);
      const resultado = RelatorioExtraidoSchema.safeParse(dadosBrutos);

      if (!resultado.success) {
        throw new PdfParsingError(
          `Dados extraidos nao correspondem ao schema: ${JSON.stringify(
            resultado.error.issues,
            null,
            2,
          )}`,
        );
      }

      console.info(
        `[PDF Extraction] Sucesso com ${CLAUDE_MODEL_EXTRACTION} em ${tempoDecorrido}ms`,
      );
      if (resposta.usage) {
        console.info(
          `[PDF Extraction] Tokens: ${resposta.usage.input_tokens} input, ${resposta.usage.output_tokens} output`,
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

  private construirPromptComSchema(
    instrucaoOriginal: string,
    esquemaJson: Record<string, unknown>,
  ): string {
    let prompt = instrucaoOriginal;

    prompt += `\n\n📋 SCHEMA JSON (OBRIGATÓRIO - SIGA EXATAMENTE):\n`;
    prompt += "```json\n";
    prompt += JSON.stringify(esquemaJson, null, 2);
    prompt += "\n```\n\n";

    prompt += "⚠️  REGRAS CRÍTICAS:\n";
    prompt +=
      '- Valores monetários DEVEM ser objetos: { valorEmCentavos: number, moeda: "BRL" }\n';
    prompt += "- Percentuais DEVEM ser objetos: { valor: number }\n";
    prompt += "- Datas no formato YYYY-MM-DD\n";
    prompt += "- Mês de referência no formato YYYY-MM\n";
    prompt +=
      "- NÃO retorne valores como primitivos (números/strings simples)\n";

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
