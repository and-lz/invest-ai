"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useContextoPaginaChat } from "@/contexts/contexto-pagina-chat";
import type { MensagemChat, MensagemParaServidor } from "@/schemas/chat.schema";
import { destacarElemento } from "@/lib/chat-highlight";

/** Envia apenas as ultimas N mensagens para a API, controlando uso de tokens */
const LIMITE_MENSAGENS_PARA_API = 20;

/** Debounce para auto-save (aguarda streaming concluir + 2s) */
const DEBOUNCE_AUTO_SAVE_MS = 2000;

interface UseChatAssistenteRetorno {
  readonly mensagens: readonly MensagemChat[];
  readonly estaTransmitindo: boolean;
  readonly erro: string | null;
  readonly enviarMensagem: (conteudo: string) => Promise<void>;
  readonly limparHistorico: () => void;
  readonly pararTransmissao: () => void;
  readonly conversaAtualId: string | null;
  readonly criarNovaConversa: () => void;
  readonly carregarConversa: (identificador: string) => Promise<void>;
}

export function useChatAssistente(): UseChatAssistenteRetorno {
  const [mensagens, setMensagens] = useState<MensagemChat[]>([]);
  const [estaTransmitindo, setEstaTransmitindo] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [conversaAtualId, setConversaAtualId] = useState<string | null>(null);
  const [estaCarregando, setEstaCarregando] = useState(false);
  const controladorAbortRef = useRef<AbortController | null>(null);
  const timeoutAutoSaveRef = useRef<NodeJS.Timeout | null>(null);

  const { identificadorPagina, dadosContexto } = useContextoPaginaChat();

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

  // Auto-save debounced (declarado ANTES de enviarMensagem para evitar erro de ordem)
  const salvarConversaAutomaticamente = useCallback(
    async (mensagensAtualizadas: MensagemChat[]) => {
      if (mensagensAtualizadas.length === 0) return;

      // Gerar titulo a partir da primeira mensagem do usuario
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
    [conversaAtualId, identificadorPagina],
  );

  const enviarMensagem = useCallback(
    async (conteudo: string) => {
      if (estaTransmitindo || !conteudo.trim()) return;

      setErro(null);
      setEstaTransmitindo(true);

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

        for (;;) {
          const { done, value } = await leitor.read();
          if (done) break;

          textoAcumulado += decodificadorTexto.decode(value, { stream: true });

          // Processar highlights e remover marcadores
          const textoLimpo = processarHighlights(textoAcumulado);

          // Atualizar mensagem do assistente progressivamente
          setMensagens((anteriores) =>
            anteriores.map((mensagem) =>
              mensagem.identificador === identificadorAssistente
                ? { ...mensagem, conteudo: textoLimpo }
                : mensagem,
            ),
          );
        }

        // Auto-save debounced: aguardar 2s apos streaming concluir
        if (timeoutAutoSaveRef.current) {
          clearTimeout(timeoutAutoSaveRef.current);
        }

        timeoutAutoSaveRef.current = setTimeout(() => {
          // Processar highlights uma última vez para garantir texto limpo
          const textoFinalLimpo = processarHighlights(textoAcumulado);
          const mensagensFinais = [
            ...mensagens,
            mensagemUsuario,
            { ...mensagemAssistentePlaceholder, conteudo: textoFinalLimpo },
          ];
          void salvarConversaAutomaticamente(mensagensFinais);
        }, DEBOUNCE_AUTO_SAVE_MS);
      } catch (erroCatch) {
        if ((erroCatch as Error).name === "AbortError") {
          // Usuario cancelou - manter resposta parcial
          return;
        }
        const mensagemErro = erroCatch instanceof Error ? erroCatch.message : "Erro inesperado";
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
    ],
  );

  const pararTransmissao = useCallback(() => {
    controladorAbortRef.current?.abort();
  }, []);

  // Carregar conversa existente
  const carregarConversa = useCallback(async (identificador: string) => {
    setEstaCarregando(true);
    try {
      const resposta = await fetch(`/api/conversations/${identificador}`);
      if (!resposta.ok) {
        throw new Error(`Erro ao carregar conversa: ${resposta.status}`);
      }

      const dados = (await resposta.json()) as { conversa: { mensagens: MensagemChat[] } };
      setMensagens(dados.conversa.mensagens);
      setConversaAtualId(identificador);
      setErro(null);
    } catch (erroCatch) {
      console.error("Erro ao carregar conversa:", erroCatch);
      setErro("Falha ao carregar conversa");
    } finally {
      setEstaCarregando(false);
    }
  }, []);

  // Criar nova conversa
  const criarNovaConversa = useCallback(() => {
    setMensagens([]);
    setConversaAtualId(null);
    setErro(null);
  }, []);

  return {
    mensagens,
    estaTransmitindo: estaTransmitindo || estaCarregando,
    erro,
    enviarMensagem,
    limparHistorico: criarNovaConversa, // alias para compatibilidade
    pararTransmissao,
    conversaAtualId,
    criarNovaConversa,
    carregarConversa,
  };
}
