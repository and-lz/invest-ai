import type { ChartConfig } from "@/components/ui/chart";
import type { CyberpunkPalette } from "@/contexts/cyberpunk-palette-context";

// Default colors (non-cyberpunk)
const CORES_ESTRATEGIA_DEFAULT: Record<string, string> = {
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

const CORES_BENCHMARK_DEFAULT: Record<string, string> = {
  carteira: "hsl(25, 95%, 53%)",
  cdi: "hsl(142, 76%, 36%)",
  ibovespa: "hsl(221, 83%, 53%)",
  ipca: "hsl(199, 89%, 48%)",
};

// Cyberpunk palette: Synthwave (Dark & Deep)
const CORES_ESTRATEGIA_SYNTHWAVE: Record<string, string> = {
  Liquidez: "oklch(0.50 0.35 330)",
  "Fundos Listados": "oklch(0.48 0.28 195)",
  "Renda Variavel": "oklch(0.45 0.32 295)",
  Global: "oklch(0.50 0.28 45)",
  Outros: "oklch(0.50 0.28 45)",
  Alternativos: "oklch(0.48 0.28 195)",
  "Pos-fixado": "oklch(0.45 0.32 295)",
  Inflacao: "oklch(0.50 0.35 330)",
  Multimercado: "oklch(0.48 0.28 195)",
};

const CORES_BENCHMARK_SYNTHWAVE: Record<string, string> = {
  carteira: "oklch(0.50 0.35 330)",
  cdi: "oklch(0.48 0.28 195)",
  ibovespa: "oklch(0.45 0.32 295)",
  ipca: "oklch(0.50 0.28 45)",
};

// Cyberpunk palette: Cyberpunk 2077 (Dark & Deep)
const CORES_ESTRATEGIA_CYBERPUNK_2077: Record<string, string> = {
  Liquidez: "oklch(0.55 0.25 95)",
  "Fundos Listados": "oklch(0.48 0.35 330)",
  "Renda Variavel": "oklch(0.45 0.28 195)",
  Global: "oklch(0.55 0.25 95)",
  Outros: "oklch(0.48 0.35 330)",
  Alternativos: "oklch(0.45 0.28 195)",
  "Pos-fixado": "oklch(0.55 0.25 95)",
  Inflacao: "oklch(0.48 0.35 330)",
  Multimercado: "oklch(0.45 0.28 195)",
};

const CORES_BENCHMARK_CYBERPUNK_2077: Record<string, string> = {
  carteira: "oklch(0.55 0.25 95)",
  cdi: "oklch(0.48 0.35 330)",
  ibovespa: "oklch(0.45 0.28 195)",
  ipca: "oklch(0.55 0.25 95)",
};

// Cyberpunk palette: Blade Runner (Dark & Deep)
const CORES_ESTRATEGIA_BLADE_RUNNER: Record<string, string> = {
  Liquidez: "oklch(0.52 0.28 45)",
  "Fundos Listados": "oklch(0.48 0.28 195)",
  "Renda Variavel": "oklch(0.45 0.30 280)",
  Global: "oklch(0.52 0.28 45)",
  Outros: "oklch(0.48 0.28 195)",
  Alternativos: "oklch(0.45 0.30 280)",
  "Pos-fixado": "oklch(0.52 0.28 45)",
  Inflacao: "oklch(0.48 0.28 195)",
  Multimercado: "oklch(0.45 0.30 280)",
};

const CORES_BENCHMARK_BLADE_RUNNER: Record<string, string> = {
  carteira: "oklch(0.52 0.28 45)",
  cdi: "oklch(0.48 0.28 195)",
  ibovespa: "oklch(0.45 0.30 280)",
  ipca: "oklch(0.52 0.28 45)",
};

// Cyberpunk palette: Matrix Green (Dark & Deep)
const CORES_ESTRATEGIA_MATRIX: Record<string, string> = {
  Liquidez: "oklch(0.50 0.32 140)",
  "Fundos Listados": "oklch(0.48 0.25 160)",
  "Renda Variavel": "oklch(0.52 0.30 125)",
  Global: "oklch(0.50 0.32 140)",
  Outros: "oklch(0.48 0.25 160)",
  Alternativos: "oklch(0.52 0.30 125)",
  "Pos-fixado": "oklch(0.50 0.32 140)",
  Inflacao: "oklch(0.48 0.25 160)",
  Multimercado: "oklch(0.52 0.30 125)",
};

const CORES_BENCHMARK_MATRIX: Record<string, string> = {
  carteira: "oklch(0.50 0.32 140)",
  cdi: "oklch(0.48 0.25 160)",
  ibovespa: "oklch(0.52 0.30 125)",
  ipca: "oklch(0.50 0.32 140)",
};

export function getCoresEstrategia(
  palette: CyberpunkPalette = "none",
): Record<string, string> {
  switch (palette) {
    case "synthwave":
      return CORES_ESTRATEGIA_SYNTHWAVE;
    case "cyberpunk-2077":
      return CORES_ESTRATEGIA_CYBERPUNK_2077;
    case "blade-runner":
      return CORES_ESTRATEGIA_BLADE_RUNNER;
    case "matrix":
      return CORES_ESTRATEGIA_MATRIX;
    case "none":
    default:
      return CORES_ESTRATEGIA_DEFAULT;
  }
}

export function getCoresBenchmark(
  palette: CyberpunkPalette = "none",
): Record<string, string> {
  switch (palette) {
    case "synthwave":
      return CORES_BENCHMARK_SYNTHWAVE;
    case "cyberpunk-2077":
      return CORES_BENCHMARK_CYBERPUNK_2077;
    case "blade-runner":
      return CORES_BENCHMARK_BLADE_RUNNER;
    case "matrix":
      return CORES_BENCHMARK_MATRIX;
    case "none":
    default:
      return CORES_BENCHMARK_DEFAULT;
  }
}

// Legacy exports for backward compatibility
export const CORES_ESTRATEGIA = CORES_ESTRATEGIA_DEFAULT;
export const CORES_BENCHMARK = CORES_BENCHMARK_DEFAULT;

export function getConfigGraficoBenchmarks(
  palette: CyberpunkPalette = "none",
): ChartConfig {
  const cores = getCoresBenchmark(palette);
  return {
    carteira: { label: "Carteira", color: cores.carteira },
    cdi: { label: "CDI", color: cores.cdi },
    ibovespa: { label: "Ibovespa", color: cores.ibovespa },
    ipca: { label: "IPCA", color: cores.ipca },
  };
}

export const configGraficoBenchmarks: ChartConfig = {
  carteira: { label: "Carteira", color: CORES_BENCHMARK.carteira },
  cdi: { label: "CDI", color: CORES_BENCHMARK.cdi },
  ibovespa: { label: "Ibovespa", color: CORES_BENCHMARK.ibovespa },
  ipca: { label: "IPCA", color: CORES_BENCHMARK.ipca },
};

export function getConfigGraficoPatrimonio(
  palette: CyberpunkPalette = "none",
): ChartConfig {
  const cores = {
    synthwave: {
      patrimonioTotal: "oklch(0.75 0.35 330)",
      totalAportado: "oklch(0.70 0.28 195)",
    },
    "cyberpunk-2077": {
      patrimonioTotal: "oklch(0.85 0.25 95)",
      totalAportado: "oklch(0.75 0.35 330)",
    },
    "blade-runner": {
      patrimonioTotal: "oklch(0.75 0.28 45)",
      totalAportado: "oklch(0.70 0.28 195)",
    },
    matrix: {
      patrimonioTotal: "oklch(0.75 0.32 140)",
      totalAportado: "oklch(0.70 0.25 160)",
    },
    none: {
      patrimonioTotal: "hsl(25, 95%, 53%)",
      totalAportado: "hsl(221, 83%, 53%)",
    },
  };

  const paletteCores = cores[palette] || cores.none;

  return {
    patrimonioTotal: {
      label: "Patrimonio",
      color: paletteCores.patrimonioTotal,
    },
    totalAportado: {
      label: "Total Aportado",
      color: paletteCores.totalAportado,
    },
  };
}

export const configGraficoPatrimonio: ChartConfig = {
  patrimonioTotal: { label: "Patrimonio", color: "hsl(25, 95%, 53%)" },
  totalAportado: { label: "Total Aportado", color: "hsl(221, 83%, 53%)" },
};
