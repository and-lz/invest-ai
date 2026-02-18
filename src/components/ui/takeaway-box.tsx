"use client";

import { useState, useCallback, useRef } from "react";
import {
  CheckCircle2,
  AlertCircle,
  Info,
  BotIcon,
  Loader2,
  RefreshCw,
  ListPlus,
  Check,
  type LucideIcon,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { tipografia, icone } from "@/lib/design-system";
import { notificar } from "@/lib/notificar";
import { revalidarTarefasAtivas } from "@/hooks/use-tarefas-ativas";
import type { TarefaBackground } from "@/lib/tarefa-descricao";
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
  readonly acionavel?: boolean;
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

type AddToPlanStatus = "idle" | "loading" | "added" | "error";

const POLL_INTERVAL_MS = 2000;
const MAX_POLL_ATTEMPTS = 30; // 60s max

/**
 * Creates an explain-takeaway background task and polls until completion.
 * Returns the explanations map from the task's descricaoResultado.
 */
async function fetchExplanations(
  conclusions: Conclusao[],
): Promise<Record<string, string>> {
  // 1. Create background task
  const createResponse = await fetch("/api/explain-takeaway", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      conclusions: conclusions.map((c) => ({
        text: c.texto,
        type: c.tipo,
      })),
    }),
  });

  if (!createResponse.ok) {
    const errorBody = (await createResponse.json().catch(() => ({}))) as {
      erro?: string;
    };
    throw new Error(errorBody.erro ?? "Falha ao iniciar explicações");
  }

  const { identificadorTarefa } = (await createResponse.json()) as {
    identificadorTarefa: string;
  };

  // Notify activity center about new task
  revalidarTarefasAtivas();

  // 2. Poll task status until completion
  for (let attempt = 0; attempt < MAX_POLL_ATTEMPTS; attempt++) {
    await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));

    const statusResponse = await fetch(`/api/tasks/${identificadorTarefa}`);
    if (!statusResponse.ok) continue;

    const tarefa = (await statusResponse.json()) as TarefaBackground;

    if (tarefa.status === "concluido" && tarefa.descricaoResultado) {
      const parsed: unknown = JSON.parse(tarefa.descricaoResultado);
      if (parsed && typeof parsed === "object" && "error" in parsed) {
        throw new Error("IA retornou formato inesperado");
      }
      return parsed as Record<string, string>;
    }

    if (tarefa.status === "erro") {
      throw new Error(tarefa.erro ?? "Erro ao gerar explicações");
    }

    if (tarefa.status === "cancelada") {
      throw new Error("Tarefa cancelada");
    }
  }

  throw new Error("Tempo limite excedido ao gerar explicações");
}

export type { Conclusao, TipoConclusao };

export function TakeawayBox({ conclusoes, className }: TakeawayBoxProps) {
  const router = useRouter();
  const [openIndices, setOpenIndices] = useState<Set<number>>(new Set());
  const [state, setState] = useState<ExplanationState>(INITIAL_STATE);
  const [addToPlanStatuses, setAddToPlanStatuses] = useState<Record<number, AddToPlanStatus>>({});
  const previousConclusionsRef = useRef(conclusoes);

  // Reset cache when conclusions change
  if (previousConclusionsRef.current !== conclusoes) {
    previousConclusionsRef.current = conclusoes;
    if (state.status !== "idle") {
      setState(INITIAL_STATE);
      setOpenIndices(new Set());
    }
    setAddToPlanStatuses({});
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

  const handleAddToPlan = useCallback(
    async (index: number, event: React.MouseEvent) => {
      event.stopPropagation();
      event.preventDefault();

      const conclusao = conclusoes[index];
      if (!conclusao) return;

      const currentStatus = addToPlanStatuses[index] ?? "idle";
      if (currentStatus === "loading" || currentStatus === "added") return;

      setAddToPlanStatuses((prev) => ({ ...prev, [index]: "loading" }));

      try {
        const response = await fetch("/api/action-plan", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            textoOriginal: conclusao.texto,
            tipoConclusao: conclusao.tipo,
            origem: "takeaway-dashboard",
          }),
        });

        if (response.status === 409) {
          notificar.info("Já no plano", {
            description: "Este item já está no seu plano de ação.",
          });
          setAddToPlanStatuses((prev) => ({ ...prev, [index]: "added" }));
          return;
        }

        if (!response.ok) {
          const errorBody = (await response.json().catch(() => ({}))) as {
            erro?: string;
          };
          throw new Error(errorBody.erro ?? "Falha ao adicionar ao plano");
        }

        notificar.success("Adicionado ao plano", {
          description: "Ação adicionada com recomendação da IA.",
          actionUrl: "/plano-acao",
          actionLabel: "Ver plano",
          action: {
            label: "Ver plano",
            onClick: () => router.push("/plano-acao"),
          },
        });

        setAddToPlanStatuses((prev) => ({ ...prev, [index]: "added" }));
      } catch (error) {
        console.error("[TakeawayBox] Error adding to plan:", error);
        notificar.error("Erro ao adicionar", {
          description:
            error instanceof Error
              ? error.message
              : "Tente novamente mais tarde.",
        });
        setAddToPlanStatuses((prev) => ({ ...prev, [index]: "error" }));
      }
    },
    [conclusoes, addToPlanStatuses, router],
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
        const planStatus = addToPlanStatuses[index] ?? "idle";

        return (
          <Collapsible
            key={conclusao.texto}
            open={isExpanded}
            onOpenChange={() => void handleToggle(index)}
          >
            <div className="flex w-full items-start gap-2">
              <CollapsibleTrigger className="group flex min-w-0 flex-1 cursor-pointer items-start gap-2 text-left">
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
              </CollapsibleTrigger>

              <div className="flex shrink-0 items-center gap-1">
                {/* Add to Plan button — only for actionable conclusions */}
                {conclusao.acionavel && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          type="button"
                          onClick={(e) => void handleAddToPlan(index, e)}
                          disabled={planStatus === "loading" || planStatus === "added"}
                          className={cn(
                            "mt-0.5 cursor-pointer rounded-sm p-0.5 transition-colors",
                            planStatus === "added"
                              ? "text-success"
                              : planStatus === "loading"
                                ? "text-muted-foreground"
                                : "text-muted-foreground/60 hover:text-muted-foreground",
                          )}
                          aria-label="Adicionar ao plano de ação"
                        >
                          {planStatus === "loading" ? (
                            <Loader2 className={cn(icone.botao, "animate-spin")} />
                          ) : planStatus === "added" ? (
                            <Check className={icone.botao} />
                          ) : (
                            <ListPlus className={icone.botao} />
                          )}
                        </button>
                      </TooltipTrigger>
                      <TooltipContent side="top" sideOffset={4}>
                        {planStatus === "added"
                          ? "Já no plano de ação"
                          : planStatus === "loading"
                            ? "Adicionando..."
                            : "Adicionar ao plano de ação"}
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}

                {/* AI Explain button */}
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        type="button"
                        onClick={() => void handleToggle(index)}
                        className="mt-0.5 cursor-pointer rounded-sm p-0.5 transition-colors"
                        aria-label="Pedir para a IA explicar"
                      >
                        <BotIcon
                          className={cn(
                            icone.botao,
                            "ai-icon-hover",
                            isOpen
                              ? "text-muted-foreground"
                              : "text-muted-foreground/60",
                          )}
                          aria-hidden="true"
                        />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="left" sideOffset={4}>
                      Pedir para a IA explicar
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>

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
                      <RefreshCw className={icone.botao} />
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
