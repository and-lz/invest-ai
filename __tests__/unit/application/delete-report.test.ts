import { describe, it, expect, vi } from "vitest";
import { DeleteReportUseCase } from "@/application/use-cases/delete-report";
import { ReportNotFoundError } from "@/domain/errors/app-errors";
import type { ReportRepository } from "@/domain/interfaces/report-repository";

function createMockRepository(
  metadados: Record<string, unknown> | null = null,
): ReportRepository {
  return {
    obterMetadados: vi.fn().mockResolvedValue(metadados),
    removerRelatorio: vi.fn().mockResolvedValue(undefined),
    salvarPdf: vi.fn(),
    salvarDadosExtraidos: vi.fn(),
    salvarMetadados: vi.fn(),
    salvarInsights: vi.fn(),
    obterDadosExtraidos: vi.fn(),
    obterInsights: vi.fn(),
    obterPdfComoBase64: vi.fn(),
    listarTodosMetadados: vi.fn(),
    listarInsightsMetadados: vi.fn(),
    removerInsights: vi.fn(),
  };
}

describe("DeleteReportUseCase", () => {
  describe("Given a report that exists", () => {
    it("When executar is called, Then it deletes the report", async () => {
      const repo = createMockRepository({ identificador: "report-1" });
      const useCase = new DeleteReportUseCase(repo);

      await useCase.executar("report-1");

      expect(repo.obterMetadados).toHaveBeenCalledWith("report-1");
      expect(repo.removerRelatorio).toHaveBeenCalledWith("report-1");
    });
  });

  describe("Given a report that does NOT exist", () => {
    it("When executar is called, Then it throws ReportNotFoundError", async () => {
      const repo = createMockRepository(null);
      const useCase = new DeleteReportUseCase(repo);

      await expect(useCase.executar("nonexistent")).rejects.toThrow(
        ReportNotFoundError,
      );
      expect(repo.removerRelatorio).not.toHaveBeenCalled();
    });
  });
});
