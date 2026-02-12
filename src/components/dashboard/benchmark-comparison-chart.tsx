"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import { configGraficoBenchmarks } from "@/lib/chart-config";
import { InfoTooltip } from "@/components/ui/info-tooltip";
import {
  GLOSSARIO_CARTEIRA_VS_BENCHMARKS,
  GLOSSARIO_CDI,
  GLOSSARIO_IBOVESPA,
  GLOSSARIO_IPCA,
} from "@/lib/glossario-financeiro";
import { TakeawayBox, type Conclusao } from "@/components/ui/takeaway-box";
import type { ComparacaoBenchmarks } from "@/schemas/report-extraction.schema";

interface DadosComparacao {
  periodo: string;
  carteira: number;
  cdi: number;
  ibovespa: number;
  ipca: number;
}

function gerarConclusaoMensal(dados: DadosComparacao): Conclusao {
  const superouCdi = dados.carteira > dados.cdi;
  const superouIbovespa = dados.carteira > dados.ibovespa;
  const superouIpca = dados.carteira > dados.ipca;

  if (superouCdi && superouIbovespa && superouIpca) {
    return {
      texto: `No mês, sua carteira rendeu mais que todos os índices de referência (${dados.carteira.toFixed(2)}%). Excelente resultado!`,
      tipo: "positivo",
    };
  }

  if (superouIpca && superouCdi) {
    return {
      texto: `No mês, sua carteira (${dados.carteira.toFixed(2)}%) superou a inflação e a renda fixa básica, mas ficou abaixo da bolsa. Bom resultado.`,
      tipo: "positivo",
    };
  }

  if (superouIpca) {
    return {
      texto: `No mês, sua carteira (${dados.carteira.toFixed(2)}%) superou a inflação (${dados.ipca.toFixed(2)}%), o que é positivo. Mas ficou abaixo do CDI (${dados.cdi.toFixed(2)}%).`,
      tipo: "neutro",
    };
  }

  return {
    texto: `No mês, sua carteira (${dados.carteira.toFixed(2)}%) ficou abaixo da inflação (${dados.ipca.toFixed(2)}%). Isso significa que seu dinheiro perdeu poder de compra neste período.`,
    tipo: "atencao",
  };
}

function gerarConclusoes(dadosGrafico: DadosComparacao[]): Conclusao[] {
  const conclusoes: Conclusao[] = [];

  const dadosMensal = dadosGrafico.find((dado) => dado.periodo.toLowerCase().includes("mes"));
  if (dadosMensal) {
    conclusoes.push(gerarConclusaoMensal(dadosMensal));
  }

  const dadosDesdeInicio = dadosGrafico.find((dado) =>
    dado.periodo.toLowerCase().includes("inicio"),
  );
  if (dadosDesdeInicio) {
    const superouIpca = dadosDesdeInicio.carteira > dadosDesdeInicio.ipca;
    const superouCdi = dadosDesdeInicio.carteira > dadosDesdeInicio.cdi;

    if (superouCdi) {
      conclusoes.push({
        texto: `Desde o início, sua carteira acumula ${dadosDesdeInicio.carteira.toFixed(2)}%, acima do CDI (${dadosDesdeInicio.cdi.toFixed(2)}%). Seu dinheiro está rendendo mais que a renda fixa básica no longo prazo.`,
        tipo: "positivo",
      });
    } else if (superouIpca) {
      conclusoes.push({
        texto: `Desde o início, sua carteira acumula ${dadosDesdeInicio.carteira.toFixed(2)}%, acima da inflação (${dadosDesdeInicio.ipca.toFixed(2)}%), mas abaixo do CDI (${dadosDesdeInicio.cdi.toFixed(2)}%). Seu patrimônio não perdeu valor, mas poderia render mais.`,
        tipo: "neutro",
      });
    } else {
      conclusoes.push({
        texto: `Desde o início, sua carteira acumula ${dadosDesdeInicio.carteira.toFixed(2)}%, abaixo da inflação (${dadosDesdeInicio.ipca.toFixed(2)}%). Atenção: no longo prazo, seu dinheiro está perdendo poder de compra.`,
        tipo: "atencao",
      });
    }
  }

  return conclusoes;
}

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

  const conclusoes = gerarConclusoes(dadosGrafico);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-1">
          Carteira vs Benchmarks
          <InfoTooltip conteudo={GLOSSARIO_CARTEIRA_VS_BENCHMARKS.explicacao} />
        </CardTitle>
        <CardDescription className="leading-relaxed">
          Cada grupo de barras mostra um período. Sua carteira é comparada com 3 referências: o CDI
          (renda fixa básica), o Ibovespa (média da bolsa) e o IPCA (inflação). Se a barra da sua
          carteira é a maior do grupo, você está indo muito bem naquele período!
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={configGraficoBenchmarks} className="h-75 w-full">
          <BarChart data={dadosGrafico}>
            <CartesianGrid vertical={false} />
            <XAxis dataKey="periodo" tickLine={false} axisLine={false} />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickFormatter={(value: number) => `${value}%`}
            />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar dataKey="carteira" fill="var(--color-carteira)" radius={[4, 4, 0, 0]} />
            <Bar dataKey="cdi" fill="var(--color-cdi)" radius={[4, 4, 0, 0]} />
            <Bar dataKey="ibovespa" fill="var(--color-ibovespa)" radius={[4, 4, 0, 0]} />
            <Bar dataKey="ipca" fill="var(--color-ipca)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ChartContainer>
        <div className="mt-4 flex flex-wrap items-center justify-center gap-4">
          <div className="text-muted-foreground flex items-center gap-1.5 text-sm">
            <div
              className="h-3 w-3 rounded-full"
              style={{ backgroundColor: "var(--color-carteira)" }}
            />
            Sua Carteira
          </div>
          <div className="text-muted-foreground flex items-center gap-1.5 text-sm">
            <div className="h-3 w-3 rounded-full" style={{ backgroundColor: "var(--color-cdi)" }} />
            CDI
            <InfoTooltip conteudo={GLOSSARIO_CDI.explicacao} tamanhoIcone="h-3 w-3" />
          </div>
          <div className="text-muted-foreground flex items-center gap-1.5 text-sm">
            <div
              className="h-3 w-3 rounded-full"
              style={{ backgroundColor: "var(--color-ibovespa)" }}
            />
            Ibovespa
            <InfoTooltip conteudo={GLOSSARIO_IBOVESPA.explicacao} tamanhoIcone="h-3 w-3" />
          </div>
          <div className="text-muted-foreground flex items-center gap-1.5 text-sm">
            <div
              className="h-3 w-3 rounded-full"
              style={{ backgroundColor: "var(--color-ipca)" }}
            />
            IPCA
            <InfoTooltip conteudo={GLOSSARIO_IPCA.explicacao} tamanhoIcone="h-3 w-3" />
          </div>
        </div>
        <TakeawayBox conclusoes={conclusoes} />
      </CardContent>
    </Card>
  );
}
