"use client";

import { useRef, useEffect } from "react";
import Image from "next/image";
import { MensagemChatBolha } from "@/components/chat/chat-message";
import { CampoEntradaChat } from "@/components/chat/chat-input-field";
import { SuggestionChips } from "@/components/chat/suggestion-chips";
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
}: ChatBodyProps) {
  const areaScrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll on new messages
  useEffect(() => {
    if (areaScrollRef.current) {
      areaScrollRef.current.scrollTop = areaScrollRef.current.scrollHeight;
    }
  }, [mensagens]);

  return (
    <div className={cn("flex flex-1 flex-col", fs && "chat-fullscreen mx-auto w-full max-w-[80ch]")}>
      {/* Messages area */}
      <div
        ref={areaScrollRef}
        className={cn(
          "flex-1 overflow-y-auto",
          fs ? "space-y-8 p-8" : "space-y-4 p-4",
        )}
      >
        {mensagens.length === 0 && (
          <div className={cn(
            "flex h-full flex-col items-center justify-center text-center",
            fs ? "mx-auto max-w-4xl gap-8" : "gap-4",
          )}>
            <Image src="/fortuna-minimal.png" alt="Fortuna" width={64} height={64} className={cn("rounded-full", fs ? "h-16 w-16" : "h-10 w-10")} />
            <div>
              <p className={cn("text-muted-foreground", fs ? "text-lg" : "text-sm")}>
                Pergunte sobre seus investimentos.
              </p>
              <p className={cn("text-muted-foreground mt-1", fs ? "text-base" : "text-xs")}>
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
        {mensagens.map((mensagem, indice) => (
          <div key={mensagem.identificador} className={cn(fs && "mx-auto max-w-4xl")}>
            <MensagemChatBolha
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
            />
          </div>
        ))}
      </div>

      {/* Error banner */}
      {erro && (
        <div className="bg-destructive/5 border-t px-4 py-2">
          <p className={cn("text-destructive", fs ? "text-sm" : "text-xs")}>{erro}</p>
        </div>
      )}

      {/* Follow-up / AI suggestions */}
      {mensagens.length > 0 && !estaTransmitindo && (activeSuggestions.length > 0 || aiSuggestionsLoading) && (
        <SuggestionChips
          suggestions={activeSuggestions}
          onSelect={onSuggestionSelect}
          filterText={aiSuggestions.length > 0 ? undefined : inputValue}
          variant="follow-up"
          isLoading={aiSuggestionsLoading}
          fullscreen={fs}
        />
      )}

      {/* Input field */}
      <CampoEntradaChat
        onEnviar={enviarMensagem}
        onParar={pararTransmissao}
        estaTransmitindo={estaTransmitindo}
        value={inputValue}
        onValueChange={onInputValueChange}
        fullscreen={fs}
      />
    </div>
  );
}
