"use client";

import { useState, useCallback, useRef, useEffect, useMemo } from "react";

import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { ChatBody } from "@/components/chat/chat-body";
import { SidebarTabs } from "@/components/chat/sidebar-tabs";
import { ChatPageHeader } from "@/components/chat/chat-page-header";
import { ChatMobileSidebar } from "@/components/chat/chat-mobile-sidebar";
import type { ChatMobileSidebarHandle } from "@/components/chat/chat-mobile-sidebar";
import { useChatAssistant } from "@/hooks/use-chat-assistant";
import { useSavedMessages } from "@/hooks/use-saved-messages";
import { useConversas } from "@/hooks/use-conversations";
import { useChatPageContext } from "@/contexts/chat-page-context";
import { useChatSuggestions } from "@/hooks/use-chat-suggestions";
import { useSpeechSynthesis } from "@/hooks/use-speech-synthesis";
import { useAutoHideOnScroll } from "@/hooks/use-auto-hide-on-scroll";
import { stripMarkdown } from "@/lib/strip-markdown";
import { INITIAL_SUGGESTIONS } from "@/lib/chat-suggestions";
import { cn } from "@/lib/utils";
import type { MensagemChat } from "@/schemas/chat.schema";

export default function ChatPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const conversationId = params.id;

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [ttsEnabled, setTtsEnabled] = useState(false);
  const { ref: headerRef, onScroll: onMessagesScroll } = useAutoHideOnScroll("chat-auto-header--hidden");
  const [inputValue, setInputValue] = useState("");
  const [raciocinio, setRaciocinio] = useState(false);
  const prevTransmitindoRef = useRef(false);
  const mobileSidebarRef = useRef<ChatMobileSidebarHandle>(null);

  useEffect(() => {
    setRaciocinio(localStorage.getItem("chatReasoningEnabled") === "true");
  }, []);
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
    estaCarregandoConversa,
  } = useChatAssistant({ raciocinio });

  // Saved messages
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

  const toggleSidebar = useCallback(() => {
    if (window.innerWidth < 768) {
      mobileSidebarRef.current?.open();
    } else {
      setSidebarOpen((v) => !v);
    }
  }, []);

  const handleToggleTts = useCallback(() => {
    setTtsEnabled((v) => {
      if (v) stopSpeech();
      return !v;
    });
  }, [stopSpeech]);

  return (
    <div className="flex min-h-0 flex-1">
      {/* Desktop sidebar */}
      <div
        className={cn(
          "bg-background hidden border-r transition-all duration-200 md:block",
          sidebarOpen ? "w-80" : "w-0 overflow-hidden border-r-0",
        )}
      >
        <SidebarTabs
          conversaAtualId={conversaAtualId}
          onSelecionarConversa={handleSelecionarConversa}
          onNovaConversa={handleNovaConversa}
          fullscreen
          useLinks
        />
      </div>

      <ChatMobileSidebar
        ref={mobileSidebarRef}
        conversaAtualId={conversaAtualId}
        onSelecionarConversa={(id) => router.push(`/chat/${id}`)}
        onNovaConversa={() => { criarNovaConversa(); router.push("/chat"); }}
      />

      {/* Main chat area */}
      <div className="relative flex flex-1 flex-col overflow-hidden">
        <ChatPageHeader
          headerRef={headerRef}
          onToggleSidebar={toggleSidebar}
          ttsSupported={ttsSupported}
          ttsEnabled={ttsEnabled}
          speechStatus={speechStatus}
          onToggleTts={handleToggleTts}
          hasMessages={mensagens.length > 0}
          onClearHistory={limparHistorico}
          onBack={() => router.push(lastNonChatPageRef.current)}
        />

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
          savedMessageIds={savedMessageIds}
          onToggleSave={handleToggleSave}
          estaCarregandoConversa={estaCarregandoConversa}
        />
      </div>
    </div>
  );
}
