"use client";

import { cn } from "@/lib/utils";
import { AlertCircle, RefreshCw, User } from "lucide-react";
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
    <div
      className={cn(
        "w-full",
        !ehUsuario && "bg-muted/50",
        fs ? "px-5 py-4" : "px-4 py-3",
      )}
    >
      {/* Role label */}
      <div className={cn("mb-2 flex items-center gap-2", fs ? "gap-2.5" : "gap-2")}>
        {ehUsuario ? (
          <Avatar className={cn("shrink-0", fs ? "h-7 w-7" : "h-5 w-5")}>
            <AvatarImage src={userImageUrl} alt="Você" />
            <AvatarFallback className={cn("bg-primary/10", fs ? "text-xs" : "text-[10px]")}>
              {userInitials ?? <User className={fs ? "h-4 w-4" : "h-3 w-3"} />}
            </AvatarFallback>
          </Avatar>
        ) : (
          <Avatar className={cn("shrink-0 overflow-hidden", fs ? "h-7 w-7" : "h-5 w-5 border border-border/50")}>
            <AvatarImage src="/fortuna-minimal.png" alt="Fortuna" className="scale-[1.35]" />
            <AvatarFallback className={cn("bg-primary/10", fs ? "text-xs" : "text-[10px]")}>F</AvatarFallback>
          </Avatar>
        )}
        <span className={cn("font-medium", fs ? "text-sm" : "text-xs")}>
          {ehUsuario ? "Você" : "Fortuna"}
        </span>
      </div>

      {/* Message content */}
      <div className={fs ? "text-base leading-relaxed" : "text-sm leading-relaxed"}>
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
