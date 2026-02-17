"use client";

import { cn } from "@/lib/utils";
import { Bot, User } from "lucide-react";
import type { MensagemChat } from "@/schemas/chat.schema";
import { ConteudoMarkdownChat } from "@/components/chat/conteudo-markdown-chat";

interface MensagemChatBolhaProps {
  readonly mensagem: MensagemChat;
  readonly estaTransmitindo?: boolean;
}

export function MensagemChatBolha({ mensagem, estaTransmitindo }: MensagemChatBolhaProps) {
  const ehUsuario = mensagem.papel === "usuario";

  return (
    <div className={cn("flex gap-2", ehUsuario ? "flex-row-reverse" : "flex-row")}>
      {/* Avatar */}
      <div
        className={cn(
          "flex h-6 w-6 shrink-0 items-center justify-center rounded-full",
          ehUsuario ? "bg-primary/10" : "bg-secondary",
        )}
      >
        {ehUsuario ? <User className="h-3 w-3" /> : <Bot className="h-3 w-3" />}
      </div>

      {/* Bolha de mensagem */}
      <div
        className={cn(
          "max-w-[85%] rounded-xl px-3 py-1.5 text-sm leading-relaxed",
          ehUsuario ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground",
        )}
      >
        {mensagem.conteudo ? (
          <ConteudoMarkdownChat conteudo={mensagem.conteudo} ehUsuario={ehUsuario} />
        ) : (
          estaTransmitindo && (
            <span className="inline-flex gap-1">
              <span className="animate-bounce">.</span>
              <span className="animate-bounce [animation-delay:0.1s]">.</span>
              <span className="animate-bounce [animation-delay:0.2s]">.</span>
            </span>
          )
        )}
      </div>
    </div>
  );
}
