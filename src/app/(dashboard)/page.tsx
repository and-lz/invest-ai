"use client";

import { useState, useMemo, useEffect } from "react";
import dynamic from "next/dynamic";
import { useChatPageContext } from "@/contexts/chat-page-context";
import { serializarContextoDashboard } from "@/lib/serialize-chat-context";
import type { ResumoContextoChat } from "@/schemas/chat.schema";
import { SummaryCards } from "@/components/dashboard/summary-cards";
import { TopPerformersTable } from "@/components/dashboard/top-performers-table";
import { StrategyGainsTable } from "@/components/dashboard/strategy-gains-table";
import { FinancialEventsList } from "@/components/dashboard/financial-events-list";
import { PeriodSelector } from "@/components/dashboard/period-selector";
import { MonthlyReturnsHeatmap } from "@/components/dashboard/monthly-returns-heatmap";
import { RiskConsistencyCard } from "@/components/dashboard/risk-consistency-card";
import { PeriodComparisonDetail } from "@/components/dashboard/period-comparison-detail";
import { useDashboardData } from "@/hooks/use-dashboard-data";
import { useDetailsOpen } from "@/hooks/use-details-open";
import { formatarMesAno } from "@/lib/format-date";
import { typography } from "@/lib/design-system";
import { Skeleton } from "@/components/ui/skeleton";
import { Collapsible, CollapsibleContent } from "@/components/ui/collapsible";
import { LayoutDashboard } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  DashboardHeadline,
  SectionLabel,
  CollapsibleSectionLabel,
  DashboardSkeleton,
  EstadoVazio,
} from "@/components/dashboard/dashboard-sub-components";

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

export default function DashboardPage() {
  const [periodoSelecionado, setPeriodoSelecionado] = useState<string | undefined>(undefined);
  const [detailsOpen, setDetailsOpen] = useDetailsOpen();

  const { dadosDashboard, estaVazio, estaCarregando } = useDashboardData(
    periodoSelecionado ? { mesAno: periodoSelecionado } : undefined,
  );

  // Registrar contexto da pagina para o chat
  const { definirContexto } = useChatPageContext();
  const contextoSerializado = useMemo(
    () => (dadosDashboard ? serializarContextoDashboard(dadosDashboard) : undefined),
    [dadosDashboard],
  );
  const resumoContexto = useMemo((): ResumoContextoChat | undefined => {
    if (!dadosDashboard) return undefined;
    const benchmarkMes = dadosDashboard.comparacaoBenchmarksAtual.find(
      (b) => b.periodo === "No mes",
    );
    const alocacaoDominante = dadosDashboard.alocacaoAtual
      .flatMap((a) => a.categorias)
      .reduce(
        (max, cat) =>
          cat.percentualDaCarteira.valor > (max?.percentualDaCarteira.valor ?? -1) ? cat : max,
        undefined as { nomeCategoria: string; percentualDaCarteira: { valor: number } } | undefined,
      )?.nomeCategoria;
    return {
      patrimonioTotal: dadosDashboard.resumoAtual.patrimonioTotal.valorEmCentavos,
      rentabilidadeMensal: dadosDashboard.resumoAtual.rentabilidadeMensal.valor,
      rentabilidadeCDIMensal: benchmarkMes?.cdi.valor ?? 0,
      melhorAtivo: dadosDashboard.melhoresPerformers[0]?.nomeAtivo,
      melhorAtivoRentabilidade: dadosDashboard.melhoresPerformers[0]?.rentabilidadeMes.valor,
      piorAtivo: dadosDashboard.pioresPerformers[0]?.nomeAtivo,
      piorAtivoRentabilidade: dadosDashboard.pioresPerformers[0]?.rentabilidadeMes.valor,
      alocacaoDominante,
      totalRelatorios: dadosDashboard.quantidadeRelatorios,
    };
  }, [dadosDashboard]);
  useEffect(() => {
    definirContexto("dashboard", contextoSerializado, resumoContexto);
  }, [definirContexto, contextoSerializado, resumoContexto]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <LayoutDashboard className="text-muted-foreground h-6 w-6" aria-hidden="true" />
          <h1 className={typography.h1}>
            Dashboard
            {dadosDashboard && (
              <span className="text-muted-foreground ml-2 text-base font-normal">
                · {formatarMesAno(periodoSelecionado ?? dadosDashboard.mesAtual, "extenso")}
              </span>
            )}
          </h1>
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
          <DashboardHeadline
            variacaoCentavos={dadosDashboard.variacaoPatrimonialCentavos}
            benchmarks={dadosDashboard.comparacaoBenchmarksAtual}
          />

          {/* ── Resumo ── */}
          <SectionLabel>Resumo</SectionLabel>

          <SummaryCards
            resumo={dadosDashboard.resumoAtual}
            variacaoPatrimonialCentavos={dadosDashboard.variacaoPatrimonialCentavos}
          />

          <WealthEvolutionChart evolucaoPatrimonial={dadosDashboard.evolucaoPatrimonial} />

          {/* ── Análise detalhada (collapsible) ── */}
          <Collapsible open={detailsOpen} onOpenChange={setDetailsOpen}>
            <CollapsibleSectionLabel>Análise detalhada</CollapsibleSectionLabel>

            <CollapsibleContent className="space-y-6 pt-6">
              <div className="grid gap-6 lg:grid-cols-2">
                <RiskConsistencyCard analiseRiscoRetorno={dadosDashboard.analiseRiscoRetorno} />
                <AssetAllocationChart alocacaoMensal={dadosDashboard.alocacaoAtual} />
              </div>

              <BenchmarkComparisonChart comparacoes={dadosDashboard.comparacaoBenchmarksAtual} />

              <MonthlyReturnsHeatmap retornosMensais={dadosDashboard.retornosMensais} />

              <div className="grid gap-6 lg:grid-cols-2">
                <AllocationEvolutionChart evolucaoAlocacao={dadosDashboard.evolucaoAlocacaoHistorica} />
                <CategoryPerformanceChart categorias={dadosDashboard.rentabilidadePorCategoria} />
              </div>

              <div className="grid gap-6 lg:grid-cols-2">
                <PeriodComparisonDetail comparacaoPeriodos={dadosDashboard.comparacaoPeriodos} />
                <LiquidityLadder faixasLiquidez={dadosDashboard.faixasLiquidez} />
              </div>

              <SectionLabel>Destaques</SectionLabel>

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

              <div className="grid gap-6 lg:grid-cols-2">
                <StrategyGainsTable ganhos={dadosDashboard.ganhosPorEstrategia} />
                <FinancialEventsList eventos={dadosDashboard.eventosRecentes} />
              </div>

              <div className="flex flex-wrap items-center justify-center gap-4">
                <Link href="/desempenho">
                  <Button variant="outline" size="sm">
                    Ver todas as posições →
                  </Button>
                </Link>
                <Link href="/reports">
                  <Button variant="outline" size="sm">
                    Ver movimentações →
                  </Button>
                </Link>
              </div>
            </CollapsibleContent>
          </Collapsible>
        </>
      )}
    </div>
  );
}
