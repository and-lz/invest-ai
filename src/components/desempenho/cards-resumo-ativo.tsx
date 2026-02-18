"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, TrendingUp, TrendingDown, PieChart, BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatarMoeda, formatarMoedaCompacta } from "@/domain/value-objects/money";
import { formatarPercentualSimples } from "@/domain/value-objects/percentage";
import { typography, icon, layout, valueColor, trendIconColor } from "@/lib/design-system";
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
    <div className={layout.gridCards}>
      {/* Cotacao / Saldo */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className={typography.label}>
            {cotacao ? "Cotacao" : "Saldo na Carteira"}
          </CardTitle>
          <DollarSign className={cn(icon.cardTitle, "text-muted-foreground")} />
        </CardHeader>
        <CardContent>
          <div className={typography.mainValue}>
            {cotacao
              ? formatarMoeda(Math.round(cotacao.preco * 100))
              : dadosAtivo.saldoAtualCentavos > 0
                ? formatarMoedaCompacta(dadosAtivo.saldoAtualCentavos)
                : "N/D"}
          </div>
          {cotacao && (
            <p className={cn("text-xs", valueColor(cotacao.variacaoPercentual))}>
              {cotacao.variacaoPercentual >= 0 ? "+" : ""}
              {formatarPercentualSimples(cotacao.variacaoPercentual)} hoje
            </p>
          )}
        </CardContent>
      </Card>

      {/* Rentabilidade no Mes */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className={typography.label}>Rent. no Mes</CardTitle>
          {rentabilidadeMes !== null && rentabilidadeMes >= 0 ? (
            <TrendingUp className={cn(icon.cardTitle, trendIconColor(rentabilidadeMes))} />
          ) : (
            <TrendingDown className={cn(icon.cardTitle, trendIconColor(rentabilidadeMes))} />
          )}
        </CardHeader>
        <CardContent>
          <div className={cn(typography.mainValue, valueColor(rentabilidadeMes))}>
            {rentabilidadeMes !== null ? formatarPercentualSimples(rentabilidadeMes) : "N/D"}
          </div>
          {rentabilidade12Meses !== null && (
            <p className={typography.helper}>
              12 meses: {formatarPercentualSimples(rentabilidade12Meses)}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Participacao na Carteira */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className={typography.label}>% da Carteira</CardTitle>
          <PieChart className={cn(icon.cardTitle, "text-muted-foreground")} />
        </CardHeader>
        <CardContent>
          <div className={typography.mainValue}>
            {dadosAtivo.participacaoAtualCarteira > 0
              ? formatarPercentualSimples(dadosAtivo.participacaoAtualCarteira)
              : "N/D"}
          </div>
          {dadosAtivo.saldoAtualCentavos > 0 && (
            <p className={typography.helper}>
              Saldo: {formatarMoedaCompacta(dadosAtivo.saldoAtualCentavos)}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Proventos Recebidos */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className={typography.label}>Proventos</CardTitle>
          <BarChart3 className={cn(icon.cardTitle, "text-muted-foreground")} />
        </CardHeader>
        <CardContent>
          <div className={typography.mainValue}>
            {totalEventos > 0 ? formatarMoedaCompacta(totalEventos) : "N/D"}
          </div>
          <p className={typography.helper}>
            {dadosAtivo.eventosFinanceirosDoAtivo.length > 0
              ? `${dadosAtivo.eventosFinanceirosDoAtivo.length} eventos registrados`
              : "Nenhum provento registrado"}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
