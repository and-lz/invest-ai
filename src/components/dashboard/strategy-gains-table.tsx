"use client";

import { useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowUp, ArrowDown, ArrowUpDown } from "lucide-react";
import { formatarMoeda } from "@/domain/value-objects/money";
import { useOrdenacaoTabela } from "@/hooks/use-ordenacao-tabela";
import type { GanhosPorEstrategia } from "@/schemas/report-extraction.schema";

type ColunaGanhos = "estrategia" | "ganhoNoMes" | "ganhoNoAno" | "ganho12Meses" | "ganhoDesdeInicio";

interface StrategyGainsTableProps {
  ganhos: GanhosPorEstrategia[];
}

function formatarCelulaMoeda(valorEmCentavos: number) {
  const eNegativo = valorEmCentavos < 0;
  return (
    <span className={eNegativo ? "text-red-600" : ""}>
      {formatarMoeda(valorEmCentavos)}
    </span>
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

export function StrategyGainsTable({ ganhos }: StrategyGainsTableProps) {
  const obterValor = useCallback(
    (ganho: GanhosPorEstrategia, coluna: ColunaGanhos) => obterValorColuna(ganho, coluna),
    [],
  );

  const { itensOrdenados, colunaOrdenacao, direcaoOrdenacao, alternarOrdenacao } =
    useOrdenacaoTabela<GanhosPorEstrategia, ColunaGanhos>(ganhos, obterValor);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ganhos por Estrategia</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <CabecalhoOrdenavel coluna="estrategia" colunaAtiva={colunaOrdenacao} direcao={direcaoOrdenacao} onClick={alternarOrdenacao}>
                Estrategia
              </CabecalhoOrdenavel>
              <CabecalhoOrdenavel coluna="ganhoNoMes" colunaAtiva={colunaOrdenacao} direcao={direcaoOrdenacao} onClick={alternarOrdenacao} className="text-right">
                No Mes
              </CabecalhoOrdenavel>
              <CabecalhoOrdenavel coluna="ganhoNoAno" colunaAtiva={colunaOrdenacao} direcao={direcaoOrdenacao} onClick={alternarOrdenacao} className="text-right">
                No Ano
              </CabecalhoOrdenavel>
              <CabecalhoOrdenavel coluna="ganho12Meses" colunaAtiva={colunaOrdenacao} direcao={direcaoOrdenacao} onClick={alternarOrdenacao} className="text-right">
                12 Meses
              </CabecalhoOrdenavel>
              <CabecalhoOrdenavel coluna="ganhoDesdeInicio" colunaAtiva={colunaOrdenacao} direcao={direcaoOrdenacao} onClick={alternarOrdenacao} className="text-right">
                Desde Inicio
              </CabecalhoOrdenavel>
            </TableRow>
          </TableHeader>
          <TableBody>
            {itensOrdenados.map((ganho) => (
              <TableRow key={ganho.nomeEstrategia}>
                <TableCell className="font-medium">{ganho.nomeEstrategia}</TableCell>
                <TableCell className="text-right">
                  {formatarCelulaMoeda(ganho.ganhoNoMes.valorEmCentavos)}
                </TableCell>
                <TableCell className="text-right">
                  {formatarCelulaMoeda(ganho.ganhoNoAno.valorEmCentavos)}
                </TableCell>
                <TableCell className="text-right">
                  {formatarCelulaMoeda(ganho.ganho12Meses.valorEmCentavos)}
                </TableCell>
                <TableCell className="text-right">
                  {formatarCelulaMoeda(ganho.ganhoDesdeInicio.valorEmCentavos)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
