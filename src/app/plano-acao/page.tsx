"use client";

import { useState } from "react";
import { Header } from "@/components/layout/header";
import { usePlanoAcao } from "@/hooks/use-action-plan";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ClipboardList, ChevronDown, LayoutDashboard } from "lucide-react";
import { cn } from "@/lib/utils";
import { typography, icon, layout } from "@/lib/design-system";
import { notificar as notify } from "@/lib/notifier";
import Link from "next/link";
import { ActionItemCard } from "@/components/action-plan/action-item-card";

export default function PlanoAcaoPage() {
  const {
    itensPendentes,
    itensConcluidos,
    itensIgnorados,
    estaCarregando,
    atualizarStatus,
    removerItem,
  } = usePlanoAcao();

  const [showCompleted, setShowCompleted] = useState(false);
  const itensInativos = [...itensConcluidos, ...itensIgnorados];

  const handleUpdateStatus = async (id: string, status: "pendente" | "concluida" | "ignorada") => {
    try {
      await atualizarStatus(id, status);
      if (status === "concluida") {
        notify.success("Ação concluída!");
      }
    } catch {
      notify.error("Erro ao atualizar status");
    }
  };

  const handleRemove = async (id: string) => {
    try {
      await removerItem(id);
    } catch {
      notify.error("Erro ao remover item");
    }
  };

  return (
    <div className={layout.pageSpacing}>
      {/* Header */}
      <div className={layout.pageHeader}>
        <ClipboardList className={cn(icon.pageTitle, "text-muted-foreground")} />
        <Header
          titulo="Plano de Ação"
          descricao="Recomendações de investimento enriquecidas pela Fortuna a partir do seu dashboard"
        />
      </div>

      {/* Loading state */}
      {estaCarregando && (
        <div className={layout.sectionSpacing}>
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
      )}

      {/* Empty state */}
      {!estaCarregando && itensPendentes.length === 0 && itensInativos.length === 0 && (
        <Card>
          <CardContent className={layout.emptyStateCard}>
            <ClipboardList className={icon.emptyState} />
            <div className="space-y-1 text-center">
              <p className={typography.label}>Seu plano de ação está vazio</p>
              <p className={typography.helper}>
                Adicione itens a partir das conclusões do dashboard ou das análises da Fortuna
              </p>
            </div>
            <Button asChild variant="outline" className="mt-2 gap-2">
              <Link href="/">
                <LayoutDashboard className={icon.button} />
                Ir para o Dashboard
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Summary badges */}
      {!estaCarregando && (itensPendentes.length > 0 || itensInativos.length > 0) && (
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline" className="gap-1.5">
            <span className="bg-warning h-2 w-2 rounded-full" />
            {itensPendentes.length} pendente{itensPendentes.length !== 1 ? "s" : ""}
          </Badge>
          {itensConcluidos.length > 0 && (
            <Badge variant="outline" className="gap-1.5">
              <span className="bg-success h-2 w-2 rounded-full" />
              {itensConcluidos.length} concluída{itensConcluidos.length !== 1 ? "s" : ""}
            </Badge>
          )}
          {itensIgnorados.length > 0 && (
            <Badge variant="outline" className="gap-1.5">
              <span className="bg-muted-foreground h-2 w-2 rounded-full" />
              {itensIgnorados.length} ignorada{itensIgnorados.length !== 1 ? "s" : ""}
            </Badge>
          )}
        </div>
      )}

      {/* Pending items */}
      {!estaCarregando && itensPendentes.length > 0 && (
        <div className={layout.sectionSpacing}>
          {itensPendentes.map((item) => (
            <ActionItemCard
              key={item.identificador}
              item={item}
              onUpdateStatus={handleUpdateStatus}
              onRemove={handleRemove}
            />
          ))}
        </div>
      )}

      {/* Completed / Dismissed items (collapsible) */}
      {!estaCarregando && itensInativos.length > 0 && (
        <div className={layout.sectionSpacing}>
          <button
            type="button"
            onClick={() => setShowCompleted((prev) => !prev)}
            className={cn(
              typography.label,
              "text-muted-foreground hover:text-foreground flex cursor-pointer items-center gap-2 transition-colors",
            )}
          >
            <ChevronDown
              className={cn(
                icon.button,
                "transition-transform",
                showCompleted && "rotate-180",
              )}
            />
            {itensInativos.length} concluída{itensInativos.length !== 1 ? "s" : ""} / ignorada{itensInativos.length !== 1 ? "s" : ""}
          </button>

          {showCompleted && (
            <div className={layout.sectionSpacing}>
              {itensInativos.map((item) => (
                <ActionItemCard
                  key={item.identificador}
                  item={item}
                  onUpdateStatus={handleUpdateStatus}
                  onRemove={handleRemove}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
