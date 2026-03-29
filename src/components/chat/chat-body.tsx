"use client";

import { useRef, useEffect } from "react";
import Image from "next/image";
import { MensagemChatBolha } from "@/components/chat/chat-message";
import { CampoEntradaChat } from "@/components/chat/chat-input-field";
import { SuggestionChips } from "@/components/chat/suggestion-chips";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { MensagemChat } from "@/schemas/chat.schema";
import type { ChatSuggestion } from "@/lib/chat-suggestions";

interface ChatBodyProps {
  readonly mensagens: readonly MensagemChat[];
  readonly estaTransmitindo: boolean;
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
  readonly aiSuggestions: readonly ChatSuggestion[];
  readonly raciocinio?: boolean;
  readonly onRaciocinioChange?: (enabled: boolean) => void;
  readonly onScroll?: (event: React.UIEvent<HTMLDivElement>) => void;
  readonly savedMessageIds?: ReadonlySet<string>;
  readonly onToggleSave?: (mensagem: MensagemChat) => void;
  readonly estaCarregandoConversa?: boolean;
}

export function ChatBody({
  mensagens,
  estaTransmitindo,
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
  aiSuggestions,
  raciocinio,
  onRaciocinioChange,
  onScroll,
  savedMessageIds,
  onToggleSave,
  estaCarregandoConversa,
}: ChatBodyProps) {
  const areaScrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll on new messages
  useEffect(() => {
    if (areaScrollRef.current) {
      areaScrollRef.current.scrollTop = areaScrollRef.current.scrollHeight;
    }
  }, [mensagens]);

  return (
    <div className={cn("flex min-h-0 flex-1 flex-col", fs && "chat-fullscreen")}>
      {/* Messages area */}
      <div
        ref={areaScrollRef}
        onScroll={onScroll}
        className="relative min-h-0 flex-1 overflow-y-auto"
      >
        {estaCarregandoConversa && (
          <div className={cn("space-y-3", fs ? "mx-auto max-w-[80ch] space-y-4 p-4 pt-[72px]" : "p-3")}>
            <MessageBubbleSkeleton role="user" fullscreen={fs} contentLines={["w-3/5"]} />
            <MessageBubbleSkeleton role="assistant" fullscreen={fs} contentLines={["w-full", "w-full", "w-full", "w-2/3"]} />
            <MessageBubbleSkeleton role="user" fullscreen={fs} contentLines={["w-2/5"]} />
            <MessageBubbleSkeleton role="assistant" fullscreen={fs} contentLines={["w-full", "w-4/5"]} />
          </div>
        )}
        {!estaCarregandoConversa && mensagens.length === 0 && (
          <div className={cn(
            "flex h-full flex-col items-center justify-center text-center",
            fs ? "mx-auto max-w-4xl gap-6" : "gap-4",
          )}>
            <Image src="/fortuna-minimal.png" alt="Fortuna" width={48} height={48} className={cn("opacity-60", fs ? "h-12 w-12" : "h-10 w-10")} />
            <div>
              <p className={cn("text-muted-foreground", fs ? "text-base" : "text-sm")}>
                Pergunte sobre seus investimentos.
              </p>
              <p className={cn("text-muted-foreground mt-1", fs ? "text-sm" : "text-xs")}>
                A Fortuna tem acesso aos dados da pagina atual.
              </p>
            </div>
            <SuggestionChips
              suggestions={activeSuggestions}
              onSelect={onSuggestionSelect}
              variant="empty-state"
              fullscreen={fs}
            />
          </div>
        )}
        {mensagens.length > 0 && (
          <div className={cn("space-y-3", fs ? "mx-auto max-w-[80ch] space-y-4 p-4 pt-[72px]" : "p-3")}>
            {mensagens.map((mensagem, indice) => (
              <MensagemChatBolha
                key={mensagem.identificador}
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
                isSaved={savedMessageIds?.has(mensagem.identificador)}
                onToggleSave={onToggleSave ? () => onToggleSave(mensagem) : undefined}
              />
            ))}
          </div>
        )}

        {/* Floating follow-up / AI suggestions */}
        {mensagens.length > 0 && !estaTransmitindo && (activeSuggestions.length > 0 || aiSuggestionsLoading) && (
          <div className="pointer-events-none sticky bottom-0">
            <SuggestionChips
              suggestions={activeSuggestions}
              onSelect={onSuggestionSelect}
              filterText={aiSuggestions.length > 0 ? undefined : inputValue}
              variant="floating"
              isLoading={aiSuggestionsLoading}
              fullscreen={fs}
            />
          </div>
        )}
      </div>

      {/* Error banner */}
      {erro && (
        <div className="bg-destructive/5 border-t px-4 py-2">
          <p className={cn("text-destructive", fs ? "text-sm" : "text-xs")}>{erro}</p>
        </div>
      )}

      {/* Input field */}
      <CampoEntradaChat
        onEnviar={enviarMensagem}
        onParar={pararTransmissao}
        estaTransmitindo={estaTransmitindo}
        value={inputValue}
        onValueChange={onInputValueChange}
        fullscreen={fs}
        raciocinio={raciocinio}
        onRaciocinioChange={onRaciocinioChange}
      />
    </div>
  );
}

/** Mirrors the exact DOM of MensagemChatBolha but with skeleton placeholders. */
function MessageBubbleSkeleton({
  role,
  fullscreen: fs,
  contentLines,
}: {
  readonly role: "user" | "assistant";
  readonly fullscreen: boolean;
  /** Width classes for each skeleton text line (e.g. ["w-full", "w-4/5"]) */
  readonly contentLines: readonly string[];
}) {
  const isUser = role === "user";
  return (
    <div className="space-y-1">
      {/* Message bubble — same classes as MensagemChatBolha */}
      <div
        className={cn(
          "group/msg w-full rounded-lg",
          !isUser && "bg-muted/50",
          fs ? "px-5 py-4" : "px-4 py-3",
        )}
      >
        {/* Role label row — same as real: avatar + name */}
        <div className={cn("mb-2 flex items-center", fs ? "gap-2.5" : "gap-2")}>
          <Skeleton className={cn("shrink-0 rounded-full", fs ? "h-7 w-7" : "h-5 w-5")} />
          <Skeleton className={cn("rounded", fs ? "h-3.5 w-12" : "h-3 w-8")} />
        </div>
        {/* Content — same text size leading as real */}
        <div className={cn("space-y-2", fs ? "text-base leading-relaxed" : "text-sm leading-relaxed")}>
          {contentLines.map((widthCls, i) => (
            <Skeleton
              key={i}
              className={cn("rounded", widthCls, fs ? "h-4" : "h-3.5")}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
