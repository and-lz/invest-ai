"use client";

import { useCallback } from "react";
import { BotIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { PROMPTS_EXPLICACAO_CARD } from "@/lib/card-explanation-prompts";

/** Custom event name — listened by ChatWidget to open + auto-send */
export const EVENTO_ABRIR_CHAT_COM_PERGUNTA = "abrir-chat-com-pergunta";

export interface EventoAbrirChatDetalhe {
  readonly pergunta: string;
}

/** Dispatches a custom event to open the chat widget and auto-send a question. */
export function abrirChatComPergunta(pergunta: string): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent<EventoAbrirChatDetalhe>(EVENTO_ABRIR_CHAT_COM_PERGUNTA, {
      detail: { pergunta },
    }),
  );
}

interface BotaoExplicarIAProps {
  /** Card identifier key from PROMPTS_EXPLICACAO_CARD */
  readonly identificadorCard: string;
}

/**
 * Small ghost button with AI icon that opens the chat and asks it to explain
 * the specific chart/table card. Place inside <CardAction>.
 */
export function BotaoExplicarIA({ identificadorCard }: BotaoExplicarIAProps) {
  const handleClick = useCallback(() => {
    const pergunta =
      PROMPTS_EXPLICACAO_CARD[identificadorCard] ??
      "Explique este gráfico de forma simples para alguém que está começando a investir.";
    abrirChatComPergunta(pergunta);
  }, [identificadorCard]);

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={handleClick}
            className="ai-icon-hover text-muted-foreground/60"
            aria-label="Pedir para a IA explicar este gráfico"
          >
            <BotIcon />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="left" sideOffset={4}>
          Pedir para a IA explicar
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
