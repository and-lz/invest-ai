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
    <div className={cn("flex gap-3", ehUsuario ? "flex-row-reverse" : "flex-row")}>
      {/* Avatar */}
      <div
        className={cn(
          "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
          ehUsuario ? "bg-primary/10" : "bg-secondary",
        )}
      >
        {ehUsuario ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
      </div>

      {/* Bolha de mensagem */}
      <div
        className={cn(
          "max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
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
