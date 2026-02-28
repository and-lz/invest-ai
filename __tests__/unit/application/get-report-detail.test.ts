import { describe, it, expect, vi } from "vitest";
import { GetReportDetailUseCase } from "@/application/use-cases/get-report-detail";
import { ReportNotFoundError } from "@/domain/errors/app-errors";
import type { ReportRepository } from "@/domain/interfaces/report-repository";

const FAKE_METADADOS = {
  identificador: "report-1",
  nomeOriginalArquivo: "extrato.pdf",
  dataUpload: "2025-01-15",
  mesReferencia: "2025-01",
  caminhoArquivo: "/reports/report-1.pdf",
};

const FAKE_DADOS_EXTRAIDOS = {
  mesReferencia: "2025-01",
  ativos: [],
  eventos: [],
};

function createMockRepository(overrides?: {
  metadados?: Record<string, unknown> | null;
  dados?: Record<string, unknown> | null;
}): ReportRepository {
  const metadados =
    overrides && "metadados" in overrides
      ? overrides.metadados
      : FAKE_METADADOS;
  const dados =
    overrides && "dados" in overrides ? overrides.dados : FAKE_DADOS_EXTRAIDOS;
  return {
    obterMetadados: vi.fn().mockResolvedValue(metadados),
    obterDadosExtraidos: vi.fn().mockResolvedValue(dados),
    removerRelatorio: vi.fn(),
    salvarPdf: vi.fn(),
    salvarDadosExtraidos: vi.fn(),
    salvarMetadados: vi.fn(),
    salvarInsights: vi.fn(),
    obterInsights: vi.fn(),
    obterPdfComoBase64: vi.fn(),
    listarTodosMetadados: vi.fn(),
    listarInsightsMetadados: vi.fn(),
    removerInsights: vi.fn(),
  };
}

describe("GetReportDetailUseCase", () => {
  describe("Given a report with metadata and extracted data", () => {
    it("When executar is called, Then it returns both metadados and dados", async () => {
      const repo = createMockRepository();
      const useCase = new GetReportDetailUseCase(repo);

      const result = await useCase.executar("report-1");

      expect(result.metadados).toEqual(FAKE_METADADOS);
      expect(result.dados).toEqual(FAKE_DADOS_EXTRAIDOS);
    });
  });

  describe("Given metadata does NOT exist", () => {
    it("When executar is called, Then it throws ReportNotFoundError", async () => {
      const repo = createMockRepository({ metadados: null });
      const useCase = new GetReportDetailUseCase(repo);

      await expect(useCase.executar("missing")).rejects.toThrow(
        ReportNotFoundError,
      );
      expect(repo.obterDadosExtraidos).not.toHaveBeenCalled();
    });
  });

  describe("Given metadata exists but extracted data does NOT", () => {
    it("When executar is called, Then it throws ReportNotFoundError", async () => {
      const repo = createMockRepository({ dados: null });
      const useCase = new GetReportDetailUseCase(repo);

      await expect(useCase.executar("report-1")).rejects.toThrow(
        ReportNotFoundError,
      );
    });
  });
});
