"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatarMoeda } from "@/domain/value-objects/money";
import { formatarDataBrasileira } from "@/lib/format-date";
import type { EventoFinanceiro } from "@/schemas/report-extraction.schema";

interface FinancialEventsListProps {
  eventos: EventoFinanceiro[];
}


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
                <Badge variant="secondary">
                  {evento.tipoEvento}
                </Badge>
                <div className="flex flex-col">
                  <span className="text-sm font-medium">
                    {evento.codigoAtivo ?? evento.nomeAtivo}
                  </span>
                  {evento.dataEvento && (
                    <span className="text-xs text-muted-foreground">
                      {formatarDataBrasileira(evento.dataEvento)}
                    </span>
                  )}
                </div>
              </div>
              <span className="text-sm font-semibold">
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
