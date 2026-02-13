"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ArrowDownLeft, ArrowUpRight, Receipt } from "lucide-react";
import { formatarMoeda } from "@/domain/value-objects/money";
import { formatarDataBrasileira } from "@/lib/format-date";
import type { MovimentacaoAtivo } from "@/schemas/analise-ativo.schema";

interface TabelaMovimentacoesProps {
  readonly movimentacoes: MovimentacaoAtivo[];
  readonly nomeAtivo: string;
}

function obterIconeMovimentacao(tipo: string) {
  if (tipo === "Aplicacao") return ArrowUpRight;
  if (tipo === "Resgate") return ArrowDownLeft;
  return Receipt;
}

function obterVarianteBadge(tipo: string): "default" | "secondary" | "outline" {
  if (tipo === "Aplicacao") return "default";
  if (tipo === "Resgate") return "secondary";
  return "outline";
}

export function TabelaMovimentacoes({ movimentacoes, nomeAtivo }: TabelaMovimentacoesProps) {
  if (movimentacoes.length === 0) return null;

  const movimentacoesOrdenadas = [...movimentacoes].sort(
    (movA, movB) => movB.data.localeCompare(movA.data),
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Receipt className="text-muted-foreground h-5 w-5" />
          <CardTitle className="text-lg">Movimentacoes</CardTitle>
        </div>
        <CardDescription>
          Historico de compras, vendas e eventos de {nomeAtivo}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Data</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead className="text-right">Valor</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {movimentacoesOrdenadas.map((movimentacao, indice) => {
              const IconeMovimentacao = obterIconeMovimentacao(movimentacao.tipo);
              return (
                <TableRow key={`${movimentacao.data}-${movimentacao.tipo}-${indice}`}>
                  <TableCell className="text-sm">
                    {formatarDataBrasileira(movimentacao.data)}
                  </TableCell>
                  <TableCell>
                    <Badge variant={obterVarianteBadge(movimentacao.tipo)} className="gap-1">
                      <IconeMovimentacao className="h-3 w-3" />
                      {movimentacao.tipo}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right text-sm font-medium">
                    {formatarMoeda(movimentacao.valorCentavos)}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
