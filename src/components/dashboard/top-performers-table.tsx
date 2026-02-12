"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown } from "lucide-react";
import { formatarMoeda } from "@/domain/value-objects/money";
import { formatarPercentualSimples } from "@/domain/value-objects/percentage";
import type { PosicaoAtivo } from "@/schemas/report-extraction.schema";

interface TopPerformersTableProps {
  titulo: string;
  ativos: PosicaoAtivo[];
  tipo: "melhores" | "piores";
}

export function TopPerformersTable({ titulo, ativos, tipo }: TopPerformersTableProps) {
  const Icone = tipo === "melhores" ? TrendingUp : TrendingDown;
  const corIcone = tipo === "melhores" ? "text-green-600" : "text-red-600";

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
              <TableHead>Ativo</TableHead>
              <TableHead>Estrategia</TableHead>
              <TableHead className="text-right">Saldo</TableHead>
              <TableHead className="text-right">Rent. Mes</TableHead>
              <TableHead className="text-right">Part.</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {ativos.map((ativo) => (
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
