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
import { formatarMoeda } from "@/domain/value-objects/money";
import { formatarPercentualSimples } from "@/domain/value-objects/percentage";
import { formatarDataBrasileira } from "@/lib/format-date";
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
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="flex items-center gap-1 text-sm font-medium">
            Patrimonio Total
            <InfoTooltip conteudo={GLOSSARIO_PATRIMONIO_TOTAL.explicacao} />
          </CardTitle>
          <DollarSign className="text-muted-foreground h-4 w-4" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {formatarMoeda(resumo.patrimonioTotal.valorEmCentavos)}
          </div>
          {variacaoPatrimonialCentavos !== null && (
            <p
              className={`text-xs ${variacaoPositiva ? "text-green-600" : "text-red-600"} flex items-center gap-1`}
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
          <CardTitle className="flex items-center gap-1 text-sm font-medium">
            Ganhos no Mes
            <InfoTooltip conteudo={GLOSSARIO_GANHOS_NO_MES.explicacao} />
          </CardTitle>
          <BarChart3 className="text-muted-foreground h-4 w-4" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {formatarMoeda(resumo.ganhosFinanceirosNoMes.valorEmCentavos)}
          </div>
          <p className="text-muted-foreground flex items-center gap-1 text-xs">
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
          <CardTitle className="flex items-center gap-1 text-sm font-medium">
            Rentabilidade Anual
            <InfoTooltip conteudo={GLOSSARIO_RENTABILIDADE_ANUAL.explicacao} />
          </CardTitle>
          <Percent className="text-muted-foreground h-4 w-4" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {formatarPercentualSimples(resumo.rentabilidadeAnual.valor)}
          </div>
          {resumo.rentabilidadeAnoAnterior && (
            <p className="text-muted-foreground text-xs">
              {formatarPercentualSimples(resumo.rentabilidadeAnoAnterior.valor)} no ano anterior
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="flex items-center gap-1 text-sm font-medium">
            Desde o Inicio
            <InfoTooltip conteudo={GLOSSARIO_DESDE_INICIO.explicacao} />
          </CardTitle>
          <CalendarDays className="text-muted-foreground h-4 w-4" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {formatarPercentualSimples(resumo.rentabilidadeDesdeInicio.valor)}
          </div>
          <p className="text-muted-foreground text-xs">
            Desde {formatarDataBrasileira(resumo.dataInicioCarteira)}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
