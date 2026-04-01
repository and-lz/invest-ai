"use client";

import { useState, useCallback, useRef, useEffect, useMemo } from "react";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { usePathname, useRouter } from "next/navigation";
import { ChatBody } from "@/components/chat/chat-body";
import { ChatHeader } from "@/components/chat/chat-header";
import { SidebarTabs } from "@/components/chat/sidebar-tabs";
import { useChatAssistant } from "@/hooks/use-chat-assistant";
import { useSavedMessages } from "@/hooks/use-saved-messages";
import { useConversas } from "@/hooks/use-conversations";
import { useChatPageContext } from "@/contexts/chat-page-context";
import { useChatSuggestions } from "@/hooks/use-chat-suggestions";
import { useSpeechSynthesis } from "@/hooks/use-speech-synthesis";
import { useNativeDialog } from "@/hooks/use-native-dialog";
import { useChatWidgetState } from "@/hooks/use-chat-widget-state";
import { stripMarkdown } from "@/lib/strip-markdown";
import { INITIAL_SUGGESTIONS, gerarSugestoesDashboard, gerarBoasVindas } from "@/lib/chat-suggestions";
import {
  EVENTO_ABRIR_CHAT_COM_PERGUNTA,
  type EventoAbrirChatDetalhe,
} from "@/components/ui/ai-explain-button";
import { cn } from "@/lib/utils";
import { dialog } from "@/lib/design-system";
import { notificar } from "@/lib/notifier";
import type { MensagemChat } from "@/schemas/chat.schema";

