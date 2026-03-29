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
    // The local proxy strips the `thinking` API parameter, so we use a
    // prompt-based approach: instruct the model to wrap reasoning in
    // <thinking>...</thinking> tags, then parse those from the text stream.
    const thinkingPrompt =
      "\n\nIMPORTANT: Before answering, write your step-by-step reasoning inside <thinking>...</thinking> tags. " +
      "After the closing </thinking> tag, write your final answer. The thinking section should show your " +
      "analysis process in a natural, conversational way. Always include both sections.";

    const instrucaoComPensamento = configuracao.instrucaoSistema + thinkingPrompt;

    const configComPensamento: ConfiguracaoGeracao = {
      ...configuracao,
      instrucaoSistema: instrucaoComPensamento,
    };

    // Reuse the existing text streaming, then split by <thinking> tags
    let accumulated = "";
    let insideThinking = false;
    let thinkingDone = false;

    for await (const textChunk of this.transmitir(configComPensamento)) {
      accumulated += textChunk;

      // Check for <thinking> open tag
      if (!insideThinking && !thinkingDone) {
        const openIdx = accumulated.indexOf("<thinking>");
        if (openIdx !== -1) {
          insideThinking = true;
          // Yield any text before <thinking> as text (unlikely but safe)
          const before = accumulated.slice(0, openIdx);
          if (before.trim()) {
            yield { type: "text", content: before };
          }
          accumulated = accumulated.slice(openIdx + "<thinking>".length);
        }
      }

      // Check for </thinking> close tag
      if (insideThinking) {
        const closeIdx = accumulated.indexOf("</thinking>");
        if (closeIdx !== -1) {
          // Everything before </thinking> is thinking content
          const thinkingContent = accumulated.slice(0, closeIdx);
          if (thinkingContent) {
            yield { type: "thinking", content: thinkingContent };
          }
          accumulated = accumulated.slice(closeIdx + "</thinking>".length);
          insideThinking = false;
          thinkingDone = true;
          // Yield remaining accumulated text
          if (accumulated.trim()) {
            yield { type: "text", content: accumulated };
            accumulated = "";
          }
        } else {
          // Still inside thinking — yield what we have so far for real-time display
          // Keep only a small tail buffer to detect the closing tag across chunks
          const safeLen = accumulated.length - "</thinking>".length;
          if (safeLen > 0) {
            yield { type: "thinking", content: accumulated.slice(0, safeLen) };
            accumulated = accumulated.slice(safeLen);
          }
        }
      } else if (thinkingDone) {
        // After thinking is done, everything is text
        yield { type: "text", content: textChunk };
        accumulated = "";
      }
    }

    // Flush any remaining content
    if (accumulated.trim()) {
      yield { type: insideThinking ? "thinking" : "text", content: accumulated };
    }
  }

  private removerFencesMarkdown(texto: string): string {
    // Remove ```json ... ``` or ``` ... ``` wrappers
    const match = texto.match(/^```(?:json)?\s*\n?([\s\S]*?)\n?```$/);
    return match?.[1]?.trim() ?? texto;
  }
}
