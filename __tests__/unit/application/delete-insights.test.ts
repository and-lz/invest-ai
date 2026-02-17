import { describe, it, expect, vi, beforeEach } from "vitest";
import { DeleteInsightsUseCase } from "@/application/use-cases/delete-insights";
import type { ReportRepository } from "@/domain/interfaces/report-repository";
import type { InsightsResponse } from "@/schemas/insights.schema";
import { InsightsNotFoundError } from "@/domain/errors/app-errors";

// ========== Mock Repository ==========

function criarMockRepository(
  insightsExistentes: Map<string, InsightsResponse> = new Map(),
): Partial<ReportRepository> {
  return {
    obterInsights: vi.fn((identificador: string) =>
      Promise.resolve(insightsExistentes.get(identificador) ?? null),
    ),
    removerInsights: vi.fn().mockResolvedValue(undefined),
  };
}

// ========== Test Data ==========

const criarInsightsResponse = (): InsightsResponse => ({
  mesReferencia: "2025-01",
  dataGeracao: "2025-01-15",
  resumoExecutivo: "Portfolio is performing well overall.",
  insights: [
    {
      titulo: "Strong performance in equities",
      descricao: "Equity allocation outperformed benchmarks.",
      categoria: "performance_positiva",
      prioridade: "alta",
      ativosRelacionados: ["PETR4"],
      acaoSugerida: null,
      impactoEstimado: null,
      concluida: false,
      statusAcao: "pendente",
    },
  ],
  alertas: [],
  recomendacoesLongoPrazo: [],
});

// ========== Tests ==========

describe("DeleteInsightsUseCase", () => {
  let useCase: DeleteInsightsUseCase;
  let mockRepository: Partial<ReportRepository>;

  describe("Given insights exist for the identifier", () => {
    beforeEach(() => {
      const insightsMap = new Map<string, InsightsResponse>();
      insightsMap.set("2025-01", criarInsightsResponse());
      mockRepository = criarMockRepository(insightsMap);
      useCase = new DeleteInsightsUseCase(mockRepository as ReportRepository);
    });

    it("When deleting, Then it should remove the insights", async () => {
      await useCase.executar("2025-01");

      expect(mockRepository.obterInsights).toHaveBeenCalledWith("2025-01");
      expect(mockRepository.removerInsights).toHaveBeenCalledWith("2025-01");
    });
  });

  describe("Given insights exist for the consolidado identifier", () => {
    beforeEach(() => {
      const insightsMap = new Map<string, InsightsResponse>();
      insightsMap.set("consolidado", criarInsightsResponse());
      mockRepository = criarMockRepository(insightsMap);
      useCase = new DeleteInsightsUseCase(mockRepository as ReportRepository);
    });

    it("When deleting consolidado, Then it should remove the insights", async () => {
      await useCase.executar("consolidado");

      expect(mockRepository.removerInsights).toHaveBeenCalledWith("consolidado");
    });
  });

  describe("Given no insights exist for the identifier", () => {
    beforeEach(() => {
      mockRepository = criarMockRepository(new Map());
      useCase = new DeleteInsightsUseCase(mockRepository as ReportRepository);
    });

    it("When deleting, Then it should throw InsightsNotFoundError", async () => {
      await expect(useCase.executar("2025-99")).rejects.toThrow(InsightsNotFoundError);
    });

    it("When deleting, Then it should NOT call removerInsights", async () => {
      await expect(useCase.executar("2025-99")).rejects.toThrow();

      expect(mockRepository.removerInsights).not.toHaveBeenCalled();
    });
  });
});
