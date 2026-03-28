"use client";

import { useState, useMemo, useEffect } from "react";
import dynamic from "next/dynamic";
import { useChatPageContext } from "@/contexts/chat-page-context";
import { serializarContextoDashboard } from "@/lib/serialize-chat-context";
import { Header } from "@/components/layout/header";
import { SummaryCards } from "@/components/dashboard/summary-cards";
import { TopPerformersTable } from "@/components/dashboard/top-performers-table";
import { StrategyGainsTable } from "@/components/dashboard/strategy-gains-table";
import { FinancialEventsList } from "@/components/dashboard/financial-events-list";
import { PeriodSelector } from "@/components/dashboard/period-selector";
import { MonthlyReturnsHeatmap } from "@/components/dashboard/monthly-returns-heatmap";
import { RiskConsistencyCard } from "@/components/dashboard/risk-consistency-card";
import { AllPositionsTable } from "@/components/dashboard/all-positions-table";
import { TransactionsTable } from "@/components/dashboard/transactions-table";
import { PeriodComparisonDetail } from "@/components/dashboard/period-comparison-detail";
import { useDashboardData } from "@/hooks/use-dashboard-data";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { Upload, LayoutDashboard } from "lucide-react";
import { isAiEnabled } from "@/lib/ai-features";
import { abrirChatComPergunta } from "@/components/ui/ai-explain-button";
import Link from "next/link";
import { Button } from "@/components/ui/button";

// Lazy-load chart components que usam Recharts (~150KB)
const WealthEvolutionChart = dynamic(
  () =>
    import("@/components/dashboard/wealth-evolution-chart").then((mod) => mod.WealthEvolutionChart),
  { ssr: false, loading: () => <Skeleton className="h-96" /> },
);

const AssetAllocationChart = dynamic(
  () =>
    import("@/components/dashboard/asset-allocation-chart").then((mod) => mod.AssetAllocationChart),
  { ssr: false, loading: () => <Skeleton className="h-64" /> },
);

const BenchmarkComparisonChart = dynamic(
  () =>
    import("@/components/dashboard/benchmark-comparison-chart").then(
      (mod) => mod.BenchmarkComparisonChart,
    ),
  { ssr: false, loading: () => <Skeleton className="h-64" /> },
);

const AllocationEvolutionChart = dynamic(
  () =>
    import("@/components/dashboard/allocation-evolution-chart").then(
      (mod) => mod.AllocationEvolutionChart,
    ),
  { ssr: false, loading: () => <Skeleton className="h-96" /> },
);

const CategoryPerformanceChart = dynamic(
  () =>
    import("@/components/dashboard/category-performance-chart").then(
      (mod) => mod.CategoryPerformanceChart,
    ),
  { ssr: false, loading: () => <Skeleton className="h-96" /> },
);

const LiquidityLadder = dynamic(
  () => import("@/components/dashboard/liquidity-ladder").then((mod) => mod.LiquidityLadder),
  { ssr: false, loading: () => <Skeleton className="h-96" /> },
);

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
      <CardContent className="space-y-6 text-center">
        <div>
          <Upload className="text-muted-foreground mx-auto mb-4 h-12 w-12" />
          <h3 className="mb-2 text-lg font-semibold">Bem-vindo ao Fortuna!</h3>
          <p className="text-muted-foreground">
            Veja como seus investimentos estão indo:
          </p>
        </div>

        <ul className="text-muted-foreground mx-auto max-w-sm space-y-1 text-left text-sm">
          <li>✓ Patrimônio total e crescimento mensal</li>
          <li>✓ Comparação com inflação e renda fixa</li>
          <li>✓ Análises automáticas em linguagem simples</li>
          {isAiEnabled() && <li>✓ Fortuna AI responde suas dúvidas sobre investimentos</li>}
        </ul>

        <div className="text-muted-foreground text-xs">
          1. Faça upload do seu relatório → 2. Aguarde ~30s → 3. Pronto!
        </div>

        <div className="flex flex-col items-center gap-2">
          <Link href="/reports">
            <Button>Fazer Upload do Relatório</Button>
          </Link>
          {isAiEnabled() && (
            <button
              type="button"
              onClick={() => abrirChatComPergunta("O que é o Fortuna e como ele pode me ajudar?")}
              className="text-muted-foreground hover:text-foreground text-sm underline transition-colors"
            >
              Tem dúvidas? Pergunte à Fortuna
            </button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default function DashboardPage() {
  const [periodoSelecionado, setPeriodoSelecionado] = useState<string | undefined>(undefined);

  const { dadosDashboard, estaVazio, estaCarregando } = useDashboardData(
    periodoSelecionado ? { mesAno: periodoSelecionado } : undefined,
  );

  // Registrar contexto da pagina para o chat
  const { definirContexto } = useChatPageContext();
  const contextoSerializado = useMemo(
    () => (dadosDashboard ? serializarContextoDashboard(dadosDashboard) : undefined),
    [dadosDashboard],
  );
  useEffect(() => {
    definirContexto("dashboard", contextoSerializado);
  }, [definirContexto, contextoSerializado]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-center gap-3">
          <LayoutDashboard className="text-muted-foreground h-6 w-6" aria-hidden="true" />
          <Header titulo="Dashboard" descricao="Visao geral dos seus investimentos" />
        </div>
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

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <RiskConsistencyCard analiseRiscoRetorno={dadosDashboard.analiseRiscoRetorno} />
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
