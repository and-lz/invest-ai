"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Lightbulb,
  Loader2,
  CheckCircle2,
  X,
  Check,
  ListPlus,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { icon } from "@/lib/design-system";
import { notificar as notify } from "@/lib/notifier";
import {
  ICONES_CATEGORIA,
  CORES_PRIORIDADE,
  LABELS_CATEGORIA,
  INSIGHT_TO_CONCLUSAO,
} from "@/lib/insights-constants";
import type { Insight, StatusAcao } from "@/schemas/insights.schema";

type AddToPlanStatus = "idle" | "loading" | "added" | "error";

export interface InsightCardProps {
  insight: Insight;
  indiceInsight: number;
  identificadorRelatorio: string;
  onStatusAlterado: (indiceInsight: number, statusAcao: StatusAcao) => void;
}

export function InsightCard({
  insight,
  indiceInsight,
  identificadorRelatorio,
  onStatusAlterado,
}: InsightCardProps) {
  const router = useRouter();
  const Icone = ICONES_CATEGORIA[insight.categoria] ?? Lightbulb;
  const statusAtual = insight.statusAcao ?? "pendente";
  const [estaAtualizando, setEstaAtualizando] = useState(false);
  const [planStatus, setPlanStatus] = useState<AddToPlanStatus>("idle");

  const handleAlterarStatus = useCallback(
    async (novoStatus: StatusAcao) => {
      setEstaAtualizando(true);
      try {
        const resposta = await fetch("/api/insights", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            identificadorRelatorio,
            indiceInsight,
            statusAcao: novoStatus,
          }),
        });

        if (resposta.ok) {
          await resposta.json();
          onStatusAlterado(indiceInsight, novoStatus);
        }
      } catch (erro) {
        console.error("Erro ao atualizar status do insight:", erro);
      } finally {
        setEstaAtualizando(false);
      }
    },
    [identificadorRelatorio, indiceInsight, onStatusAlterado],
  );

  const handleAddToPlan = useCallback(async () => {
    if (!insight.acaoSugerida || planStatus === "loading" || planStatus === "added") return;

    setPlanStatus("loading");
    try {
      const response = await fetch("/api/action-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          textoOriginal: insight.acaoSugerida,
          tipoConclusao: INSIGHT_TO_CONCLUSAO[insight.categoria] ?? "neutro",
          origem: "insight-acao-sugerida",
          ativosRelacionados: insight.ativosRelacionados,
        }),
      });

      if (response.status === 409) {
        notify.info("Já no plano", {
          description: "Este item já está no seu plano de ação.",
        });
        setPlanStatus("added");
        return;
      }

      if (!response.ok) {
        const errorBody = (await response.json().catch(() => ({}))) as { erro?: string };
        throw new Error(errorBody.erro ?? "Falha ao adicionar ao plano");
      }

      notify.success("Adicionado ao plano", {
        description: "Ação adicionada com recomendação da Fortuna.",
        actionUrl: "/plano-acao",
        actionLabel: "Ver plano",
        action: {
          label: "Ver plano",
          onClick: () => router.push("/plano-acao"),
        },
      });
      setPlanStatus("added");
    } catch (error) {
      console.error("[Insights] Error adding to plan:", error);
      notify.error("Erro ao adicionar", {
        description: error instanceof Error ? error.message : "Tente novamente mais tarde.",
      });
      setPlanStatus("error");
    }
  }, [insight.acaoSugerida, insight.categoria, insight.ativosRelacionados, planStatus, router]);

  const estilosBloco = {
    pendente: "border border-transparent rounded-lg p-4",
    concluida: "border border-transparent rounded-lg p-4 opacity-60",
    ignorada: "border border-transparent rounded-lg p-4 opacity-50",
  };

  const estiloTexto = {
    pendente: "",
    concluida: "",
    ignorada: "",
  };

  return (
    <article className={cn("transition-all", estilosBloco[statusAtual])}>
      {/* Categoria + Prioridade */}
      <div className="mb-2 flex items-center gap-3">
        <Icone className="text-muted-foreground h-5 w-5" />
        <span className="text-muted-foreground text-sm font-medium tracking-wide uppercase">
          {LABELS_CATEGORIA[insight.categoria] ?? insight.categoria}
        </span>
        <Badge className={CORES_PRIORIDADE[insight.prioridade] ?? ""}>{insight.prioridade}</Badge>
      </div>

      {/* Título */}
      <h3 className={cn("text-xl leading-snug font-bold", estiloTexto[statusAtual])}>
        {insight.titulo}
      </h3>

      {/* Descrição */}
      <p
        className={cn(
          "text-muted-foreground mt-2 text-lg leading-relaxed",
          estiloTexto[statusAtual],
        )}
      >
        {insight.descricao}
      </p>

      {/* Ação Sugerida */}
      {insight.acaoSugerida && (
        <div
          className={cn(
            "mt-4 rounded-lg border-l-4 px-5 py-4",
            "border-muted-foreground/20 bg-muted/50",
          )}
        >
          <div className="flex items-start justify-between gap-3">
            <p className={cn("text-base leading-relaxed", estiloTexto[statusAtual])}>
              <span className="font-bold">Acao sugerida:</span>{" "}
              <span className="italic">{insight.acaoSugerida}</span>
            </p>
            <button
              type="button"
              onClick={() => void handleAddToPlan()}
              disabled={planStatus === "loading" || planStatus === "added"}
              className={cn(
                "mt-0.5 shrink-0 cursor-pointer rounded-sm p-1 transition-colors",
                planStatus === "added"
                  ? "text-success"
                  : planStatus === "loading"
                    ? "text-muted-foreground"
                    : "text-muted-foreground/60 hover:text-muted-foreground",
              )}
              aria-label="Adicionar ao plano de ação"
            >
              {planStatus === "loading" ? (
                <Loader2 className={cn(icon.button, "animate-spin")} />
              ) : planStatus === "added" ? (
                <Check className={icon.button} />
              ) : (
                <ListPlus className={icon.button} />
              )}
            </button>
          </div>
        </div>
      )}

      {/* Ativos Relacionados */}
      {insight.ativosRelacionados.length > 0 && (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="text-muted-foreground text-sm font-semibold">Ativos:</span>
          {insight.ativosRelacionados.map((ativo) => (
            <Badge key={ativo} variant="outline">
              {ativo}
            </Badge>
          ))}
        </div>
      )}

      {/* Ações sutis - somente se houver acaoSugerida */}
      {insight.acaoSugerida && (
        <div className="mt-4 flex items-center gap-2">
          {statusAtual === "pendente" && (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => void handleAlterarStatus("concluida")}
                disabled={estaAtualizando}
                className="text-muted-foreground hover:text-success h-8 gap-1.5 text-xs"
              >
                <Check className="h-4 w-4" />
                Concluir
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => void handleAlterarStatus("ignorada")}
                disabled={estaAtualizando}
                className="text-muted-foreground hover:text-warning h-8 gap-1.5 text-xs"
              >
                <X className="h-4 w-4" />
                Ignorar
              </Button>
            </>
          )}
          {statusAtual === "concluida" && (
            <div className="text-success flex items-center gap-2 text-sm">
              <CheckCircle2 className="h-4 w-4" />
              <span>Ação concluída</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => void handleAlterarStatus("pendente")}
                disabled={estaAtualizando}
                className="text-muted-foreground ml-2 h-7 text-xs"
              >
                Desfazer
              </Button>
            </div>
          )}
          {statusAtual === "ignorada" && (
            <div className="text-muted-foreground flex items-center gap-2 text-sm">
              <X className="h-4 w-4" />
              <span>Ação ignorada</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => void handleAlterarStatus("pendente")}
                disabled={estaAtualizando}
                className="text-muted-foreground ml-2 h-7 text-xs"
              >
                Desfazer
              </Button>
            </div>
          )}
        </div>
      )}
    </article>
  );
}
