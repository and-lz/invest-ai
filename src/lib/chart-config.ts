import type { ChartConfig } from "@/components/ui/chart";

export const CORES_ESTRATEGIA: Record<string, string> = {
  Liquidez: "hsl(142, 76%, 36%)",
  "Fundos Listados": "hsl(221, 83%, 53%)",
  "Renda Variavel": "hsl(262, 83%, 58%)",
  Global: "hsl(45, 93%, 47%)",
  Outros: "hsl(25, 95%, 53%)",
  Alternativos: "hsl(0, 84%, 60%)",
  "Pos-fixado": "hsl(173, 80%, 40%)",
  Inflacao: "hsl(340, 82%, 52%)",
  Multimercado: "hsl(199, 89%, 48%)",
};

export const CORES_BENCHMARK: Record<string, string> = {
  carteira: "hsl(25, 95%, 53%)",
  cdi: "hsl(142, 76%, 36%)",
  ibovespa: "hsl(221, 83%, 53%)",
  ipca: "hsl(199, 89%, 48%)",
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
  patrimonioTotal: { label: "Patrimonio", color: "hsl(25, 95%, 53%)" },
  totalAportado: { label: "Total Aportado", color: "hsl(221, 83%, 53%)" },
};

export function getConfigGraficoPatrimonio(): ChartConfig {
  return configGraficoPatrimonio;
}
