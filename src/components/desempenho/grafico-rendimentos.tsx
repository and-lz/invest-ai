"use client";

import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BotaoExplicarIA } from "@/components/ui/botao-explicar-ia";
import { ChartContainer, ChartTooltip } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import { formatarMoeda } from "@/domain/value-objects/money";
import { formatarDataBrasileira } from "@/lib/format-date";
import type { ChartConfig } from "@/components/ui/chart";
import type { EventoFinanceiroAtivo } from "@/schemas/analise-ativo.schema";
import { Wallet } from "lucide-react";

interface GraficoRendimentosProps {
  readonly eventos: EventoFinanceiroAtivo[];
  readonly nomeAtivo: string;
}

const configGrafico: ChartConfig = {
  valor: { label: "Valor", color: "var(--chart-2)" },
};

interface PontoGraficoTooltipPayload {
  value: number;
  dataKey: string;
  payload: { tipo: string; dataFormatada: string };
}

interface TooltipCustomizadoProps {
  active?: boolean;
  payload?: PontoGraficoTooltipPayload[];
}

function TooltipCustomizado({ active, payload }: TooltipCustomizadoProps) {
  if (!active || !payload?.[0]) return null;

  const ponto = payload[0];

  return (
    <div className="bg-background rounded-lg border p-3 shadow-sm">
      <p className="mb-1 text-sm font-medium">{ponto.payload.dataFormatada}</p>
      <p className="text-muted-foreground text-sm">
        {ponto.payload.tipo}:{" "}
        <span className="text-success font-medium">{formatarMoeda(ponto.value)}</span>
      </p>
    </div>
  );
}

export function GraficoRendimentos({ eventos, nomeAtivo }: GraficoRendimentosProps) {
  if (eventos.length === 0) return null;

  const dadosGrafico = eventos
    .filter((evento) => evento.data !== null)
    .map((evento) => ({
      data: evento.data ?? "",
      dataFormatada: evento.data ? formatarDataBrasileira(evento.data) : "N/D",
      tipo: evento.tipo,
      valorCentavos: evento.valorCentavos,
    }))
    .sort((eventoA, eventoB) => eventoA.data.localeCompare(eventoB.data));

  const totalCentavos = eventos.reduce((soma, evento) => soma + evento.valorCentavos, 0);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Wallet className="text-muted-foreground h-5 w-5" />
          <CardTitle className="text-lg">Proventos Recebidos</CardTitle>
        </div>
        <CardDescription>
          Dividendos, JCP e outros eventos de {nomeAtivo}. Total: {formatarMoeda(totalCentavos)}
        </CardDescription>
        <CardAction>
          <BotaoExplicarIA identificadorCard="rendimentos-ativo" />
        </CardAction>
      </CardHeader>
      <CardContent>
        <ChartContainer config={configGrafico} className="h-[250px] w-full">
          <BarChart data={dadosGrafico}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="dataFormatada"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              className="text-xs"
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickFormatter={(valor: number) => formatarMoeda(valor)}
              width={80}
              className="text-xs"
            />
            <ChartTooltip content={<TooltipCustomizado />} />
            <Bar dataKey="valorCentavos" fill="var(--chart-2)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
