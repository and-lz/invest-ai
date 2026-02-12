"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { PieChart, Pie, Cell } from "recharts";
import { CORES_ESTRATEGIA } from "@/lib/chart-config";
import { formatarPercentualSimples } from "@/domain/value-objects/percentage";
import type { AlocacaoMensal } from "@/schemas/report-extraction.schema";

interface AssetAllocationChartProps {
  alocacaoMensal: AlocacaoMensal[];
}

export function AssetAllocationChart({ alocacaoMensal }: AssetAllocationChartProps) {
  const alocacaoRecente = alocacaoMensal[alocacaoMensal.length - 1];
  if (!alocacaoRecente) return null;

  const dadosGrafico = alocacaoRecente.categorias
    .filter((categoria) => categoria.percentualDaCarteira.valor > 0)
    .map((categoria) => ({
      nome: categoria.nomeCategoria,
      valor: categoria.percentualDaCarteira.valor,
      fill: CORES_ESTRATEGIA[categoria.nomeCategoria] ?? "hsl(0, 0%, 70%)",
    }));

  const chartConfig = Object.fromEntries(
    dadosGrafico.map((item) => [item.nome, { label: item.nome, color: item.fill }]),
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Alocacao por Estrategia</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="mx-auto aspect-square max-h-[300px]">
          <PieChart>
            <ChartTooltip content={<ChartTooltipContent />} />
            <Pie
              data={dadosGrafico}
              dataKey="valor"
              nameKey="nome"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={2}
            >
              {dadosGrafico.map((entry) => (
                <Cell key={entry.nome} fill={entry.fill} />
              ))}
            </Pie>
          </PieChart>
        </ChartContainer>
        <div className="mt-4 grid grid-cols-2 gap-2">
          {dadosGrafico.map((item) => (
            <div key={item.nome} className="flex items-center gap-2 text-sm">
              <div className="h-3 w-3 rounded-full" style={{ backgroundColor: item.fill }} />
              <span className="text-muted-foreground">{item.nome}</span>
              <span className="ml-auto font-medium">{formatarPercentualSimples(item.valor)}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
