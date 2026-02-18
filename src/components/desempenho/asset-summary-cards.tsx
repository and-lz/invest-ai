"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, TrendingUp, TrendingDown, PieChart, BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatarMoeda, formatCompactCurrency } from "@/domain/value-objects/money";
import { formatSimplePercentage } from "@/domain/value-objects/percentage";
import { tipografia, icone, layout, corValor, corIconeTendencia } from "@/lib/design-system";
import type { DadosAgregadosAtivo } from "@/schemas/asset-analysis.schema";

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
    <div className={layout.gridCards}>
      {/* Cotacao / Saldo */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className={tipografia.rotulo}>
            {cotacao ? "Cotacao" : "Saldo na Carteira"}
          </CardTitle>
          <DollarSign className={cn(icone.tituloCard, "text-muted-foreground")} />
        </CardHeader>
        <CardContent>
          <div className={tipografia.valorPrincipal}>
            {cotacao
              ? formatarMoeda(Math.round(cotacao.preco * 100))
              : dadosAtivo.saldoAtualCentavos > 0
                ? formatCompactCurrency(dadosAtivo.saldoAtualCentavos)
                : "N/D"}
          </div>
          {cotacao && (
            <p className={cn("text-xs", corValor(cotacao.variacaoPercentual))}>
              {cotacao.variacaoPercentual >= 0 ? "+" : ""}
              {formatSimplePercentage(cotacao.variacaoPercentual)} hoje
            </p>
          )}
        </CardContent>
      </Card>

      {/* Rentabilidade no Mes */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className={tipografia.rotulo}>Rent. no Mes</CardTitle>
          {rentabilidadeMes !== null && rentabilidadeMes >= 0 ? (
            <TrendingUp className={cn(icone.tituloCard, corIconeTendencia(rentabilidadeMes))} />
          ) : (
            <TrendingDown className={cn(icone.tituloCard, corIconeTendencia(rentabilidadeMes))} />
          )}
        </CardHeader>
        <CardContent>
          <div className={cn(tipografia.valorPrincipal, corValor(rentabilidadeMes))}>
            {rentabilidadeMes !== null ? formatSimplePercentage(rentabilidadeMes) : "N/D"}
          </div>
          {rentabilidade12Meses !== null && (
            <p className={tipografia.auxiliar}>
              12 meses: {formatSimplePercentage(rentabilidade12Meses)}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Participacao na Carteira */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className={tipografia.rotulo}>% da Carteira</CardTitle>
          <PieChart className={cn(icone.tituloCard, "text-muted-foreground")} />
        </CardHeader>
        <CardContent>
          <div className={tipografia.valorPrincipal}>
            {dadosAtivo.participacaoAtualCarteira > 0
              ? formatSimplePercentage(dadosAtivo.participacaoAtualCarteira)
              : "N/D"}
          </div>
          {dadosAtivo.saldoAtualCentavos > 0 && (
            <p className={tipografia.auxiliar}>
              Saldo: {formatCompactCurrency(dadosAtivo.saldoAtualCentavos)}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Proventos Recebidos */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className={tipografia.rotulo}>Proventos</CardTitle>
          <BarChart3 className={cn(icone.tituloCard, "text-muted-foreground")} />
        </CardHeader>
        <CardContent>
          <div className={tipografia.valorPrincipal}>
            {totalEventos > 0 ? formatCompactCurrency(totalEventos) : "N/D"}
          </div>
          <p className={tipografia.auxiliar}>
            {dadosAtivo.eventosFinanceirosDoAtivo.length > 0
              ? `${dadosAtivo.eventosFinanceirosDoAtivo.length} eventos registrados`
              : "Nenhum provento registrado"}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
