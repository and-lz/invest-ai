"use client";

import { useInsightsList } from "@/hooks/use-insights-list";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Trash2, Lightbulb, Layers } from "lucide-react";
import { notificar } from "@/lib/notificar";
import { formatarMesAno, validarMesAno } from "@/lib/format-date";
import { icone, tipografia } from "@/lib/design-system";
import { cn } from "@/lib/utils";
import type { InsightsMetadata } from "@/schemas/insights.schema";

interface InsightsListProps {
  onSelectPeriod: (identificador: string) => void;
  selectedPeriod: string;
  onInsightsDeleted: (identificador: string) => void;
  onGenerateNew?: () => void;
}

function formatPeriodLabel(item: InsightsMetadata): string {
  if (item.identificador === "consolidado") return "Consolidado";
  if (validarMesAno(item.identificador)) return formatarMesAno(item.identificador, "extenso");
  return item.mesReferencia;
}

export function InsightsList({ onSelectPeriod, selectedPeriod, onInsightsDeleted, onGenerateNew }: InsightsListProps) {
  const { insightsMetadados, isLoading, deleteInsights } = useInsightsList();

  const handleDelete = async (identificador: string, evento: React.MouseEvent) => {
    evento.stopPropagation();
    try {
      await deleteInsights(identificador);
      onInsightsDeleted(identificador);
      notificar.success("Análises removidas");
    } catch {
      notificar.error("Falha ao remover análises");
    }
  };

  if (isLoading) return <Skeleton className="h-48" />;
  if (insightsMetadados.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-4 py-12 text-center">
          <Lightbulb className={icone.estadoVazio} />
          <p className="text-muted-foreground">
            Nenhuma análise gerada ainda. Gere sua primeira análise para acompanhar sua carteira.
          </p>
          {onGenerateNew && (
            <Button onClick={onGenerateNew}>Gerar análise</Button>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className={cn(tipografia.h3, "flex items-center gap-2")}>
          <Lightbulb className={cn(icone.tituloCard, "text-muted-foreground")} />
          Análises geradas
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Periodo</TableHead>
                <TableHead className="hidden sm:table-cell">Gerado em</TableHead>
                <TableHead>Análises</TableHead>
                <TableHead className="hidden md:table-cell">Alertas</TableHead>
                <TableHead className="text-right">Acoes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {insightsMetadados.map((item) => (
                <TableRow
                  key={item.identificador}
                  className={cn(
                    "cursor-pointer",
                    item.identificador === selectedPeriod && "bg-muted/50",
                  )}
                  onClick={() => onSelectPeriod(item.identificador)}
                >
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      {item.identificador === "consolidado" && (
                        <Layers className={cn(icone.micro, "text-muted-foreground")} />
                      )}
                      {formatPeriodLabel(item)}
                    </div>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    {new Date(item.dataGeracao).toLocaleDateString("pt-BR")}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{item.totalInsights}</Badge>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {item.totalAlertas > 0 ? (
                      <Badge variant="outline">{item.totalAlertas}</Badge>
                    ) : (
                      <span className="text-muted-foreground text-sm">0</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => void handleDelete(item.identificador, e)}
                    >
                      <Trash2 className={icone.botao} />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
