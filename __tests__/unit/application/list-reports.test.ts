import { describe, it, expect, vi } from "vitest";
import { ListReportsUseCase } from "@/application/use-cases/list-reports";
import type { ReportRepository } from "@/domain/interfaces/report-repository";

const FAKE_REPORTS = [
  {
    identificador: "r-1",
    nomeOriginalArquivo: "jan.pdf",
    dataUpload: "2025-01-15",
    mesReferencia: "2025-01",
    caminhoArquivo: "/reports/r-1.pdf",
  },
  {
    identificador: "r-2",
    nomeOriginalArquivo: "fev.pdf",
    dataUpload: "2025-02-10",
    mesReferencia: "2025-02",
    caminhoArquivo: "/reports/r-2.pdf",
  },
];

function createMockRepository(
  reports: Record<string, unknown>[] = [],
): ReportRepository {
  return {
    listarTodosMetadados: vi.fn().mockResolvedValue(reports),
    obterMetadados: vi.fn(),
    obterDadosExtraidos: vi.fn(),
    obterInsights: vi.fn(),
    obterPdfComoBase64: vi.fn(),
    salvarPdf: vi.fn(),
    salvarDadosExtraidos: vi.fn(),
    salvarMetadados: vi.fn(),
    salvarInsights: vi.fn(),
    removerRelatorio: vi.fn(),
    removerInsights: vi.fn(),
    listarInsightsMetadados: vi.fn(),
  };
}

describe("ListReportsUseCase", () => {
  describe("Given no reports exist", () => {
    it("When executar is called, Then it returns empty array", async () => {
      const repo = createMockRepository([]);
      const useCase = new ListReportsUseCase(repo);

      const result = await useCase.executar();

      expect(result).toEqual([]);
    });
  });

  describe("Given multiple reports exist", () => {
    it("When executar is called, Then it returns all report metadata", async () => {
      const repo = createMockRepository(FAKE_REPORTS);
      const useCase = new ListReportsUseCase(repo);

      const result = await useCase.executar();

      expect(result).toHaveLength(2);
      expect(result).toEqual(FAKE_REPORTS);
    });
  });
});
