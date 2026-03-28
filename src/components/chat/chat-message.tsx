"use client";

import { cn } from "@/lib/utils";
import { AlertCircle, Bot, RefreshCw, User } from "lucide-react";
import type { MensagemChat } from "@/schemas/chat.schema";
import { ConteudoMarkdownChat } from "@/components/chat/chat-markdown-content";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

/** Matches `[ERRO]: <message>` at the end of streamed content */
const STREAM_ERROR_REGEX = /\n*\[ERRO\]:\s*(.+)$/;

interface MensagemChatBolhaProps {
  readonly mensagem: MensagemChat;
  readonly estaTransmitindo?: boolean;
  readonly userImageUrl?: string;
  readonly userInitials?: string;
  readonly onRetry?: () => void;
  readonly fullscreen?: boolean;
}

export function MensagemChatBolha({
  mensagem,
  estaTransmitindo,
  userImageUrl,
  userInitials,
  onRetry,
  fullscreen,
}: MensagemChatBolhaProps) {
  const ehUsuario = mensagem.papel === "usuario";
  const fs = fullscreen;

  // Detect stream errors embedded in assistant messages
  const errorMatch = !ehUsuario ? mensagem.conteudo.match(STREAM_ERROR_REGEX) : null;
  const streamError = errorMatch?.[1] ?? null;
  const cleanContent = streamError
    ? mensagem.conteudo.replace(STREAM_ERROR_REGEX, "").trim()
    : mensagem.conteudo;

  return (
    <div className={cn("flex gap-3", ehUsuario ? "flex-row-reverse" : "flex-row")}>
      {/* Avatar */}
      {ehUsuario ? (
        <Avatar className={cn("shrink-0", fs ? "h-12 w-12" : "h-8 w-8")}>
          <AvatarImage src={userImageUrl} alt="Você" />
          <AvatarFallback className={cn("bg-primary/10", fs ? "text-base" : "text-xs")}>
            {userInitials ?? <User className={fs ? "h-6 w-6" : "h-4 w-4"} />}
          </AvatarFallback>
        </Avatar>
      ) : (
        <div
          className={cn(
            "flex shrink-0 items-center justify-center rounded-full bg-secondary",
            fs ? "h-12 w-12" : "h-8 w-8",
          )}
        >
          <Bot className={fs ? "h-6 w-6" : "h-4 w-4"} />
        </div>
      )}

      {/* Bolha de mensagem */}
      <div
        className={cn(
          "rounded-2xl leading-relaxed",
          fs
            ? "max-w-[80ch] px-7 py-4 text-2xl"
            : "max-w-[80%] px-4 py-2.5 text-sm",
          ehUsuario ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground",
        )}
      >
        {cleanContent ? (
          <ConteudoMarkdownChat conteudo={cleanContent} ehUsuario={ehUsuario} fullscreen={fs} />
        ) : (
          estaTransmitindo &&
          !streamError && (
            <span className="inline-flex gap-1">
              <span className="animate-bounce">.</span>
              <span className="animate-bounce [animation-delay:0.1s]">.</span>
              <span className="animate-bounce [animation-delay:0.2s]">.</span>
            </span>
          )
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
  );
}
