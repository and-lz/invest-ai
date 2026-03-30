"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Check, X, Undo2, Trash2, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { typography, icon } from "@/lib/design-system";
import type { ItemPlanoAcao } from "@/schemas/action-plan.schema";
import {
  CONCLUSION_ICONS,
  CONCLUSION_COLORS,
  CONCLUSION_BADGE_STYLES,
  CONCLUSION_LABELS,
  ORIGIN_LABELS,
} from "@/lib/action-plan-constants";

interface ActionItemCardProps {
  item: ItemPlanoAcao;
  onUpdateStatus: (id: string, status: "pendente" | "concluida" | "ignorada") => void;
  onRemove: (id: string) => void;
}

export function ActionItemCard({ item, onUpdateStatus, onRemove }: ActionItemCardProps) {
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
              Enriquecimento pela Fortuna em andamento...
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
