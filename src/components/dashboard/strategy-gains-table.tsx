"use client";

import { useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ArrowUp,
  ArrowDown,
  ArrowUpDown,
  Landmark,
  TrendingUp,
  Building2,
  Globe,
  BarChart3,
  Bitcoin,
  Package,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import { formatarMoeda } from "@/domain/value-objects/money";
import { useOrdenacaoTabela } from "@/hooks/use-ordenacao-tabela";
import { InfoTooltip } from "@/components/ui/info-tooltip";
import {
  GLOSSARIO_GANHOS_POR_ESTRATEGIA,
  GLOSSARIO_PERIODO_NO_MES,
  GLOSSARIO_PERIODO_NO_ANO,
  GLOSSARIO_PERIODO_12_MESES,
  GLOSSARIO_PERIODO_DESDE_INICIO,
} from "@/lib/glossario-financeiro";
import { TakeawayBox, type Conclusao } from "@/components/ui/takeaway-box";
import type { GanhosPorEstrategia } from "@/schemas/report-extraction.schema";

const ICONES_ESTRATEGIA: Record<string, LucideIcon> = {
  "Renda Fixa": Landmark,
  "Ações Brasil": TrendingUp,
  "Fundos Imobiliários": Building2,
  "Ações Global": Globe,
  "Renda Variável": BarChart3,
  Criptomoedas: Bitcoin,
  Outros: Package,
};

type ColunaGanhos =
  | "estrategia"
  | "ganhoNoMes"
  | "ganhoNoAno"
  | "ganho12Meses"
  | "ganhoDesdeInicio";

interface StrategyGainsTableProps {
  ganhos: GanhosPorEstrategia[];
}

function formatarCelulaMoeda(valorEmCentavos: number) {
  const eNegativo = valorEmCentavos < 0;
  return (
    <span className={eNegativo ? "text-destructive" : ""}>{formatarMoeda(valorEmCentavos)}</span>
  );
}

function obterValorColuna(ganho: GanhosPorEstrategia, coluna: ColunaGanhos): string | number {
  switch (coluna) {
    case "estrategia":
      return ganho.nomeEstrategia;
    case "ganhoNoMes":
      return ganho.ganhoNoMes.valorEmCentavos;
    case "ganhoNoAno":
      return ganho.ganhoNoAno.valorEmCentavos;
    case "ganho12Meses":
      return ganho.ganho12Meses.valorEmCentavos;
    case "ganhoDesdeInicio":
      return ganho.ganhoDesdeInicio.valorEmCentavos;
  }
}

interface CabecalhoOrdenaveProps {
  coluna: ColunaGanhos;
  colunaAtiva: ColunaGanhos | null;
  direcao: "asc" | "desc";
  onClick: (coluna: ColunaGanhos) => void;
  className?: string;
  children: React.ReactNode;
}

function CabecalhoOrdenavel({
  coluna,
  colunaAtiva,
  direcao,
  onClick,
  className,
  children,
}: CabecalhoOrdenaveProps) {
  const eAtiva = colunaAtiva === coluna;
  const Icone = eAtiva ? (direcao === "asc" ? ArrowUp : ArrowDown) : ArrowUpDown;

  return (
    <TableHead
      className={`group hover:text-foreground cursor-pointer select-none ${className ?? ""}`}
      onClick={() => onClick(coluna)}
    >
      <div
        className={`flex items-center gap-1 ${className?.includes("text-right") ? "justify-end" : ""}`}
      >
        {children}
        <Icone
          className={`h-3 w-3 ${eAtiva ? "text-foreground" : "text-muted-foreground/50 opacity-0 group-hover:opacity-100"} transition-opacity`}
        />
      </div>
    </TableHead>
  );
}

function gerarConclusaoGanhos(ganhos: GanhosPorEstrategia[]): Conclusao[] {
  if (ganhos.length === 0) return [];

  const ordenadosPorGanhoMensal = [...ganhos].sort(
    (ganhoA, ganhoB) => ganhoB.ganhoNoMes.valorEmCentavos - ganhoA.ganhoNoMes.valorEmCentavos,
  );

  const melhorEstrategia = ordenadosPorGanhoMensal.at(0);
  const piorEstrategia = ordenadosPorGanhoMensal.at(-1);

  if (!melhorEstrategia) return [];

  const conclusoes: Conclusao[] = [];

  conclusoes.push({
    texto: `No mês, ${melhorEstrategia.nomeEstrategia} foi a estratégia que mais rendeu (${formatarMoeda(melhorEstrategia.ganhoNoMes.valorEmCentavos)}).`,
    tipo: "positivo",
  });

  if (piorEstrategia && piorEstrategia.ganhoNoMes.valorEmCentavos < 0) {
    conclusoes.push({
      texto: `${piorEstrategia.nomeEstrategia} teve prejuízo de ${formatarMoeda(Math.abs(piorEstrategia.ganhoNoMes.valorEmCentavos))}.`,
      tipo: "atencao",
    });
  }

  return conclusoes;
}

export function StrategyGainsTable({ ganhos }: StrategyGainsTableProps) {
  const conclusaoGanhos = gerarConclusaoGanhos(ganhos);
  const obterValor = useCallback(
    (ganho: GanhosPorEstrategia, coluna: ColunaGanhos) => obterValorColuna(ganho, coluna),
    [],
  );

  const { itensOrdenados, colunaOrdenacao, direcaoOrdenacao, alternarOrdenacao } =
    useOrdenacaoTabela<GanhosPorEstrategia, ColunaGanhos>(ganhos, obterValor);

  return (
    <Card data-chat-highlight="ganhos-estrategia">
      <CardHeader>
        <CardTitle className="flex items-center gap-1">
          <Wallet className="text-muted-foreground h-5 w-5" aria-hidden="true" />
          Ganhos por Estrategia
          <InfoTooltip conteudo={GLOSSARIO_GANHOS_POR_ESTRATEGIA.explicacao} />
        </CardTitle>
        <CardDescription className="leading-relaxed">
          Quanto cada tipo de investimento rendeu em reais. Valores em vermelho indicam prejuízo no
          período. Clique nos cabeçalhos para ordenar.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <CabecalhoOrdenavel
                  coluna="estrategia"
                  colunaAtiva={colunaOrdenacao}
                  direcao={direcaoOrdenacao}
                  onClick={alternarOrdenacao}
                >
                  Estrategia
                </CabecalhoOrdenavel>
                <CabecalhoOrdenavel
                  coluna="ganhoNoMes"
                  colunaAtiva={colunaOrdenacao}
                  direcao={direcaoOrdenacao}
                  onClick={alternarOrdenacao}
                  className="text-right"
                >
                  <span className="flex items-center gap-1">
                    No Mes
                    <InfoTooltip
                      conteudo={GLOSSARIO_PERIODO_NO_MES.explicacao}
                      tamanhoIcone="h-3 w-3"
                    />
                  </span>
                </CabecalhoOrdenavel>
                <CabecalhoOrdenavel
                  coluna="ganhoNoAno"
                  colunaAtiva={colunaOrdenacao}
                  direcao={direcaoOrdenacao}
                  onClick={alternarOrdenacao}
                  className="text-right"
                >
                  <span className="flex items-center gap-1">
                    No Ano
                    <InfoTooltip
                      conteudo={GLOSSARIO_PERIODO_NO_ANO.explicacao}
                      tamanhoIcone="h-3 w-3"
                    />
                  </span>
                </CabecalhoOrdenavel>
                <CabecalhoOrdenavel
                  coluna="ganho12Meses"
                  colunaAtiva={colunaOrdenacao}
                  direcao={direcaoOrdenacao}
                  onClick={alternarOrdenacao}
                  className="hidden text-right sm:table-cell"
                >
                  <span className="flex items-center gap-1">
                    12 Meses
                    <InfoTooltip
                      conteudo={GLOSSARIO_PERIODO_12_MESES.explicacao}
                      tamanhoIcone="h-3 w-3"
                    />
                  </span>
                </CabecalhoOrdenavel>
                <CabecalhoOrdenavel
                  coluna="ganhoDesdeInicio"
                  colunaAtiva={colunaOrdenacao}
                  direcao={direcaoOrdenacao}
                  onClick={alternarOrdenacao}
                  className="hidden text-right md:table-cell"
                >
                  <span className="flex items-center gap-1">
                    Desde Inicio
                    <InfoTooltip
                      conteudo={GLOSSARIO_PERIODO_DESDE_INICIO.explicacao}
                      tamanhoIcone="h-3 w-3"
                    />
                  </span>
                </CabecalhoOrdenavel>
              </TableRow>
            </TableHeader>
            <TableBody>
              {itensOrdenados.map((ganho) => {
                const IconeEstrategia = ICONES_ESTRATEGIA[ganho.nomeEstrategia];
                return (
                  <TableRow key={ganho.nomeEstrategia}>
                    <TableCell className="font-medium">
                      <span className="flex items-center gap-2">
                        {IconeEstrategia && (
                          <IconeEstrategia className="h-4 w-4" aria-hidden="true" />
                        )}
                        {ganho.nomeEstrategia}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      {formatarCelulaMoeda(ganho.ganhoNoMes.valorEmCentavos)}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatarCelulaMoeda(ganho.ganhoNoAno.valorEmCentavos)}
                    </TableCell>
                    <TableCell className="hidden text-right sm:table-cell">
                      {formatarCelulaMoeda(ganho.ganho12Meses.valorEmCentavos)}
                    </TableCell>
                    <TableCell className="hidden text-right md:table-cell">
                      {formatarCelulaMoeda(ganho.ganhoDesdeInicio.valorEmCentavos)}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
        <TakeawayBox conclusoes={conclusaoGanhos} />
      </CardContent>
    </Card>
  );
}
