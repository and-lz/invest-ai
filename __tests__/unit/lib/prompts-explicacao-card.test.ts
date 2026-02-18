import { describe, it, expect } from "vitest";
import { PROMPTS_EXPLICACAO_CARD } from "@/lib/card-explanation-prompts";

describe("PROMPTS_EXPLICACAO_CARD", () => {
  it("Given the prompt registry, When checking all entries, Then every key should have a non-empty Portuguese prompt ending with a question mark", () => {
    const entries = Object.entries(PROMPTS_EXPLICACAO_CARD);
    expect(entries.length).toBeGreaterThanOrEqual(16);

    for (const [key, prompt] of entries) {
      expect(key).toBeTruthy();
      expect(prompt.length).toBeGreaterThan(20);
      expect(prompt.trimEnd()).toMatch(/\?$/);
    }
  });

  it("Given dashboard cards, When looking up prompts, Then all expected identifiers should exist", () => {
    const expectedDashboardKeys = [
      "patrimonio-total",
      "benchmark",
      "alocacao-ativos",
      "evolucao-alocacao",
      "rentabilidade-categoria",
      "retornos-mensais",
      "escada-liquidez",
      "top-performers",
      "ganhos-estrategia",
      "eventos-financeiros",
      "comparacao-periodos",
      "risco-consistencia",
    ];

    for (const key of expectedDashboardKeys) {
      expect(PROMPTS_EXPLICACAO_CARD[key]).toBeDefined();
    }
  });

  it("Given desempenho cards, When looking up prompts, Then all expected identifiers should exist", () => {
    const expectedDesempenhoKeys = ["evolucao-ativo", "rendimentos-ativo"];

    for (const key of expectedDesempenhoKeys) {
      expect(PROMPTS_EXPLICACAO_CARD[key]).toBeDefined();
    }
  });

  it("Given trends cards, When looking up prompts, Then all expected identifiers should exist", () => {
    const expectedTrendsKeys = ["indicadores-macro", "heatmap-setores"];

    for (const key of expectedTrendsKeys) {
      expect(PROMPTS_EXPLICACAO_CARD[key]).toBeDefined();
    }
  });
});
