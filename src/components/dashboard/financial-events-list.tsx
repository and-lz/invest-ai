"use client";

import { useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowUp, ArrowDown, ArrowUpDown } from "lucide-react";
import { formatarMoeda } from "@/domain/value-objects/money";
import { formatarDataBrasileira } from "@/lib/format-date";
import { useOrdenacaoTabela } from "@/hooks/use-ordenacao-tabela";
import type { EventoFinanceiro } from "@/schemas/report-extraction.schema";

type ColunaEventos = "tipo" | "ativo" | "data" | "valor";

interface FinancialEventsListProps {
  eventos: EventoFinanceiro[];
}

function obterValorColuna(evento: EventoFinanceiro, coluna: ColunaEventos): string | number {
  switch (coluna) {
    case "tipo":
      return evento.tipoEvento;
    case "ativo":
      return evento.codigoAtivo ?? evento.nomeAtivo;
    case "data":
      return evento.dataEvento ?? "";
    case "valor":
      return evento.valor.valorEmCentavos;
  }
}

interface CabecalhoOrdenaveProps {
  coluna: ColunaEventos;
  colunaAtiva: ColunaEventos | null;
  direcao: "asc" | "desc";
  onClick: (coluna: ColunaEventos) => void;
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

export function FinancialEventsList({ eventos }: FinancialEventsListProps) {
  const obterValor = useCallback(
    (evento: EventoFinanceiro, coluna: ColunaEventos) => obterValorColuna(evento, coluna),
    [],
  );

  const { itensOrdenados, colunaOrdenacao, direcaoOrdenacao, alternarOrdenacao } =
    useOrdenacaoTabela<EventoFinanceiro, ColunaEventos>(eventos, obterValor);

  const totalRecebidoCentavos = eventos.reduce(
    (acumulador, evento) => acumulador + evento.valor.valorEmCentavos,
    0,
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Eventos Financeiros</CardTitle>
        {eventos.length > 0 && (
          <CardDescription>
            {eventos.length} eventos — Total: {formatarMoeda(totalRecebidoCentavos)}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent>
        {eventos.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhum evento financeiro neste mes.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <CabecalhoOrdenavel coluna="tipo" colunaAtiva={colunaOrdenacao} direcao={direcaoOrdenacao} onClick={alternarOrdenacao}>
                  Tipo
                </CabecalhoOrdenavel>
                <CabecalhoOrdenavel coluna="ativo" colunaAtiva={colunaOrdenacao} direcao={direcaoOrdenacao} onClick={alternarOrdenacao}>
                  Ativo
                </CabecalhoOrdenavel>
                <CabecalhoOrdenavel coluna="data" colunaAtiva={colunaOrdenacao} direcao={direcaoOrdenacao} onClick={alternarOrdenacao}>
                  Data
                </CabecalhoOrdenavel>
                <CabecalhoOrdenavel coluna="valor" colunaAtiva={colunaOrdenacao} direcao={direcaoOrdenacao} onClick={alternarOrdenacao} className="text-right">
                  Valor
                </CabecalhoOrdenavel>
              </TableRow>
            </TableHeader>
            <TableBody>
              {itensOrdenados.map((evento, indice) => (
                <TableRow key={`${evento.codigoAtivo ?? evento.nomeAtivo}-${indice}`}>
                  <TableCell className="text-muted-foreground">{evento.tipoEvento}</TableCell>
                  <TableCell className="font-medium">{evento.codigoAtivo ?? evento.nomeAtivo}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {evento.dataEvento ? formatarDataBrasileira(evento.dataEvento) : "—"}
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {formatarMoeda(evento.valor.valorEmCentavos)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
