"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useChatPageContext } from "@/contexts/chat-page-context";
import type { MensagemChat, MensagemParaServidor } from "@/schemas/chat.schema";
import { destacarElemento } from "@/lib/chat-highlight";
import {
  parseSuggestionsFromResponse,
  stripPartialSuggestionMarker,
  type ChatSuggestion,
} from "@/lib/chat-suggestions";

/** Envia apenas as ultimas N mensagens para a API, controlando uso de tokens */
const LIMITE_MENSAGENS_PARA_API = 20;

/** Parse newline-delimited JSON stream for reasoning protocol.
 * Each line is {"t":0,"c":"..."} (thinking) or {"t":1,"c":"..."} (text). */
function parseReasoningStream(raw: string): { thinking: string; text: string } {
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

/** Debounce para auto-save (aguarda streaming concluir + 2s) */
const DEBOUNCE_AUTO_SAVE_MS = 2000;

interface UseChatAssistenteOpcoes {
  readonly raciocinio?: boolean;
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
  const [mensagens, setMensagens] = useState<MensagemChat[]>([]);
  const [estaTransmitindo, setEstaTransmitindo] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [conversaAtualId, setConversaAtualId] = useState<string | null>(null);
  const [estaCarregando, setEstaCarregando] = useState(false);
  const [followUpSuggestions, setFollowUpSuggestions] = useState<ChatSuggestion[]>([]);
  const controladorAbortRef = useRef<AbortController | null>(null);
  const timeoutAutoSaveRef = useRef<NodeJS.Timeout | null>(null);
  const retryContentRef = useRef<string | null>(null);

  const { identificadorPagina, dadosContexto } = useChatPageContext();

  // Limpar timeout ao desmontar
  useEffect(() => {
    return () => {
      if (timeoutAutoSaveRef.current) {
        clearTimeout(timeoutAutoSaveRef.current);
      }
    };
  }, []);

  // Processar marcadores de highlighting e retornar texto limpo
  const processarHighlights = useCallback((texto: string): string => {
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
  }, []);

  // Generate smart AI title for a conversation (fire-and-forget)
  const gerarTituloInteligente = useCallback(
    async (conversaId: string, mensagens: MensagemChat[]) => {
      try {
        const payload = mensagens.slice(0, 4).map((m) => ({
          papel: m.papel,
          conteudo: m.conteudo,
        }));
        const resp = await fetch("/api/chat/title", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ mensagens: payload }),
        });
        if (!resp.ok) return;
        const { titulo } = (await resp.json()) as { titulo: string };
        if (!titulo) return;
        await fetch(`/api/conversations/${conversaId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ titulo }),
        });
      } catch {
        // Silent fail — placeholder title remains
      }
    },
    [],
  );

  // Auto-save debounced (declarado ANTES de enviarMensagem para evitar erro de ordem)
  const salvarConversaAutomaticamente = useCallback(
    async (mensagensAtualizadas: MensagemChat[]) => {
      if (mensagensAtualizadas.length === 0) return;

      // Placeholder title from first user message (replaced by AI title later)
      const primeiraMensagemUsuario = mensagensAtualizadas.find(
        (mensagem) => mensagem.papel === "usuario",
      );
      const titulo = primeiraMensagemUsuario?.conteudo.slice(0, 50) ?? "Nova conversa";

      try {
        if (!conversaAtualId) {
          // Criar nova conversa
          const resposta = await fetch("/api/conversations", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              titulo,
              identificadorPagina,
              mensagens: mensagensAtualizadas,
            }),
          });

          if (!resposta.ok) {
            throw new Error("Erro ao criar conversa");
          }

          const dados = (await resposta.json()) as {
            conversa: { identificador: string };
          };
          setConversaAtualId(dados.conversa.identificador);

          // Fire-and-forget: generate smart AI title
          void gerarTituloInteligente(dados.conversa.identificador, mensagensAtualizadas);
        } else {
          // Atualizar conversa existente
          await fetch(`/api/conversations/${conversaAtualId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ mensagens: mensagensAtualizadas }),
          });
        }
      } catch (erroCatch) {
        console.error("Erro ao salvar conversa:", erroCatch);
        // Silent fail: nao interrompe fluxo do chat
      }
    },
    [conversaAtualId, identificadorPagina, gerarTituloInteligente],
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

      // Montar mensagens para a API (ultimas N)
      // Filter out empty messages (e.g. aborted stream placeholders) and
      // truncate long assistant responses to stay within schema limits
      const todasMensagens = [...mensagens, mensagemUsuario];
      const mensagensRecentes = todasMensagens.slice(-LIMITE_MENSAGENS_PARA_API);
      const mensagensParaServidor: MensagemParaServidor[] = mensagensRecentes
        .filter((mensagem) => mensagem.conteudo.length > 0)
        .map((mensagem) => ({
          papel: mensagem.papel,
          conteudo:
            mensagem.papel === "assistente" ? mensagem.conteudo.slice(0, 4000) : mensagem.conteudo,
        }));

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
          const textoLimpo = processarHighlights(textoSemParciais);

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
          const textoFinalLimpo = processarHighlights(textoFinalSemSugestoes);
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
      processarHighlights,
      raciocinio,
    ],
  );

  const pararTransmissao = useCallback(() => {
    controladorAbortRef.current?.abort();
  }, []);

  // Carregar conversa existente
  const carregarConversa = useCallback(async (identificador: string): Promise<boolean> => {
    setEstaCarregando(true);
    try {
      const resposta = await fetch(`/api/conversations/${identificador}`);
      if (resposta.status === 404) {
        setMensagens([]);
        setConversaAtualId(null);
        setErro(null);
        setFollowUpSuggestions([]);
        return false;
      }
      if (!resposta.ok) {
        throw new Error(`Erro ao carregar conversa: ${resposta.status}`);
      }

      const dados = (await resposta.json()) as { conversa: { mensagens: MensagemChat[] } };
      setMensagens(dados.conversa.mensagens);
      setConversaAtualId(identificador);
      setErro(null);
      return true;
    } catch (erroCatch) {
      console.error("Erro ao carregar conversa:", erroCatch);
      setErro("Falha ao carregar conversa");
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

    // Find last user message content
    let lastUserContent: string | null = null;
    for (let i = mensagens.length - 1; i >= 0; i--) {
      const msg = mensagens[i];
      if (msg?.papel === "usuario") {
        lastUserContent = msg.conteudo;
        break;
      }
    }
    if (!lastUserContent) return;

    retryContentRef.current = lastUserContent;

    // Remove last assistant, then last user message
    setMensagens((prev) => {
      const result = [...prev];
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
    });
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
