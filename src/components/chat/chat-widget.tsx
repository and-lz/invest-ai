"use client";

import { useState, useCallback, useRef, useEffect, useMemo } from "react";
import { Bot, X, Trash2, Menu, Maximize2, Minimize2, Volume2, VolumeX } from "lucide-react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { MensagemChatBolha } from "@/components/chat/chat-message";
import { CampoEntradaChat } from "@/components/chat/chat-input-field";
import { SuggestionChips } from "@/components/chat/suggestion-chips";
import { ListaConversas } from "@/components/chat/conversations-list";
import { useChatAssistant } from "@/hooks/use-chat-assistant";
import { useChatPageContext } from "@/contexts/chat-page-context";
import { useChatSuggestions } from "@/hooks/use-chat-suggestions";
import { useSpeechSynthesis } from "@/hooks/use-speech-synthesis";
import { useNativeDialog } from "@/hooks/use-native-dialog";
import { stripMarkdown } from "@/lib/strip-markdown";
import { INITIAL_SUGGESTIONS } from "@/lib/chat-suggestions";
import {
  EVENTO_ABRIR_CHAT_COM_PERGUNTA,
  type EventoAbrirChatDetalhe,
} from "@/components/ui/ai-explain-button";
import { cn } from "@/lib/utils";
import { dialog } from "@/lib/design-system";


