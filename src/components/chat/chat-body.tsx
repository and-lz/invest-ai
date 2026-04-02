"use client";

import { ChevronDown } from "lucide-react";
import { MensagemChatBolha } from "@/components/chat/chat-message";
import { CampoEntradaChat } from "@/components/chat/chat-input-field";
import { SuggestionChips } from "@/components/chat/suggestion-chips";
import { MessageBubbleSkeleton } from "@/components/chat/chat-body-skeleton";
import { ChatEmptyState } from "@/components/chat/chat-empty-state";
import { useAutoScroll } from "@/hooks/use-auto-scroll";
import { getDateLabel, isSameDay } from "@/lib/chat-date-utils";
import { cn } from "@/lib/utils";
import type { MensagemChat } from "@/schemas/chat.schema";
import type { ChatSuggestion } from "@/lib/chat-suggestions";
import type { ClaudeModelTier } from "@/lib/model-tiers";
import type { StreamingPhase } from "@/hooks/use-chat-assistant";

interface ChatBodyProps {
  readonly mensagens: readonly MensagemChat[];
  readonly estaTransmitindo: boolean;
  readonly streamingPhase: StreamingPhase;
  readonly erro: string | null;
  readonly enviarMensagem: (conteudo: string) => Promise<void>;
  readonly pararTransmissao: () => void;
  readonly reenviarUltimaMensagem: () => void;
  readonly fullscreen: boolean;
  readonly userImageUrl?: string;
  readonly userInitials?: string;
  readonly activeSuggestions: readonly ChatSuggestion[];
  readonly aiSuggestionsLoading: boolean;
  readonly inputValue: string;
  readonly onInputValueChange: (value: string) => void;
  readonly onSuggestionSelect: (text: string) => void;
  readonly onSuggestionPrefill?: (text: string) => void;
  readonly raciocinio?: boolean;
  readonly onRaciocinioChange?: (enabled: boolean) => void;
  readonly modoMercado?: boolean;
  readonly onModoMercadoChange?: (enabled: boolean) => void;
  readonly modelTier?: ClaudeModelTier;
  readonly onModelTierChange?: (tier: ClaudeModelTier) => void;
  readonly savedMessageIds?: ReadonlySet<string>;
  readonly onToggleSave?: (mensagem: MensagemChat) => void;
  readonly onRegenerate?: () => void;
  readonly estaCarregandoConversa?: boolean;
  readonly scrollAreaRef?: React.RefObject<HTMLDivElement | null>;
  readonly welcomeMessage?: string;
  readonly headerSlot?: React.ReactNode;
}

