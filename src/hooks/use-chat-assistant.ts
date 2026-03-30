"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useChatPageContext } from "@/contexts/chat-page-context";
import type { MensagemChat } from "@/schemas/chat.schema";
import {
  parseSuggestionsFromResponse,
  stripPartialSuggestionMarker,
  type ChatSuggestion,
} from "@/lib/chat-suggestions";
import { notificar } from "@/lib/notifier";
import {
  parseReasoningStream,
  processHighlights,
  findLastUserContent,
  removeLastUserAssistantPair,
  buildMessagesForApi,
} from "@/lib/chat-stream-utils";
import { autoSaveConversation, loadConversation } from "@/lib/chat-persistence";

/** Debounce para auto-save (aguarda streaming concluir + 2s) */
const DEBOUNCE_AUTO_SAVE_MS = 2000;

interface UseChatAssistenteOpcoes {
  readonly raciocinio?: boolean;
  readonly modelTier?: string;
}

interface UseChatAssistenteRetorno {
  readonly mensagens: readonly MensagemChat[];
  readonly estaTransmitindo: boolean;
  readonly estaCarregandoConversa: boolean;
  readonly erro: string | null;
  readonly enviarMensagem: (conteudo: string) => Promise<void>;
  readonly limparHistorico: () => void;
  readonly pararTransmissao: () => void;
  readonly conversaAtualId: string | null;
  readonly criarNovaConversa: () => void;
  readonly carregarConversa: (identificador: string) => Promise<boolean>;
  readonly followUpSuggestions: readonly ChatSuggestion[];
  readonly reenviarUltimaMensagem: () => void;
}

