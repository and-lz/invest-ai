"use client";

import { useState } from "react";
import { Header } from "@/components/layout/header";
import { usePlanoAcao } from "@/hooks/use-plano-acao";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ClipboardList,
  CheckCircle2,
  AlertCircle,
  Info,
  Check,
  X,
  Undo2,
  Trash2,
  ChevronDown,
  LayoutDashboard,
  Loader2,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { typography, icon, layout, badgeColor } from "@/lib/design-system";
import { notificar } from "@/lib/notificar";
import type { ItemPlanoAcao, TipoConclusaoPlano } from "@/schemas/plano-acao.schema";
import Link from "next/link";

const CONCLUSION_ICONS: Record<TipoConclusaoPlano, LucideIcon> = {
  positivo: CheckCircle2,
  atencao: AlertCircle,
  neutro: Info,
};

const CONCLUSION_COLORS: Record<TipoConclusaoPlano, string> = {
  positivo: "text-success",
  atencao: "text-warning",
  neutro: "text-muted-foreground",
};

const CONCLUSION_BADGE_STYLES: Record<TipoConclusaoPlano, string> = {
  positivo: badgeColor("success"),
  atencao: badgeColor("warning"),
  neutro: "bg-muted text-muted-foreground border-border",
};

const CONCLUSION_LABELS: Record<TipoConclusaoPlano, string> = {
  positivo: "Oportunidade",
  atencao: "Atenção",
  neutro: "Informativo",
};

const ORIGIN_LABELS: Record<string, string> = {
  "takeaway-dashboard": "Dashboard",
  "insight-acao-sugerida": "Análise IA",
};

function ActionItemCard({
  item,
  onUpdateStatus,
  onRemove,
}: {
  item: ItemPlanoAcao;
  onUpdateStatus: (id: string, status: "pendente" | "concluida" | "ignorada") => void;
  onRemove: (id: string) => void;
}) {
  const ConclusionIcon = CONCLUSION_ICONS[item.tipoConclusao];
  const isCompleted = item.status === "concluida";
  const isDismissed = item.status === "ignorada";
  const isInactive = isCompleted || isDismissed;

  return (
    <Card className={cn(isInactive && "opacity-60")}>
      <CardContent className="space-y-3 p-4">
        {/* Header: icon + original text + badges */}
        <div className="flex items-start gap-3">
          <ConclusionIcon
            className={cn(
              "mt-0.5 shrink-0",
              icon.cardTitle,
              isInactive
                ? "text-muted-foreground"
                : CONCLUSION_COLORS[item.tipoConclusao],
            )}
            aria-hidden="true"
          />
          <div className="min-w-0 flex-1 space-y-2">
            <p className={cn(typography.body, "text-muted-foreground leading-relaxed")}>
              {item.textoOriginal}
            </p>
          </div>
        </div>

        {/* AI recommendation (or pending enrichment state) */}
        {item.recomendacaoEnriquecida ? (
          <div className="border-primary/20 ml-7 border-l-2 pl-3">
            <p className={cn(typography.body, "leading-relaxed")}>
              {item.recomendacaoEnriquecida}
            </p>
            {item.fundamentacao && (
              <p className={cn(typography.helper, "mt-1 leading-relaxed")}>
                {item.fundamentacao}
              </p>
            )}
          </div>
        ) : (
          <div className="ml-7 flex items-center gap-2">
            <Loader2 className={cn(icon.micro, "text-muted-foreground animate-spin")} />
            <p className={cn(typography.helper, "italic")}>
              Enriquecimento por IA em andamento...
            </p>
          </div>
        )}

        {/* Badges + actions */}
        <div className="ml-7 flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-1.5">
            <Badge
              variant="outline"
              className={cn("text-xs", CONCLUSION_BADGE_STYLES[item.tipoConclusao])}
            >
              {CONCLUSION_LABELS[item.tipoConclusao]}
            </Badge>
            <Badge variant="outline" className="text-xs">
              {ORIGIN_LABELS[item.origem] ?? item.origem}
            </Badge>
            {item.ativosRelacionados.length > 0 &&
              item.ativosRelacionados.map((ativo) => (
                <Badge key={ativo} variant="secondary" className="text-xs">
                  {ativo}
                </Badge>
              ))}
          </div>

          <div className="flex items-center gap-1">
            {item.status === "pendente" && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-success hover:text-success h-8 gap-1.5"
                  onClick={() => onUpdateStatus(item.identificador, "concluida")}
                >
                  <Check className={icon.button} />
                  Concluir
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground h-8 gap-1.5"
                  onClick={() => onUpdateStatus(item.identificador, "ignorada")}
                >
                  <X className={icon.button} />
                  Ignorar
                </Button>
              </>
            )}
            {isInactive && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground h-8 gap-1.5"
                  onClick={() => onUpdateStatus(item.identificador, "pendente")}
                >
                  <Undo2 className={icon.button} />
                  Desfazer
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-destructive hover:text-destructive h-8 gap-1.5"
                  onClick={() => onRemove(item.identificador)}
                >
                  <Trash2 className={icon.button} />
                </Button>
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

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
        notificar.success("Ação concluída!");
      }
    } catch {
      notificar.error("Erro ao atualizar status");
    }
  };

  const handleRemove = async (id: string) => {
    try {
      await removerItem(id);
    } catch {
      notificar.error("Erro ao remover item");
    }
  };

  return (
    <div className={layout.pageSpacing}>
      {/* Header */}
      <div className={layout.pageHeader}>
        <ClipboardList className={cn(icon.pageTitle, "text-muted-foreground")} />
        <Header
          titulo="Plano de Ação"
          descricao="Recomendações de investimento enriquecidas por IA a partir do seu dashboard"
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
                Adicione itens a partir das conclusões do dashboard ou das análises IA
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
