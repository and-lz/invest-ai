"use client";

import { HelpCircle } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface InfoTooltipProps {
  readonly conteudo: string;
  readonly tamanhoIcone?: string;
  readonly className?: string;
  readonly lado?: "top" | "right" | "bottom" | "left";
  readonly larguraMaxima?: string;
}

export function InfoTooltip({
  conteudo,
  tamanhoIcone = "h-3.5 w-3.5",
  className,
  lado = "top",
  larguraMaxima = "max-w-xs",
}: InfoTooltipProps) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            className={cn(
              "inline-flex items-center justify-center rounded-full",
              "text-muted-foreground/60 hover:text-muted-foreground",
              "focus-visible:ring-ring focus-visible:ring-2 focus-visible:outline-none",
              "transition-colors",
              className,
            )}
            aria-label="Saiba mais"
          >
            <HelpCircle className={tamanhoIcone} />
          </button>
        </TooltipTrigger>
        <TooltipContent
          side={lado}
          className={cn(larguraMaxima, "text-sm leading-relaxed")}
          sideOffset={4}
        >
          {conteudo}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
