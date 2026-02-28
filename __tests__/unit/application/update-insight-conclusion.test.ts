import { describe, it, expect, vi, beforeEach } from "vitest";
import { UpdateInsightConclusionUseCase } from "@/application/use-cases/update-insight-conclusion";
import type { ReportRepository } from "@/domain/interfaces/report-repository";
import { ReportNotFoundError } from "@/domain/errors/app-errors";
import type { InsightsResponse } from "@/schemas/insights.schema";

// ========== Test Data Factories ==========

function createInsightsResponse(overrides?: Partial<InsightsResponse>): InsightsResponse {
  return {
    mesReferencia: "2025-01",
    dataGeracao: "2025-01-15",
    resumoExecutivo: "Portfolio is performing well overall.",
    insights: [
      {
        titulo: "Strong equity performance",
        descricao: "Equities outperformed benchmarks this month.",
        categoria: "performance_positiva",
        prioridade: "alta",
        ativosRelacionados: ["PETR4", "VALE3"],
        acaoSugerida: "Maintain current allocation",
        impactoEstimado: "Potential 2% uplift",
        concluida: false,
        statusAcao: "pendente",
      },
      {
        titulo: "High concentration risk",
        descricao: "Over 40% in a single strategy.",
        categoria: "risco",
        prioridade: "media",
        ativosRelacionados: [],
        acaoSugerida: "Diversify across strategies",
        impactoEstimado: null,
        concluida: false,
        statusAcao: "pendente",
      },
      {
        titulo: "Dividend income opportunity",
        descricao: "Several assets paying dividends next month.",
        categoria: "oportunidade",
        prioridade: "baixa",
        ativosRelacionados: ["BBAS3"],
        acaoSugerida: null,
        impactoEstimado: null,
        concluida: false,
        statusAcao: "pendente",
      },
    ],
    alertas: [],
    recomendacoesLongoPrazo: ["Increase fixed income allocation"],
    ...overrides,
  };
}

function createFakeMetadados(identificador: string) {
  return {
    identificador,
    mesReferencia: "2025-01",
    nomeArquivoOriginal: "report.pdf",
    caminhoArquivoPdf: `data/reports/${identificador}.pdf`,
    caminhoArquivoExtraido: `data/extracted/${identificador}.json`,
    caminhoArquivoInsights: `data/insights/${identificador}.json`,
    dataUpload: new Date().toISOString(),
    statusExtracao: "concluido" as const,
    origemDados: "upload-automatico" as const,
    erroExtracao: null,
  };
}

// ========== Mock Repository ==========

function createMockRepository(): ReportRepository {
  return {
    obterMetadados: vi.fn(),
    obterInsights: vi.fn(),
    salvarInsights: vi.fn().mockResolvedValue(undefined),
    obterDadosExtraidos: vi.fn(),
    obterPdfComoBase64: vi.fn(),
    salvarPdf: vi.fn(),
    salvarDadosExtraidos: vi.fn(),
    salvarMetadados: vi.fn(),
    listarTodosMetadados: vi.fn(),
    listarInsightsMetadados: vi.fn(),
    removerRelatorio: vi.fn(),
    removerInsights: vi.fn(),
  };
}

// ========== Tests ==========

