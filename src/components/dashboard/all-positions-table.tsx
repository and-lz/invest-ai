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
import { ArrowUp, ArrowDown, ArrowUpDown, Briefcase } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { formatarMoeda } from "@/domain/value-objects/money";
import { formatarPercentualSimples } from "@/domain/value-objects/percentage";
import { useOrdenacaoTabela } from "@/hooks/use-ordenacao-tabela";
import { InfoTooltip } from "@/components/ui/info-tooltip";
import {
  GLOSSARIO_TODAS_POSICOES,
  GLOSSARIO_RENTABILIDADE_12M,
  GLOSSARIO_RENTABILIDADE_DESDE_INICIO_ATIVO,
} from "@/lib/glossario-financeiro";
import { TakeawayBox, type Conclusao } from "@/components/ui/takeaway-box";
import type { PosicaoAtivo } from "@/schemas/report-extraction.schema";

type ColunaPosicoes =
  | "ativo"
  | "estrategia"
  | "saldo"
  | "rentabilidadeMes"
  | "rentabilidade12m"
  | "rentabilidadeDesdeInicio"
  | "participacao";

interface AllPositionsTableProps {
  posicoes: PosicaoAtivo[];
}

function obterValorColuna(posicao: PosicaoAtivo, coluna: ColunaPosicoes): string | number {
  switch (coluna) {
    case "ativo":
      return posicao.codigoAtivo ?? posicao.nomeAtivo;
    case "estrategia":
      return posicao.estrategia;
    case "saldo":
      return posicao.saldoBruto.valorEmCentavos;
    case "rentabilidadeMes":
      return posicao.rentabilidadeMes.valor;
    case "rentabilidade12m":
      return posicao.rentabilidade12Meses?.valor ?? -Infinity;
    case "rentabilidadeDesdeInicio":
      return posicao.rentabilidadeDesdeInicio?.valor ?? -Infinity;
    case "participacao":
      return posicao.participacaoNaCarteira.valor;
  }
}

interface CabecalhoOrdenaveProps {
  coluna: ColunaPosicoes;
  colunaAtiva: ColunaPosicoes | null;
  direcao: "asc" | "desc";
  onClick: (coluna: ColunaPosicoes) => void;
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

export function gerarConclusaoTodasPosicoes(posicoes: PosicaoAtivo[]): Conclusao[] {
  const conclusoes: Conclusao[] = [];
  if (posicoes.length === 0) return conclusoes;

  const positivasNoMes = posicoes.filter((posicao) => posicao.rentabilidadeMes.valor > 0);
  const negativasNoMes = posicoes.filter((posicao) => posicao.rentabilidadeMes.valor < 0);

  conclusoes.push({
    texto: `Você tem ${posicoes.length} posições. ${positivasNoMes.length} estão positivas no mês e ${negativasNoMes.length} negativas.`,
    tipo:
      positivasNoMes.length > negativasNoMes.length
        ? "positivo"
        : positivasNoMes.length === negativasNoMes.length
          ? "neutro"
          : "atencao",
  });

  const maisConcentrada = [...posicoes].sort(
    (posicaoA, posicaoB) =>
      posicaoB.participacaoNaCarteira.valor - posicaoA.participacaoNaCarteira.valor,
  )[0];

  if (maisConcentrada && maisConcentrada.participacaoNaCarteira.valor > 10) {
    conclusoes.push({
      texto: `Maior posição: ${maisConcentrada.codigoAtivo ?? maisConcentrada.nomeAtivo} com ${formatarPercentualSimples(maisConcentrada.participacaoNaCarteira.valor)} da carteira.`,
      tipo: maisConcentrada.participacaoNaCarteira.valor > 25 ? "atencao" : "neutro",
    });
  }

  return conclusoes;
}

export function AllPositionsTable({ posicoes }: AllPositionsTableProps) {
  const obterValor = useCallback(
    (posicao: PosicaoAtivo, coluna: ColunaPosicoes) => obterValorColuna(posicao, coluna),
    [],
  );

  const { itensOrdenados, colunaOrdenacao, direcaoOrdenacao, alternarOrdenacao } =
    useOrdenacaoTabela<PosicaoAtivo, ColunaPosicoes>(posicoes, obterValor);

  const conclusoes = gerarConclusaoTodasPosicoes(posicoes);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-1">
          <Briefcase className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
          Todas as Posições
          <InfoTooltip conteudo={GLOSSARIO_TODAS_POSICOES.explicacao} />
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
                    className="text-right"
                  >
                    <span className="flex items-center gap-1">
                      12M
                      <InfoTooltip
                        conteudo={GLOSSARIO_RENTABILIDADE_12M.explicacao}
                        tamanhoIcone="h-3 w-3"
                      />
                    </span>
                  </CabecalhoOrdenavel>
                  <CabecalhoOrdenavel
                    coluna="rentabilidadeDesdeInicio"
                    colunaAtiva={colunaOrdenacao}
                    direcao={direcaoOrdenacao}
                    onClick={alternarOrdenacao}
                    className="text-right"
                  >
                    <span className="flex items-center gap-1">
                      Início
                      <InfoTooltip
                        conteudo={GLOSSARIO_RENTABILIDADE_DESDE_INICIO_ATIVO.explicacao}
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
                      {posicao.codigoAtivo ?? posicao.nomeAtivo}
                    </TableCell>
                    <TableCell>
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
                      {formatarPercentualSimples(posicao.rentabilidadeMes.valor)}
                    </TableCell>
                    <TableCell
                      className={cn(
                        "text-right tabular-nums",
                        posicao.rentabilidade12Meses &&
                          posicao.rentabilidade12Meses.valor > 0 &&
                          "text-success",
                        posicao.rentabilidade12Meses &&
                          posicao.rentabilidade12Meses.valor < 0 &&
                          "text-destructive",
                      )}
                    >
                      {posicao.rentabilidade12Meses
                        ? formatarPercentualSimples(posicao.rentabilidade12Meses.valor)
                        : "—"}
                    </TableCell>
                    <TableCell
                      className={cn(
                        "text-right tabular-nums",
                        posicao.rentabilidadeDesdeInicio &&
                          posicao.rentabilidadeDesdeInicio.valor > 0 &&
                          "text-success",
                        posicao.rentabilidadeDesdeInicio &&
                          posicao.rentabilidadeDesdeInicio.valor < 0 &&
                          "text-destructive",
                      )}
                    >
                      {posicao.rentabilidadeDesdeInicio
                        ? formatarPercentualSimples(posicao.rentabilidadeDesdeInicio.valor)
                        : "—"}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-right tabular-nums">
                      {formatarPercentualSimples(posicao.participacaoNaCarteira.valor)}
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
