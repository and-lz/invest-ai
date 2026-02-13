import type { ChartConfig } from "@/components/ui/chart";

/**
 * Semantic chart color mapping aligned with CSS variables from globals.css
 *
 * Color psychology for financial markets:
 * - Navy (250°): Stability, traditional banking → Liquidez, Pós-fixado
 * - Teal (165°): Growth, prosperity → Renda Variável, Ibovespa
 * - Gold (75°): Premium, wealth → Carteira, benchmark principal
 * - Purple (310°): Sophistication → Fundos Listados, alternatives
 * - Wine (15°): Caution, risk → Multimercado, Alternativos
 */
const PALETA_CHART = {
  navy: "var(--chart-1)", // Principal, estável
  teal: "var(--chart-2)", // Crescimento, positivo
  gold: "var(--chart-3)", // Premium, destaque
  purple: "var(--chart-4)", // Alternativo, diferenciado
  wine: "var(--chart-5)", // Risco, atenção
} as const;

export const CORES_ESTRATEGIA: Record<string, string> = {
  Liquidez: PALETA_CHART.navy,
  "Fundos Listados": PALETA_CHART.purple,
  "Renda Variavel": PALETA_CHART.teal,
  Global: PALETA_CHART.gold,
  Outros: PALETA_CHART.wine,
  Alternativos: PALETA_CHART.wine,
  "Pos-fixado": PALETA_CHART.navy,
  Inflacao: PALETA_CHART.gold,
  Multimercado: PALETA_CHART.purple,
};

export const CORES_BENCHMARK: Record<string, string> = {
  carteira: PALETA_CHART.gold, // Principal destaque
  cdi: PALETA_CHART.navy, // Referência estável
  ibovespa: PALETA_CHART.teal, // Crescimento
  ipca: PALETA_CHART.purple, // Inflação
};

export function getCoresEstrategia(): Record<string, string> {
  return CORES_ESTRATEGIA;
}

export function getCoresBenchmark(): Record<string, string> {
  return CORES_BENCHMARK;
}

export const configGraficoBenchmarks: ChartConfig = {
  carteira: { label: "Carteira", color: CORES_BENCHMARK.carteira },
  cdi: { label: "CDI", color: CORES_BENCHMARK.cdi },
  ibovespa: { label: "Ibovespa", color: CORES_BENCHMARK.ibovespa },
  ipca: { label: "IPCA", color: CORES_BENCHMARK.ipca },
};

export function getConfigGraficoBenchmarks(): ChartConfig {
  return configGraficoBenchmarks;
}

export const configGraficoPatrimonio: ChartConfig = {
  patrimonioTotal: { label: "Patrimonio", color: PALETA_CHART.gold },
  totalAportado: { label: "Total Aportado", color: PALETA_CHART.navy },
};

export function getConfigGraficoPatrimonio(): ChartConfig {
  return configGraficoPatrimonio;
}