export function useChatAssistant(opcoes?: UseChatAssistenteOpcoes): UseChatAssistenteRetorno {
  const raciocinio = opcoes?.raciocinio ?? false;
  const modelTier = opcoes?.modelTier;
  const [mensagens, setMensagens] = useState<MensagemChat[]>([]);
  const [estaTransmitindo, setEstaTransmitindo] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [conversaAtualId, setConversaAtualId] = useState<string | null>(null);
  const [estaCarregando, setEstaCarregando] = useState(false);
  const [followUpSuggestions, setFollowUpSuggestions] = useState<ChatSuggestion[]>([]);
  const controladorAbortRef = useRef<AbortController | null>(null);
  const timeoutAutoSaveRef = useRef<NodeJS.Timeout | null>(null);
  const retryContentRef = useRef<string | null>(null);
  const autoSaveFailCountRef = useRef(0);

  const { identificadorPagina, dadosContexto } = useChatPageContext();

  // Limpar timeout ao desmontar
  useEffect(() => {
    return () => { if (timeoutAutoSaveRef.current) clearTimeout(timeoutAutoSaveRef.current); };
  }, []);

  // Auto-save wrapper that delegates to extracted pure function
  const salvarConversaAutomaticamente = useCallback(
    async (mensagensAtualizadas: readonly MensagemChat[]) => {
      await autoSaveConversation({
        mensagens: mensagensAtualizadas,
        conversaAtualId,
        identificadorPagina,
        onConversaCriada: (id) => setConversaAtualId(id),
        onAutoSaveFail: (count) => {
          autoSaveFailCountRef.current = count;
        },
        autoSaveFailCount: autoSaveFailCountRef.current,
      });
    },
    [conversaAtualId, identificadorPagina],
  );

  const enviarMensagem = useCallback(
    async (conteudo: string) => {
      if (estaTransmitindo || !conteudo.trim()) return;

      setErro(null);
      setEstaTransmitindo(true);
      setFollowUpSuggestions([]);

      const mensagemUsuario: MensagemChat = {
        identificador: crypto.randomUUID(),
        papel: "usuario",
        conteudo: conteudo.trim(),
        criadaEm: new Date().toISOString(),
      };

      const identificadorAssistente = crypto.randomUUID();
      const mensagemAssistentePlaceholder: MensagemChat = {
        identificador: identificadorAssistente,
        papel: "assistente",
        conteudo: "",
        criadaEm: new Date().toISOString(),
      };

      setMensagens((anteriores) => [...anteriores, mensagemUsuario, mensagemAssistentePlaceholder]);

      // Montar mensagens para a API (ultimas N, filtradas e truncadas)
      const mensagensParaServidor = buildMessagesForApi([...mensagens, mensagemUsuario]);

      const controladorAbort = new AbortController();
      controladorAbortRef.current = controladorAbort;

      try {
        const resposta = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            mensagens: mensagensParaServidor,
            contextoPagina: dadosContexto,
            identificadorPagina,
            ...(raciocinio && { raciocinio: true }),
            ...(modelTier && { modelTier }),
          }),
          signal: controladorAbort.signal,
        });

        if (!resposta.ok) {
          const corpoErro = await resposta.json().catch(() => ({ erro: "Erro desconhecido" }));
          throw new Error((corpoErro as { erro?: string }).erro ?? `Erro ${resposta.status}`);
        }

        const leitor = resposta.body!.getReader();
        const decodificadorTexto = new TextDecoder();
        let textoAcumulado = "";
        let pensamentoAcumulado = "";
        let rawAcumulado = "";

        for (;;) {
          const { done, value } = await leitor.read();
          if (done) break;

          rawAcumulado += decodificadorTexto.decode(value, { stream: true });

          if (raciocinio) {
            const parsed = parseReasoningStream(rawAcumulado);
            pensamentoAcumulado = parsed.thinking;
            textoAcumulado = parsed.text;
          } else {
            textoAcumulado = rawAcumulado;
          }

          // Strip complete suggestion markers + partial ones (streaming)
          const { cleanText: textoSemSugestoes } = parseSuggestionsFromResponse(textoAcumulado);
          const textoSemParciais = stripPartialSuggestionMarker(textoSemSugestoes);

          // Processar highlights e remover marcadores
          const textoLimpo = processHighlights(textoSemParciais);

          // Atualizar mensagem do assistente progressivamente
          setMensagens((anteriores) =>
            anteriores.map((mensagem) =>
              mensagem.identificador === identificadorAssistente
                ? { ...mensagem, conteudo: textoLimpo, pensamento: pensamentoAcumulado || undefined }
                : mensagem,
            ),
          );
        }

        // Extract follow-up suggestions from completed response
        const { cleanText: textoFinalSemSugestoes, suggestions } =
          parseSuggestionsFromResponse(textoAcumulado);
        setFollowUpSuggestions(suggestions);

        // Auto-save debounced: aguardar 2s apos streaming concluir
        if (timeoutAutoSaveRef.current) {
          clearTimeout(timeoutAutoSaveRef.current);
        }

        const pensamentoFinal = pensamentoAcumulado || undefined;
        timeoutAutoSaveRef.current = setTimeout(() => {
          // Processar highlights uma última vez para garantir texto limpo
          const textoFinalLimpo = processHighlights(textoFinalSemSugestoes);
          const mensagensFinais = [
            ...mensagens,
            mensagemUsuario,
            { ...mensagemAssistentePlaceholder, conteudo: textoFinalLimpo, pensamento: pensamentoFinal },
          ];
          void salvarConversaAutomaticamente(mensagensFinais);
        }, DEBOUNCE_AUTO_SAVE_MS);
      } catch (erroCatch) {
        if ((erroCatch as Error).name === "AbortError") {
          // Usuario cancelou - manter resposta parcial
          return;
        }
        const mensagemErro =
          erroCatch instanceof Error ? erroCatch.message : "Algo deu errado. Tente novamente.";
        setErro(mensagemErro);
        // Remover placeholder vazio em caso de erro
        setMensagens((anteriores) =>
          anteriores.filter(
            (mensagem) =>
              mensagem.identificador !== identificadorAssistente || mensagem.conteudo.length > 0,
          ),
        );
      } finally {
        setEstaTransmitindo(false);
        controladorAbortRef.current = null;
      }
    },
    [
      estaTransmitindo,
      mensagens,
      dadosContexto,
      identificadorPagina,
      salvarConversaAutomaticamente,
      raciocinio,
      modelTier,
    ],
  );

  const pararTransmissao = useCallback(() => {
    controladorAbortRef.current?.abort();
  }, []);

  // Carregar conversa existente
  const carregarConversa = useCallback(async (identificador: string): Promise<boolean> => {
    setEstaCarregando(true);
    try {
      const result = await loadConversation(identificador);
      if (!result) {
        setMensagens([]);
        setConversaAtualId(null);
        setErro(null);
        setFollowUpSuggestions([]);
        return false;
      }
      setMensagens(result.mensagens);
      setConversaAtualId(identificador);
      setErro(null);
      autoSaveFailCountRef.current = 0;
      return true;
    } catch (erroCatch) {
      console.error("Erro ao carregar conversa:", erroCatch);
      setErro("Falha ao carregar conversa");
      notificar.error("Erro ao carregar conversa");
      return false;
    } finally {
      setEstaCarregando(false);
    }
  }, []);

  // Criar nova conversa
  const criarNovaConversa = useCallback(() => {
    setMensagens([]);
    setConversaAtualId(null);
    setErro(null);
    setFollowUpSuggestions([]);
    autoSaveFailCountRef.current = 0;
  }, []);

  // Keep a ref to enviarMensagem so the retry effect always calls the latest version
  const enviarMensagemRef = useRef(enviarMensagem);
  enviarMensagemRef.current = enviarMensagem;

  // Retry: when content is pending and messages have been cleaned, re-send
  useEffect(() => {
    if (retryContentRef.current && !estaTransmitindo) {
      const content = retryContentRef.current;
      retryContentRef.current = null;
      void enviarMensagemRef.current(content);
    }
  }, [mensagens, estaTransmitindo]);

  // Remove the failed user+assistant pair and re-send the last user message
  const reenviarUltimaMensagem = useCallback(() => {
    if (estaTransmitindo) return;

    const lastUserContent = findLastUserContent(mensagens);
    if (!lastUserContent) return;

    retryContentRef.current = lastUserContent;
    setMensagens((prev) => removeLastUserAssistantPair(prev));
  }, [estaTransmitindo, mensagens]);

  return {
    mensagens,
    estaTransmitindo: estaTransmitindo || estaCarregando,
    estaCarregandoConversa: estaCarregando,
    erro,
    enviarMensagem,
    limparHistorico: criarNovaConversa, // alias para compatibilidade
    pararTransmissao,
    conversaAtualId,
    criarNovaConversa,
    carregarConversa,
    followUpSuggestions,
    reenviarUltimaMensagem,
  };
}