describe("UpdateInsightConclusionUseCase", () => {
  let repository: ReportRepository;
  let useCase: UpdateInsightConclusionUseCase;

  beforeEach(() => {
    vi.clearAllMocks();
    repository = createMockRepository();
    useCase = new UpdateInsightConclusionUseCase(repository);
  });

  describe("Given the report does not exist", () => {
    it("When executar is called, Then it throws ReportNotFoundError", async () => {
      // Given
      vi.mocked(repository.obterMetadados).mockResolvedValue(null);

      // When / Then
      await expect(
        useCase.executar({
          identificadorRelatorio: "non-existent-report",
          indiceInsight: 0,
          statusAcao: "concluida",
        }),
      ).rejects.toThrow(ReportNotFoundError);
    });
  });

  describe("Given the report exists but has no insights", () => {
    it("When executar is called, Then it throws ReportNotFoundError", async () => {
      // Given
      vi.mocked(repository.obterMetadados).mockResolvedValue(
        createFakeMetadados("report-1"),
      );
      vi.mocked(repository.obterInsights).mockResolvedValue(null);

      // When / Then
      await expect(
        useCase.executar({
          identificadorRelatorio: "report-1",
          indiceInsight: 0,
          statusAcao: "concluida",
        }),
      ).rejects.toThrow(ReportNotFoundError);
    });
  });

  describe("Given an invalid insight index", () => {
    it("When index is negative, Then it throws an Error", async () => {
      // Given
      vi.mocked(repository.obterMetadados).mockResolvedValue(
        createFakeMetadados("report-1"),
      );
      vi.mocked(repository.obterInsights).mockResolvedValue(
        createInsightsResponse(),
      );

      // When / Then
      await expect(
        useCase.executar({
          identificadorRelatorio: "report-1",
          indiceInsight: -1,
          statusAcao: "concluida",
        }),
      ).rejects.toThrow("Índice de insight inválido: -1");
    });

    it("When index exceeds insights array length, Then it throws an Error", async () => {
      // Given
      vi.mocked(repository.obterMetadados).mockResolvedValue(
        createFakeMetadados("report-1"),
      );
      vi.mocked(repository.obterInsights).mockResolvedValue(
        createInsightsResponse(),
      );

      // When / Then
      await expect(
        useCase.executar({
          identificadorRelatorio: "report-1",
          indiceInsight: 3, // only 3 insights (indices 0-2)
          statusAcao: "concluida",
        }),
      ).rejects.toThrow("Índice de insight inválido: 3");
    });
  });

  describe("Given a valid report with insights and statusAcao='concluida'", () => {
    it("When executar is called, Then the target insight is marked as concluida", async () => {
      // Given
      const insights = createInsightsResponse();
      vi.mocked(repository.obterMetadados).mockResolvedValue(
        createFakeMetadados("report-1"),
      );
      vi.mocked(repository.obterInsights).mockResolvedValue(insights);

      // When
      const result = await useCase.executar({
        identificadorRelatorio: "report-1",
        indiceInsight: 0,
        statusAcao: "concluida",
      });

      // Then
      expect(result.insights[0]!.statusAcao).toBe("concluida");
      expect(result.insights[0]!.concluida).toBe(true);
    });

    it("When executar is called, Then other insights remain unchanged", async () => {
      // Given
      const insights = createInsightsResponse();
      vi.mocked(repository.obterMetadados).mockResolvedValue(
        createFakeMetadados("report-1"),
      );
      vi.mocked(repository.obterInsights).mockResolvedValue(insights);

      // When
      const result = await useCase.executar({
        identificadorRelatorio: "report-1",
        indiceInsight: 0,
        statusAcao: "concluida",
      });

      // Then
      expect(result.insights[1]!.statusAcao).toBe("pendente");
      expect(result.insights[1]!.concluida).toBe(false);
      expect(result.insights[2]!.statusAcao).toBe("pendente");
      expect(result.insights[2]!.concluida).toBe(false);
    });

    it("When executar completes, Then it saves the updated insights to the repository", async () => {
      // Given
      const insights = createInsightsResponse();
      vi.mocked(repository.obterMetadados).mockResolvedValue(
        createFakeMetadados("report-1"),
      );
      vi.mocked(repository.obterInsights).mockResolvedValue(insights);

      // When
      const result = await useCase.executar({
        identificadorRelatorio: "report-1",
        indiceInsight: 0,
        statusAcao: "concluida",
      });

      // Then
      expect(repository.salvarInsights).toHaveBeenCalledOnce();
      expect(repository.salvarInsights).toHaveBeenCalledWith("report-1", result);
    });
  });

  describe("Given backward-compatible concluida=true (deprecated field)", () => {
    it("When concluida=true is passed without statusAcao, Then it derives statusAcao='concluida'", async () => {
      // Given
      const insights = createInsightsResponse();
      vi.mocked(repository.obterMetadados).mockResolvedValue(
        createFakeMetadados("report-1"),
      );
      vi.mocked(repository.obterInsights).mockResolvedValue(insights);

      // When
      const result = await useCase.executar({
        identificadorRelatorio: "report-1",
        indiceInsight: 1,
        concluida: true,
      });

      // Then
      expect(result.insights[1]!.statusAcao).toBe("concluida");
      expect(result.insights[1]!.concluida).toBe(true);
    });

    it("When concluida=false is passed without statusAcao, Then it derives statusAcao='pendente'", async () => {
      // Given
      const insights = createInsightsResponse();
      vi.mocked(repository.obterMetadados).mockResolvedValue(
        createFakeMetadados("report-1"),
      );
      vi.mocked(repository.obterInsights).mockResolvedValue(insights);

      // When
      const result = await useCase.executar({
        identificadorRelatorio: "report-1",
        indiceInsight: 1,
        concluida: false,
      });

      // Then
      expect(result.insights[1]!.statusAcao).toBe("pendente");
      expect(result.insights[1]!.concluida).toBe(false);
    });
  });

  describe("Given statusAcao='ignorada' (dismissed state)", () => {
    it("When executar is called, Then the insight is marked as ignorada with concluida=false", async () => {
      // Given
      const insights = createInsightsResponse();
      vi.mocked(repository.obterMetadados).mockResolvedValue(
        createFakeMetadados("report-1"),
      );
      vi.mocked(repository.obterInsights).mockResolvedValue(insights);

      // When
      const result = await useCase.executar({
        identificadorRelatorio: "report-1",
        indiceInsight: 2,
        statusAcao: "ignorada",
      });

      // Then
      expect(result.insights[2]!.statusAcao).toBe("ignorada");
      expect(result.insights[2]!.concluida).toBe(false);
    });
  });

  describe("Given statusAcao takes precedence over concluida", () => {
    it("When both statusAcao='pendente' and concluida=true are passed, Then statusAcao wins", async () => {
      // Given
      const insights = createInsightsResponse();
      vi.mocked(repository.obterMetadados).mockResolvedValue(
        createFakeMetadados("report-1"),
      );
      vi.mocked(repository.obterInsights).mockResolvedValue(insights);

      // When
      const result = await useCase.executar({
        identificadorRelatorio: "report-1",
        indiceInsight: 0,
        statusAcao: "pendente",
        concluida: true,
      });

      // Then
      expect(result.insights[0]!.statusAcao).toBe("pendente");
      expect(result.insights[0]!.concluida).toBe(false);
    });
  });
});