export function ChatBody({
  mensagens,
  estaTransmitindo,
  streamingPhase,
  erro,
  enviarMensagem,
  pararTransmissao,
  reenviarUltimaMensagem,
  fullscreen: fs,
  userImageUrl,
  userInitials,
  activeSuggestions,
  aiSuggestionsLoading,
  inputValue,
  onInputValueChange,
  onSuggestionSelect,
  onSuggestionPrefill,
  raciocinio,
  onRaciocinioChange,
  modoMercado,
  onModoMercadoChange,
  modelTier,
  onModelTierChange,
  savedMessageIds,
  onToggleSave,
  onRegenerate,
  estaCarregandoConversa,
  scrollAreaRef,
  welcomeMessage,
  headerSlot,
}: ChatBodyProps) {
  const { mergedScrollRef, showScrollBtn, hasNewMessages, scrollToBottom, handleScroll } =
    useAutoScroll({ messageCount: mensagens.length, scrollAreaRef });

  return (
    <div className={cn("relative flex min-h-0 flex-1 flex-col", fs && "chat-fullscreen")}>
      {/* Messages area */}
      <article
        ref={mergedScrollRef}
        onScroll={handleScroll}
        className={cn("min-h-0 flex-1 overflow-y-auto", fs ? "pb-40" : "pb-32")}
      >
        {headerSlot}
        {estaCarregandoConversa && (
          <div className={cn("space-y-3", fs ? "mx-auto max-w-[80ch] space-y-4 p-4 pt-12" : "p-3")}>
            <MessageBubbleSkeleton role="user" fullscreen={fs} contentLines={["w-3/5"]} />
            <MessageBubbleSkeleton role="assistant" fullscreen={fs} contentLines={["w-full", "w-full", "w-full", "w-2/3"]} />
            <MessageBubbleSkeleton role="user" fullscreen={fs} contentLines={["w-2/5"]} />
            <MessageBubbleSkeleton role="assistant" fullscreen={fs} contentLines={["w-full", "w-4/5"]} />
          </div>
        )}
        {!estaCarregandoConversa && mensagens.length === 0 && (
          <ChatEmptyState
            fullscreen={fs}
            welcomeMessage={welcomeMessage}
            suggestions={activeSuggestions}
            onSuggestionSelect={onSuggestionSelect}
          />
        )}
        {mensagens.length > 0 && (
          <div className={cn("space-y-3", fs ? "mx-auto max-w-[80ch] space-y-4 p-4 pt-12" : "p-3")}>
            {mensagens.map((mensagem, indice) => {
              const prev = mensagens[indice - 1];
              const showDateSep = !prev || !isSameDay(mensagem.criadaEm, prev.criadaEm);
              return (
                <div key={mensagem.identificador}>
                  {showDateSep && (
                    <div className="chat-date-sep flex items-center gap-3 py-2">
                      <div className="h-px flex-1 bg-border/30" />
                      <span className="text-muted-foreground shrink-0 text-[11px]">
                        {getDateLabel(mensagem.criadaEm)}
                      </span>
                      <div className="h-px flex-1 bg-border/30" />
                    </div>
                  )}
                  <MensagemChatBolha
                    mensagem={mensagem}
                    estaTransmitindo={
                      estaTransmitindo &&
                      mensagem.papel === "assistente" &&
                      indice === mensagens.length - 1
                    }
                    streamingPhase={
                      estaTransmitindo && indice === mensagens.length - 1
                        ? streamingPhase
                        : "idle"
                    }
                    userImageUrl={userImageUrl}
                    userInitials={userInitials}
                    onRetry={
                      mensagem.papel === "assistente" && indice === mensagens.length - 1
                        ? reenviarUltimaMensagem
                        : undefined
                    }
                    onRegenerate={
                      mensagem.papel === "assistente" && indice === mensagens.length - 1
                        ? onRegenerate
                        : undefined
                    }
                    fullscreen={fs}
                    isSaved={savedMessageIds?.has(mensagem.identificador)}
                    onToggleSave={onToggleSave ? () => onToggleSave(mensagem) : undefined}
                  />
                </div>
              );
            })}
          </div>
        )}

      </article>

      {/* Scroll-to-bottom FAB */}
      {showScrollBtn && mensagens.length > 0 && (
        <button
          onClick={scrollToBottom}
          type="button"
          className={cn(
            "absolute z-20 flex items-center justify-center rounded-full border bg-card shadow-md transition-all hover:bg-muted chat-scroll-btn-enter",
            fs ? "bottom-28 right-6 h-9 w-9" : "bottom-20 right-3 h-8 w-8",
          )}
          aria-label="Rolar para o final"
        >
          <ChevronDown className={cn(fs ? "h-5 w-5" : "h-4 w-4")} />
          {hasNewMessages && (
            <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-primary" />
          )}
        </button>
      )}

      {/* Error banner */}
      {erro && (
        <div className="bg-destructive/5 border-t px-4 py-2">
          <p className={cn("text-destructive", fs ? "text-sm" : "text-xs")}>{erro}</p>
        </div>
      )}

      {/* Floating footer: input overlay with gradient fade */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-background via-background/90 to-transparent pt-28">
        <div className="pointer-events-auto">
          {/* Quick reply chips — rendered above the input box */}
          {(activeSuggestions.length > 0 || aiSuggestionsLoading) && mensagens.length > 0 && !estaTransmitindo && (
            <SuggestionChips
              suggestions={activeSuggestions}
              onSelect={onSuggestionSelect}
              onPrefill={onSuggestionPrefill}
              variant="quick-reply"
              isLoading={aiSuggestionsLoading}
              fullscreen={fs}
            />
          )}
          <CampoEntradaChat
            onEnviar={enviarMensagem}
            onParar={pararTransmissao}
            estaTransmitindo={estaTransmitindo}
            value={inputValue}
            onValueChange={onInputValueChange}
            fullscreen={fs}
            raciocinio={raciocinio}
            onRaciocinioChange={onRaciocinioChange}
            modoMercado={modoMercado}
            onModoMercadoChange={onModoMercadoChange}
            modelTier={modelTier}
            onModelTierChange={onModelTierChange}
            hideBorderTop
          />
        </div>
      </div>
    </div>
  );
}
