"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { InfoTooltip } from "@/components/ui/info-tooltip";
import { TakeawayBox } from "@/components/ui/takeaway-box";
import type { Conclusao } from "@/components/ui/takeaway-box";
import { GLOSSARIO_HEATMAP_SETORES } from "@/lib/glossario-financeiro";
import { Grid3X3 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { SetorPerformance } from "@/schemas/trends.schema";

interface MapaCalorSetoresProps {
  setoresPerformance: SetorPerformance[];
}

function obterClasseCor(variacao: number): string {
  if (variacao >= 2) return "bg-success/20 text-success border-success/30";
  if (variacao >= 0.5) return "bg-success/10 text-success border-success/20";
  if (variacao >= 0) return "bg-muted text-muted-foreground border-border";
  if (variacao >= -0.5) return "bg-destructive/5 text-muted-foreground border-border";
  if (variacao >= -2) return "bg-destructive/10 text-destructive border-destructive/20";
  return "bg-destructive/20 text-destructive border-destructive/30";
}

function formatarVariacao(variacao: number): string {
  const sinal = variacao >= 0 ? "+" : "";
  return `${sinal}${variacao.toFixed(2)}%`;
}

function gerarConclusoesSetores(setores: SetorPerformance[]): Conclusao[] {
  const conclusoes: Conclusao[] = [];

  const melhorSetor = setores[0];
  if (melhorSetor && melhorSetor.variacaoMedia > 0) {
    conclusoes.push({
      texto: `${melhorSetor.setorTraduzido} lidera com variacao media de ${formatarVariacao(melhorSetor.variacaoMedia)}.`,
      tipo: "positivo",
    });
  }

  const setoresNegativos = setores.filter((setor) => setor.variacaoMedia < 0);
  if (setoresNegativos.length > 0) {
    const piorSetor = setoresNegativos[setoresNegativos.length - 1];
    if (piorSetor) {
      conclusoes.push({
        texto: `${piorSetor.setorTraduzido} tem a maior queda: ${formatarVariacao(piorSetor.variacaoMedia)}.`,
        tipo: "atencao",
      });
    }
  }

  const setoresPositivos = setores.filter((setor) => setor.variacaoMedia > 0);
  if (setoresPositivos.length === setores.length && setores.length > 0) {
    conclusoes.push({
      texto: "Todos os setores em alta — dia positivo para o mercado.",
      tipo: "positivo",
    });
  }

  return conclusoes;
}

export function MapaCalorSetores({ setoresPerformance }: MapaCalorSetoresProps) {
  const conclusoes = gerarConclusoesSetores(setoresPerformance);

  if (setoresPerformance.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Grid3X3 className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
          Performance por Setor
          <InfoTooltip conteudo={GLOSSARIO_HEATMAP_SETORES.explicacao} />
        </CardTitle>
        <CardDescription>
          Variacao media dos 5 ativos mais negociados de cada setor
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
          {setoresPerformance.map((setor) => (
            <div
              key={setor.setor}
              className={cn(
                "flex flex-col items-center justify-center rounded-lg border p-4 transition-colors",
                obterClasseCor(setor.variacaoMedia),
              )}
            >
              <p className="text-center text-sm font-medium">
                {setor.setorTraduzido}
              </p>
              <p className="mt-1 text-lg font-bold">
                {formatarVariacao(setor.variacaoMedia)}
              </p>
              <p className="text-xs opacity-60">
                {setor.quantidadeAtivos} ativos
              </p>
            </div>
          ))}
        </div>

        <TakeawayBox conclusoes={conclusoes} />
      </CardContent>
    </Card>
  );
}
