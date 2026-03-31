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
  readonly aiSuggestions: readonly ChatSuggestion[];
  readonly raciocinio?: boolean;
  readonly onRaciocinioChange?: (enabled: boolean) => void;
  readonly modelTier?: ClaudeModelTier;
  readonly onModelTierChange?: (tier: ClaudeModelTier) => void;
  readonly onScroll?: (event: React.UIEvent<HTMLDivElement>) => void;
  readonly savedMessageIds?: ReadonlySet<string>;
  readonly onToggleSave?: (mensagem: MensagemChat) => void;
  readonly estaCarregandoConversa?: boolean;
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
  aiSuggestions,
  raciocinio,
  onRaciocinioChange,
  modelTier,
  onModelTierChange,
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
    <div className={cn("relative flex min-h-0 flex-1 flex-col", fs && "chat-fullscreen")}>
      {/* Messages area */}
      <div
        ref={areaScrollRef}
        onScroll={onScroll}
        className={cn("min-h-0 flex-1 overflow-y-auto", fs ? "pb-28" : "pb-20")}
      >
        {estaCarregandoConversa && (
          <div className={cn("space-y-3", fs ? "mx-auto max-w-[80ch] space-y-4 p-4 pt-12" : "p-3")}>
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
          <div className={cn("space-y-3", fs ? "mx-auto max-w-[80ch] space-y-4 p-4 pt-12" : "p-3")}>
            {mensagens.map((mensagem, indice) => (
              <MensagemChatBolha
                key={mensagem.identificador}
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
                fullscreen={fs}
                isSaved={savedMessageIds?.has(mensagem.identificador)}
                onToggleSave={onToggleSave ? () => onToggleSave(mensagem) : undefined}
              />
            ))}
          </div>
        )}

      </div>

      {/* Error banner */}
      {erro && (
        <div className="bg-destructive/5 border-t px-4 py-2">
          <p className={cn("text-destructive", fs ? "text-sm" : "text-xs")}>{erro}</p>
        </div>
      )}

      {/* Floating footer: gradient fade + input overlay */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10">
        {/* Gradient fade from transparent → background */}
        <div className={cn("bg-gradient-to-b from-transparent to-card", fs ? "h-10" : "h-6")} />
        {/* Input container with solid bg so text is readable */}
        <div className="pointer-events-auto bg-card">
          <CampoEntradaChat
            onEnviar={enviarMensagem}
            onParar={pararTransmissao}
            estaTransmitindo={estaTransmitindo}
            value={inputValue}
            onValueChange={onInputValueChange}
            fullscreen={fs}
            raciocinio={raciocinio}
            onRaciocinioChange={onRaciocinioChange}
            modelTier={modelTier}
            onModelTierChange={onModelTierChange}
            hideBorderTop
            suggestions={mensagens.length > 0 && !estaTransmitindo ? activeSuggestions : undefined}
            suggestionsLoading={mensagens.length > 0 && !estaTransmitindo ? aiSuggestionsLoading : false}
            onSuggestionSelect={onSuggestionSelect}
            suggestionsFilterText={aiSuggestions.length > 0 ? undefined : inputValue}
          />
        </div>
      </div>
    </div>
  );
}

/** Mirrors the exact DOM of MensagemChatBolha but with skeleton placeholders. */
function MessageBubbleSkeleton({
  fullscreen: fs,
  contentLines,
}: {
  readonly role: "user" | "assistant";
  readonly fullscreen: boolean;
  /** Width classes for each skeleton text line (e.g. ["w-full", "w-4/5"]) */
  readonly contentLines: readonly string[];
}) {
  return (
    <div className={cn("w-full", fs ? "py-2" : "py-1.5")}>
      <div className={cn("space-y-2", fs ? "text-base leading-relaxed" : "text-sm leading-relaxed")}>
        {contentLines.map((widthCls, i) => (
          <Skeleton
            key={i}
            className={cn("rounded", widthCls, fs ? "h-4" : "h-3.5")}
          />
        ))}
      </div>
    </div>
  );
}
