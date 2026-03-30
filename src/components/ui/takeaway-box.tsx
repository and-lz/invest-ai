"use client";

import { useState, useCallback, useRef } from "react";
import Image from "next/image";
import {
  Loader2,
  ListPlus,
  Check,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { icon } from "@/lib/design-system";
import { notificar as notify } from "@/lib/notifier";
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

import type { Conclusao, TipoConclusao, TakeawayBoxProps, AddToPlanStatus, ExplanationState } from "./takeaway-box-types";
import { INDICATOR_ICONS, ICON_COLORS, INITIAL_STATE } from "./takeaway-box-types";
import { fetchExplanations } from "./takeaway-box-fetch";
import { TakeawayExplanation } from "./takeaway-box-explanation";

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

      // Already loaded -- just toggle visibility
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
              : "Erro ao gerar explicacoes",
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
          notify.info("Ja no plano", {
            description: "Este item ja esta no seu plano de acao.",
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

        notify.success("Adicionado ao plano", {
          description: "Acao adicionada com recomendacao da Fortuna.",
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
        notify.error("Erro ao adicionar", {
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
                {/* Add to Plan button -- only for actionable conclusions */}
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
                          aria-label="Adicionar ao plano de acao"
                        >
                          {planStatus === "loading" ? (
                            <Loader2 className={cn(icon.button, "animate-spin")} />
                          ) : planStatus === "added" ? (
                            <Check className={icon.button} />
                          ) : (
                            <ListPlus className={icon.button} />
                          )}
                        </button>
                      </TooltipTrigger>
                      <TooltipContent side="top" sideOffset={4}>
                        {planStatus === "added"
                          ? "Ja no plano de acao"
                          : planStatus === "loading"
                            ? "Adicionando..."
                            : "Adicionar ao plano de acao"}
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
                        aria-label="Pedir para a Fortuna explicar"
                      >
                        <Image
                          src="/fortuna-minimal.png"
                          alt="Fortuna"
                          width={16}
                          height={16}
                          className={cn(
                            icon.button,
                            "ai-icon-hover",
                            isOpen
                              ? "opacity-100"
                              : "opacity-60",
                          )}
                          aria-hidden
                        />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="left" sideOffset={4}>
                      Pedir para a Fortuna explicar
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>

            <CollapsibleContent>
              <TakeawayExplanation
                state={state}
                isOpen={isOpen}
                explanation={explanation}
                onRetry={() => handleRetry(index)}
              />
            </CollapsibleContent>
          </Collapsible>
        );
      })}
    </div>
  );
}
