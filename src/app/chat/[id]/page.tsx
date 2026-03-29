"use client";

import { useState, useCallback, useRef, useEffect, useMemo } from "react";

import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Bot, Menu, Trash2, Volume2, VolumeX, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ChatBody } from "@/components/chat/chat-body";
import { ListaConversas } from "@/components/chat/conversations-list";
import { useChatAssistant } from "@/hooks/use-chat-assistant";
import { useChatPageContext } from "@/contexts/chat-page-context";
import { useChatSuggestions } from "@/hooks/use-chat-suggestions";
import { useSpeechSynthesis } from "@/hooks/use-speech-synthesis";
import { useAutoHideOnScroll } from "@/hooks/use-auto-hide-on-scroll";
import { useNativeDialog } from "@/hooks/use-native-dialog";
import { stripMarkdown } from "@/lib/strip-markdown";
import { INITIAL_SUGGESTIONS } from "@/lib/chat-suggestions";
import { cn } from "@/lib/utils";
import { dialog } from "@/lib/design-system";

export default function ChatPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const conversationId = params.id;

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [ttsEnabled, setTtsEnabled] = useState(false);
  const { ref: headerRef, onScroll: onMessagesScroll } = useAutoHideOnScroll("chat-auto-header--hidden");
  const [inputValue, setInputValue] = useState("");
  const [raciocinio, setRaciocinio] = useState(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem("chatReasoningEnabled") === "true";
  });
  const prevTransmitindoRef = useRef(false);
  const lastNonChatPageRef = useRef("/");

  const handleRaciocinioChange = useCallback((enabled: boolean) => {
    setRaciocinio(enabled);
    localStorage.setItem("chatReasoningEnabled", String(enabled));
  }, []);

  // Read last non-chat page on mount
  useEffect(() => {
    const stored = sessionStorage.getItem("lastNonChatPage");
    if (stored) lastNonChatPageRef.current = stored;
  }, []);

  const { identificadorPagina } = useChatPageContext();
  const { data: session } = useSession();

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
  } = useChatAssistant({ raciocinio });

  // Load conversation on mount or when ID changes
  const loadedIdRef = useRef<string | null>(null);
  useEffect(() => {
    if (conversationId && conversationId !== loadedIdRef.current) {
      loadedIdRef.current = conversationId;
      // 404 is expected for new conversations (created on first message send)
      void carregarConversa(conversationId);
    }
  }, [conversationId, carregarConversa]);

  // Suggestions logic (same as ChatWidget)
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

  const activeSuggestions = useMemo(() => {
    if (mensagens.length === 0) {
      return INITIAL_SUGGESTIONS[identificadorPagina] ?? [];
    }
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

  // TTS auto-read
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

  // Sidebar conversation select — navigate to URL
  const handleSelecionarConversa = useCallback(
    (identificador: string) => {
      router.push(`/chat/${identificador}`);
    },
    [router],
  );

  const handleNovaConversa = useCallback(() => {
    criarNovaConversa();
    router.push("/chat");
  }, [criarNovaConversa, router]);

  // Mobile sidebar drawer
  const {
    dialogRef: sidebarDialogRef,
    open: openMobileSidebar,
    close: closeMobileSidebar,
    handleBackdropClick: handleSidebarBackdrop,
  } = useNativeDialog();

  const toggleSidebar = useCallback(() => {
    // On mobile, use dialog drawer
    if (window.innerWidth < 768) {
      openMobileSidebar();
    } else {
      setSidebarOpen((v) => !v);
    }
  }, [openMobileSidebar]);

  const handleMobileSelecionarConversa = useCallback(
    (identificador: string) => {
      closeMobileSidebar();
      router.push(`/chat/${identificador}`);
    },
    [closeMobileSidebar, router],
  );

  const handleMobileNovaConversa = useCallback(() => {
    closeMobileSidebar();
    criarNovaConversa();
    router.push("/chat");
  }, [closeMobileSidebar, criarNovaConversa, router]);

  return (
    <div className="flex min-h-0 flex-1">
      {/* Desktop sidebar */}
      <div
        className={cn(
          "bg-background hidden border-r transition-all duration-200 md:block",
          sidebarOpen ? "w-80" : "w-0 overflow-hidden border-r-0",
        )}
      >
        <ListaConversas
          conversaAtualId={conversaAtualId}
          onSelecionarConversa={handleSelecionarConversa}
          onNovaConversa={handleNovaConversa}
          fullscreen
          useLinks
        />
      </div>

      {/* Mobile sidebar drawer */}
      <dialog
        ref={sidebarDialogRef}
        onClick={handleSidebarBackdrop}
        aria-label="Conversas"
        className={cn(
          "bg-background flex flex-col border-r p-0 shadow-lg md:hidden",
          dialog.backdrop,
          dialog.drawerLeft,
        )}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          bottom: 0,
          width: "min(320px, 80vw)",
          height: "100dvh",
          margin: 0,
        }}
      >
        <ListaConversas
          conversaAtualId={conversaAtualId}
          onSelecionarConversa={handleMobileSelecionarConversa}
          onNovaConversa={handleMobileNovaConversa}
          fullscreen
        />
      </dialog>

      {/* Main chat area */}
      <div className="relative flex flex-1 flex-col overflow-hidden">
        {/* Header — absolutely positioned, slides up via transform (no reflow) */}
        <div ref={headerRef} className="chat-auto-header bg-background/95 supports-[backdrop-filter]:bg-background/80 absolute inset-x-0 top-0 z-10 border-b backdrop-blur-sm">
          <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleSidebar}
              className="h-10 w-10"
            >
              <Menu className="h-5 w-5" />
            </Button>

            <Bot className="text-muted-foreground h-6 w-6" />
            <h3 className="text-lg font-medium">Fortuna</h3>
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
                      className={cn("h-10 w-10", ttsEnabled && "text-primary")}
                    >
                      {ttsEnabled ? (
                        <Volume2
                          className={cn(
                            "h-5 w-5",
                            speechStatus === "speaking" && "animate-pulse",
                          )}
                        />
                      ) : (
                        <VolumeX className="text-muted-foreground h-5 w-5" />
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
              <Button variant="ghost" size="icon" onClick={limparHistorico} className="h-10 w-10">
                <Trash2 className="text-muted-foreground h-5 w-5" />
                <span className="sr-only">Limpar historico</span>
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push(lastNonChatPageRef.current)}
              className="h-10 w-10"
            >
              <ArrowLeft className="text-muted-foreground h-5 w-5" />
              <span className="sr-only">Voltar</span>
            </Button>
          </div>
          </div>
        </div>

        {/* Chat body */}
        <ChatBody
          mensagens={mensagens}
          estaTransmitindo={estaTransmitindo}
          erro={erro}
          enviarMensagem={enviarMensagem}
          pararTransmissao={pararTransmissao}
          reenviarUltimaMensagem={reenviarUltimaMensagem}
          fullscreen
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
          onScroll={onMessagesScroll}
        />
      </div>
    </div>
  );
}
