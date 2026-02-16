"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { PieChart, Pie, Cell } from "recharts";
import { CORES_ESTRATEGIA } from "@/lib/chart-config";
import { formatarPercentualSimples } from "@/domain/value-objects/percentage";
import { InfoTooltip } from "@/components/ui/info-tooltip";
import {
  GLOSSARIO_ALOCACAO_POR_ESTRATEGIA,
  GLOSSARIO_ESTRATEGIAS,
} from "@/lib/glossario-financeiro";
import { TakeawayBox, type Conclusao } from "@/components/ui/takeaway-box";
import {
  PieChart as PieChartIcon,
  Landmark,
  TrendingUp,
  Building2,
  Globe,
  BarChart3,
  Bitcoin,
  Package,
  type LucideIcon,
} from "lucide-react";
import type { AlocacaoMensal } from "@/schemas/report-extraction.schema";

const ICONES_ESTRATEGIA: Record<string, LucideIcon> = {
  "Renda Fixa": Landmark,
  "Ações Brasil": TrendingUp,
  "Fundos Imobiliários": Building2,
  "Ações Global": Globe,
  "Renda Variável": BarChart3,
  Criptomoedas: Bitcoin,
  Outros: Package,
};

interface AssetAllocationChartProps {
  alocacaoMensal: AlocacaoMensal[];
}

function gerarConclusaoAlocacao(dadosGrafico: Array<{ nome: string; valor: number }>): Conclusao[] {
  const conclusoes: Conclusao[] = [];
  if (dadosGrafico.length === 0) return conclusoes;

  const ordenadosPorValor = [...dadosGrafico].sort((valorA, valorB) => valorB.valor - valorA.valor);
  const maiorCategoria = ordenadosPorValor[0];
  if (!maiorCategoria) return conclusoes;
  const quantidadeCategorias = dadosGrafico.length;

  if (maiorCategoria.valor > 50) {
    conclusoes.push({
      texto: `${formatarPercentualSimples(maiorCategoria.valor)} do seu dinheiro está em ${maiorCategoria.nome}. Concentrar mais de 50% em um único tipo de investimento aumenta o risco. Considere diversificar.`,
      tipo: "atencao",
    });
  } else if (quantidadeCategorias >= 4) {
    conclusoes.push({
      texto: `Sua carteira está distribuída em ${quantidadeCategorias} tipos de investimento diferentes. Boa diversificação!`,
      tipo: "positivo",
    });
  } else {
    conclusoes.push({
      texto: `Sua carteira tem ${quantidadeCategorias} tipos de investimento. Quanto mais diversificado, menor o risco.`,
      tipo: "neutro",
    });
  }

  return conclusoes;
}

export function AssetAllocationChart({ alocacaoMensal }: AssetAllocationChartProps) {
  const cores = CORES_ESTRATEGIA;

  const alocacaoRecente = alocacaoMensal[alocacaoMensal.length - 1];
  if (!alocacaoRecente) return null;

  const dadosGrafico = alocacaoRecente.categorias
    .filter((categoria) => categoria.percentualDaCarteira.valor > 0)
    .map((categoria) => ({
      nome: categoria.nomeCategoria,
      valor: categoria.percentualDaCarteira.valor,
      fill: cores[categoria.nomeCategoria] ?? "hsl(0, 0%, 70%)",
    }));

  const conclusoesAlocacao = gerarConclusaoAlocacao(dadosGrafico);

  const chartConfig = Object.fromEntries(
    dadosGrafico.map((item) => [item.nome, { label: item.nome, color: item.fill }]),
  );

  return (
    <Card data-chat-highlight="alocacao-ativos">
      <CardHeader>
        <CardTitle className="flex items-center gap-1">
          <PieChartIcon className="text-muted-foreground h-5 w-5" aria-hidden="true" />
          Alocacao por Estrategia
          <InfoTooltip conteudo={GLOSSARIO_ALOCACAO_POR_ESTRATEGIA.explicacao} />
        </CardTitle>
        <CardDescription className="leading-relaxed">
          Veja como seu dinheiro está distribuído. Cada fatia representa um tipo de investimento —
          passe o mouse sobre os nomes para entender cada um.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="mx-auto aspect-square max-h-75">
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
        <div className="mt-4 grid grid-cols-1 gap-1.5 sm:grid-cols-2 sm:gap-2">
          {dadosGrafico.map((item) => {
            const explicacaoEstrategia = GLOSSARIO_ESTRATEGIAS[item.nome];
            const IconeEstrategia = ICONES_ESTRATEGIA[item.nome];
            return (
              <div key={item.nome} className="flex items-center gap-2 text-sm">
                <div
                  className="h-3 w-3 shrink-0 rounded-full"
                  style={{ backgroundColor: item.fill }}
                />
                <span className="text-muted-foreground flex items-center gap-1">
                  {IconeEstrategia && <IconeEstrategia className="h-3 w-3" aria-hidden="true" />}
                  {item.nome}
                  {explicacaoEstrategia && (
                    <InfoTooltip
                      conteudo={explicacaoEstrategia.explicacao}
                      tamanhoIcone="h-3 w-3"
                    />
                  )}
                </span>
                <span className="ml-auto font-medium">{formatarPercentualSimples(item.valor)}</span>
              </div>
            );
          })}
        </div>
        <TakeawayBox conclusoes={conclusoesAlocacao} />
      </CardContent>
    </Card>
  );
}
