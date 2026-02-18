"use client";

import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BotaoExplicarIA } from "@/components/ui/ai-explain-button";
import { ChartContainer, ChartTooltip } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Cell, ReferenceLine } from "recharts";
import { InfoTooltip } from "@/components/ui/info-tooltip";
import { GLOSSARY_RENTABILIDADE_POR_CATEGORIA } from "@/lib/financial-glossary";
import { TakeawayBox, type Conclusao } from "@/components/ui/takeaway-box";
import { BarChart3 } from "lucide-react";
import { formatSimplePercentage } from "@/domain/value-objects/percentage";
import type { RentabilidadePorCategoria } from "@/schemas/report-extraction.schema";
import type { ChartConfig } from "@/components/ui/chart";

interface CategoryPerformanceChartProps {
  categorias: RentabilidadePorCategoria[];
  cdiAnual?: number;
}

interface PontoGraficoTooltipPayload {
  value: number;
  payload: {
    nome: string;
    rentabilidade: number;
  };
}

interface TooltipCategoriaProps {
  active?: boolean;
  payload?: PontoGraficoTooltipPayload[];
}

function TooltipCategoria({ active, payload }: TooltipCategoriaProps) {
  if (!active || !payload || payload.length === 0) return null;

  const primeiroPonto = payload[0];
  if (!primeiroPonto) return null;
  const dados = primeiroPonto.payload;

  return (
    <div className="bg-background rounded-lg border p-3 shadow-sm">
      <p className="mb-1 text-sm font-medium">{dados.nome}</p>
      <p className="text-muted-foreground text-sm">
        12 meses:{" "}
        <span className="text-foreground font-medium">
          {formatSimplePercentage(dados.rentabilidade)}
        </span>
      </p>
    </div>
  );
}

export function gerarConclusaoCategorias(
  categorias: RentabilidadePorCategoria[],
  cdiAnual?: number,
): Conclusao[] {
  const conclusoes: Conclusao[] = [];
  if (categorias.length === 0) return conclusoes;

  const ordenadas = [...categorias].sort(
    (categoriaA, categoriaB) =>
      categoriaB.rentabilidade12Meses.valor - categoriaA.rentabilidade12Meses.valor,
  );

  const melhor = ordenadas[0];
  const pior = ordenadas[ordenadas.length - 1];
  if (!melhor || !pior) return conclusoes;

  conclusoes.push({
    texto: `A melhor categoria em 12 meses foi ${melhor.nomeCategoria} (${formatSimplePercentage(melhor.rentabilidade12Meses.valor)}). A pior foi ${pior.nomeCategoria} (${formatSimplePercentage(pior.rentabilidade12Meses.valor)}).`,
    tipo: melhor.rentabilidade12Meses.valor > 0 ? "positivo" : "atencao",
  });

  if (cdiAnual !== undefined) {
    const categoriasAcimaCdi = categorias.filter(
      (categoria) => categoria.rentabilidade12Meses.valor > cdiAnual,
    );
    conclusoes.push({
      texto: `${categoriasAcimaCdi.length} de ${categorias.length} categorias bateram o CDI (${formatSimplePercentage(cdiAnual)}) nos últimos 12 meses.`,
      tipo:
        categoriasAcimaCdi.length > categorias.length / 2
          ? "positivo"
          : categoriasAcimaCdi.length > 0
            ? "neutro"
            : "atencao",
    });
  }

  return conclusoes;
}

export function CategoryPerformanceChart({ categorias, cdiAnual }: CategoryPerformanceChartProps) {
  if (categorias.length === 0) return null;

  const dadosGrafico = [...categorias]
    .sort(
      (categoriaA, categoriaB) =>
        categoriaB.rentabilidade12Meses.valor - categoriaA.rentabilidade12Meses.valor,
    )
    .map((categoria) => ({
      nome: categoria.nomeCategoria,
      rentabilidade: categoria.rentabilidade12Meses.valor,
    }));

  const configGrafico: ChartConfig = {
    rentabilidade: {
      label: "Rentabilidade 12M",
      color: "hsl(221, 83%, 53%)",
    },
  };

  const conclusoes = gerarConclusaoCategorias(categorias, cdiAnual);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-1">
          <BarChart3 className="text-muted-foreground h-5 w-5" aria-hidden="true" />
          Rentabilidade por Categoria
          <InfoTooltip conteudo={GLOSSARY_RENTABILIDADE_POR_CATEGORIA.explicacao} />
        </CardTitle>
        <CardDescription className="leading-relaxed">
          Compara o retorno de cada tipo de investimento nos últimos 12 meses.
          {cdiAnual !== undefined &&
            ` A linha tracejada indica o CDI (${formatSimplePercentage(cdiAnual)}).`}
        </CardDescription>
        <CardAction>
          <BotaoExplicarIA identificadorCard="rentabilidade-categoria" />
        </CardAction>
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
              width={80}
              className="text-xs"
            />
            <ChartTooltip content={<TooltipCategoria />} />
            {cdiAnual !== undefined && (
              <ReferenceLine
                x={cdiAnual}
                stroke="hsl(142, 76%, 36%)"
                strokeDasharray="3 3"
                label={{ value: "CDI", position: "top", fontSize: 11 }}
              />
            )}
            <Bar dataKey="rentabilidade" radius={[0, 4, 4, 0]}>
              {dadosGrafico.map((ponto) => (
                <Cell
                  key={ponto.nome}
                  fill={ponto.rentabilidade > 0 ? "hsl(142, 76%, 36%)" : "hsl(0, 84%, 60%)"}
                />
              ))}
            </Bar>
          </BarChart>
        </ChartContainer>
        <TakeawayBox conclusoes={conclusoes} />
      </CardContent>
    </Card>
  );
}
