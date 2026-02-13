"use client";

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
import { TrendingUp, TrendingDown, BarChart3 } from "lucide-react";
import { TakeawayBox } from "@/components/ui/takeaway-box";
import type { Conclusao } from "@/components/ui/takeaway-box";
import { cn } from "@/lib/utils";
import type { AtivoRanking } from "@/schemas/trends.schema";

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

function TabelaAtivos({
  ativos,
  mostrarVolume,
}: {
  ativos: AtivoRanking[];
  mostrarVolume?: boolean;
}) {
  if (ativos.length === 0) {
    return (
      <p className="text-muted-foreground py-8 text-center text-sm">
        Nenhum dado disponivel
      </p>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[80px]">Ticker</TableHead>
          <TableHead>Nome</TableHead>
          <TableHead className="text-right">Preco</TableHead>
          <TableHead className="text-right">Variacao</TableHead>
          {mostrarVolume && (
            <TableHead className="text-right">Volume</TableHead>
          )}
        </TableRow>
      </TableHeader>
      <TableBody>
        {ativos.map((ativo) => (
          <TableRow key={ativo.ticker}>
            <TableCell className="font-mono text-sm font-medium">
              {ativo.ticker}
            </TableCell>
            <TableCell className="max-w-[200px] truncate text-sm text-muted-foreground">
              {ativo.nome}
            </TableCell>
            <TableCell className="text-right text-sm">
              {formatarPreco(ativo.preco)}
            </TableCell>
            <TableCell
              className={cn(
                "text-right text-sm font-medium",
                ativo.variacao >= 0 ? "text-success" : "text-destructive",
              )}
            >
              {formatarVariacao(ativo.variacao)}
            </TableCell>
            {mostrarVolume && (
              <TableCell className="text-right text-sm text-muted-foreground">
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
          <BarChart3 className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
          Ranking de Acoes
        </CardTitle>
        <CardDescription>
          Acoes da B3 ordenadas por variacao e volume de negociacao
        </CardDescription>
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
