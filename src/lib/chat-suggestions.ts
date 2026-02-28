import type { IdentificadorPagina } from "@/schemas/chat.schema";

/**
 * A suggestion chip shown to the user in the chat widget.
 * - `label`: Short text displayed on the chip (max ~60 chars)
 * - `text`: Full prompt sent to chat when clicked
 */
export interface ChatSuggestion {
  readonly label: string;
  readonly text: string;
}

/**
 * Static initial suggestions shown when a new conversation starts.
 * Contextual per page — zero AI cost.
 */
export const INITIAL_SUGGESTIONS: Record<IdentificadorPagina, ChatSuggestion[]> = {
  dashboard: [
    {
      label: "Como esta minha carteira?",
      text: "Faca um resumo geral de como esta minha carteira de investimentos. O que esta indo bem e o que precisa de atencao?",
    },
    {
      label: "Estou batendo o CDI?",
      text: "Minha carteira esta superando o CDI? Como estou em relacao aos principais benchmarks?",
    },
    {
      label: "Preciso diversificar?",
      text: "Analise minha diversificacao. Minha carteira esta concentrada demais em alguma estrategia ou ativo?",
    },
    {
      label: "Melhores e piores ativos",
      text: "Quais sao meus melhores e piores ativos no momento? Devo me preocupar com algum?",
    },
  ],
  reports: [
    {
      label: "O que posso fazer aqui?",
      text: "Explique o que e a pagina de relatorios e como importar meus dados da corretora.",
    },
    {
      label: "Comparar ultimos meses",
      text: "Compare meus relatorios dos ultimos meses. O que mudou na minha carteira?",
    },
  ],
  insights: [
    {
      label: "Resuma as analises",
      text: "Faca um resumo das principais analises e recomendacoes da Fortuna para minha carteira.",
    },
    {
      label: "Quais os maiores riscos?",
      text: "Quais sao os maiores riscos identificados na minha carteira?",
    },
    {
      label: "Oportunidades de melhoria",
      text: "Existem oportunidades de melhoria na minha carteira? O que posso otimizar?",
    },
  ],
  trends: [
    {
      label: "Cenario macro atual",
      text: "Qual o cenario macroeconomico atual? Como Selic, IPCA e mercado podem afetar meus investimentos?",
    },
    {
      label: "Setores em alta",
      text: "Quais setores do mercado estao indo bem e quais estao em queda? Algum impacta minha carteira?",
    },
  ],
  desempenho: [
    {
      label: "Vale manter este ativo?",
      text: "Analise o desempenho deste ativo. Vale a pena manter ou devo considerar realocar?",
    },
    {
      label: "Rendimentos consistentes?",
      text: "Este ativo esta pagando dividendos/proventos de forma consistente? A tendencia e de crescimento?",
    },
  ],
  aprender: [
    {
      label: "Por onde comecar?",
      text: "Sou iniciante em investimentos. Quais sao os conceitos mais importantes que preciso entender primeiro?",
    },
    {
      label: "O que e renda fixa?",
      text: "Explique de forma simples o que e renda fixa, quais os principais tipos e quando vale a pena investir.",
    },
  ],
};

/**
 * Result of parsing `[SUGGESTIONS:a|b|c]` markers from an AI response.
 */
export interface ParsedSuggestions {
  readonly cleanText: string;
  readonly suggestions: ChatSuggestion[];
}

/**
 * Extracts `[SUGGESTIONS:label1|label2|label3]` markers from assistant response text.
 * Returns cleaned text (markers removed) + parsed suggestion list.
 *
 * For follow-up suggestions, label and text are the same — they're short enough
 * to serve as direct prompts.
 */
export function parseSuggestionsFromResponse(text: string): ParsedSuggestions {
  const regex = /\[SUGGESTIONS:([^\]]+)\]/g;
  const suggestions: ChatSuggestion[] = [];

  let match;
  while ((match = regex.exec(text)) !== null) {
    const captured = match[1];
    if (!captured) continue;
    const items = captured
      .split("|")
      .map((s) => s.trim())
      .filter(Boolean);
    for (const item of items) {
      suggestions.push({ label: item, text: item });
    }
  }

  const cleanText = text.replace(regex, "").trimEnd();
  return { cleanText, suggestions };
}

/**
 * Strips incomplete `[SUGGESTIONS:...` markers that appear during streaming
 * (the closing `]` hasn't arrived yet). Safe to call on every chunk.
 */
export function stripPartialSuggestionMarker(text: string): string {
  return text.replace(/\[SUGGESTIONS:[^\]]*$/, "").trimEnd();
}
