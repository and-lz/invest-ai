"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { InfoTooltip } from "@/components/ui/info-tooltip";
import { GLOSSARIO_RISCO_CONSISTENCIA } from "@/lib/glossario-financeiro";
import { TakeawayBox, type Conclusao } from "@/components/ui/takeaway-box";
import { Shield } from "lucide-react";
import { formatarPercentualSimples } from "@/domain/value-objects/percentage";
import type { AnaliseRiscoRetorno } from "@/schemas/report-extraction.schema";

interface RiskConsistencyCardProps {
  analiseRiscoRetorno: AnaliseRiscoRetorno;
}

export function gerarConclusaoRiscoConsistencia(analise: AnaliseRiscoRetorno): Conclusao[] {
  const conclusoes: Conclusao[] = [];

  const totalMeses = analise.mesesAcimaBenchmark + analise.mesesAbaixoBenchmark;
  if (totalMeses === 0) return conclusoes;

  const taxaAcerto = Math.round((analise.mesesAcimaBenchmark / totalMeses) * 100);

  if (taxaAcerto >= 60) {
    conclusoes.push({
      texto: `Sua carteira bateu o CDI em ${taxaAcerto}% dos meses (${analise.mesesAcimaBenchmark} de ${totalMeses}). Consistência acima da média!`,
      tipo: "positivo",
    });
  } else if (taxaAcerto >= 40) {
    conclusoes.push({
      texto: `Sua carteira bateu o CDI em ${taxaAcerto}% dos meses (${analise.mesesAcimaBenchmark} de ${totalMeses}). Resultado misto — às vezes supera, às vezes fica atrás.`,
      tipo: "neutro",
    });
  } else {
    conclusoes.push({
      texto: `Sua carteira bateu o CDI em apenas ${taxaAcerto}% dos meses (${analise.mesesAcimaBenchmark} de ${totalMeses}). Na maioria dos meses, a renda fixa básica rendeu mais.`,
      tipo: "atencao",
    });
  }

  conclusoes.push({
    texto: `Maior ganho: ${formatarPercentualSimples(analise.maiorRentabilidade.valor.valor)} em ${analise.maiorRentabilidade.mesAno}. Maior perda: ${formatarPercentualSimples(analise.menorRentabilidade.valor.valor)} em ${analise.menorRentabilidade.mesAno}.`,
    tipo: analise.menorRentabilidade.valor.valor < -5 ? "atencao" : "neutro",
  });

  return conclusoes;
}

export function RiskConsistencyCard({ analiseRiscoRetorno }: RiskConsistencyCardProps) {
  const totalMeses =
    analiseRiscoRetorno.mesesAcimaBenchmark + analiseRiscoRetorno.mesesAbaixoBenchmark;
  const taxaAcerto =
    totalMeses > 0 ? Math.round((analiseRiscoRetorno.mesesAcimaBenchmark / totalMeses) * 100) : 0;
  const percentualAcima =
    totalMeses > 0 ? (analiseRiscoRetorno.mesesAcimaBenchmark / totalMeses) * 100 : 0;

  const conclusoes = gerarConclusaoRiscoConsistencia(analiseRiscoRetorno);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-1">
          <Shield className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
          Risco e Consistência
          <InfoTooltip conteudo={GLOSSARIO_RISCO_CONSISTENCIA.explicacao} />
        </CardTitle>
        <CardDescription className="leading-relaxed">
          Mostra com que frequência sua carteira supera o CDI e qual foi o melhor e pior mês da
          história.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-col items-center gap-2">
          <div className="relative flex h-28 w-28 items-center justify-center">
            <svg className="h-28 w-28 -rotate-90" viewBox="0 0 120 120">
              <circle
                cx="60"
                cy="60"
                r="50"
                fill="none"
                stroke="currentColor"
                strokeWidth="10"
                className="text-muted/50"
              />
              <circle
                cx="60"
                cy="60"
                r="50"
                fill="none"
                strokeWidth="10"
                strokeDasharray={`${(percentualAcima / 100) * 314.16} 314.16`}
                strokeLinecap="round"
                className={cn(
                  taxaAcerto >= 60
                    ? "text-success"
                    : taxaAcerto >= 40
                      ? "text-warning"
                      : "text-destructive",
                )}
                stroke="currentColor"
              />
            </svg>
            <div className="absolute flex flex-col items-center">
              <span className="text-2xl font-bold">{taxaAcerto}%</span>
              <span className="text-muted-foreground text-xs">acerto</span>
            </div>
          </div>
          <p className="text-muted-foreground text-sm">
            {analiseRiscoRetorno.mesesAcimaBenchmark} meses acima do CDI de {totalMeses} total
          </p>
        </div>

        <div className="w-full overflow-hidden rounded-full bg-destructive/20">
          <div
            className="h-3 rounded-full bg-success/60 transition-all"
            style={{ width: `${percentualAcima}%` }}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-lg border p-3">
            <p className="text-muted-foreground text-xs">Melhor Mês</p>
            <p className="text-lg font-bold text-success">
              {formatarPercentualSimples(analiseRiscoRetorno.maiorRentabilidade.valor.valor)}
            </p>
            <p className="text-muted-foreground text-xs">
              {analiseRiscoRetorno.maiorRentabilidade.mesAno}
            </p>
          </div>
          <div className="rounded-lg border p-3">
            <p className="text-muted-foreground text-xs">Pior Mês</p>
            <p className="text-lg font-bold text-destructive">
              {formatarPercentualSimples(analiseRiscoRetorno.menorRentabilidade.valor.valor)}
            </p>
            <p className="text-muted-foreground text-xs">
              {analiseRiscoRetorno.menorRentabilidade.mesAno}
            </p>
          </div>
        </div>

        <TakeawayBox conclusoes={conclusoes} />
      </CardContent>
    </Card>
  );
}
