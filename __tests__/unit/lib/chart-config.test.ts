import { describe, it, expect } from "vitest";
import {
  CORES_ESTRATEGIA,
  CORES_BENCHMARK,
  getCoresEstrategia,
  getCoresBenchmark,
  getConfigGraficoBenchmarks,
  getConfigGraficoPatrimonio,
  configGraficoBenchmarks,
  configGraficoPatrimonio,
} from "@/lib/chart-config";

describe("chart-config utilities", () => {
  describe("CORES_ESTRATEGIA constant", () => {
    const expectedStrategies = [
      "Liquidez",
      "Fundos Listados",
      "Renda Variavel",
      "Global",
      "Outros",
      "Alternativos",
      "Pos-fixado",
      "Inflacao",
      "Multimercado",
    ];

    describe("Given the strategy color mapping", () => {
      it("When checking all known strategies, Then every strategy has a mapped color", () => {
        for (const strategy of expectedStrategies) {
          expect(CORES_ESTRATEGIA).toHaveProperty(strategy);
          expect(typeof CORES_ESTRATEGIA[strategy]).toBe("string");
        }
      });

      it("When inspecting color values, Then all colors use CSS custom properties", () => {
        for (const color of Object.values(CORES_ESTRATEGIA)) {
          expect(color).toMatch(/^var\(--chart-\d+\)$/);
        }
      });
    });
  });

  describe("CORES_BENCHMARK constant", () => {
    const expectedBenchmarks = ["carteira", "cdi", "ibovespa", "ipca"];

    describe("Given the benchmark color mapping", () => {
      it("When checking all known benchmarks, Then carteira, cdi, ibovespa, and ipca are mapped", () => {
        for (const benchmark of expectedBenchmarks) {
          expect(CORES_BENCHMARK).toHaveProperty(benchmark);
          expect(typeof CORES_BENCHMARK[benchmark]).toBe("string");
        }
      });

      it("When inspecting color values, Then all colors use CSS custom properties", () => {
        for (const color of Object.values(CORES_BENCHMARK)) {
          expect(color).toMatch(/^var\(--chart-\d+\)$/);
        }
      });
    });
  });

  describe("getCoresEstrategia", () => {
    describe("Given the strategy color getter", () => {
      it("When called, Then returns the same object as CORES_ESTRATEGIA", () => {
        const result = getCoresEstrategia();

        expect(result).toBe(CORES_ESTRATEGIA);
      });
    });
  });

  describe("getCoresBenchmark", () => {
    describe("Given the benchmark color getter", () => {
      it("When called, Then returns the same object as CORES_BENCHMARK", () => {
        const result = getCoresBenchmark();

        expect(result).toBe(CORES_BENCHMARK);
      });
    });
  });

  describe("getConfigGraficoBenchmarks", () => {
    describe("Given the benchmark chart config getter", () => {
      it("When called, Then returns the same object as configGraficoBenchmarks", () => {
        const result = getConfigGraficoBenchmarks();

        expect(result).toBe(configGraficoBenchmarks);
      });

      it("When inspecting the config, Then it contains entries for carteira, cdi, ibovespa, and ipca", () => {
        const config = getConfigGraficoBenchmarks();

        expect(config).toHaveProperty("carteira");
        expect(config).toHaveProperty("cdi");
        expect(config).toHaveProperty("ibovespa");
        expect(config).toHaveProperty("ipca");
      });

      it("When inspecting each entry, Then it has a label and a color", () => {
        const config = getConfigGraficoBenchmarks();

        for (const [, entry] of Object.entries(config)) {
          expect(entry).toHaveProperty("label");
          expect(entry).toHaveProperty("color");
          expect(typeof entry.label).toBe("string");
          expect(typeof entry.color).toBe("string");
        }
      });

      it("When checking labels, Then they match expected display names", () => {
        const config = getConfigGraficoBenchmarks();

        expect(config.carteira!.label).toBe("Carteira");
        expect(config.cdi!.label).toBe("CDI");
        expect(config.ibovespa!.label).toBe("Ibovespa");
        expect(config.ipca!.label).toBe("IPCA");
      });
    });
  });

  describe("getConfigGraficoPatrimonio", () => {
    describe("Given the patrimonio chart config getter", () => {
      it("When called, Then returns the same object as configGraficoPatrimonio", () => {
        const result = getConfigGraficoPatrimonio();

        expect(result).toBe(configGraficoPatrimonio);
      });

      it("When inspecting the config, Then it contains patrimonioTotal and totalAportado", () => {
        const config = getConfigGraficoPatrimonio();

        expect(config).toHaveProperty("patrimonioTotal");
        expect(config).toHaveProperty("totalAportado");
      });

      it("When checking labels, Then they match expected display names", () => {
        const config = getConfigGraficoPatrimonio();

        expect(config.patrimonioTotal!.label).toBe("Patrimonio");
        expect(config.totalAportado!.label).toBe("Total Aportado");
      });

      it("When checking colors, Then they use CSS custom properties", () => {
        const config = getConfigGraficoPatrimonio();

        expect(config.patrimonioTotal!.color).toMatch(/^var\(--chart-\d+\)$/);
        expect(config.totalAportado!.color).toMatch(/^var\(--chart-\d+\)$/);
      });
    });
  });
});
