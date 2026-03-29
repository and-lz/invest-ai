import type {
  ProvedorAi,
  ConfiguracaoGeracao,
  RespostaAi,
  StreamChunk,
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
 * Suporta streaming via SSE (Server-Sent Events) no endpoint /v1/messages.
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
    const messages: AnthropicMessage[] = configuracao.mensagens.map((mensagem) => ({
      role: mensagem.papel === "usuario" ? "user" : "assistant",
      content: mensagem.partes
        .filter((p) => p.tipo === "texto")
        .map((p) => (p.tipo === "texto" ? p.dados : ""))
        .join("\n"),
    }));

    let httpResponse: Response;

    try {
      httpResponse = await fetch(`${this.proxyBaseUrl}/v1/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: this.model,
          system: configuracao.instrucaoSistema,
          messages,
          max_tokens: configuracao.maxOutputTokens ?? 8192,
          stream: true,
        }),
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      throw new AiApiTransientError(
        `Nao foi possivel conectar ao proxy Claude em ${this.proxyBaseUrl}. Inicie o proxy com \`npm run proxy\`. Erro: ${message}`,
      );
    }

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

    const body = httpResponse.body;
    if (!body) {
      throw new AiApiError("Resposta do proxy Claude nao contem body stream");
    }

    // Parse SSE stream
    const reader = body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        // Process complete SSE events (separated by double newline)
        const events = buffer.split("\n\n");
        buffer = events.pop() ?? ""; // last element is incomplete

        for (const event of events) {
          if (!event.trim()) continue;

          const dataLine = event.split("\n").find((l) => l.startsWith("data: "));
          if (!dataLine) continue;

          const jsonStr = dataLine.slice(6); // strip "data: "
          let parsed: { type?: string; delta?: { type?: string; text?: string } };
          try {
            parsed = JSON.parse(jsonStr) as typeof parsed;
          } catch {
            continue; // skip malformed events
          }

          if (parsed.type === "content_block_delta" && parsed.delta?.type === "text_delta" && parsed.delta.text) {
            yield parsed.delta.text;
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  }

  async *transmitirComPensamento(configuracao: ConfiguracaoGeracao): AsyncGenerator<StreamChunk, void, unknown> {
    // Two-step approach: the local Claude proxy buffers full responses and
    // strips the native `thinking` API parameter. So we make two calls:
    // 1) Non-streaming reasoning call (~500 tokens) — yielded as thinking
    // 2) Streaming response call with reasoning injected as context

    // Step 1: Generate reasoning (non-streaming, fast)
    const reasoningSystemPrompt =
      "You are an internal reasoning engine. Analyze the user's question and the conversation context. " +
      "Produce a brief, structured analysis (3-8 bullet points) covering: what data is relevant, " +
      "what patterns or insights you notice, and what approach you'll take to answer. " +
      "Write in the same language as the user. Be concise — this is internal analysis, not the final answer. " +
      "Do NOT answer the question itself, only analyze it.";

    const reasoningConfig: ConfiguracaoGeracao = {
      ...configuracao,
      instrucaoSistema: reasoningSystemPrompt,
      maxOutputTokens: 600,
    };

    const reasoningResult = await this.gerar(reasoningConfig);
    const reasoning = reasoningResult.texto;

    // Yield reasoning as thinking chunk
    yield { type: "thinking", content: reasoning };

    // Step 2: Generate response with reasoning context injected
    const augmentedSystemPrompt =
      configuracao.instrucaoSistema +
      "\n\n<internal-analysis>\n" + reasoning + "\n</internal-analysis>\n" +
      "Use the analysis above to inform your response. Do NOT reference or mention the analysis itself.";

    const responseConfig: ConfiguracaoGeracao = {
      ...configuracao,
      instrucaoSistema: augmentedSystemPrompt,
    };

    for await (const textChunk of this.transmitir(responseConfig)) {
      yield { type: "text", content: textChunk };
    }
  }

  private removerFencesMarkdown(texto: string): string {
    // Remove ```json ... ``` or ``` ... ``` wrappers
    const match = texto.match(/^```(?:json)?\s*\n?([\s\S]*?)\n?```$/);
    return match?.[1]?.trim() ?? texto;
  }
}
