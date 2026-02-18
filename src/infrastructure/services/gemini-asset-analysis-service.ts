import type { AssetAnalysisService } from "@/domain/interfaces/asset-analysis-service";
import type { ProvedorAi } from "@/domain/interfaces/ai-provider";
import type { AnaliseAtivoResponse } from "@/schemas/asset-analysis.schema";
import { AnaliseAtivoResponseSchema } from "@/schemas/asset-analysis.schema";
import type { DadosAtivoParaPrompt } from "@/lib/serialize-asset-data-markdown";
import { AiApiError } from "@/domain/errors/app-errors";
import {
  SYSTEM_PROMPT_ANALISE_ATIVO,
  construirPromptAnaliseAtivo,
} from "@/lib/asset-analysis-prompt";

/**
 * Servico de analise de ativo usando ProvedorAi.
 * Responsabilidade: construir prompts + validar schema.
 * Criacao de cliente, log de tokens e classificacao de erros ficam no ProvedorAi.
 */
export class GeminiAssetAnalysisService implements AssetAnalysisService {
  constructor(private readonly provedor: ProvedorAi) {}

  async analisarAtivo(dadosAtivo: DadosAtivoParaPrompt): Promise<AnaliseAtivoResponse> {
    const prompt = construirPromptAnaliseAtivo(dadosAtivo);

    const resposta = await this.provedor.gerar({
      instrucaoSistema: SYSTEM_PROMPT_ANALISE_ATIVO,
      mensagens: [
        {
          papel: "usuario",
          partes: [{ tipo: "texto", dados: prompt }],
        },
      ],
      temperatura: 0.7,
      formatoResposta: "json",
    });

    const dadosBrutos = this.parseJsonSeguro(resposta.texto);
    const validacao = AnaliseAtivoResponseSchema.safeParse(dadosBrutos);

    if (!validacao.success) {
      throw new AiApiError(
        `Analise de ativo nao corresponde ao schema: ${JSON.stringify(validacao.error.issues.slice(0, 5))}`,
      );
    }

    // Sobrescrever dataAnalise com a data atual do sistema
    const dataAtual = new Date().toISOString().split("T")[0] ?? "";
    return {
      ...validacao.data,
      dataAnalise: dataAtual,
    };
  }

  private parseJsonSeguro(texto: string): unknown {
    try {
      return JSON.parse(texto);
    } catch {
      throw new AiApiError(`Resposta nao e JSON valido: ${texto.substring(0, 200)}`);
    }
  }
}
