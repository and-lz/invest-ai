"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatarMoeda } from "@/domain/value-objects/money";
import type { GanhosPorEstrategia } from "@/schemas/report-extraction.schema";

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

export function StrategyGainsTable({ ganhos }: StrategyGainsTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Ganhos por Estrategia</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Estrategia</TableHead>
              <TableHead className="text-right">No Mes</TableHead>
              <TableHead className="text-right">No Ano</TableHead>
              <TableHead className="text-right">12 Meses</TableHead>
              <TableHead className="text-right">Desde Inicio</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {ganhos.map((ganho) => (
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
