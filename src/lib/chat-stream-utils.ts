import { destacarElemento } from "@/lib/chat-highlight";
import type { MensagemChat, MensagemParaServidor } from "@/schemas/chat.schema";

/** Max messages to send to the API to control token usage */
const MESSAGE_LIMIT_FOR_API = 20;

/** Build the message payload for the chat API from the current message history.
 * Filters empty messages and truncates long assistant responses. */
export function buildMessagesForApi(
  allMessages: readonly MensagemChat[],
): MensagemParaServidor[] {
  const recent = allMessages.slice(-MESSAGE_LIMIT_FOR_API);
  return recent
    .filter((m) => m.conteudo.length > 0)
    .map((m) => ({
      papel: m.papel,
      conteudo: m.papel === "assistente" ? m.conteudo.slice(0, 4000) : m.conteudo,
    }));
}

/** Parse newline-delimited JSON stream for reasoning protocol.
 * Each line is {"t":0,"c":"..."} (thinking) or {"t":1,"c":"..."} (text). */
export function parseReasoningStream(raw: string): { thinking: string; text: string } {
  let thinking = "";
  let text = "";
  const lines = raw.split("\n");
  for (const line of lines) {
    if (!line.trim()) continue;
    try {
      const parsed = JSON.parse(line) as { t: number; c: string };
      if (parsed.t === 0) {
        thinking += parsed.c;
      } else {
        text += parsed.c;
      }
    } catch {
      // Incomplete JSON line (chunk split mid-line) — skip, will be complete next iteration
    }
  }
  return { thinking, text };
}

/** Process highlight markers in assistant text and trigger visual highlights.
 * Returns cleaned text with markers removed. */
export function processHighlights(texto: string): string {
  const regex = /\[HIGHLIGHT:([a-z-]+)\]/g;
  let match;

  while ((match = regex.exec(texto)) !== null) {
    const identificador = match[1];
    // Aplicar highlight (nao-bloqueante, com delay de 100ms)
    setTimeout(() => {
      if (identificador) {
        destacarElemento(identificador);
      }
    }, 100);
  }

  // Remover marcadores do texto exibido
  return texto.replace(regex, "");
}

/** A pending action extracted from [ACAO:texto|tipo|ativos] markers in assistant responses */
export interface AcaoPendente {
  readonly texto: string;
  readonly tipo: "positivo" | "atencao" | "neutro";
  readonly ativos: string[];
}

/** Parse [ACAO:texto|tipo|ativos] marker from assistant response.
 * Returns the extracted action and the cleaned text (marker removed).
 * Returns null for acaoPendente if no valid marker found. */
export function parsearAcaoPendente(text: string): {
  cleanText: string;
  acaoPendente: AcaoPendente | null;
} {
  const regex = /\[ACAO:([^|\]]+)\|([^|\]]+)\|([^\]]*)\]/;
  const match = regex.exec(text);

  if (!match) {
    return { cleanText: text, acaoPendente: null };
  }

  const rawTexto = match[1]?.trim() ?? "";
  const rawTipo = match[2]?.trim() ?? "";
  const rawAtivos = match[3]?.trim() ?? "";

  const tiposValidos = ["positivo", "atencao", "neutro"] as const;
  const tipo = tiposValidos.includes(rawTipo as (typeof tiposValidos)[number])
    ? (rawTipo as AcaoPendente["tipo"])
    : "neutro";

  const ativos = rawAtivos
    ? rawAtivos
        .split(",")
        .map((a) => a.trim())
        .filter(Boolean)
    : [];

  const acaoPendente: AcaoPendente = { texto: rawTexto, tipo, ativos };
  const cleanText = text.replace(regex, "").trimEnd();

  return { cleanText, acaoPendente };
}

/** Strips incomplete [ACAO:... markers during streaming (closing ] not yet arrived). */
export function stripPartialAcaoMarker(text: string): string {
  return text.replace(/\[ACAO:[^\]]*$/, "").trimEnd();
}

/** Find the content of the last user message in a list. */
export function findLastUserContent(mensagens: readonly MensagemChat[]): string | null {
  for (let i = mensagens.length - 1; i >= 0; i--) {
    const msg = mensagens[i];
    if (msg?.papel === "usuario") {
      return msg.conteudo;
    }
  }
  return null;
}

/** Remove the last assistant message then the last user message from a list.
 * Returns a new array (does not mutate). */
export function removeLastUserAssistantPair(mensagens: readonly MensagemChat[]): MensagemChat[] {
  const result = [...mensagens];
  for (let i = result.length - 1; i >= 0; i--) {
    if (result[i]?.papel === "assistente") {
      result.splice(i, 1);
      break;
    }
  }
  for (let i = result.length - 1; i >= 0; i--) {
    if (result[i]?.papel === "usuario") {
      result.splice(i, 1);
      break;
    }
  }
  return result;
}
