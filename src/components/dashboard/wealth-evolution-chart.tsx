"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip } from "@/components/ui/chart";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid } from "recharts";
import { configGraficoPatrimonio } from "@/lib/chart-config";
import { formatarMoeda, formatarMoedaCompacta } from "@/domain/value-objects/money";
import { formatarMesAno } from "@/lib/format-date";
import type { DashboardData } from "@/application/use-cases/get-dashboard-data";

interface WealthEvolutionChartProps {
  evolucaoPatrimonial: DashboardData["evolucaoPatrimonial"];
}

interface PontoGraficoTooltipPayload {
  value: number;
  dataKey: string;
  color: string;
  name: string;
}

interface TooltipCustomizadoProps {
  active?: boolean;
  payload?: PontoGraficoTooltipPayload[];
  label?: string;
}

function TooltipCustomizado({ active, payload, label }: TooltipCustomizadoProps) {
  if (!active || !payload || !label) return null;

  const patrimonioTotal = payload.find((ponto) => ponto.dataKey === "patrimonioTotalCentavos");
  const totalAportado = payload.find((ponto) => ponto.dataKey === "totalAportadoCentavos");

  const rendimentosCentavos =
    (patrimonioTotal?.value ?? 0) - (totalAportado?.value ?? 0);

  return (
    <div className="rounded-lg border bg-background p-3 shadow-sm">
      <p className="mb-2 text-sm font-medium">{label}</p>
      {patrimonioTotal && (
        <p className="text-sm" style={{ color: patrimonioTotal.color }}>
          Patrimonio: {formatarMoeda(patrimonioTotal.value)}
        </p>
      )}
      {totalAportado && (
        <p className="text-sm" style={{ color: totalAportado.color }}>
          Aportado: {formatarMoeda(totalAportado.value)}
        </p>
      )}
      <p className={`text-sm font-medium ${rendimentosCentavos >= 0 ? "text-green-600" : "text-red-600"}`}>
        Rendimentos: {formatarMoeda(rendimentosCentavos)}
      </p>
    </div>
  );
}

export function WealthEvolutionChart({ evolucaoPatrimonial }: WealthEvolutionChartProps) {
  if (evolucaoPatrimonial.length < 2) return null;

  const dadosGrafico = evolucaoPatrimonial.map((ponto) => ({
    mesAno: formatarMesAno(ponto.mesAno, "abreviado"),
    patrimonioTotalCentavos: ponto.patrimonioTotalCentavos,
    totalAportadoCentavos: ponto.totalAportadoCentavos,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Evolucao Patrimonial</CardTitle>
        <p className="text-sm text-muted-foreground">
          Patrimonio total vs total aportado ao longo do tempo
        </p>
      </CardHeader>
      <CardContent>
        <ChartContainer config={configGraficoPatrimonio} className="h-[300px] w-full">
          <AreaChart data={dadosGrafico}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="mesAno"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickFormatter={(valorCentavos: number) => formatarMoedaCompacta(valorCentavos)}
              width={80}
            />
            <ChartTooltip content={<TooltipCustomizado />} />
            <Area
              dataKey="totalAportadoCentavos"
              type="monotone"
              fill="var(--color-totalAportado)"
              fillOpacity={0.3}
              stroke="var(--color-totalAportado)"
              strokeWidth={2}
            />
            <Area
              dataKey="patrimonioTotalCentavos"
              type="monotone"
              fill="var(--color-patrimonioTotal)"
              fillOpacity={0.15}
              stroke="var(--color-patrimonioTotal)"
              strokeWidth={2}
            />
          </AreaChart>
        </ChartContainer>
        <div className="mt-4 flex items-center justify-center gap-6">
          <div className="flex items-center gap-2 text-sm">
            <div className="h-3 w-3 rounded-full" style={{ backgroundColor: "var(--color-patrimonioTotal)" }} />
            <span className="text-muted-foreground">Patrimonio Total</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <div className="h-3 w-3 rounded-full" style={{ backgroundColor: "var(--color-totalAportado)" }} />
            <span className="text-muted-foreground">Total Aportado</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <div className="h-3 w-3 rounded-sm bg-gradient-to-b from-orange-300/30 to-blue-400/30" />
            <span className="text-muted-foreground">Rendimentos (diferenca)</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
