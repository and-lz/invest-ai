"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Percent,
  BarChart3,
  CalendarDays,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatarMoeda } from "@/domain/value-objects/money";
import { formatSimplePercentage } from "@/domain/value-objects/percentage";
import { formatBrazilianDate } from "@/lib/format-date";
import { typography, icon, layout, valueColor } from "@/lib/design-system";
import { InfoTooltip } from "@/components/ui/info-tooltip";
import {
  GLOSSARY_PATRIMONIO_TOTAL,
  GLOSSARY_VARIACAO_PATRIMONIAL,
  GLOSSARY_GANHOS_NO_MES,
  GLOSSARY_RENTABILIDADE_MENSAL,
  GLOSSARY_RENTABILIDADE_ANUAL,
  GLOSSARY_DESDE_INICIO,
} from "@/lib/financial-glossary";
import type { Resumo } from "@/schemas/report-extraction.schema";

interface SummaryCardsProps {
  resumo: Resumo;
  variacaoPatrimonialCentavos: number | null;
}

export function SummaryCards({ resumo, variacaoPatrimonialCentavos }: SummaryCardsProps) {
  const variacaoPositiva = variacaoPatrimonialCentavos !== null && variacaoPatrimonialCentavos >= 0;

  return (
    <div className={layout.gridCards}>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className={cn("flex items-center gap-1", typography.label)}>
            <DollarSign
              className={cn(icon.cardTitle, "text-muted-foreground")}
              aria-hidden="true"
            />
            Patrimonio Total
            <InfoTooltip conteudo={GLOSSARY_PATRIMONIO_TOTAL.explicacao} />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className={typography.mainValue}>
            {formatarMoeda(resumo.patrimonioTotal.valorEmCentavos)}
          </div>
          {variacaoPatrimonialCentavos !== null && (
            <p
              className={cn(
                "flex items-center gap-1 text-xs",
                valueColor(variacaoPatrimonialCentavos),
              )}
            >
              {variacaoPositiva ? (
                <TrendingUp className="h-3 w-3" />
              ) : (
                <TrendingDown className="h-3 w-3" />
              )}
              {formatarMoeda(Math.abs(variacaoPatrimonialCentavos))} vs mes anterior
              <InfoTooltip
                conteudo={GLOSSARY_VARIACAO_PATRIMONIAL.explicacao}
                tamanhoIcone="h-3 w-3"
              />
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className={cn("flex items-center gap-1", typography.label)}>
            <BarChart3
              className={cn(icon.cardTitle, "text-muted-foreground")}
              aria-hidden="true"
            />
            Ganhos no Mes
            <InfoTooltip conteudo={GLOSSARY_GANHOS_NO_MES.explicacao} />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className={typography.mainValue}>
            {formatarMoeda(resumo.ganhosFinanceirosNoMes.valorEmCentavos)}
          </div>
          <p className={cn(typography.helper, "flex items-center gap-1")}>
            Rentabilidade: {formatSimplePercentage(resumo.rentabilidadeMensal.valor)}
            <InfoTooltip
              conteudo={GLOSSARY_RENTABILIDADE_MENSAL.explicacao}
              tamanhoIcone="h-3 w-3"
            />
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className={cn("flex items-center gap-1", typography.label)}>
            <Percent className={cn(icon.cardTitle, "text-muted-foreground")} aria-hidden="true" />
            Rentabilidade Anual
            <InfoTooltip conteudo={GLOSSARY_RENTABILIDADE_ANUAL.explicacao} />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className={typography.mainValue}>
            {formatSimplePercentage(resumo.rentabilidadeAnual.valor)}
          </div>
          {resumo.rentabilidadeAnoAnterior && (
            <p className={typography.helper}>
              {formatSimplePercentage(resumo.rentabilidadeAnoAnterior.valor)} no ano anterior
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className={cn("flex items-center gap-1", typography.label)}>
            <CalendarDays
              className={cn(icon.cardTitle, "text-muted-foreground")}
              aria-hidden="true"
            />
            Desde o Inicio
            <InfoTooltip conteudo={GLOSSARY_DESDE_INICIO.explicacao} />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className={typography.mainValue}>
            {formatSimplePercentage(resumo.rentabilidadeDesdeInicio.valor)}
          </div>
          <p className={typography.helper}>
            Desde {formatBrazilianDate(resumo.dataInicioCarteira)}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
