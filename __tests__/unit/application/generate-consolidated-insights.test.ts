import { describe, it, expect, vi, beforeEach } from "vitest";
import { GenerateConsolidatedInsightsUseCase } from "@/application/use-cases/generate-consolidated-insights";
import type { ReportRepository } from "@/domain/interfaces/report-repository";
import type { InsightsService } from "@/domain/interfaces/extraction-service";
import type { InsightsResponse } from "@/schemas/insights.schema";

// ========== Test Data Factories ==========

function createFakeExtractedData(mesReferencia: string) {
  return {
    metadados: {
      mesReferencia,
      dataGeracao: new Date().toISOString(),
      instituicao: "Inter Prime",
    },
    posicoesDetalhadas: [],
    movimentacoes: [],
    eventosFinanceiros: [],
    comparacaoBenchmarks: [],
    resumo: {
      patrimonioTotal: { valorEmCentavos: 100000000, moeda: "BRL" },
      patrimonioMesAnterior: null,
      ganhosFinanceirosNoMes: { valorEmCentavos: 0, moeda: "BRL" },
      ganhosFinanceirosMesAnterior: { valorEmCentavos: 0, moeda: "BRL" },
      aplicacoesNoMes: { valorEmCentavos: 0, moeda: "BRL" },
      resgatesNoMes: { valorEmCentavos: 0, moeda: "BRL" },
      eventosFinanceirosNoMes: { valorEmCentavos: 0, moeda: "BRL" },
      eventosFinanceirosMesAnterior: { valorEmCentavos: 0, moeda: "BRL" },
      rentabilidadeMensal: { valor: 0 },
      rentabilidadeMensalAnterior: { valor: 0 },
      rentabilidadeAnual: { valor: 0 },
      rentabilidadeAnoAnterior: { valor: 0 },
      rentabilidadeDesdeInicio: { valor: 0 },
      dataInicioCarteira: "2020-01-01",
    },
    evolucaoAlocacao: [],
    evolucaoPatrimonial: [],
    comparacaoPeriodos: [],
    analiseRiscoRetorno: {
      mesesAcimaBenchmark: 0,
      mesesAbaixoBenchmark: 0,
      maiorRentabilidade: { valor: { valor: 0 }, mesAno: mesReferencia },
      menorRentabilidade: { valor: { valor: 0 }, mesAno: mesReferencia },
    },
    retornosMensais: [],
    rentabilidadePorCategoria: [],
    ganhosPorEstrategia: [],
    faixasLiquidez: [],
  };
}

function createFakeMetadados(identificador: string, mesReferencia: string) {
  return {
    identificador,
    mesReferencia,
    nomeArquivoOriginal: `report-${mesReferencia}.pdf`,
    caminhoArquivoPdf: `data/reports/${identificador}.pdf`,
    caminhoArquivoExtraido: `data/extracted/${identificador}.json`,
    caminhoArquivoInsights: null,
    dataUpload: new Date().toISOString(),
    statusExtracao: "concluido" as const,
    origemDados: "upload-automatico" as const,
    erroExtracao: null,
  };
}

function createFakeInsightsResponse(mesReferencia: string): InsightsResponse {
  return {
    mesReferencia,
    dataGeracao: "2025-02-01",
    resumoExecutivo: "Consolidated portfolio analysis.",
    insights: [
      {
        titulo: "Consolidated insight",
        descricao: "An insight spanning multiple months.",
        categoria: "performance_positiva",
        prioridade: "alta",
        ativosRelacionados: [],
        acaoSugerida: "Keep current allocation",
        impactoEstimado: null,
        concluida: false,
        statusAcao: "pendente",
      },
    ],
    alertas: [],
    recomendacoesLongoPrazo: [],
  };
}

// ========== Mock Repository & Service ==========

function createMockRepository(): ReportRepository {
  return {
    listarTodosMetadados: vi.fn().mockResolvedValue([]),
    obterDadosExtraidos: vi.fn().mockResolvedValue(null),
    obterMetadados: vi.fn(),
    obterInsights: vi.fn(),
    obterPdfComoBase64: vi.fn(),
    salvarPdf: vi.fn(),
    salvarDadosExtraidos: vi.fn(),
    salvarMetadados: vi.fn(),
    salvarInsights: vi.fn().mockResolvedValue(undefined),
    listarInsightsMetadados: vi.fn(),
    removerRelatorio: vi.fn(),
    removerInsights: vi.fn(),
  };
}

function createMockInsightsService(): InsightsService {
  return {
    gerarInsights: vi.fn(),
    gerarInsightsConsolidados: vi.fn(),
  };
}

// ========== Tests ==========

