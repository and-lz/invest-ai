"use client";

import { useCallback } from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Briefcase } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { formatarMoeda } from "@/domain/value-objects/money";
import { formatSimplePercentage } from "@/domain/value-objects/percentage";
import { useTableSorting } from "@/hooks/use-table-sorting";
import { InfoTooltip } from "@/components/ui/info-tooltip";
import {
  GLOSSARY_TODAS_POSICOES,
  GLOSSARY_RENTABILIDADE_12M,
  GLOSSARY_RENTABILIDADE_DESDE_INICIO_ATIVO,
} from "@/lib/financial-glossary";
import { TakeawayBox } from "@/components/ui/takeaway-box";
import type { PosicaoAtivo } from "@/schemas/report-extraction.schema";
import { obterValorColuna, gerarConclusaoTodasPosicoes, type ColunaPosicoes } from "./all-positions-utils";
import { CabecalhoOrdenavel } from "./all-positions-sortable-header";

// Re-export for external consumers
export { gerarConclusaoTodasPosicoes } from "./all-positions-utils";

interface AllPositionsTableProps {
  posicoes: PosicaoAtivo[];
}

export function AllPositionsTable({ posicoes }: AllPositionsTableProps) {
  const obterValor = useCallback(
    (posicao: PosicaoAtivo, coluna: ColunaPosicoes) => obterValorColuna(posicao, coluna),
    [],
  );

  const { itensOrdenados, colunaOrdenacao, direcaoOrdenacao, alternarOrdenacao } =
    useTableSorting<PosicaoAtivo, ColunaPosicoes>(posicoes, obterValor);

  const conclusoes = gerarConclusaoTodasPosicoes(posicoes);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-1">
          <Briefcase className="text-muted-foreground h-5 w-5" aria-hidden="true" />
          Todas as Posições
          <InfoTooltip conteudo={GLOSSARY_TODAS_POSICOES.explicacao} />
        </CardTitle>
        {posicoes.length > 0 && (
          <CardDescription>{posicoes.length} investimentos na carteira</CardDescription>
        )}
      </CardHeader>
      <CardContent>
        {posicoes.length === 0 ? (
          <p className="text-muted-foreground text-sm">Nenhuma posição encontrada.</p>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <CabecalhoOrdenavel
                    coluna="ativo"
                    colunaAtiva={colunaOrdenacao}
                    direcao={direcaoOrdenacao}
                    onClick={alternarOrdenacao}
                  >
                    Ativo
                  </CabecalhoOrdenavel>
                  <CabecalhoOrdenavel
                    coluna="estrategia"
                    colunaAtiva={colunaOrdenacao}
                    direcao={direcaoOrdenacao}
                    onClick={alternarOrdenacao}
                    className="hidden sm:table-cell"
                  >
                    Estratégia
                  </CabecalhoOrdenavel>
                  <CabecalhoOrdenavel
                    coluna="saldo"
                    colunaAtiva={colunaOrdenacao}
                    direcao={direcaoOrdenacao}
                    onClick={alternarOrdenacao}
                    className="text-right"
                  >
                    Saldo
                  </CabecalhoOrdenavel>
                  <CabecalhoOrdenavel
                    coluna="rentabilidadeMes"
                    colunaAtiva={colunaOrdenacao}
                    direcao={direcaoOrdenacao}
                    onClick={alternarOrdenacao}
                    className="text-right"
                  >
                    Mês
                  </CabecalhoOrdenavel>
                  <CabecalhoOrdenavel
                    coluna="rentabilidade12m"
                    colunaAtiva={colunaOrdenacao}
                    direcao={direcaoOrdenacao}
                    onClick={alternarOrdenacao}
                    className="hidden text-right sm:table-cell"
                  >
                    <span className="flex items-center gap-1">
                      12M
                      <InfoTooltip
                        conteudo={GLOSSARY_RENTABILIDADE_12M.explicacao}
                        tamanhoIcone="h-3 w-3"
                      />
                    </span>
                  </CabecalhoOrdenavel>
                  <CabecalhoOrdenavel
                    coluna="rentabilidadeDesdeInicio"
                    colunaAtiva={colunaOrdenacao}
                    direcao={direcaoOrdenacao}
                    onClick={alternarOrdenacao}
                    className="hidden text-right md:table-cell"
                  >
                    <span className="flex items-center gap-1">
                      Início
                      <InfoTooltip
                        conteudo={GLOSSARY_RENTABILIDADE_DESDE_INICIO_ATIVO.explicacao}
                        tamanhoIcone="h-3 w-3"
                      />
                    </span>
                  </CabecalhoOrdenavel>
                  <CabecalhoOrdenavel
                    coluna="participacao"
                    colunaAtiva={colunaOrdenacao}
                    direcao={direcaoOrdenacao}
                    onClick={alternarOrdenacao}
                    className="text-right"
                  >
                    Part.
                  </CabecalhoOrdenavel>
                </TableRow>
              </TableHeader>
              <TableBody>
                {itensOrdenados.map((posicao, indice) => (
                  <TableRow key={`${posicao.codigoAtivo ?? posicao.nomeAtivo}-${indice}`}>
                    <TableCell className="max-w-48 truncate font-medium">
                      <Link
                        href={`/desempenho?ticker=${encodeURIComponent(posicao.codigoAtivo ?? posicao.nomeAtivo)}`}
                        className="hover:text-primary underline-offset-4 hover:underline"
                      >
                        {posicao.codigoAtivo ?? posicao.nomeAtivo}
                      </Link>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <Badge variant="outline" className="text-xs">
                        {posicao.estrategia}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-medium tabular-nums">
                      {formatarMoeda(posicao.saldoBruto.valorEmCentavos)}
                    </TableCell>
                    <TableCell
                      className={cn(
                        "text-right tabular-nums",
                        posicao.rentabilidadeMes.valor > 0 && "text-success",
                        posicao.rentabilidadeMes.valor < 0 && "text-destructive",
                      )}
                    >
                      {formatSimplePercentage(posicao.rentabilidadeMes.valor)}
                    </TableCell>
                    <TableCell
                      className={cn(
                        "hidden text-right tabular-nums sm:table-cell",
                        posicao.rentabilidade12Meses &&
                          posicao.rentabilidade12Meses.valor > 0 &&
                          "text-success",
                        posicao.rentabilidade12Meses &&
                          posicao.rentabilidade12Meses.valor < 0 &&
                          "text-destructive",
                      )}
                    >
                      {posicao.rentabilidade12Meses
                        ? formatSimplePercentage(posicao.rentabilidade12Meses.valor)
                        : "—"}
                    </TableCell>
                    <TableCell
                      className={cn(
                        "hidden text-right tabular-nums md:table-cell",
                        posicao.rentabilidadeDesdeInicio &&
                          posicao.rentabilidadeDesdeInicio.valor > 0 &&
                          "text-success",
                        posicao.rentabilidadeDesdeInicio &&
                          posicao.rentabilidadeDesdeInicio.valor < 0 &&
                          "text-destructive",
                      )}
                    >
                      {posicao.rentabilidadeDesdeInicio
                        ? formatSimplePercentage(posicao.rentabilidadeDesdeInicio.valor)
                        : "—"}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-right tabular-nums">
                      {formatSimplePercentage(posicao.participacaoNaCarteira.valor)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
        <TakeawayBox conclusoes={conclusoes} />
      </CardContent>
    </Card>
  );
}