export function ChatWidget() {
  const pathname = usePathname();
  const router = useRouter();
  const isOnChatPage = pathname.startsWith("/chat");

  const telaCheia = false;
  const [inputValue, setInputValue] = useState("");
  const prevTransmitindoRef = useRef(false);

  const {
    mostrarSidebar,
    setMostrarSidebar,
    ttsEnabled,
    raciocinio,
    modelTier,
    handleRaciocinioChange,
    handleModelTierChange,
    toggleSidebar,
    closeSidebar,
    toggleTts,
  } = useChatWidgetState();

  const { identificadorPagina, resumoContexto } = useChatPageContext();

  const { data: session } = useSession();

  const userInitials = session?.user?.name
    ? session.user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : undefined;
  const userImageUrl = session?.user?.image ?? undefined;

  const { isSupported: ttsSupported, speak, stop: stopSpeech, status: speechStatus } =
    useSpeechSynthesis();

  const {
    mensagens,
    estaTransmitindo,
    streamingPhase,
    enviarMensagem,
    limparHistorico,
    erro,
    pararTransmissao,
    conversaAtualId,
    criarNovaConversa,
    carregarConversa,
    followUpSuggestions,
    reenviarUltimaMensagem,
  } = useChatAssistant({ raciocinio, modelTier });

  const { savedMessageIds, saveMessage, unsaveMessage } = useSavedMessages();
  const { conversas } = useConversas();

  const handleToggleSave = useCallback(
    (mensagem: MensagemChat) => {
      if (savedMessageIds.has(mensagem.identificador)) {
        void unsaveMessage(mensagem.identificador);
      } else if (conversaAtualId) {
        const conversa = conversas.find((c) => c.identificador === conversaAtualId);
        void saveMessage({
          conversaId: conversaAtualId,
          tituloConversa: conversa?.titulo ?? "Conversa",
          mensagemId: mensagem.identificador,
          papel: mensagem.papel,
          conteudo: mensagem.conteudo,
        });
      }
    },
    [savedMessageIds, unsaveMessage, saveMessage, conversaAtualId, conversas],
  );

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
    if (mensagens.length === 0) {
      return initialSuggestions;
    }
    if (aiSuggestions.length > 0) {
      return aiSuggestions;
    }
    return followUpSuggestions.length > 0 ? followUpSuggestions : initialSuggestions;
  }, [mensagens.length, initialSuggestions, followUpSuggestions, aiSuggestions]);

  const welcomeMessage = useMemo(
    () =>
      identificadorPagina === "dashboard" && resumoContexto
        ? gerarBoasVindas(resumoContexto)
        : undefined,
    [identificadorPagina, resumoContexto],
  );

  const handleSuggestionSelect = useCallback(
    (text: string) => {
      setInputValue("");
      void enviarMensagem(text);
    },
    [enviarMensagem],
  );

  const [estaAberto, setEstaAberto] = useState(false);

  const handleFechar = useCallback(() => {
    stopSpeech();
    setMostrarSidebar(false);
    setEstaAberto(false);
  }, [stopSpeech, setMostrarSidebar]);

  const { dialogRef, open: _abrirDialog, close: fecharChat, handleBackdropClick } = useNativeDialog({
    onClose: handleFechar,
  });

  const abrirChat = useCallback(() => {
    _abrirDialog();
    setEstaAberto(true);
  }, [_abrirDialog]);

  // Auto-read: when streaming ends and TTS is enabled, read the last assistant message
  useEffect(() => {
    const wasTransmitting = prevTransmitindoRef.current;
    prevTransmitindoRef.current = estaTransmitindo;

    if (wasTransmitting && !estaTransmitindo && ttsEnabled) {
      const lastMessage = mensagens[mensagens.length - 1];
      if (lastMessage?.papel === "assistente" && lastMessage.conteudo) {
        const plainText = stripMarkdown(lastMessage.conteudo);
        if (plainText) speak(plainText);
      }
    }
  }, [estaTransmitindo, ttsEnabled, mensagens, speak]);

  // Listen for external "ask AI to explain" events
  useEffect(() => {
    function handleAbrirComPergunta(evento: Event) {
      const { pergunta } = (evento as CustomEvent<EventoAbrirChatDetalhe>).detail;
      abrirChat();
      criarNovaConversa();
      setTimeout(() => {
        void enviarMensagem(pergunta);
      }, 100);
    }

    window.addEventListener(EVENTO_ABRIR_CHAT_COM_PERGUNTA, handleAbrirComPergunta);
    return () => {
      window.removeEventListener(EVENTO_ABRIR_CHAT_COM_PERGUNTA, handleAbrirComPergunta);
    };
  }, [abrirChat, criarNovaConversa, enviarMensagem]);

  const handleSelecionarConversa = useCallback(
    async (identificador: string) => {
      await carregarConversa(identificador);
      setMostrarSidebar(false);
    },
    [carregarConversa, setMostrarSidebar],
  );

  const handleNovaConversa = useCallback(() => {
    criarNovaConversa();
    setMostrarSidebar(false);
  }, [criarNovaConversa, setMostrarSidebar]);

  const fs = telaCheia;

  return (
    <>
      {/* FAB -- hidden on /chat/* pages */}
      {!isOnChatPage && (
        <button
          onClick={abrirChat}
          className={cn(
            "ai-fab fixed right-6 bottom-6 z-40 flex h-14 w-14 cursor-pointer items-center justify-center overflow-hidden rounded-full shadow-lg transition-transform hover:scale-105 active:scale-95",
            estaAberto && "!scale-0 !animate-none",
          )}
          type="button"
        >
          <Image src="/fortuna-minimal.png" alt="Fortuna" width={56} height={56} className="h-14 w-14 object-cover" />
          <span className="sr-only">Abrir Fortuna</span>
        </button>
      )}

      <dialog
        ref={dialogRef}
        onClick={handleBackdropClick}
        className={cn(dialog.backdrop, "bg-transparent p-0")}
        style={{
          position: "fixed",
          inset: 0,
          width: "100vw",
          height: "100dvh",
          margin: 0,
        }}
      >
        <div
          className={cn(
            "bg-background absolute flex overflow-hidden border shadow-xl",
            telaCheia
              ? "inset-0 h-dvh w-dvw"
              : "left-0 top-0 h-dvh w-dvw md:inset-auto md:right-6 md:bottom-6 md:left-auto md:top-auto md:h-[85vh] md:max-h-[calc(100vh-3rem)] md:w-[420px] md:rounded-2xl",
          )}
          style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
        >
          {/* Sidebar backdrop (mobile) */}
          {mostrarSidebar && (
            <div
              className="absolute inset-0 z-5 bg-black/40 transition-opacity md:hidden"
              onClick={closeSidebar}
              aria-hidden="true"
            />
          )}

          {/* Sidebar */}
          <div
            className={cn(
              "bg-background absolute z-10 h-full border-r transition-transform",
              fs ? "w-80" : "w-64",
              mostrarSidebar ? "translate-x-0" : "-translate-x-full",
            )}
          >
            <SidebarTabs
              conversaAtualId={conversaAtualId}
              onSelecionarConversa={handleSelecionarConversa}
              onNovaConversa={handleNovaConversa}
              fullscreen={fs}
            />
          </div>

          {/* Main chat area */}
          <div className="flex flex-1 flex-col">
            <ChatHeader
              fullscreen={fs}
              onToggleSidebar={toggleSidebar}
              ttsSupported={ttsSupported}
              ttsEnabled={ttsEnabled}
              onToggleTts={() => {
                const wasEnabled = ttsEnabled;
                toggleTts(stopSpeech);
                if (!wasEnabled) {
                  notificar.warning("Qualidade de voz limitada", {
                    description: "A leitura usa a voz do navegador, que pode soar artificial. Para melhor experiência, instale uma voz premium em Ajustes do Sistema > Acessibilidade > Conteúdo Falado.",
                  });
                }
              }}
              speechStatus={speechStatus}
              hasMensagens={mensagens.length > 0}
              onLimparHistorico={limparHistorico}
              onOpenFullscreen={() => { fecharChat(); router.push(conversaAtualId ? `/chat/${conversaAtualId}` : "/chat"); }}
              onFechar={fecharChat}
            />

            <ChatBody
              mensagens={mensagens}
              estaTransmitindo={estaTransmitindo}
              streamingPhase={streamingPhase}
              erro={erro}
              enviarMensagem={enviarMensagem}
              pararTransmissao={pararTransmissao}
              reenviarUltimaMensagem={reenviarUltimaMensagem}
              fullscreen={fs}
              userImageUrl={userImageUrl}
              userInitials={userInitials}
              activeSuggestions={activeSuggestions}
              aiSuggestionsLoading={aiSuggestionsLoading}
              inputValue={inputValue}
              onInputValueChange={setInputValue}
              onSuggestionSelect={handleSuggestionSelect}
              aiSuggestions={aiSuggestions}
              raciocinio={raciocinio}
              onRaciocinioChange={handleRaciocinioChange}
              modelTier={modelTier}
              onModelTierChange={handleModelTierChange}
              savedMessageIds={savedMessageIds}
              onToggleSave={handleToggleSave}
              welcomeMessage={welcomeMessage}
            />
          </div>
        </div>
      </dialog>
    </>
  );
}
