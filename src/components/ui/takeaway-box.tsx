"use client";

import { useState, useCallback, useRef } from "react";
import {
  CheckCircle2,
  AlertCircle,
  Info,
  BotIcon,
  Loader2,
  RefreshCw,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { tipografia, icone } from "@/lib/design-system";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

type TipoConclusao = "positivo" | "neutro" | "atencao";

interface Conclusao {
  readonly texto: string;
  readonly tipo: TipoConclusao;
}

interface TakeawayBoxProps {
  readonly conclusoes: Conclusao[];
  readonly className?: string;
}

const INDICATOR_ICONS: Record<TipoConclusao, LucideIcon> = {
  positivo: CheckCircle2,
  atencao: AlertCircle,
  neutro: Info,
};

const ICON_COLORS: Record<TipoConclusao, string> = {
  positivo: "text-success",
  atencao: "text-warning",
  neutro: "text-muted-foreground",
};

interface ExplanationState {
  explanations: Record<string, string>;
  status: "idle" | "loading" | "success" | "error";
  errorMessage?: string;
}

const INITIAL_STATE: ExplanationState = {
  explanations: {},
  status: "idle",
};

async function fetchExplanations(
  conclusions: Conclusao[],
): Promise<Record<string, string>> {
  const response = await fetch("/api/explain-takeaway", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      conclusions: conclusions.map((c) => ({
        text: c.texto,
        type: c.tipo,
      })),
    }),
  });

  if (!response.ok) {
    const errorBody = (await response.json().catch(() => ({}))) as {
      erro?: string;
    };
    throw new Error(errorBody.erro ?? "Falha ao gerar explicações");
  }

  const data = (await response.json()) as {
    explanations: Record<string, string>;
  };
  return data.explanations;
}

export type { Conclusao, TipoConclusao };

export function TakeawayBox({ conclusoes, className }: TakeawayBoxProps) {
  const [openIndices, setOpenIndices] = useState<Set<number>>(new Set());
  const [state, setState] = useState<ExplanationState>(INITIAL_STATE);
  const previousConclusionsRef = useRef(conclusoes);

  // Reset cache when conclusions change
  if (previousConclusionsRef.current !== conclusoes) {
    previousConclusionsRef.current = conclusoes;
    if (state.status !== "idle") {
      setState(INITIAL_STATE);
      setOpenIndices(new Set());
    }
  }

  const handleToggle = useCallback(
    async (index: number) => {
      if (state.status === "loading") return;

      // Already loaded — just toggle visibility
      if (state.status === "success") {
        setOpenIndices((prev) => {
          const next = new Set(prev);
          if (next.has(index)) next.delete(index);
          else next.add(index);
          return next;
        });
        return;
      }

      // First click: fetch all explanations
      setState({ explanations: {}, status: "loading" });
      setOpenIndices(new Set([index]));

      try {
        const explanations = await fetchExplanations(conclusoes);
        setState({ explanations, status: "success" });
      } catch (error) {
        setState({
          explanations: {},
          status: "error",
          errorMessage:
            error instanceof Error
              ? error.message
              : "Erro ao gerar explicações",
        });
      }
    },
    [state.status, conclusoes],
  );

  const handleRetry = useCallback(
    (index: number) => {
      setState(INITIAL_STATE);
      setTimeout(() => void handleToggle(index), 0);
    },
    [handleToggle],
  );

  if (conclusoes.length === 0) return null;

  return (
    <div className={cn("mt-4 space-y-2 rounded-lg p-3", className)}>
      <hr className="mb-5 opacity-50" />
      {conclusoes.map((conclusao, index) => {
        const ConclusionIcon = INDICATOR_ICONS[conclusao.tipo];
        const isOpen = openIndices.has(index);
        const explanation = state.explanations[String(index)];
        const isExpanded =
          isOpen &&
          (state.status === "success" ||
            state.status === "loading" ||
            state.status === "error");

        return (
          <Collapsible
            key={conclusao.texto}
            open={isExpanded}
            onOpenChange={() => void handleToggle(index)}
          >
            <CollapsibleTrigger className="group flex w-full cursor-pointer items-start gap-2 text-left">
              <ConclusionIcon
                className={cn(
                  "mt-0.5 h-4 w-4 shrink-0",
                  ICON_COLORS[conclusao.tipo],
                )}
                aria-hidden="true"
              />
              <span className="text-muted-foreground flex-1 text-sm leading-relaxed">
                {conclusao.texto}
              </span>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="shrink-0">
                      <BotIcon
                        className={cn(
                          icone.micro,
                          "mt-0.5 transition-colors",
                          isOpen
                            ? "text-muted-foreground"
                            : "text-muted-foreground/60 group-hover:text-muted-foreground",
                        )}
                        aria-hidden="true"
                      />
                    </span>
                  </TooltipTrigger>
                  <TooltipContent side="left" sideOffset={4}>
                    Pedir para a IA explicar
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </CollapsibleTrigger>

            <CollapsibleContent>
              <div className="ml-6 mt-1.5 border-l-2 border-primary/30 pl-3">
                {state.status === "loading" && (
                  <div className="flex items-center gap-2 py-1">
                    <Loader2
                      className={cn(
                        icone.micro,
                        "text-muted-foreground animate-spin",
                      )}
                    />
                    <span className={tipografia.auxiliar}>
                      Gerando explicação...
                    </span>
                  </div>
                )}

                {state.status === "error" && isOpen && (
                  <div className="flex items-center gap-2 py-1">
                    <span
                      className={cn(tipografia.auxiliar, "text-destructive")}
                    >
                      {state.errorMessage}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRetry(index);
                      }}
                      className={cn(
                        tipografia.auxiliar,
                        "text-primary inline-flex cursor-pointer items-center gap-1 hover:underline",
                      )}
                    >
                      <RefreshCw className={icone.micro} />
                      Tentar novamente
                    </button>
                  </div>
                )}

                {state.status === "success" && explanation && (
                  <p
                    className={cn(tipografia.corpo, "text-muted-foreground py-1 leading-relaxed")}
                  >
                    {explanation}
                  </p>
                )}
              </div>
            </CollapsibleContent>
          </Collapsible>
        );
      })}
    </div>
  );
}