export function ChatWidget() {
  const [telaCheia, setTelaCheia] = useState(false);
  const [mostrarSidebar, setMostrarSidebar] = useState(false);
  const [ttsEnabled, setTtsEnabled] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const areaScrollRef = useRef<HTMLDivElement>(null);
  const prevTransmitindoRef = useRef(false);

  const { identificadorPagina } = useChatPageContext();

  const { data: session } = useSession();

  // Derive user initials from session name
  const userInitials = session?.user?.name
    ? session.user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : undefined;

  const userImageUrl = session?.user?.image ?? undefined;

  const { isSupported: ttsSupported, speak, stop: stopSpeech, status: speechStatus } =
    useSpeechSynthesis();

  const {
    mensagens,
    estaTransmitindo,
    enviarMensagem,
    limparHistorico,
    erro,
    pararTransmissao,
    conversaAtualId,
    criarNovaConversa,
    carregarConversa,
    followUpSuggestions,
    reenviarUltimaMensagem,
  } = useChatAssistant();

  // Recent message texts for AI suggestions context (last 4, truncated)
  const recentMessages = useMemo(
    () => mensagens.slice(-4).map((m) => m.conteudo.slice(0, 200)),
    [mensagens],
  );

  // AI-powered type-ahead suggestions (debounced, only when user is typing 3+ chars)
  const { suggestions: aiSuggestions, isLoading: aiSuggestionsLoading } = useChatSuggestions({
    input: inputValue,
    pageId: identificadorPagina,
    recentMessages,
    enabled: mensagens.length > 0 && !estaTransmitindo && inputValue.trim().length >= 3,
  });

  const activeSuggestions = useMemo(() => {
    if (mensagens.length === 0) {
      return INITIAL_SUGGESTIONS[identificadorPagina] ?? [];
    }
    // AI suggestions take priority when user is typing
    if (aiSuggestions.length > 0) {
      return aiSuggestions;
    }
    return followUpSuggestions;
  }, [mensagens.length, identificadorPagina, followUpSuggestions, aiSuggestions]);

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
    setTelaCheia(false);
    setEstaAberto(false);
  }, [stopSpeech]);

  const { dialogRef, open: _abrirDialog, close: fecharChat, handleBackdropClick } = useNativeDialog({
    onClose: handleFechar,
  });

  const abrirChat = useCallback(() => {
    _abrirDialog();
    setEstaAberto(true);
  }, [_abrirDialog]);

  // Auto-scroll ao receber novas mensagens
  useEffect(() => {
    if (areaScrollRef.current) {
      areaScrollRef.current.scrollTop = areaScrollRef.current.scrollHeight;
    }
  }, [mensagens]);

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

  // Listen for external "ask AI to explain" events from chart card buttons
  useEffect(() => {
    function handleAbrirComPergunta(evento: Event) {
      const { pergunta } = (evento as CustomEvent<EventoAbrirChatDetalhe>).detail;
      abrirChat();
      criarNovaConversa();
      // Small delay to let React render before sending
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
    [carregarConversa],
  );

  const handleNovaConversa = useCallback(() => {
    criarNovaConversa();
    setMostrarSidebar(false);
  }, [criarNovaConversa]);

  const handleFecharSidebar = useCallback(() => {
    setMostrarSidebar(false);
  }, []);

  // Shorthand for fullscreen conditional classes
  const fs = telaCheia;

  return (
    <>
      {/* Botao flutuante (FAB) */}
      <button
        onClick={abrirChat}
        className={cn(
          "ai-gradient-bg ai-fab fixed right-6 bottom-6 z-40 flex h-14 w-14 cursor-pointer items-center justify-center rounded-full",
          estaAberto && "!scale-0 !animate-none",
        )}
        type="button"
      >
        <Bot className="relative z-10 h-6 w-6" />
        <span className="sr-only">Abrir Fortuna</span>
      </button>

      {/* Chat dialog — transparent container fills viewport; inner div is the visible panel */}
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
        {/* Painel de chat */}
        <div
          className={cn(
            "bg-background absolute flex overflow-hidden border shadow-xl",
            telaCheia
              ? "inset-0 h-dvh w-dvw"
              : "left-0 top-0 h-dvh w-dvw md:inset-auto md:right-6 md:bottom-6 md:left-auto md:top-auto md:h-[85vh] md:max-h-[calc(100vh-3rem)] md:w-[420px] md:rounded-2xl",
          )}
          style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
        >
          {/* Backdrop da sidebar (mobile) */}
          {mostrarSidebar && (
            <div
              className="absolute inset-0 z-5 bg-black/40 transition-opacity md:hidden"
              onClick={handleFecharSidebar}
              aria-hidden="true"
            />
          )}

          {/* Sidebar de conversas (overlay, aberta apenas ao clicar) */}
          <div
            className={cn(
              "bg-background absolute z-10 h-full border-r transition-transform",
              fs ? "w-80" : "w-64",
              mostrarSidebar ? "translate-x-0" : "-translate-x-full",
            )}
          >
            <ListaConversas
              conversaAtualId={conversaAtualId}
              onSelecionarConversa={handleSelecionarConversa}
              onNovaConversa={handleNovaConversa}
              fullscreen={fs}
            />
          </div>

          {/* Area principal do chat */}
          <div className={cn("flex flex-1 flex-col", fs && "chat-fullscreen")}>
            {/* Cabecalho */}
            <div className={cn(
              "flex items-center justify-between border-b",
              fs ? "px-6 py-5" : "px-4 py-3",
            )}>
              <div className="flex items-center gap-2">
                {/* Botao toggle sidebar (historico de conversas) */}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setMostrarSidebar(!mostrarSidebar)}
                  className={fs ? "h-10 w-10" : "h-8 w-8"}
                >
                  <Menu className={fs ? "h-6 w-6" : "h-4 w-4"} />
                </Button>

                <Bot className={cn("text-muted-foreground", fs ? "h-7 w-7" : "h-5 w-5")} />
                <h3 className={cn("font-medium", fs ? "text-lg" : "text-sm")}>Fortuna</h3>
              </div>
              <div className="flex items-center gap-1">
                {ttsSupported && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setTtsEnabled((v) => {
                              if (v) stopSpeech();
                              return !v;
                            });
                          }}
                          className={cn(fs ? "h-10 w-10" : "h-8 w-8", ttsEnabled && "text-primary")}
                        >
                          {ttsEnabled ? (
                            <Volume2
                              className={cn(
                                fs ? "h-6 w-6" : "h-4 w-4",
                                speechStatus === "speaking" && "animate-pulse",
                              )}
                            />
                          ) : (
                            <VolumeX className={cn("text-muted-foreground", fs ? "h-6 w-6" : "h-4 w-4")} />
                          )}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        {ttsEnabled ? "Desativar leitura em voz alta" : "Ativar leitura em voz alta"}
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
                {mensagens.length > 0 && (
                  <Button variant="ghost" size="icon" onClick={limparHistorico} className={fs ? "h-10 w-10" : "h-8 w-8"}>
                    <Trash2 className={cn("text-muted-foreground", fs ? "h-6 w-6" : "h-4 w-4")} />
                    <span className="sr-only">Limpar historico</span>
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setTelaCheia((v) => !v)}
                  className={cn("hidden md:inline-flex", fs ? "h-10 w-10" : "h-8 w-8")}
                >
                  {telaCheia ? (
                    <Minimize2 className={cn("text-muted-foreground", fs ? "h-6 w-6" : "h-4 w-4")} />
                  ) : (
                    <Maximize2 className={cn("text-muted-foreground", fs ? "h-6 w-6" : "h-4 w-4")} />
                  )}
                  <span className="sr-only">{telaCheia ? "Sair da tela cheia" : "Tela cheia"}</span>
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={fecharChat}
                  className={fs ? "h-10 w-10" : "h-8 w-8"}
                >
                  <X className={cn("text-muted-foreground", fs ? "h-6 w-6" : "h-4 w-4")} />
                  <span className="sr-only">Fechar Fortuna</span>
                </Button>
              </div>
            </div>

            {/* Area de mensagens */}
            <div
              ref={areaScrollRef}
              className={cn(
                "flex-1 overflow-y-auto",
                fs ? "space-y-8 p-8" : "space-y-4 p-4",
              )}
            >
              {mensagens.length === 0 && (
                <div className={cn(
                  "flex h-full flex-col items-center justify-center text-center",
                  fs ? "mx-auto max-w-4xl gap-8" : "gap-4",
                )}>
                  <Bot className={cn("text-muted-foreground", fs ? "h-16 w-16" : "h-10 w-10")} />
                  <div>
                    <p className={cn("text-muted-foreground", fs ? "text-lg" : "text-sm")}>
                      Pergunte sobre seus investimentos.
                    </p>
                    <p className={cn("text-muted-foreground mt-1", fs ? "text-base" : "text-xs")}>
                      A Fortuna tem acesso aos dados da pagina atual.
                    </p>
                  </div>
                  <SuggestionChips
                    suggestions={activeSuggestions}
                    onSelect={handleSuggestionSelect}
                    variant="empty-state"
                    fullscreen={fs}
                  />
                </div>
              )}
              {mensagens.map((mensagem, indice) => (
                <div key={mensagem.identificador} className={cn(fs && "mx-auto max-w-4xl")}>
                  <MensagemChatBolha
                    mensagem={mensagem}
                    estaTransmitindo={
                      estaTransmitindo &&
                      mensagem.papel === "assistente" &&
                      indice === mensagens.length - 1
                    }
                    userImageUrl={userImageUrl}
                    userInitials={userInitials}
                    onRetry={
                      mensagem.papel === "assistente" && indice === mensagens.length - 1
                        ? reenviarUltimaMensagem
                        : undefined
                    }
                    fullscreen={fs}
                  />
                </div>
              ))}
            </div>

            {/* Banner de erro */}
            {erro && (
              <div className="bg-destructive/5 border-t px-4 py-2">
                <p className={cn("text-destructive", fs ? "text-sm" : "text-xs")}>{erro}</p>
              </div>
            )}

            {/* Follow-up / AI suggestions */}
            {mensagens.length > 0 && !estaTransmitindo && (activeSuggestions.length > 0 || aiSuggestionsLoading) && (
              <SuggestionChips
                suggestions={activeSuggestions}
                onSelect={handleSuggestionSelect}
                filterText={aiSuggestions.length > 0 ? undefined : inputValue}
                variant="follow-up"
                isLoading={aiSuggestionsLoading}
                fullscreen={fs}
              />
            )}

            {/* Campo de entrada */}
            <CampoEntradaChat
              onEnviar={enviarMensagem}
              onParar={pararTransmissao}
              estaTransmitindo={estaTransmitindo}
              value={inputValue}
              onValueChange={setInputValue}
              fullscreen={fs}
            />
          </div>
        </div>
      </dialog>
    </>
  );
}
