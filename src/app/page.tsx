"use client";

import { useState } from "react";
import { Header } from "@/components/layout/header";
import { SummaryCards } from "@/components/dashboard/summary-cards";
import { AssetAllocationChart } from "@/components/dashboard/asset-allocation-chart";
import { BenchmarkComparisonChart } from "@/components/dashboard/benchmark-comparison-chart";
import { TopPerformersTable } from "@/components/dashboard/top-performers-table";
import { StrategyGainsTable } from "@/components/dashboard/strategy-gains-table";
import { FinancialEventsList } from "@/components/dashboard/financial-events-list";
import { WealthEvolutionChart } from "@/components/dashboard/wealth-evolution-chart";
import { PeriodSelector } from "@/components/dashboard/period-selector";
import { MonthlyReturnsHeatmap } from "@/components/dashboard/monthly-returns-heatmap";
import { RiskConsistencyCard } from "@/components/dashboard/risk-consistency-card";
import { LiquidityLadder } from "@/components/dashboard/liquidity-ladder";
import { AllPositionsTable } from "@/components/dashboard/all-positions-table";
import { CategoryPerformanceChart } from "@/components/dashboard/category-performance-chart";
import { TransactionsTable } from "@/components/dashboard/transactions-table";
import { AllocationEvolutionChart } from "@/components/dashboard/allocation-evolution-chart";
import { PeriodComparisonDetail } from "@/components/dashboard/period-comparison-detail";
import { useDashboardData } from "@/hooks/use-dashboard-data";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { Upload } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, indice) => (
          <Skeleton key={indice} className="h-32" />
        ))}
      </div>
      <Skeleton className="h-96" />
      <div className="grid gap-6 lg:grid-cols-2">
        <Skeleton className="h-96" />
        <Skeleton className="h-96" />
      </div>
    </div>
  );
}

function EstadoVazio() {
  return (
    <Card className="flex flex-col items-center justify-center p-12">
      <CardContent className="text-center">
        <Upload className="text-muted-foreground mx-auto mb-4 h-12 w-12" />
        <h3 className="mb-2 text-lg font-semibold">Nenhum relatorio encontrado</h3>
        <p className="text-muted-foreground mb-4">
          Faca upload do seu relatorio Inter Prime para comecar a visualizar seus investimentos.
        </p>
        <Link href="/upload">
          <Button>Fazer Upload</Button>
        </Link>
      </CardContent>
    </Card>
  );
}

export default function DashboardPage() {
  const [periodoSelecionado, setPeriodoSelecionado] = useState<string | undefined>(undefined);

  const { dadosDashboard, estaVazio, estaCarregando } = useDashboardData(
    periodoSelecionado ? { mesAno: periodoSelecionado } : undefined,
  );

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <Header titulo="Dashboard" descricao="Visao geral dos seus investimentos" />
        {dadosDashboard && dadosDashboard.periodosDisponiveis.length > 0 && (
          <PeriodSelector
            periodosDisponiveis={dadosDashboard.periodosDisponiveis}
            periodoSelecionado={periodoSelecionado ?? dadosDashboard.mesAtual}
            onPeriodoChange={setPeriodoSelecionado}
          />
        )}
      </div>

      {estaCarregando && <DashboardSkeleton />}

      {!estaCarregando && estaVazio && <EstadoVazio />}

      {!estaCarregando && dadosDashboard && (
        <>
          <SummaryCards
            resumo={dadosDashboard.resumoAtual}
            variacaoPatrimonialCentavos={dadosDashboard.variacaoPatrimonialCentavos}
          />

          <WealthEvolutionChart evolucaoPatrimonial={dadosDashboard.evolucaoPatrimonial} />

          <RiskConsistencyCard analiseRiscoRetorno={dadosDashboard.analiseRiscoRetorno} />

          <div className="grid gap-6 lg:grid-cols-2">
            <AssetAllocationChart alocacaoMensal={dadosDashboard.alocacaoAtual} />
            <BenchmarkComparisonChart comparacoes={dadosDashboard.comparacaoBenchmarksAtual} />
          </div>

          <MonthlyReturnsHeatmap retornosMensais={dadosDashboard.retornosMensais} />

          <div className="grid gap-6 lg:grid-cols-2">
            <AllocationEvolutionChart evolucaoAlocacao={dadosDashboard.evolucaoAlocacaoHistorica} />
            <CategoryPerformanceChart categorias={dadosDashboard.rentabilidadePorCategoria} />
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <PeriodComparisonDetail comparacaoPeriodos={dadosDashboard.comparacaoPeriodos} />
            <LiquidityLadder faixasLiquidez={dadosDashboard.faixasLiquidez} />
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <TopPerformersTable
              titulo="Melhores do Mes"
              ativos={dadosDashboard.melhoresPerformers}
              tipo="melhores"
            />
            <TopPerformersTable
              titulo="Piores do Mes"
              ativos={dadosDashboard.pioresPerformers}
              tipo="piores"
            />
          </div>

          <AllPositionsTable posicoes={dadosDashboard.todasPosicoes} />

          <StrategyGainsTable ganhos={dadosDashboard.ganhosPorEstrategia} />

          <div className="grid gap-6 lg:grid-cols-2">
            <FinancialEventsList eventos={dadosDashboard.eventosRecentes} />
            <TransactionsTable movimentacoes={dadosDashboard.movimentacoes} />
          </div>
        </>
      )}
    </div>
  );
}
