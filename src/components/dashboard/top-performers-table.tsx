"use client";

import { useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, ArrowUp, ArrowDown, ArrowUpDown } from "lucide-react";
import { formatarMoeda } from "@/domain/value-objects/money";
import { formatarPercentualSimples } from "@/domain/value-objects/percentage";
import { useOrdenacaoTabela } from "@/hooks/use-ordenacao-tabela";
import type { PosicaoAtivo } from "@/schemas/report-extraction.schema";

type ColunaPerformers = "ativo" | "estrategia" | "saldo" | "rentabilidadeMes" | "participacao";

interface TopPerformersTableProps {
  titulo: string;
  ativos: PosicaoAtivo[];
  tipo: "melhores" | "piores";
}

function obterValorColuna(ativo: PosicaoAtivo, coluna: ColunaPerformers): string | number {
  switch (coluna) {
    case "ativo":
      return ativo.codigoAtivo ?? ativo.nomeAtivo;
    case "estrategia":
      return ativo.estrategia;
    case "saldo":
      return ativo.saldoBruto.valorEmCentavos;
    case "rentabilidadeMes":
      return ativo.rentabilidadeMes.valor;
    case "participacao":
      return ativo.participacaoNaCarteira.valor;
  }
}

interface CabecalhoOrdenaveProps {
  coluna: ColunaPerformers;
  colunaAtiva: ColunaPerformers | null;
  direcao: "asc" | "desc";
  onClick: (coluna: ColunaPerformers) => void;
  className?: string;
  children: React.ReactNode;
}

function CabecalhoOrdenavel({ coluna, colunaAtiva, direcao, onClick, className, children }: CabecalhoOrdenaveProps) {
  const eAtiva = colunaAtiva === coluna;
  const Icone = eAtiva ? (direcao === "asc" ? ArrowUp : ArrowDown) : ArrowUpDown;

  return (
    <TableHead
      className={`group cursor-pointer select-none hover:text-foreground ${className ?? ""}`}
      onClick={() => onClick(coluna)}
    >
      <div className={`flex items-center gap-1 ${className?.includes("text-right") ? "justify-end" : ""}`}>
        {children}
        <Icone className={`h-3 w-3 ${eAtiva ? "text-foreground" : "text-muted-foreground/50 opacity-0 group-hover:opacity-100"} transition-opacity`} />
      </div>
    </TableHead>
  );
}

export function TopPerformersTable({ titulo, ativos, tipo }: TopPerformersTableProps) {
  const Icone = tipo === "melhores" ? TrendingUp : TrendingDown;
  const corIcone = tipo === "melhores" ? "text-green-600" : "text-red-600";

  const obterValor = useCallback(
    (ativo: PosicaoAtivo, coluna: ColunaPerformers) => obterValorColuna(ativo, coluna),
    [],
  );

  const { itensOrdenados, colunaOrdenacao, direcaoOrdenacao, alternarOrdenacao } =
    useOrdenacaoTabela<PosicaoAtivo, ColunaPerformers>(ativos, obterValor);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-2">
        <Icone className={`h-5 w-5 ${corIcone}`} />
        <CardTitle>{titulo}</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <CabecalhoOrdenavel coluna="ativo" colunaAtiva={colunaOrdenacao} direcao={direcaoOrdenacao} onClick={alternarOrdenacao}>
                Ativo
              </CabecalhoOrdenavel>
              <CabecalhoOrdenavel coluna="estrategia" colunaAtiva={colunaOrdenacao} direcao={direcaoOrdenacao} onClick={alternarOrdenacao}>
                Estrategia
              </CabecalhoOrdenavel>
              <CabecalhoOrdenavel coluna="saldo" colunaAtiva={colunaOrdenacao} direcao={direcaoOrdenacao} onClick={alternarOrdenacao} className="text-right">
                Saldo
              </CabecalhoOrdenavel>
              <CabecalhoOrdenavel coluna="rentabilidadeMes" colunaAtiva={colunaOrdenacao} direcao={direcaoOrdenacao} onClick={alternarOrdenacao} className="text-right">
                Rent. Mes
              </CabecalhoOrdenavel>
              <CabecalhoOrdenavel coluna="participacao" colunaAtiva={colunaOrdenacao} direcao={direcaoOrdenacao} onClick={alternarOrdenacao} className="text-right">
                Part.
              </CabecalhoOrdenavel>
            </TableRow>
          </TableHeader>
          <TableBody>
            {itensOrdenados.map((ativo) => (
              <TableRow key={ativo.nomeAtivo}>
                <TableCell className="font-medium">
                  {ativo.codigoAtivo ?? ativo.nomeAtivo}
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="text-xs">{ativo.estrategia}</Badge>
                </TableCell>
                <TableCell className="text-right">
                  {formatarMoeda(ativo.saldoBruto.valorEmCentavos)}
                </TableCell>
                <TableCell className={`text-right font-medium ${ativo.rentabilidadeMes.valor >= 0 ? "text-green-600" : "text-red-600"}`}>
                  {formatarPercentualSimples(ativo.rentabilidadeMes.valor)}
                </TableCell>
                <TableCell className="text-right text-muted-foreground">
                  {formatarPercentualSimples(ativo.participacaoNaCarteira.valor)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