describe("GenerateConsolidatedInsightsUseCase", () => {
  let repository: ReportRepository;
  let insightsService: InsightsService;
  let useCase: GenerateConsolidatedInsightsUseCase;

  beforeEach(() => {
    vi.clearAllMocks();
    repository = createMockRepository();
    insightsService = createMockInsightsService();
    useCase = new GenerateConsolidatedInsightsUseCase(repository, insightsService);
  });

  describe("Given no reports exist", () => {
    it("When executar is called, Then it throws an error about no reports", async () => {
      // Given
      vi.mocked(repository.listarTodosMetadados).mockResolvedValue([]);

      // When / Then
      await expect(useCase.executar()).rejects.toThrow(
        "Nenhum relatório disponível para gerar insights consolidados",
      );
    });

    it("When executar fails, Then the insights service is never called", async () => {
      // Given
      vi.mocked(repository.listarTodosMetadados).mockResolvedValue([]);

      // When
      try {
        await useCase.executar();
      } catch {
        // expected
      }

      // Then
      expect(insightsService.gerarInsightsConsolidados).not.toHaveBeenCalled();
    });
  });

  describe("Given reports exist but none have extracted data", () => {
    it("When executar is called, Then it throws an error about no extracted data", async () => {
      // Given
      vi.mocked(repository.listarTodosMetadados).mockResolvedValue([
        createFakeMetadados("report-1", "2025-01"),
        createFakeMetadados("report-2", "2025-02"),
      ]);
      vi.mocked(repository.obterDadosExtraidos).mockResolvedValue(null);

      // When / Then
      await expect(useCase.executar()).rejects.toThrow(
        "Nenhum relatório com dados extraídos disponível",
      );
    });
  });

  describe("Given multiple reports with extracted data", () => {
    const dataJan = createFakeExtractedData("2025-01");
    const dataMar = createFakeExtractedData("2025-03");
    const dataFeb = createFakeExtractedData("2025-02");

    beforeEach(() => {
      vi.mocked(repository.listarTodosMetadados).mockResolvedValue([
        createFakeMetadados("report-mar", "2025-03"),
        createFakeMetadados("report-jan", "2025-01"),
        createFakeMetadados("report-feb", "2025-02"),
      ]);

      vi.mocked(repository.obterDadosExtraidos).mockImplementation(
        async (identificador: string) => {
          if (identificador === "report-jan") return dataJan;
          if (identificador === "report-feb") return dataFeb;
          if (identificador === "report-mar") return dataMar;
          return null;
        },
      );

      const fakeInsights = createFakeInsightsResponse("consolidado");
      vi.mocked(insightsService.gerarInsightsConsolidados).mockResolvedValue(fakeInsights);
    });

    it("When executar is called, Then reports are sorted chronologically (oldest first)", async () => {
      // When
      await useCase.executar();

      // Then
      const calledWith = vi.mocked(insightsService.gerarInsightsConsolidados).mock.calls[0]![0];
      const months = calledWith.map((r: { metadados: { mesReferencia: string } }) => r.metadados.mesReferencia);
      expect(months).toEqual(["2025-01", "2025-02", "2025-03"]);
    });

    it("When executar is called, Then insights are saved with 'consolidado' identifier", async () => {
      // When
      const result = await useCase.executar();

      // Then
      expect(repository.salvarInsights).toHaveBeenCalledOnce();
      expect(repository.salvarInsights).toHaveBeenCalledWith("consolidado", result);
    });

    it("When executar completes, Then it returns the generated insights", async () => {
      // When
      const result = await useCase.executar();

      // Then
      expect(result.mesReferencia).toBe("consolidado");
      expect(result.insights).toHaveLength(1);
      expect(result.insights[0]!.titulo).toBe("Consolidated insight");
    });
  });

  describe("Given some reports have extracted data and others do not", () => {
    it("When executar is called, Then only reports with data are sent to the service", async () => {
      // Given
      vi.mocked(repository.listarTodosMetadados).mockResolvedValue([
        createFakeMetadados("report-1", "2025-01"),
        createFakeMetadados("report-2", "2025-02"),
        createFakeMetadados("report-3", "2025-03"),
      ]);

      const dataJan = createFakeExtractedData("2025-01");
      const dataMar = createFakeExtractedData("2025-03");

      vi.mocked(repository.obterDadosExtraidos).mockImplementation(
        async (identificador: string) => {
          if (identificador === "report-1") return dataJan;
          if (identificador === "report-3") return dataMar;
          return null; // report-2 has no extracted data
        },
      );

      const fakeInsights = createFakeInsightsResponse("consolidado");
      vi.mocked(insightsService.gerarInsightsConsolidados).mockResolvedValue(fakeInsights);

      // When
      await useCase.executar();

      // Then
      const calledWith = vi.mocked(insightsService.gerarInsightsConsolidados).mock.calls[0]![0];
      expect(calledWith).toHaveLength(2);
      const months = calledWith.map((r: { metadados: { mesReferencia: string } }) => r.metadados.mesReferencia);
      expect(months).toEqual(["2025-01", "2025-03"]);
    });
  });
});
