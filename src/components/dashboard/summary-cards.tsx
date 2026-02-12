"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, DollarSign, Percent, BarChart3, CalendarDays } from "lucide-react";
import { formatarMoeda } from "@/domain/value-objects/money";
import { formatarPercentualSimples } from "@/domain/value-objects/percentage";
import { formatarDataBrasileira } from "@/lib/format-date";
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
          <CardTitle className="text-sm font-medium">Patrimonio Total</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {formatarMoeda(resumo.patrimonioTotal.valorEmCentavos)}
          </div>
          {variacaoPatrimonialCentavos !== null && (
            <p className={`text-xs ${variacaoPositiva ? "text-green-600" : "text-red-600"} flex items-center gap-1`}>
              {variacaoPositiva ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
              {formatarMoeda(Math.abs(variacaoPatrimonialCentavos))} vs mes anterior
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Ganhos no Mes</CardTitle>
          <BarChart3 className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {formatarMoeda(resumo.ganhosFinanceirosNoMes.valorEmCentavos)}
          </div>
          <p className="text-xs text-muted-foreground">
            Rentabilidade: {formatarPercentualSimples(resumo.rentabilidadeMensal.valor)}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Rentabilidade Anual</CardTitle>
          <Percent className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {formatarPercentualSimples(resumo.rentabilidadeAnual.valor)}
          </div>
          {resumo.rentabilidadeAnoAnterior && (
            <p className="text-xs text-muted-foreground">
              {formatarPercentualSimples(resumo.rentabilidadeAnoAnterior.valor)} no ano anterior
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Desde o Inicio</CardTitle>
          <CalendarDays className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {formatarPercentualSimples(resumo.rentabilidadeDesdeInicio.valor)}
          </div>
          <p className="text-xs text-muted-foreground">
            Desde {formatarDataBrasileira(resumo.dataInicioCarteira)}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
