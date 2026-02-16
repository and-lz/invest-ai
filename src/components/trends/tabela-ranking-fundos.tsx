"use client";

import { useCallback } from "react";
import { Link } from "next-view-transitions";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Building2, ArrowUp, ArrowDown, ArrowUpDown } from "lucide-react";
import { InfoTooltip } from "@/components/ui/info-tooltip";
import { GLOSSARIO_FUNDOS_EM_ALTA } from "@/lib/glossario-financeiro";
import { useOrdenacaoTabela } from "@/hooks/use-ordenacao-tabela";
import { cn } from "@/lib/utils";
import type { AtivoRanking } from "@/schemas/trends.schema";

type ColunaFundos = "ticker" | "nome" | "preco" | "variacao" | "volume";

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

function obterValorColunaFundos(fundo: AtivoRanking, coluna: ColunaFundos): string | number {
  switch (coluna) {
    case "ticker":
      return fundo.ticker;
    case "nome":
      return fundo.nome;
    case "preco":
      return fundo.preco;
    case "variacao":
      return fundo.variacao;
    case "volume":
      return fundo.volume;
  }
}

interface CabecalhoOrderavelFundosProps {
  coluna: ColunaFundos;
  colunaAtiva: ColunaFundos | null;
  direcao: "asc" | "desc";
  onClick: (coluna: ColunaFundos) => void;
  className?: string;
  children: React.ReactNode;
}

function CabecalhoOrderavelFundos({
  coluna,
  colunaAtiva,
  direcao,
  onClick,
  className,
  children,
}: CabecalhoOrderavelFundosProps) {
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

export function TabelaRankingFundos({ fundosEmAlta }: TabelaRankingFundosProps) {
  const obterValor = useCallback(
    (fundo: AtivoRanking, coluna: ColunaFundos) => obterValorColunaFundos(fundo, coluna),
    [],
  );

  const { itensOrdenados, colunaOrdenacao, direcaoOrdenacao, alternarOrdenacao } =
    useOrdenacaoTabela<AtivoRanking, ColunaFundos>(fundosEmAlta, obterValor);

  if (fundosEmAlta.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="text-muted-foreground h-5 w-5" aria-hidden="true" />
          Fundos em Alta
          <InfoTooltip conteudo={GLOSSARIO_FUNDOS_EM_ALTA.explicacao} />
        </CardTitle>
        <CardDescription>Fundos imobiliários e ETFs com maiores valorizações</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <CabecalhoOrderavelFundos
                coluna="ticker"
                colunaAtiva={colunaOrdenacao}
                direcao={direcaoOrdenacao}
                onClick={alternarOrdenacao}
              >
                Ticker
              </CabecalhoOrderavelFundos>
              <CabecalhoOrderavelFundos
                coluna="nome"
                colunaAtiva={colunaOrdenacao}
                direcao={direcaoOrdenacao}
                onClick={alternarOrdenacao}
              >
                Nome
              </CabecalhoOrderavelFundos>
              <CabecalhoOrderavelFundos
                coluna="preco"
                colunaAtiva={colunaOrdenacao}
                direcao={direcaoOrdenacao}
                onClick={alternarOrdenacao}
                className="text-right"
              >
                Preço
              </CabecalhoOrderavelFundos>
              <CabecalhoOrderavelFundos
                coluna="variacao"
                colunaAtiva={colunaOrdenacao}
                direcao={direcaoOrdenacao}
                onClick={alternarOrdenacao}
                className="text-right"
              >
                Variação
              </CabecalhoOrderavelFundos>
              <CabecalhoOrderavelFundos
                coluna="volume"
                colunaAtiva={colunaOrdenacao}
                direcao={direcaoOrdenacao}
                onClick={alternarOrdenacao}
                className="text-right"
              >
                Volume
              </CabecalhoOrderavelFundos>
            </TableRow>
          </TableHeader>
          <TableBody>
            {itensOrdenados.map((fundo) => (
              <TableRow key={fundo.ticker}>
                <TableCell className="font-mono text-sm font-medium">
                  <Link
                    href={`/desempenho?ticker=${encodeURIComponent(fundo.ticker)}`}
                    className="hover:text-primary underline-offset-4 hover:underline"
                  >
                    {fundo.ticker}
                  </Link>
                </TableCell>
                <TableCell className="text-muted-foreground max-w-[200px] truncate text-sm">
                  {fundo.nome}
                </TableCell>
                <TableCell className="text-right text-sm">{formatarPreco(fundo.preco)}</TableCell>
                <TableCell
                  className={cn(
                    "text-right text-sm font-medium",
                    fundo.variacao >= 0 ? "text-success" : "text-destructive",
                  )}
                >
                  {formatarVariacao(fundo.variacao)}
                </TableCell>
                <TableCell className="text-muted-foreground text-right text-sm">
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
