"use client";

import { useState, useCallback, useRef } from "react";
import { useContextoPaginaChat } from "@/contexts/contexto-pagina-chat";
import type { MensagemChat, MensagemParaServidor } from "@/schemas/chat.schema";

/** Envia apenas as ultimas N mensagens para a API, controlando uso de tokens */
const LIMITE_MENSAGENS_PARA_API = 20;

interface UseChatAssistenteRetorno {
  readonly mensagens: readonly MensagemChat[];
  readonly estaTransmitindo: boolean;
  readonly erro: string | null;
  readonly enviarMensagem: (conteudo: string) => Promise<void>;
  readonly limparHistorico: () => void;
  readonly pararTransmissao: () => void;
}

export function useChatAssistente(): UseChatAssistenteRetorno {
  const [mensagens, setMensagens] = useState<MensagemChat[]>([]);
  const [estaTransmitindo, setEstaTransmitindo] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const controladorAbortRef = useRef<AbortController | null>(null);

  const { identificadorPagina, dadosContexto } = useContextoPaginaChat();

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

      setMensagens((anteriores) => [
        ...anteriores,
        mensagemUsuario,
        mensagemAssistentePlaceholder,
      ]);

      // Montar mensagens para a API (ultimas N)
      const todasMensagens = [...mensagens, mensagemUsuario];
      const mensagensRecentes = todasMensagens.slice(
        -LIMITE_MENSAGENS_PARA_API,
      );
      const mensagensParaServidor: MensagemParaServidor[] =
        mensagensRecentes.map((mensagem) => ({
          papel: mensagem.papel,
          conteudo: mensagem.conteudo,
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
          const corpoErro = await resposta
            .json()
            .catch(() => ({ erro: "Erro desconhecido" }));
          throw new Error(
            (corpoErro as { erro?: string }).erro ?? `Erro ${resposta.status}`,
          );
        }

        const leitor = resposta.body!.getReader();
        const decodificadorTexto = new TextDecoder();
        let textoAcumulado = "";

        for (;;) {
          const { done, value } = await leitor.read();
          if (done) break;

          textoAcumulado += decodificadorTexto.decode(value, { stream: true });

          // Atualizar mensagem do assistente progressivamente
          const textoAtual = textoAcumulado;
          setMensagens((anteriores) =>
            anteriores.map((mensagem) =>
              mensagem.identificador === identificadorAssistente
                ? { ...mensagem, conteudo: textoAtual }
                : mensagem,
            ),
          );
        }
      } catch (erroCatch) {
        if ((erroCatch as Error).name === "AbortError") {
          // Usuario cancelou - manter resposta parcial
          return;
        }
        const mensagemErro =
          erroCatch instanceof Error
            ? erroCatch.message
            : "Erro inesperado";
        setErro(mensagemErro);
        // Remover placeholder vazio em caso de erro
        setMensagens((anteriores) =>
          anteriores.filter(
            (mensagem) =>
              mensagem.identificador !== identificadorAssistente ||
              mensagem.conteudo.length > 0,
          ),
        );
      } finally {
        setEstaTransmitindo(false);
        controladorAbortRef.current = null;
      }
    },
    [estaTransmitindo, mensagens, dadosContexto, identificadorPagina],
  );

  const limparHistorico = useCallback(() => {
    setMensagens([]);
    setErro(null);
  }, []);

  const pararTransmissao = useCallback(() => {
    controladorAbortRef.current?.abort();
  }, []);

  return {
    mensagens,
    estaTransmitindo,
    erro,
    enviarMensagem,
    limparHistorico,
    pararTransmissao,
  };
}
