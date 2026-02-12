"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatarMoeda } from "@/domain/value-objects/money";
import type { EventoFinanceiro } from "@/schemas/report-extraction.schema";

interface FinancialEventsListProps {
  eventos: EventoFinanceiro[];
}

const CORES_TIPO_EVENTO: Record<string, string> = {
  Dividendo: "bg-green-100 text-green-800",
  JCP: "bg-blue-100 text-blue-800",
  Rendimento: "bg-amber-100 text-amber-800",
  Amortizacao: "bg-purple-100 text-purple-800",
  Aluguel: "bg-gray-100 text-gray-800",
  Outro: "bg-gray-100 text-gray-800",
};

export function FinancialEventsList({ eventos }: FinancialEventsListProps) {
  const eventosOrdenados = [...eventos].sort(
    (eventoA, eventoB) => eventoB.valor.valorEmCentavos - eventoA.valor.valorEmCentavos,
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Eventos Financeiros</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {eventosOrdenados.map((evento, indice) => (
            <div key={`${evento.nomeAtivo}-${indice}`} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Badge variant="secondary" className={CORES_TIPO_EVENTO[evento.tipoEvento] ?? ""}>
                  {evento.tipoEvento}
                </Badge>
                <span className="text-sm font-medium">
                  {evento.codigoAtivo ?? evento.nomeAtivo}
                </span>
              </div>
              <span className="text-sm font-semibold text-green-600">
                {formatarMoeda(evento.valor.valorEmCentavos)}
              </span>
            </div>
          ))}
          {eventosOrdenados.length === 0 && (
            <p className="text-sm text-muted-foreground">Nenhum evento financeiro neste mes.</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
