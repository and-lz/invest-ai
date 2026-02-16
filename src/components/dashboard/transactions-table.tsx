"use client";

import { useCallback } from "react";
import { Link } from "next-view-transitions";
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
  ArrowRightLeft,
  ArrowUpRight,
  ArrowDownRight,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatarMoeda } from "@/domain/value-objects/money";
import { formatarDataBrasileira } from "@/lib/format-date";
import { useOrdenacaoTabela } from "@/hooks/use-ordenacao-tabela";
import { InfoTooltip } from "@/components/ui/info-tooltip";
import { GLOSSARIO_MOVIMENTACOES } from "@/lib/glossario-financeiro";
import { TakeawayBox, type Conclusao } from "@/components/ui/takeaway-box";
import type { Movimentacao } from "@/schemas/report-extraction.schema";

const ICONES_TIPO_MOVIMENTACAO: Record<string, LucideIcon> = {
  Aplicacao: ArrowUpRight,
  Resgate: ArrowDownRight,
};

type ColunaMovimentacoes = "data" | "tipo" | "ativo" | "valor";

const TIPOS_ENTRADA = new Set(["Aplicacao"]);
const TIPOS_SAIDA = new Set(["Resgate"]);

interface TransactionsTableProps {
  movimentacoes: Movimentacao[];
}

function obterValorColuna(
  movimentacao: Movimentacao,
  coluna: ColunaMovimentacoes,
): string | number {
  switch (coluna) {
    case "data":
      return movimentacao.data;
    case "tipo":
      return movimentacao.tipoMovimentacao;
    case "ativo":
      return movimentacao.codigoAtivo ?? movimentacao.nomeAtivo;
    case "valor":
      return movimentacao.valor.valorEmCentavos;
  }
}

interface CabecalhoOrdenaveProps {
  coluna: ColunaMovimentacoes;
  colunaAtiva: ColunaMovimentacoes | null;
  direcao: "asc" | "desc";
  onClick: (coluna: ColunaMovimentacoes) => void;
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

export function gerarConclusaoMovimentacoes(movimentacoes: Movimentacao[]): Conclusao[] {
  const conclusoes: Conclusao[] = [];
  if (movimentacoes.length === 0) return conclusoes;

  const totalAplicadoCentavos = movimentacoes
    .filter((movimentacao) => TIPOS_ENTRADA.has(movimentacao.tipoMovimentacao))
    .reduce((acumulador, movimentacao) => acumulador + movimentacao.valor.valorEmCentavos, 0);

  const totalResgatadoCentavos = movimentacoes
    .filter((movimentacao) => TIPOS_SAIDA.has(movimentacao.tipoMovimentacao))
    .reduce((acumulador, movimentacao) => acumulador + movimentacao.valor.valorEmCentavos, 0);

  const fluxoLiquidoCentavos = totalAplicadoCentavos - totalResgatadoCentavos;

  conclusoes.push({
    texto: `Este mês: ${formatarMoeda(totalAplicadoCentavos)} aplicados, ${formatarMoeda(totalResgatadoCentavos)} resgatados. Fluxo líquido: ${formatarMoeda(fluxoLiquidoCentavos)}.`,
    tipo: fluxoLiquidoCentavos > 0 ? "positivo" : fluxoLiquidoCentavos === 0 ? "neutro" : "atencao",
  });

  return conclusoes;
}

export function TransactionsTable({ movimentacoes }: TransactionsTableProps) {
  const obterValor = useCallback(
    (movimentacao: Movimentacao, coluna: ColunaMovimentacoes) =>
      obterValorColuna(movimentacao, coluna),
    [],
  );

  const { itensOrdenados, colunaOrdenacao, direcaoOrdenacao, alternarOrdenacao } =
    useOrdenacaoTabela<Movimentacao, ColunaMovimentacoes>(movimentacoes, obterValor);

  const conclusoes = gerarConclusaoMovimentacoes(movimentacoes);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-1">
          <ArrowRightLeft className="text-muted-foreground h-5 w-5" aria-hidden="true" />
          Movimentações
          <InfoTooltip conteudo={GLOSSARIO_MOVIMENTACOES.explicacao} />
        </CardTitle>
        {movimentacoes.length > 0 && (
          <CardDescription>{movimentacoes.length} movimentações no mês</CardDescription>
        )}
      </CardHeader>
      <CardContent>
        {movimentacoes.length === 0 ? (
          <p className="text-muted-foreground text-sm">Nenhuma movimentação neste mês.</p>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <CabecalhoOrdenavel
                    coluna="data"
                    colunaAtiva={colunaOrdenacao}
                    direcao={direcaoOrdenacao}
                    onClick={alternarOrdenacao}
                  >
                    Data
                  </CabecalhoOrdenavel>
                  <CabecalhoOrdenavel
                    coluna="tipo"
                    colunaAtiva={colunaOrdenacao}
                    direcao={direcaoOrdenacao}
                    onClick={alternarOrdenacao}
                  >
                    Tipo
                  </CabecalhoOrdenavel>
                  <CabecalhoOrdenavel
                    coluna="ativo"
                    colunaAtiva={colunaOrdenacao}
                    direcao={direcaoOrdenacao}
                    onClick={alternarOrdenacao}
                  >
                    Ativo
                  </CabecalhoOrdenavel>
                  <CabecalhoOrdenavel
                    coluna="valor"
                    colunaAtiva={colunaOrdenacao}
                    direcao={direcaoOrdenacao}
                    onClick={alternarOrdenacao}
                    className="text-right"
                  >
                    Valor
                  </CabecalhoOrdenavel>
                </TableRow>
              </TableHeader>
              <TableBody>
                {itensOrdenados.map((movimentacao, indice) => {
                  const eEntrada = TIPOS_ENTRADA.has(movimentacao.tipoMovimentacao);
                  const eSaida = TIPOS_SAIDA.has(movimentacao.tipoMovimentacao);

                  return (
                    <TableRow key={`${movimentacao.data}-${movimentacao.nomeAtivo}-${indice}`}>
                      <TableCell className="text-muted-foreground">
                        {formatarDataBrasileira(movimentacao.data)}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        <span className="flex items-center gap-1">
                          {(() => {
                            const IconeMovimentacao =
                              ICONES_TIPO_MOVIMENTACAO[movimentacao.tipoMovimentacao];
                            if (IconeMovimentacao) {
                              return (
                                <IconeMovimentacao className="h-3.5 w-3.5" aria-hidden="true" />
                              );
                            }
                            return null;
                          })()}
                          {movimentacao.tipoMovimentacao}
                        </span>
                      </TableCell>
                      <TableCell className="max-w-48 truncate font-medium">
                        <Link
                          href={`/desempenho?ticker=${encodeURIComponent(movimentacao.codigoAtivo ?? movimentacao.nomeAtivo)}`}
                          className="hover:text-primary underline-offset-4 hover:underline"
                        >
                          {movimentacao.codigoAtivo ?? movimentacao.nomeAtivo}
                        </Link>
                      </TableCell>
                      <TableCell
                        className={cn(
                          "text-right font-medium tabular-nums",
                          eEntrada && "text-success",
                          eSaida && "text-destructive",
                        )}
                      >
                        {eSaida ? "- " : ""}
                        {formatarMoeda(movimentacao.valor.valorEmCentavos)}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
        <TakeawayBox conclusoes={conclusoes} />
      </CardContent>
    </Card>
  );
}
