"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip } from "@/components/ui/chart";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid } from "recharts";
import { formatarMoeda, formatarMoedaCompacta } from "@/domain/value-objects/money";
import { formatarMesAno } from "@/lib/format-date";
import type { ChartConfig } from "@/components/ui/chart";
import type { HistoricoPosicaoAtivo } from "@/schemas/analise-ativo.schema";
import { TrendingUp } from "lucide-react";

interface GraficoEvolucaoAtivoProps {
  readonly historico: HistoricoPosicaoAtivo[];
  readonly nomeAtivo: string;
}

const configGrafico: ChartConfig = {
  saldo: { label: "Saldo", color: "var(--chart-3)" },
};

interface PontoGraficoTooltipPayload {
  value: number;
  dataKey: string;
}

interface TooltipCustomizadoProps {
  active?: boolean;
  payload?: PontoGraficoTooltipPayload[];
  label?: string;
}

function TooltipCustomizado({ active, payload, label }: TooltipCustomizadoProps) {
  if (!active || !payload || !label) return null;

  const saldo = payload.find((ponto) => ponto.dataKey === "saldoBrutoCentavos");

  return (
    <div className="bg-background rounded-lg border p-3 shadow-sm">
      <p className="mb-1 text-sm font-medium">{label}</p>
      {saldo && (
        <p className="text-muted-foreground text-sm">
          Saldo:{" "}
          <span className="text-foreground font-medium">
            {formatarMoeda(saldo.value)}
          </span>
        </p>
      )}
    </div>
  );
}

export function GraficoEvolucaoAtivo({ historico, nomeAtivo }: GraficoEvolucaoAtivoProps) {
  if (historico.length === 0) return null;

  const dadosGrafico = historico.map((ponto) => ({
    ...ponto,
    mesAnoFormatado: formatarMesAno(ponto.mesAno, "abreviado"),
  }));

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <TrendingUp className="text-muted-foreground h-5 w-5" />
          <CardTitle className="text-lg">Evolucao do Saldo</CardTitle>
        </div>
        <CardDescription>
          Historico do saldo de {nomeAtivo} na sua carteira
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={configGrafico} className="h-[300px] w-full">
          <AreaChart data={dadosGrafico}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="mesAnoFormatado"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              className="text-xs"
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickFormatter={(valor: number) => formatarMoedaCompacta(valor)}
              width={80}
              className="text-xs"
            />
            <ChartTooltip content={<TooltipCustomizado />} />
            <defs>
              <linearGradient id="gradienteSaldo" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--chart-3)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="var(--chart-3)" stopOpacity={0.05} />
              </linearGradient>
            </defs>
            <Area
              type="monotone"
              dataKey="saldoBrutoCentavos"
              stroke="var(--chart-3)"
              fill="url(#gradienteSaldo)"
              strokeWidth={2}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
