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
        <Upload className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
        <h3 className="mb-2 text-lg font-semibold">Nenhum relatorio encontrado</h3>
        <p className="mb-4 text-muted-foreground">
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
    periodoSelecionado ? { mesAno: periodoSelecionado } : undefined
  );

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <Header
          titulo="Dashboard"
          descricao="Visao geral dos seus investimentos"
        />
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

          <WealthEvolutionChart
            evolucaoPatrimonial={dadosDashboard.evolucaoPatrimonial}
          />

          <div className="grid gap-6 lg:grid-cols-2">
            <AssetAllocationChart alocacaoMensal={dadosDashboard.alocacaoAtual} />
            <BenchmarkComparisonChart comparacoes={dadosDashboard.comparacaoBenchmarksAtual} />
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

          <StrategyGainsTable ganhos={dadosDashboard.ganhosPorEstrategia} />

          <FinancialEventsList eventos={dadosDashboard.eventosRecentes} />
        </>
      )}
    </div>
  );
}
