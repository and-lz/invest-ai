import type {
  ProvedorAi,
  ConfiguracaoGeracao,
  RespostaAi,
} from "@/domain/interfaces/ai-provider";
import { AiApiError, AiApiTransientError } from "@/domain/errors/app-errors";


interface AnthropicMessage {
  role: "user" | "assistant";
  content: string;
}

interface AnthropicResponse {
  id: string;
  type: string;
  role: string;
  content: Array<{ type: string; text: string }>;
  model: string;
  stop_reason: string;
  usage: { input_tokens: number; output_tokens: number };
}

/**
 * Implementacao do ProvedorAi usando o proxy local do Claude CLI.
 * Nao suporta streaming real — `transmitir()` delega para `gerar()` e
 * retorna a resposta completa como um unico chunk.
 */
export class AnthropicProvedorAi implements ProvedorAi {
  private readonly proxyBaseUrl: string;
  private readonly model: string;

  constructor(proxyBaseUrl: string, model: string) {
    this.proxyBaseUrl = proxyBaseUrl;
    this.model = model;
  }

  async gerar(configuracao: ConfiguracaoGeracao): Promise<RespostaAi> {
    const tempoInicio = Date.now();

    const messages: AnthropicMessage[] = configuracao.mensagens.map((mensagem) => ({
      role: mensagem.papel === "usuario" ? "user" : "assistant",
      content: mensagem.partes
        .filter((p) => p.tipo === "texto")
        .map((p) => (p.tipo === "texto" ? p.dados : ""))
        .join("\n"),
    }));

    let responseBody: AnthropicResponse;

    try {
      const httpResponse = await fetch(`${this.proxyBaseUrl}/v1/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: this.model,
          system: configuracao.instrucaoSistema,
          messages,
          max_tokens: configuracao.maxOutputTokens ?? 8192,
        }),
      });

      if (!httpResponse.ok) {
        const errorText = await httpResponse.text().catch(() => "");
        if (httpResponse.status >= 500) {
          throw new AiApiTransientError(
            `Proxy Claude retornou ${httpResponse.status}. Verifique se o proxy esta rodando com \`npm run proxy\`. Detalhes: ${errorText}`,
          );
        }
        throw new AiApiError(
          `Proxy Claude retornou ${httpResponse.status}: ${errorText}`,
        );
      }

      responseBody = (await httpResponse.json()) as AnthropicResponse;
    } catch (err) {
      if (err instanceof AiApiError) throw err;

      // Network error (proxy not running, ECONNREFUSED, etc.)
      const message = err instanceof Error ? err.message : String(err);
      throw new AiApiTransientError(
        `Nao foi possivel conectar ao proxy Claude em ${this.proxyBaseUrl}. Inicie o proxy com \`npm run proxy\`. Erro: ${message}`,
      );
    }

    const textBlock = responseBody.content.find((b) => b.type === "text");
    if (!textBlock) {
      throw new AiApiError("Resposta do proxy Claude nao contem bloco de texto");
    }

    // Strip markdown fences if the model wrapped JSON in them
    const textoResposta = this.removerFencesMarkdown(textBlock.text.trim());

    const tempoDecorrido = Date.now() - tempoInicio;
    const tokensEntrada = responseBody.usage?.input_tokens;
    const tokensSaida = responseBody.usage?.output_tokens;

    console.info(
      `[AnthropicProvedorAi] Geracao concluida em ${tempoDecorrido}ms` +
        (tokensEntrada !== undefined
          ? ` | Tokens: ${tokensEntrada} entrada, ${tokensSaida} saida`
          : ""),
    );

    return { texto: textoResposta, tokensEntrada, tokensSaida };
  }

  async *transmitir(configuracao: ConfiguracaoGeracao): AsyncGenerator<string, void, unknown> {
    // Proxy does not support streaming — return full response as single chunk
    const resposta = await this.gerar(configuracao);
    yield resposta.texto;
  }

  private removerFencesMarkdown(texto: string): string {
    // Remove ```json ... ``` or ``` ... ``` wrappers
    const match = texto.match(/^```(?:json)?\s*\n?([\s\S]*?)\n?```$/);
    return match?.[1]?.trim() ?? texto;
  }
}
