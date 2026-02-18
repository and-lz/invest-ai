"use client";

import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BotaoExplicarIA } from "@/components/ui/ai-explain-button";
import { ChartContainer, ChartTooltip } from "@/components/ui/chart";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid } from "recharts";
import { configGraficoPatrimonio } from "@/lib/chart-config";
import { formatarMoeda, formatCompactCurrency } from "@/domain/value-objects/money";
import { formatSimplePercentage } from "@/domain/value-objects/percentage";
import { formatarMesAno } from "@/lib/format-date";
import { InfoTooltip } from "@/components/ui/info-tooltip";
import {
  GLOSSARY_EVOLUCAO_PATRIMONIAL,
  GLOSSARY_TOTAL_APORTADO,
  GLOSSARY_RENDIMENTOS,
} from "@/lib/financial-glossary";
import { TakeawayBox, type Conclusao } from "@/components/ui/takeaway-box";
import { TrendingUp } from "lucide-react";
import type { DashboardData } from "@/application/use-cases/get-dashboard-data";
import { cn } from "@/lib/utils";
import { corValor } from "@/lib/design-system";

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

  const rendimentosCentavos = (patrimonioTotal?.value ?? 0) - (totalAportado?.value ?? 0);

  return (
    <div className="bg-background rounded-lg border p-3 shadow-sm">
      <p className="mb-2 text-sm font-medium">{label}</p>
      {patrimonioTotal && (
        <p className="text-muted-foreground text-sm">
          Patrimonio:{" "}
          <span className="text-foreground font-medium">
            {formatarMoeda(patrimonioTotal.value)}
          </span>
        </p>
      )}
      {totalAportado && (
        <p className="text-muted-foreground text-sm">
          Aportado:{" "}
          <span className="text-foreground font-medium">{formatarMoeda(totalAportado.value)}</span>
        </p>
      )}
      <p className={cn("text-sm font-medium", corValor(rendimentosCentavos))}>
        Rendimentos: {formatarMoeda(rendimentosCentavos)}
      </p>
    </div>
  );
}

function gerarConclusaoEvolucao(evolucao: DashboardData["evolucaoPatrimonial"]): Conclusao[] {
  const conclusoes: Conclusao[] = [];
  const pontoAtual = evolucao[evolucao.length - 1];
  if (!pontoAtual) return conclusoes;

  const rendimentosCentavos = pontoAtual.patrimonioTotalCentavos - pontoAtual.totalAportadoCentavos;
  const percentualRendimento =
    pontoAtual.totalAportadoCentavos > 0
      ? (rendimentosCentavos / pontoAtual.totalAportadoCentavos) * 100
      : 0;

  if (rendimentosCentavos > 0) {
    conclusoes.push({
      texto: `Seus investimentos já geraram ${formatarMoeda(rendimentosCentavos)} de rendimentos, o que representa ${formatSimplePercentage(percentualRendimento)} sobre o que você investiu do próprio bolso.`,
      tipo: "positivo",
    });
  } else if (rendimentosCentavos < 0) {
    conclusoes.push({
      texto: `Seus investimentos estão com ${formatarMoeda(Math.abs(rendimentosCentavos))} de prejuízo acumulado. Isso pode ser temporário — investimentos de longo prazo costumam se recuperar.`,
      tipo: "atencao",
      acionavel: true,
    });
  }

  if (evolucao.length >= 3) {
    const penultimo = evolucao[evolucao.length - 2];
    const antepenultimo = evolucao[evolucao.length - 3];
    if (!penultimo || !antepenultimo) return conclusoes;
    const cresceu2Meses =
      pontoAtual.patrimonioTotalCentavos > penultimo.patrimonioTotalCentavos &&
      penultimo.patrimonioTotalCentavos > antepenultimo.patrimonioTotalCentavos;
    const caiu2Meses =
      pontoAtual.patrimonioTotalCentavos < penultimo.patrimonioTotalCentavos &&
      penultimo.patrimonioTotalCentavos < antepenultimo.patrimonioTotalCentavos;

    if (cresceu2Meses) {
      conclusoes.push({
        texto: "Seu patrimônio está em tendência de alta — cresceu nos últimos meses consecutivos.",
        tipo: "positivo",
      });
    } else if (caiu2Meses) {
      conclusoes.push({
        texto:
          "Seu patrimônio caiu nos últimos meses consecutivos. Fique atento, mas evite decisões por impulso.",
        tipo: "atencao",
        acionavel: true,
      });
    }
  }

  return conclusoes;
}

export function WealthEvolutionChart({ evolucaoPatrimonial }: WealthEvolutionChartProps) {
  if (evolucaoPatrimonial.length < 2) return null;

  const dadosGrafico = evolucaoPatrimonial.map((ponto) => ({
    mesAno: formatarMesAno(ponto.mesAno, "abreviado"),
    patrimonioTotalCentavos: ponto.patrimonioTotalCentavos,
    totalAportadoCentavos: ponto.totalAportadoCentavos,
  }));

  const conclusoesEvolucao = gerarConclusaoEvolucao(evolucaoPatrimonial);
  const configGrafico = configGraficoPatrimonio;

  return (
    <Card data-chat-highlight="patrimonio-total">
      <CardHeader>
        <CardTitle className="flex items-center gap-1">
          <TrendingUp className="text-muted-foreground h-5 w-5" aria-hidden="true" />
          Evolucao Patrimonial
          <InfoTooltip conteudo={GLOSSARY_EVOLUCAO_PATRIMONIAL.explicacao} />
        </CardTitle>
        <CardDescription className="leading-relaxed">
          Acompanhe a evolução do seu dinheiro. Quanto mais a área de cima se distancia da de baixo,
          mais seus investimentos estão rendendo. Se as duas linhas estão juntas, os rendimentos
          estão baixos.
        </CardDescription>
        <CardAction>
          <BotaoExplicarIA identificadorCard="patrimonio-total" />
        </CardAction>
      </CardHeader>
      <CardContent>
        <ChartContainer config={configGrafico} className="h-52 w-full sm:h-64 lg:h-75">
          <AreaChart data={dadosGrafico}>
            <CartesianGrid vertical={false} />
            <XAxis dataKey="mesAno" tickLine={false} axisLine={false} tickMargin={8} />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickFormatter={(valorCentavos: number) => formatCompactCurrency(valorCentavos)}
              width={55}
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
        <div className="mt-4 flex flex-wrap items-center justify-center gap-3 sm:gap-6">
          <div className="flex items-center gap-2 text-sm">
            <div
              className="h-3 w-3 rounded-full"
              style={{ backgroundColor: "var(--color-patrimonioTotal)" }}
            />
            <span className="text-muted-foreground">Patrimonio Total</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <div
              className="h-3 w-3 rounded-full"
              style={{ backgroundColor: "var(--color-totalAportado)" }}
            />
            <span className="text-muted-foreground flex items-center gap-1">
              Total Aportado
              <InfoTooltip conteudo={GLOSSARY_TOTAL_APORTADO.explicacao} tamanhoIcone="h-3 w-3" />
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <div className="from-chart-3/30 to-chart-1/30 h-3 w-3 rounded-sm bg-linear-to-b" />
            <span className="text-muted-foreground flex items-center gap-1">
              Rendimentos (diferença)
              <InfoTooltip conteudo={GLOSSARY_RENDIMENTOS.explicacao} tamanhoIcone="h-3 w-3" />
            </span>
          </div>
        </div>
        <TakeawayBox conclusoes={conclusoesEvolucao} />
      </CardContent>
    </Card>
  );
}
