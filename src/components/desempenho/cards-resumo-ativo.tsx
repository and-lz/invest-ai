"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, TrendingUp, TrendingDown, PieChart, BarChart3 } from "lucide-react";
import { formatarMoeda, formatarMoedaCompacta } from "@/domain/value-objects/money";
import { formatarPercentualSimples } from "@/domain/value-objects/percentage";
import type { DadosAgregadosAtivo } from "@/schemas/analise-ativo.schema";

interface CardsResumoAtivoProps {
  readonly dadosAtivo: DadosAgregadosAtivo;
}

export function CardsResumoAtivo({ dadosAtivo }: CardsResumoAtivoProps) {
  const cotacao = dadosAtivo.cotacaoAtual;
  const ultimaPosicao = dadosAtivo.historicoNaCarteira.at(-1);
  const rentabilidadeMes = ultimaPosicao?.rentabilidadeMes ?? null;
  const rentabilidade12Meses = ultimaPosicao?.rentabilidade12Meses ?? null;

  const totalEventos = dadosAtivo.eventosFinanceirosDoAtivo.reduce(
    (soma, evento) => soma + evento.valorCentavos,
    0,
  );

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {/* Cotacao / Saldo */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            {cotacao ? "Cotacao" : "Saldo na Carteira"}
          </CardTitle>
          <DollarSign className="text-muted-foreground h-5 w-5" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {cotacao
              ? formatarMoeda(Math.round(cotacao.preco * 100))
              : dadosAtivo.saldoAtualCentavos > 0
                ? formatarMoedaCompacta(dadosAtivo.saldoAtualCentavos)
                : "N/D"}
          </div>
          {cotacao && (
            <p
              className={`text-xs ${cotacao.variacaoPercentual >= 0 ? "text-success" : "text-destructive"}`}
            >
              {cotacao.variacaoPercentual >= 0 ? "+" : ""}
              {formatarPercentualSimples(cotacao.variacaoPercentual)} hoje
            </p>
          )}
        </CardContent>
      </Card>

      {/* Rentabilidade no Mes */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Rent. no Mes</CardTitle>
          {rentabilidadeMes !== null && rentabilidadeMes >= 0 ? (
            <TrendingUp className="text-success h-5 w-5" />
          ) : (
            <TrendingDown className="text-destructive h-5 w-5" />
          )}
        </CardHeader>
        <CardContent>
          <div
            className={`text-2xl font-bold ${rentabilidadeMes !== null ? (rentabilidadeMes >= 0 ? "text-success" : "text-destructive") : ""}`}
          >
            {rentabilidadeMes !== null
              ? formatarPercentualSimples(rentabilidadeMes)
              : "N/D"}
          </div>
          {rentabilidade12Meses !== null && (
            <p className="text-muted-foreground text-xs">
              12 meses: {formatarPercentualSimples(rentabilidade12Meses)}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Participacao na Carteira */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">% da Carteira</CardTitle>
          <PieChart className="text-muted-foreground h-5 w-5" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {dadosAtivo.participacaoAtualCarteira > 0
              ? formatarPercentualSimples(dadosAtivo.participacaoAtualCarteira)
              : "N/D"}
          </div>
          {dadosAtivo.saldoAtualCentavos > 0 && (
            <p className="text-muted-foreground text-xs">
              Saldo: {formatarMoedaCompacta(dadosAtivo.saldoAtualCentavos)}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Proventos Recebidos */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Proventos</CardTitle>
          <BarChart3 className="text-muted-foreground h-5 w-5" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {totalEventos > 0 ? formatarMoedaCompacta(totalEventos) : "N/D"}
          </div>
          <p className="text-muted-foreground text-xs">
            {dadosAtivo.eventosFinanceirosDoAtivo.length > 0
              ? `${dadosAtivo.eventosFinanceirosDoAtivo.length} eventos registrados`
              : "Nenhum provento registrado"}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
