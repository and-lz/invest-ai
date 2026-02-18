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
import { formatarPercentualSimples } from "@/domain/value-objects/percentage";
import { formatarDataBrasileira } from "@/lib/format-date";
import { tipografia, icone, layout, corValor } from "@/lib/design-system";
import { InfoTooltip } from "@/components/ui/info-tooltip";
import {
  GLOSSARIO_PATRIMONIO_TOTAL,
  GLOSSARIO_VARIACAO_PATRIMONIAL,
  GLOSSARIO_GANHOS_NO_MES,
  GLOSSARIO_RENTABILIDADE_MENSAL,
  GLOSSARIO_RENTABILIDADE_ANUAL,
  GLOSSARIO_DESDE_INICIO,
} from "@/lib/glossario-financeiro";
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
          <CardTitle className={cn("flex items-center gap-1", tipografia.rotulo)}>
            <DollarSign
              className={cn(icone.tituloCard, "text-muted-foreground")}
              aria-hidden="true"
            />
            Patrimonio Total
            <InfoTooltip conteudo={GLOSSARIO_PATRIMONIO_TOTAL.explicacao} />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className={tipografia.valorPrincipal}>
            {formatarMoeda(resumo.patrimonioTotal.valorEmCentavos)}
          </div>
          {variacaoPatrimonialCentavos !== null && (
            <p
              className={cn(
                "flex items-center gap-1 text-xs",
                corValor(variacaoPatrimonialCentavos),
              )}
            >
              {variacaoPositiva ? (
                <TrendingUp className="h-3 w-3" />
              ) : (
                <TrendingDown className="h-3 w-3" />
              )}
              {formatarMoeda(Math.abs(variacaoPatrimonialCentavos))} vs mes anterior
              <InfoTooltip
                conteudo={GLOSSARIO_VARIACAO_PATRIMONIAL.explicacao}
                tamanhoIcone="h-3 w-3"
              />
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className={cn("flex items-center gap-1", tipografia.rotulo)}>
            <BarChart3
              className={cn(icone.tituloCard, "text-muted-foreground")}
              aria-hidden="true"
            />
            Ganhos no Mes
            <InfoTooltip conteudo={GLOSSARIO_GANHOS_NO_MES.explicacao} />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className={tipografia.valorPrincipal}>
            {formatarMoeda(resumo.ganhosFinanceirosNoMes.valorEmCentavos)}
          </div>
          <p className={cn(tipografia.auxiliar, "flex items-center gap-1")}>
            Rentabilidade: {formatarPercentualSimples(resumo.rentabilidadeMensal.valor)}
            <InfoTooltip
              conteudo={GLOSSARIO_RENTABILIDADE_MENSAL.explicacao}
              tamanhoIcone="h-3 w-3"
            />
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className={cn("flex items-center gap-1", tipografia.rotulo)}>
            <Percent className={cn(icone.tituloCard, "text-muted-foreground")} aria-hidden="true" />
            Rentabilidade Anual
            <InfoTooltip conteudo={GLOSSARIO_RENTABILIDADE_ANUAL.explicacao} />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className={tipografia.valorPrincipal}>
            {formatarPercentualSimples(resumo.rentabilidadeAnual.valor)}
          </div>
          {resumo.rentabilidadeAnoAnterior && (
            <p className={tipografia.auxiliar}>
              {formatarPercentualSimples(resumo.rentabilidadeAnoAnterior.valor)} no ano anterior
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className={cn("flex items-center gap-1", tipografia.rotulo)}>
            <CalendarDays
              className={cn(icone.tituloCard, "text-muted-foreground")}
              aria-hidden="true"
            />
            Desde o Inicio
            <InfoTooltip conteudo={GLOSSARIO_DESDE_INICIO.explicacao} />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className={tipografia.valorPrincipal}>
            {formatarPercentualSimples(resumo.rentabilidadeDesdeInicio.valor)}
          </div>
          <p className={tipografia.auxiliar}>
            Desde {formatarDataBrasileira(resumo.dataInicioCarteira)}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
