"use client";

import { useCallback } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrendingUp, TrendingDown, BarChart3, ArrowUp, ArrowDown, ArrowUpDown } from "lucide-react";
import { TakeawayBox } from "@/components/ui/takeaway-box";
import type { Conclusao } from "@/components/ui/takeaway-box";
import { useTableSorting } from "@/hooks/use-table-sorting";
import { cn } from "@/lib/utils";
import { valueColor } from "@/lib/design-system";
import type { AtivoRanking } from "@/schemas/trends.schema";

type ColunaRanking = "ticker" | "nome" | "preco" | "variacao" | "volume";

interface TabelaRankingAtivosProps {
  maioresAltas: AtivoRanking[];
  maioresBaixas: AtivoRanking[];
  maisNegociados: AtivoRanking[];
}

function formatarVariacao(variacao: number): string {
  const sinal = variacao >= 0 ? "+" : "";
  return `${sinal}${variacao.toFixed(2)}%`;
}

function formatarVolume(volume: number): string {
  if (volume >= 1_000_000_000) {
    return `${(volume / 1_000_000_000).toFixed(1)}B`;
  }
  if (volume >= 1_000_000) {
    return `${(volume / 1_000_000).toFixed(1)}M`;
  }
  if (volume >= 1_000) {
    return `${(volume / 1_000).toFixed(1)}K`;
  }
  return String(volume);
}

