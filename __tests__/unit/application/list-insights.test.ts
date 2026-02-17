import { describe, it, expect, vi, beforeEach } from "vitest";
import { ListInsightsUseCase } from "@/application/use-cases/list-insights";
import type { ReportRepository } from "@/domain/interfaces/report-repository";
import type { InsightsMetadata } from "@/schemas/insights.schema";

// ========== Mock Repository ==========

function criarMockRepository(
  metadados: InsightsMetadata[] = [],
): Partial<ReportRepository> {
  return {
    listarInsightsMetadados: vi.fn().mockResolvedValue(metadados),
  };
}

// ========== Test Data ==========

const criarInsightsMetadata = (overrides: Partial<InsightsMetadata> = {}): InsightsMetadata => ({
  identificador: "2025-01",
  dataGeracao: "2025-01-15",
  mesReferencia: "2025-01",
  totalInsights: 5,
  totalAlertas: 2,
  atualizadoEm: "2025-01-15T10:00:00Z",
  ...overrides,
});

// ========== Tests ==========

describe("ListInsightsUseCase", () => {
  let useCase: ListInsightsUseCase;
  let mockRepository: Partial<ReportRepository>;

  describe("Given the repository has generated insights", () => {
    beforeEach(() => {
      mockRepository = criarMockRepository([
        criarInsightsMetadata({ identificador: "2025-02", mesReferencia: "2025-02" }),
        criarInsightsMetadata({ identificador: "2025-01", mesReferencia: "2025-01" }),
        criarInsightsMetadata({ identificador: "consolidado", mesReferencia: "consolidado" }),
      ]);
      useCase = new ListInsightsUseCase(mockRepository as ReportRepository);
    });

    it("When executing, Then it should return all insights metadata", async () => {
      const result = await useCase.executar();

      expect(result).toHaveLength(3);
      expect(result[0]!.identificador).toBe("2025-02");
      expect(result[2]!.identificador).toBe("consolidado");
    });

    it("When executing, Then it should delegate to the repository", async () => {
      await useCase.executar();

      expect(mockRepository.listarInsightsMetadados).toHaveBeenCalledOnce();
    });
  });

  describe("Given the repository has no insights", () => {
    beforeEach(() => {
      mockRepository = criarMockRepository([]);
      useCase = new ListInsightsUseCase(mockRepository as ReportRepository);
    });

    it("When executing, Then it should return an empty array", async () => {
      const result = await useCase.executar();

      expect(result).toEqual([]);
    });
  });
});
