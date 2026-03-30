"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { AlertCircle, Bookmark, Brain, ChevronRight, RefreshCw } from "lucide-react";
import type { MensagemChat } from "@/schemas/chat.schema";
import type { StreamingPhase } from "@/hooks/use-chat-assistant";
import { ConteudoMarkdownChat } from "@/components/chat/chat-markdown-content";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

/** Matches `[ERRO]: <message>` at the end of streamed content */
const STREAM_ERROR_REGEX = /\n*\[ERRO\]:\s*(.+)$/;

interface MensagemChatBolhaProps {
  readonly mensagem: MensagemChat;
  readonly estaTransmitindo?: boolean;
  readonly streamingPhase?: StreamingPhase;
  readonly userImageUrl?: string;
  readonly userInitials?: string;
  readonly onRetry?: () => void;
  readonly fullscreen?: boolean;
  readonly isSaved?: boolean;
  readonly onToggleSave?: () => void;
}

export function MensagemChatBolha({
  mensagem,
  estaTransmitindo,
  streamingPhase = "idle",
  onRetry,
  fullscreen,
  isSaved,
  onToggleSave,
}: MensagemChatBolhaProps) {
  const ehUsuario = mensagem.papel === "usuario";
  const fs = fullscreen;

  // Detect stream errors embedded in assistant messages
  const errorMatch = !ehUsuario ? mensagem.conteudo.match(STREAM_ERROR_REGEX) : null;
  const streamError = errorMatch?.[1] ?? null;
  const cleanContent = streamError
    ? mensagem.conteudo.replace(STREAM_ERROR_REGEX, "").trim()
    : mensagem.conteudo;

  const isThinking = streamingPhase === "thinking";
  const hasThinkingContent = Boolean(mensagem.pensamento);

  // Auto-open reasoning during thinking phase, auto-collapse when responding starts
  const [reasoningOpen, setReasoningOpen] = useState(false);

  useEffect(() => {
    if (isThinking) {
      setReasoningOpen(true);
    } else if (streamingPhase === "responding" && hasThinkingContent) {
      setReasoningOpen(false);
    }
  }, [isThinking, streamingPhase, hasThinkingContent]);

  return (
    <div>
      {/* Thinking indicator — shown while AI is reasoning, before any content */}
      {!ehUsuario && isThinking && !hasThinkingContent && !cleanContent && (
        <div className={cn(
          "text-muted-foreground flex items-center gap-2 px-2 py-1.5",
          fs ? "text-sm" : "text-xs",
        )}>
          <Brain className="h-3.5 w-3.5 chat-thinking-pulse" />
          <span className="font-medium">Pensando...</span>
        </div>
      )}

      {/* Collapsible reasoning block (before the message) */}
      {!ehUsuario && (hasThinkingContent || isThinking) && (
        <Collapsible open={reasoningOpen} onOpenChange={setReasoningOpen}>
          <CollapsibleTrigger
            className={cn(
              "text-muted-foreground flex cursor-pointer items-center gap-1 rounded-md px-2 py-1 transition-colors hover:bg-muted/50",
              fs ? "text-xs" : "text-[11px]",
            )}
          >
            {isThinking ? (
              <Brain className="h-3 w-3 shrink-0 chat-thinking-pulse" />
            ) : (
              <ChevronRight
                className={cn(
                  "h-3 w-3 shrink-0 transition-transform duration-200",
                  reasoningOpen && "rotate-90",
                )}
              />
            )}
            <span className="font-medium">
              {isThinking ? "Pensando..." : "Raciocínio"}
            </span>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div
              className={cn(
                "text-muted-foreground mt-1 ml-2 border-l-2 border-border/40 pl-3 italic whitespace-pre-wrap",
                fs ? "text-sm" : "text-xs",
              )}
            >
              {mensagem.pensamento}
              {isThinking && <span className="chat-thinking-cursor" />}
            </div>
          </CollapsibleContent>
        </Collapsible>
      )}

      {/* Message content */}
      <div
        className={cn(
          "group/msg w-full flex",
          fs ? "py-2" : "py-1.5",
          ehUsuario ? "justify-end" : "justify-start",
        )}
      >
        <div
          className={cn(
            "relative",
            fs ? "text-base leading-relaxed" : "text-sm leading-relaxed",
            ehUsuario
              ? "bg-muted/40 rounded-2xl rounded-br-sm max-w-[85%] px-4 py-2.5"
              : "text-foreground w-full",
          )}
        >
          {cleanContent ? (
            <ConteudoMarkdownChat conteudo={cleanContent} ehUsuario={ehUsuario} fullscreen={fs} />
          ) : estaTransmitindo && !streamError ? (
            isThinking ? null : (
              <span className="text-muted-foreground inline-flex gap-1">
                <span className="animate-bounce">.</span>
                <span className="animate-bounce [animation-delay:0.1s]">.</span>
                <span className="animate-bounce [animation-delay:0.2s]">.</span>
              </span>
            )
          ) : (
            !ehUsuario &&
            !streamError &&
            onRetry && (
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground text-xs">
                  Resposta vazia — tente novamente.
                </span>
                <button
                  onClick={onRetry}
                  type="button"
                  className="text-primary flex items-center gap-1.5 text-xs font-medium hover:underline"
                >
                  <RefreshCw className="h-3 w-3" />
                  Tentar novamente
                </button>
              </div>
            )
          )}

          {/* Bookmark — appears on hover outside the message */}
          {onToggleSave && !estaTransmitindo && cleanContent && (
            <button
              onClick={onToggleSave}
              type="button"
              className={cn(
                "absolute top-0 transition-opacity",
                ehUsuario ? "-left-8" : "-right-8",
                fs ? "h-7 w-7" : "h-6 w-6",
                "inline-flex items-center justify-center rounded-md hover:bg-muted",
                isSaved
                  ? "text-primary opacity-100"
                  : "text-muted-foreground opacity-0 group-hover/msg:opacity-100",
              )}
              aria-label={isSaved ? "Remover dos salvos" : "Salvar mensagem"}
            >
              <Bookmark
                className={cn(fs ? "h-4 w-4" : "h-3.5 w-3.5", isSaved && "fill-current")}
              />
            </button>
          )}

          {/* Stream error with retry */}
          {streamError && (
            <div className={cn(cleanContent && "mt-3 border-t border-destructive/20 pt-3")}>
              <div className="flex items-start gap-2">
                <AlertCircle className="text-destructive mt-0.5 h-3.5 w-3.5 shrink-0" />
                <span className="text-destructive text-xs">{streamError}</span>
              </div>
              {onRetry && (
                <button
                  onClick={onRetry}
                  type="button"
                  className="text-primary mt-2 flex items-center gap-1.5 text-xs font-medium hover:underline"
                >
                  <RefreshCw className="h-3 w-3" />
                  Tentar novamente
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