function formatarPreco(preco: number): string {
  return preco.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function obterValorColunaRanking(ativo: AtivoRanking, coluna: ColunaRanking): string | number {
  switch (coluna) {
    case "ticker":
      return ativo.ticker;
    case "nome":
      return ativo.nome;
    case "preco":
      return ativo.preco;
    case "variacao":
      return ativo.variacao;
    case "volume":
      return ativo.volume;
  }
}

interface CabecalhoOrderavelRankingProps {
  coluna: ColunaRanking;
  colunaAtiva: ColunaRanking | null;
  direcao: "asc" | "desc";
  onClick: (coluna: ColunaRanking) => void;
  className?: string;
  children: React.ReactNode;
}

function CabecalhoOrderavelRanking({
  coluna,
  colunaAtiva,
  direcao,
  onClick,
  className,
  children,
}: CabecalhoOrderavelRankingProps) {
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

function TabelaAtivos({
  ativos,
  mostrarVolume,
}: {
  ativos: AtivoRanking[];
  mostrarVolume?: boolean;
}) {
  const obterValor = useCallback(
    (ativo: AtivoRanking, coluna: ColunaRanking) => obterValorColunaRanking(ativo, coluna),
    [],
  );

  const { itensOrdenados, colunaOrdenacao, direcaoOrdenacao, alternarOrdenacao } =
    useTableSorting<AtivoRanking, ColunaRanking>(ativos, obterValor);

  if (ativos.length === 0) {
    return <p className="text-muted-foreground py-8 text-center text-sm">Nenhum dado disponível</p>;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <CabecalhoOrderavelRanking
            coluna="ticker"
            colunaAtiva={colunaOrdenacao}
            direcao={direcaoOrdenacao}
            onClick={alternarOrdenacao}
          >
            Ticker
          </CabecalhoOrderavelRanking>
          <CabecalhoOrderavelRanking
            coluna="nome"
            colunaAtiva={colunaOrdenacao}
            direcao={direcaoOrdenacao}
            onClick={alternarOrdenacao}
          >
            Nome
          </CabecalhoOrderavelRanking>
          <CabecalhoOrderavelRanking
            coluna="preco"
            colunaAtiva={colunaOrdenacao}
            direcao={direcaoOrdenacao}
            onClick={alternarOrdenacao}
            className="text-right"
          >
            Preço
          </CabecalhoOrderavelRanking>
          <CabecalhoOrderavelRanking
            coluna="variacao"
            colunaAtiva={colunaOrdenacao}
            direcao={direcaoOrdenacao}
            onClick={alternarOrdenacao}
            className="text-right"
          >
            Variação
          </CabecalhoOrderavelRanking>
          {mostrarVolume && (
            <CabecalhoOrderavelRanking
              coluna="volume"
              colunaAtiva={colunaOrdenacao}
              direcao={direcaoOrdenacao}
              onClick={alternarOrdenacao}
              className="text-right"
            >
              Volume
            </CabecalhoOrderavelRanking>
          )}
        </TableRow>
      </TableHeader>
      <TableBody>
        {itensOrdenados.map((ativo) => (
          <TableRow key={ativo.ticker}>
            <TableCell className="font-mono text-sm font-medium">
              <Link
                href={`/desempenho?ticker=${encodeURIComponent(ativo.ticker)}`}
                className="hover:text-primary underline-offset-4 hover:underline"
              >
                {ativo.ticker}
              </Link>
            </TableCell>
            <TableCell className="text-muted-foreground max-w-[200px] truncate text-sm">
              {ativo.nome}
            </TableCell>
            <TableCell className="text-right text-sm">{formatarPreco(ativo.preco)}</TableCell>
            <TableCell
              className={cn(
                "text-right text-sm font-medium",
                valueColor(ativo.variacao),
              )}
            >
              {formatarVariacao(ativo.variacao)}
            </TableCell>
            {mostrarVolume && (
              <TableCell className="text-muted-foreground text-right text-sm">
                {formatarVolume(ativo.volume)}
              </TableCell>
            )}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

function gerarConclusoesRanking(
  maioresAltas: AtivoRanking[],
  maioresBaixas: AtivoRanking[],
): Conclusao[] {
  const conclusoes: Conclusao[] = [];

  const melhorAtivo = maioresAltas[0];
  if (melhorAtivo) {
    conclusoes.push({
      texto: `${melhorAtivo.ticker} lidera as altas com ${formatarVariacao(melhorAtivo.variacao)}${melhorAtivo.setor ? ` (setor: ${melhorAtivo.setor})` : ""}.`,
      tipo: "positivo",
    });
  }

  const piorAtivo = maioresBaixas[0];
  if (piorAtivo) {
    conclusoes.push({
      texto: `${piorAtivo.ticker} tem a maior queda: ${formatarVariacao(piorAtivo.variacao)}.`,
      tipo: "atencao",
    });
  }

  return conclusoes;
}

export function TabelaRankingAtivos({
  maioresAltas,
  maioresBaixas,
  maisNegociados,
}: TabelaRankingAtivosProps) {
  const conclusoes = gerarConclusoesRanking(maioresAltas, maioresBaixas);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="text-muted-foreground h-5 w-5" aria-hidden="true" />
          Ranking de Ações
        </CardTitle>
        <CardDescription>Ações da B3 ordenadas por variação e volume de negociação</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="altas">
          <TabsList className="mb-4">
            <TabsTrigger value="altas" className="gap-1.5">
              <TrendingUp className="h-3.5 w-3.5" />
              Maiores Altas
            </TabsTrigger>
            <TabsTrigger value="baixas" className="gap-1.5">
              <TrendingDown className="h-3.5 w-3.5" />
              Maiores Baixas
            </TabsTrigger>
            <TabsTrigger value="volume" className="gap-1.5">
              <BarChart3 className="h-3.5 w-3.5" />
              Mais Negociadas
            </TabsTrigger>
          </TabsList>

          <TabsContent value="altas">
            <TabelaAtivos ativos={maioresAltas} />
          </TabsContent>

          <TabsContent value="baixas">
            <TabelaAtivos ativos={maioresBaixas} />
          </TabsContent>

          <TabsContent value="volume">
            <TabelaAtivos ativos={maisNegociados} mostrarVolume />
          </TabsContent>
        </Tabs>

        <TakeawayBox conclusoes={conclusoes} />
      </CardContent>
    </Card>
  );
}
