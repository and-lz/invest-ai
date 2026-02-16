"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Cell } from "recharts";
import { InfoTooltip } from "@/components/ui/info-tooltip";
import { GLOSSARIO_LIQUIDEZ } from "@/lib/glossario-financeiro";
import { TakeawayBox, type Conclusao } from "@/components/ui/takeaway-box";
import { Droplets } from "lucide-react";
import { formatarMoeda } from "@/domain/value-objects/money";
import { formatarPercentualSimples } from "@/domain/value-objects/percentage";
import type { FaixaLiquidez } from "@/schemas/report-extraction.schema";
import type { ChartConfig } from "@/components/ui/chart";

interface LiquidityLadderProps {
  faixasLiquidez: FaixaLiquidez[];
}

const CORES_LIQUIDEZ: string[] = [
  "hsl(142, 76%, 36%)",
  "hsl(142, 60%, 50%)",
  "hsl(45, 93%, 47%)",
  "hsl(25, 95%, 53%)",
  "hsl(0, 84%, 60%)",
  "hsl(262, 83%, 58%)",
  "hsl(221, 83%, 53%)",
];

interface PontoGraficoTooltipPayload {
  value: number;
  payload: {
    nome: string;
    percentual: number;
    valorCentavos: number;
    acumulado: number;
  };
}

interface TooltipLiquidezProps {
  active?: boolean;
  payload?: PontoGraficoTooltipPayload[];
}

function TooltipLiquidez({ active, payload }: TooltipLiquidezProps) {
  if (!active || !payload || payload.length === 0) return null;

  const primeiroPonto = payload[0];
  if (!primeiroPonto) return null;
  const dados = primeiroPonto.payload;

  return (
    <div className="bg-background rounded-lg border p-3 shadow-sm">
      <p className="mb-1 text-sm font-medium">{dados.nome}</p>
      <p className="text-muted-foreground text-sm">
        Valor:{" "}
        <span className="text-foreground font-medium">{formatarMoeda(dados.valorCentavos)}</span>
      </p>
      <p className="text-muted-foreground text-sm">
        Participação:{" "}
        <span className="text-foreground font-medium">
          {formatarPercentualSimples(dados.percentual)}
        </span>
      </p>
      <p className="text-muted-foreground text-sm">
        Acumulado:{" "}
        <span className="text-foreground font-medium">
          {formatarPercentualSimples(dados.acumulado)}
        </span>
      </p>
    </div>
  );
}

export function gerarConclusaoLiquidez(faixas: FaixaLiquidez[]): Conclusao[] {
  const conclusoes: Conclusao[] = [];
  if (faixas.length === 0) return conclusoes;

  const faixasCurtoPrazo = faixas.filter((faixa) => faixa.diasMaximo <= 5);
  const percentualCurtoPrazo = faixasCurtoPrazo.reduce(
    (acumulador, faixa) => acumulador + faixa.percentualDaCarteira.valor,
    0,
  );
  const valorCurtoPrazoCentavos = faixasCurtoPrazo.reduce(
    (acumulador, faixa) => acumulador + faixa.valor.valorEmCentavos,
    0,
  );

  const faixasAte30Dias = faixas.filter((faixa) => faixa.diasMaximo <= 30);
  const percentualAte30Dias = faixasAte30Dias.reduce(
    (acumulador, faixa) => acumulador + faixa.percentualDaCarteira.valor,
    0,
  );

  conclusoes.push({
    texto: `${formatarPercentualSimples(percentualCurtoPrazo)} do seu patrimônio (${formatarMoeda(valorCurtoPrazoCentavos)}) pode ser resgatado em até 5 dias. ${formatarPercentualSimples(percentualAte30Dias)} está acessível em até 30 dias.`,
    tipo: percentualCurtoPrazo >= 15 ? "positivo" : "atencao",
  });

  const faixasLongoPrazo = faixas.filter((faixa) => faixa.diasMinimo > 90);
  const percentualLongoPrazo = faixasLongoPrazo.reduce(
    (acumulador, faixa) => acumulador + faixa.percentualDaCarteira.valor,
    0,
  );

  if (percentualLongoPrazo > 50) {
    conclusoes.push({
      texto: `${formatarPercentualSimples(percentualLongoPrazo)} do seu patrimônio tem liquidez acima de 90 dias. Certifique-se de manter uma reserva de emergência acessível.`,
      tipo: "atencao",
    });
  }

  return conclusoes;
}

export function LiquidityLadder({ faixasLiquidez }: LiquidityLadderProps) {
  if (faixasLiquidez.length === 0) return null;

  const dadosGrafico = faixasLiquidez.map((faixa) => ({
    nome: `${faixa.descricaoPeriodo} dias`,
    percentual: faixa.percentualDaCarteira.valor,
    valorCentavos: faixa.valor.valorEmCentavos,
    acumulado: faixa.percentualAcumulado.valor,
  }));

  const configGrafico: ChartConfig = {
    percentual: { label: "Percentual", color: CORES_LIQUIDEZ[0] ?? "hsl(142, 76%, 36%)" },
  };

  const conclusoes = gerarConclusaoLiquidez(faixasLiquidez);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-1">
          <Droplets className="text-muted-foreground h-5 w-5" aria-hidden="true" />
          Escada de Liquidez
          <InfoTooltip conteudo={GLOSSARIO_LIQUIDEZ.explicacao} />
        </CardTitle>
        <CardDescription className="leading-relaxed">
          Mostra em quanto tempo você consegue resgatar cada parte do seu patrimônio. Barras à
          esquerda representam dinheiro mais acessível — importante para emergências.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={configGrafico} className="h-48 w-full sm:h-64">
          <BarChart data={dadosGrafico} layout="vertical">
            <CartesianGrid horizontal={false} />
            <XAxis
              type="number"
              tickLine={false}
              axisLine={false}
              tickFormatter={(valor: number) => `${valor}%`}
            />
            <YAxis
              type="category"
              dataKey="nome"
              tickLine={false}
              axisLine={false}
              width={100}
              className="text-xs"
            />
            <ChartTooltip content={<TooltipLiquidez />} />
            <Bar dataKey="percentual" radius={[0, 4, 4, 0]}>
              {dadosGrafico.map((_, indice) => (
                <Cell key={indice} fill={CORES_LIQUIDEZ[indice % CORES_LIQUIDEZ.length]} />
              ))}
            </Bar>
          </BarChart>
        </ChartContainer>
        <TakeawayBox conclusoes={conclusoes} />
      </CardContent>
    </Card>
  );
}
