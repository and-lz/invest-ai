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
import { Building2 } from "lucide-react";
import { InfoTooltip } from "@/components/ui/info-tooltip";
import { GLOSSARIO_FUNDOS_EM_ALTA } from "@/lib/glossario-financeiro";
import { cn } from "@/lib/utils";
import type { AtivoRanking } from "@/schemas/trends.schema";

interface TabelaRankingFundosProps {
  fundosEmAlta: AtivoRanking[];
}

function formatarVariacao(variacao: number): string {
  const sinal = variacao >= 0 ? "+" : "";
  return `${sinal}${variacao.toFixed(2)}%`;
}

function formatarPreco(preco: number): string {
  return preco.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function formatarVolume(volume: number): string {
  if (volume >= 1_000_000) {
    return `${(volume / 1_000_000).toFixed(1)}M`;
  }
  if (volume >= 1_000) {
    return `${(volume / 1_000).toFixed(1)}K`;
  }
  return String(volume);
}

export function TabelaRankingFundos({ fundosEmAlta }: TabelaRankingFundosProps) {
  if (fundosEmAlta.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
          Fundos em Alta
          <InfoTooltip conteudo={GLOSSARIO_FUNDOS_EM_ALTA.explicacao} />
        </CardTitle>
        <CardDescription>
          Fundos imobiliarios e ETFs com maiores valorizacoes
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">Ticker</TableHead>
              <TableHead>Nome</TableHead>
              <TableHead className="text-right">Preco</TableHead>
              <TableHead className="text-right">Variacao</TableHead>
              <TableHead className="text-right">Volume</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {fundosEmAlta.map((fundo) => (
              <TableRow key={fundo.ticker}>
                <TableCell className="font-mono text-sm font-medium">
                  {fundo.ticker}
                </TableCell>
                <TableCell className="max-w-[200px] truncate text-sm text-muted-foreground">
                  {fundo.nome}
                </TableCell>
                <TableCell className="text-right text-sm">
                  {formatarPreco(fundo.preco)}
                </TableCell>
                <TableCell
                  className={cn(
                    "text-right text-sm font-medium",
                    fundo.variacao >= 0 ? "text-success" : "text-destructive",
                  )}
                >
                  {formatarVariacao(fundo.variacao)}
                </TableCell>
                <TableCell className="text-right text-sm text-muted-foreground">
                  {formatarVolume(fundo.volume)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
