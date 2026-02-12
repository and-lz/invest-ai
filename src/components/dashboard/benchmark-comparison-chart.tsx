"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import { configGraficoBenchmarks } from "@/lib/chart-config";
import type { ComparacaoBenchmarks } from "@/schemas/report-extraction.schema";

interface BenchmarkComparisonChartProps {
  comparacoes: ComparacaoBenchmarks[];
}

export function BenchmarkComparisonChart({ comparacoes }: BenchmarkComparisonChartProps) {
  const dadosGrafico = comparacoes.map((comparacao) => ({
    periodo: comparacao.periodo,
    carteira: comparacao.carteira.valor,
    cdi: comparacao.cdi.valor,
    ibovespa: comparacao.ibovespa.valor,
    ipca: comparacao.ipca.valor,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Carteira vs Benchmarks</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={configGraficoBenchmarks} className="h-[300px] w-full">
          <BarChart data={dadosGrafico}>
            <CartesianGrid vertical={false} />
            <XAxis dataKey="periodo" tickLine={false} axisLine={false} />
            <YAxis tickLine={false} axisLine={false} tickFormatter={(value: number) => `${value}%`} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar dataKey="carteira" fill="var(--color-carteira)" radius={[4, 4, 0, 0]} />
            <Bar dataKey="cdi" fill="var(--color-cdi)" radius={[4, 4, 0, 0]} />
            <Bar dataKey="ibovespa" fill="var(--color-ibovespa)" radius={[4, 4, 0, 0]} />
            <Bar dataKey="ipca" fill="var(--color-ipca)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
