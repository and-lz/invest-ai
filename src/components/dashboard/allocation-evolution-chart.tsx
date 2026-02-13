"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid } from "recharts";
import { getCoresEstrategia } from "@/lib/chart-config";
import { useCyberpunkPalette } from "@/contexts/cyberpunk-palette-context";
import { formatarMesAno } from "@/lib/format-date";
import { InfoTooltip } from "@/components/ui/info-tooltip";
import { GLOSSARIO_EVOLUCAO_ALOCACAO, GLOSSARIO_ESTRATEGIAS } from "@/lib/glossario-financeiro";
import { TakeawayBox, type Conclusao } from "@/components/ui/takeaway-box";
import { formatarPercentualSimples } from "@/domain/value-objects/percentage";
import type { AlocacaoMensal } from "@/schemas/report-extraction.schema";
import type { ChartConfig } from "@/components/ui/chart";

interface AllocationEvolutionChartProps {
  evolucaoAlocacao: AlocacaoMensal[];
}

export function gerarConclusaoEvolucaoAlocacao(evolucao: AlocacaoMensal[]): Conclusao[] {
  const conclusoes: Conclusao[] = [];
  if (evolucao.length < 2) return conclusoes;

  const primeiro = evolucao[0];
  const ultimo = evolucao[evolucao.length - 1];
  if (!primeiro || !ultimo) return conclusoes;

  let maiorMudancaCategoria = "";
  let maiorMudancaValor = 0;
  let percentualInicial = 0;
  let percentualFinal = 0;

  for (const categoriaFinal of ultimo.categorias) {
    const categoriaInicial = primeiro.categorias.find(
      (categoria) => categoria.nomeCategoria === categoriaFinal.nomeCategoria,
    );
    const valorInicial = categoriaInicial?.percentualDaCarteira.valor ?? 0;
    const valorFinal = categoriaFinal.percentualDaCarteira.valor;
    const diferenca = Math.abs(valorFinal - valorInicial);

    if (diferenca > maiorMudancaValor) {
      maiorMudancaValor = diferenca;
      maiorMudancaCategoria = categoriaFinal.nomeCategoria;
      percentualInicial = valorInicial;
      percentualFinal = valorFinal;
    }
  }

  // Check initial categories that may have disappeared
  for (const categoriaInicial of primeiro.categorias) {
    const categoriaFinal = ultimo.categorias.find(
      (categoria) => categoria.nomeCategoria === categoriaInicial.nomeCategoria,
    );
    if (!categoriaFinal) {
      const diferenca = categoriaInicial.percentualDaCarteira.valor;
      if (diferenca > maiorMudancaValor) {
        maiorMudancaValor = diferenca;
        maiorMudancaCategoria = categoriaInicial.nomeCategoria;
        percentualInicial = categoriaInicial.percentualDaCarteira.valor;
        percentualFinal = 0;
      }
    }
  }

  if (maiorMudancaCategoria) {
    conclusoes.push({
      texto: `Sua maior mudança de alocação foi em ${maiorMudancaCategoria}: foi de ${formatarPercentualSimples(percentualInicial)} para ${formatarPercentualSimples(percentualFinal)}.`,
      tipo: "neutro",
    });
  }

  return conclusoes;
}

export function AllocationEvolutionChart({ evolucaoAlocacao }: AllocationEvolutionChartProps) {
  const { palette } = useCyberpunkPalette();
  const cores = getCoresEstrategia(palette);

  if (evolucaoAlocacao.length < 2) return null;

  const todasCategorias = new Set<string>();
  for (const mes of evolucaoAlocacao) {
    for (const categoria of mes.categorias) {
      todasCategorias.add(categoria.nomeCategoria);
    }
  }

  const categoriasOrdenadas = [...todasCategorias].sort();

  const dadosGrafico = evolucaoAlocacao.map((mes) => {
    const ponto: Record<string, string | number> = {
      mesAno: formatarMesAno(mes.mesAno, "abreviado"),
    };
    for (const nomeCategoria of categoriasOrdenadas) {
      const categoria = mes.categorias.find(
        (categoriaItem) => categoriaItem.nomeCategoria === nomeCategoria,
      );
      ponto[nomeCategoria] = categoria?.percentualDaCarteira.valor ?? 0;
    }
    return ponto;
  });

  const configGrafico: ChartConfig = Object.fromEntries(
    categoriasOrdenadas.map((nomeCategoria) => [
      nomeCategoria,
      {
        label: nomeCategoria,
        color: cores[nomeCategoria] ?? "hsl(0, 0%, 70%)",
      },
    ]),
  );

  const conclusoes = gerarConclusaoEvolucaoAlocacao(evolucaoAlocacao);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-1">
          Evolução da Alocação
          <InfoTooltip conteudo={GLOSSARIO_EVOLUCAO_ALOCACAO.explicacao} />
        </CardTitle>
        <CardDescription className="leading-relaxed">
          Veja como a distribuição da sua carteira mudou ao longo dos meses. Cada cor representa um
          tipo de investimento.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={configGrafico} className="h-75 w-full">
          <AreaChart data={dadosGrafico} stackOffset="expand">
            <CartesianGrid vertical={false} />
            <XAxis dataKey="mesAno" tickLine={false} axisLine={false} />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickFormatter={(valor: number) => `${Math.round(valor * 100)}%`}
            />
            <ChartTooltip content={<ChartTooltipContent />} />
            {categoriasOrdenadas.map((nomeCategoria) => (
              <Area
                key={nomeCategoria}
                dataKey={nomeCategoria}
                type="monotone"
                stackId="1"
                fill={cores[nomeCategoria] ?? "hsl(0, 0%, 70%)"}
                stroke={cores[nomeCategoria] ?? "hsl(0, 0%, 70%)"}
                fillOpacity={0.6}
              />
            ))}
          </AreaChart>
        </ChartContainer>
        <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
          {categoriasOrdenadas.map((nomeCategoria) => {
            const explicacao = GLOSSARIO_ESTRATEGIAS[nomeCategoria];
            return (
              <div
                key={nomeCategoria}
                className="text-muted-foreground flex items-center gap-1.5 text-xs"
              >
                <div
                  className="h-3 w-3 rounded-full"
                  style={{
                    backgroundColor: cores[nomeCategoria] ?? "hsl(0, 0%, 70%)",
                  }}
                />
                {nomeCategoria}
                {explicacao && (
                  <InfoTooltip conteudo={explicacao.explicacao} tamanhoIcone="h-3 w-3" />
                )}
              </div>
            );
          })}
        </div>
        <TakeawayBox conclusoes={conclusoes} />
      </CardContent>
    </Card>
  );
}
