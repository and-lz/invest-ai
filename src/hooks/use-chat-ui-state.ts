"use client";

import { useMemo } from "react";
import { useChatSuggestions } from "@/hooks/use-chat-suggestions";
import { INITIAL_SUGGESTIONS, gerarSugestoesDashboard, gerarBoasVindas } from "@/lib/chat-suggestions";
import type { ChatSuggestion } from "@/lib/chat-suggestions";
import type { MensagemChat, IdentificadorPagina, ResumoContextoChat } from "@/schemas/chat.schema";

interface UseChatUiStateParams {
  readonly identificadorPagina: IdentificadorPagina;
  readonly resumoContexto: ResumoContextoChat | undefined;
  readonly mensagens: readonly MensagemChat[];
  readonly estaTransmitindo: boolean;
  readonly inputValue: string;
  readonly followUpSuggestions: readonly ChatSuggestion[];
}

interface UseChatUiStateResult {
  readonly activeSuggestions: readonly ChatSuggestion[];
  readonly aiSuggestions: readonly ChatSuggestion[];
  readonly aiSuggestionsLoading: boolean;
  readonly welcomeMessage: string | undefined;
}

export function useChatUiState({
  identificadorPagina,
  resumoContexto,
  mensagens,
  estaTransmitindo,
  inputValue,
  followUpSuggestions,
}: UseChatUiStateParams): UseChatUiStateResult {
  const recentMessages = useMemo(
    () => mensagens.slice(-4).map((m) => m.conteudo.slice(0, 200)),
    [mensagens],
  );

  const { suggestions: aiSuggestions, isLoading: aiSuggestionsLoading } = useChatSuggestions({
    input: inputValue,
    pageId: identificadorPagina,
    recentMessages,
    enabled: mensagens.length > 0 && !estaTransmitindo && inputValue.trim().length >= 3,
  });

  const initialSuggestions = useMemo(() => {
    if (identificadorPagina === "dashboard" && resumoContexto) {
      return gerarSugestoesDashboard(resumoContexto);
    }
    return INITIAL_SUGGESTIONS[identificadorPagina] ?? [];
  }, [identificadorPagina, resumoContexto]);

  const activeSuggestions = useMemo(() => {
    if (mensagens.length === 0) return initialSuggestions;
    if (aiSuggestions.length > 0) return aiSuggestions;
    return followUpSuggestions.length > 0 ? followUpSuggestions : initialSuggestions;
  }, [mensagens.length, initialSuggestions, followUpSuggestions, aiSuggestions]);

  const welcomeMessage = useMemo(
    () =>
      identificadorPagina === "dashboard" && resumoContexto
        ? gerarBoasVindas(resumoContexto)
        : undefined,
    [identificadorPagina, resumoContexto],
  );

  return { activeSuggestions, aiSuggestions, aiSuggestionsLoading, welcomeMessage };
}
