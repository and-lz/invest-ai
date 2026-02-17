import { describe, it, expect, beforeEach, vi } from "vitest";
import { UploadReportUseCase } from "@/application/use-cases/upload-report";
import type { ReportRepository } from "@/domain/interfaces/report-repository";
import type { ExtractionService } from "@/domain/interfaces/extraction-service";
import type { RelatorioExtraido } from "@/schemas/report-extraction.schema";
import type { ReportMetadata } from "@/schemas/report-metadata.schema";
import type { InsightsResponse } from "@/schemas/insights.schema";

// ========== Test Data Factories ==========

const criarMoney = (valorEmCentavos: number) => ({
  valorEmCentavos,
  moeda: "BRL",
});

const criarPercentual = (valor: number) => ({
  valor,
});

const criarRelatorioExtraido = (mesAno = "2024-12"): RelatorioExtraido => ({
  metadados: {
    mesReferencia: mesAno,
    dataGeracao: "2024-12-15T10:00:00Z",
    instituicao: "Inter Prime",
  },
  resumo: {
    patrimonioTotal: criarMoney(100000000),
    patrimonioMesAnterior: criarMoney(90000000),
    ganhosFinanceirosNoMes: criarMoney(100000),
    ganhosFinanceirosMesAnterior: criarMoney(90000),
    aplicacoesNoMes: criarMoney(50000),
    resgatesNoMes: criarMoney(20000),
    eventosFinanceirosNoMes: criarMoney(10000),
    eventosFinanceirosMesAnterior: criarMoney(5000),
    rentabilidadeMensal: criarPercentual(1.5),
    rentabilidadeMensalAnterior: criarPercentual(1.2),
    rentabilidadeAnual: criarPercentual(15.3),
    rentabilidadeAnoAnterior: criarPercentual(12.1),
    rentabilidadeDesdeInicio: criarPercentual(45.8),
    dataInicioCarteira: "2020-01-01",
  },
  evolucaoAlocacao: [],
  evolucaoPatrimonial: [],
  comparacaoPeriodos: [],
  analiseRiscoRetorno: {
    mesesAcimaBenchmark: 8,
    mesesAbaixoBenchmark: 2,
    maiorRentabilidade: { valor: criarPercentual(3.5), mesAno: "2024-03" },
    menorRentabilidade: { valor: criarPercentual(-1.2), mesAno: "2024-02" },
  },
  retornosMensais: [],
  comparacaoBenchmarks: [],
  rentabilidadePorCategoria: [],
  eventosFinanceiros: [],
  ganhosPorEstrategia: [],
  faixasLiquidez: [],
  posicoesDetalhadas: [],
  movimentacoes: [],
});

// ========== Mock ExtractionService ==========

class MockExtractionService implements ExtractionService {
  relatorioParaRetornar: RelatorioExtraido = criarRelatorioExtraido();
  base64Recebido: string | null = null;

  async extrairDadosDoRelatorio(pdfBase64: string): Promise<RelatorioExtraido> {
    this.base64Recebido = pdfBase64;
    return this.relatorioParaRetornar;
  }
}

// ========== Mock Repository ==========

class MockReportRepository implements ReportRepository {
  metadadosSalvos: ReportMetadata | null = null;
  pdfSalvo: { identificador: string; buffer: Buffer } | null = null;
  dadosSalvos: { identificador: string; dados: RelatorioExtraido } | null = null;

  async salvarPdf(identificador: string, pdfBuffer: Buffer): Promise<string> {
    this.pdfSalvo = { identificador, buffer: pdfBuffer };
    return `data/reports/${identificador}.pdf`;
  }

  async salvarDadosExtraidos(identificador: string, dados: RelatorioExtraido): Promise<string> {
    this.dadosSalvos = { identificador, dados };
    return `data/extracted/${identificador}.json`;
  }

  async salvarMetadados(metadados: ReportMetadata): Promise<void> {
    this.metadadosSalvos = metadados;
  }

  async salvarInsights(): Promise<void> {
    return;
  }

  async obterMetadados(): Promise<ReportMetadata | null> {
    return null;
  }

  async obterDadosExtraidos(): Promise<RelatorioExtraido | null> {
    return null;
  }

  async obterInsights(): Promise<InsightsResponse | null> {
    return null;
  }

  async obterPdfComoBase64(): Promise<string> {
    return "";
  }

  async listarTodosMetadados(): Promise<ReportMetadata[]> {
    return [];
  }

  async removerRelatorio(): Promise<void> {
    return;
  }

  async listarInsightsMetadados() {
    return [];
  }

  async removerInsights(): Promise<void> {
    return;
  }
}

// ========== Tests ==========

describe("UploadReportUseCase", () => {
  let repository: MockReportRepository;
  let extractionService: MockExtractionService;
  let useCase: UploadReportUseCase;

  const pdfBuffer = Buffer.from("fake-pdf-content");

  beforeEach(() => {
    repository = new MockReportRepository();
    extractionService = new MockExtractionService();
    useCase = new UploadReportUseCase(repository, extractionService);
  });

  describe("extração de dados", () => {
    it("deve converter PDF buffer para base64 e enviar ao ExtractionService", async () => {
      await useCase.executar({
        nomeArquivoOriginal: "relatorio.pdf",
        pdfBuffer,
      });

      expect(extractionService.base64Recebido).toBe(pdfBuffer.toString("base64"));
    });

    it("deve usar mesReferencia extraído como identificador", async () => {
      extractionService.relatorioParaRetornar = criarRelatorioExtraido("2025-01");

      const resultado = await useCase.executar({
        nomeArquivoOriginal: "relatorio.pdf",
        pdfBuffer,
      });

      expect(resultado.metadados.identificador).toBe("2025-01");
      expect(resultado.metadados.mesReferencia).toBe("2025-01");
    });
  });

  describe("persistência", () => {
    it("deve salvar PDF com identificador extraído", async () => {
      await useCase.executar({
        nomeArquivoOriginal: "relatorio.pdf",
        pdfBuffer,
      });

      expect(repository.pdfSalvo).not.toBeNull();
      expect(repository.pdfSalvo!.identificador).toBe("2024-12");
      expect(repository.pdfSalvo!.buffer).toBe(pdfBuffer);
    });

    it("deve salvar dados extraídos com identificador correto", async () => {
      await useCase.executar({
        nomeArquivoOriginal: "relatorio.pdf",
        pdfBuffer,
      });

      expect(repository.dadosSalvos).not.toBeNull();
      expect(repository.dadosSalvos!.identificador).toBe("2024-12");
    });

    it("deve salvar metadados completos", async () => {
      await useCase.executar({
        nomeArquivoOriginal: "meu-relatorio.pdf",
        pdfBuffer,
      });

      const metadados = repository.metadadosSalvos!;
      expect(metadados).not.toBeNull();
      expect(metadados.nomeArquivoOriginal).toBe("meu-relatorio.pdf");
      expect(metadados.statusExtracao).toBe("concluido");
      expect(metadados.origemDados).toBe("upload-automatico");
      expect(metadados.erroExtracao).toBeNull();
      expect(metadados.caminhoArquivoInsights).toBeNull();
    });

    it("deve preencher caminhoArquivoPdf e caminhoArquivoExtraido", async () => {
      await useCase.executar({
        nomeArquivoOriginal: "relatorio.pdf",
        pdfBuffer,
      });

      const metadados = repository.metadadosSalvos!;
      expect(metadados.caminhoArquivoPdf).toBe("data/reports/2024-12.pdf");
      expect(metadados.caminhoArquivoExtraido).toBe("data/extracted/2024-12.json");
    });
  });

  describe("retorno", () => {
    it("deve retornar metadados e dados extraídos", async () => {
      const resultado = await useCase.executar({
        nomeArquivoOriginal: "relatorio.pdf",
        pdfBuffer,
      });

      expect(resultado.metadados).toBeDefined();
      expect(resultado.dadosExtraidos).toBeDefined();
      expect(resultado.dadosExtraidos.metadados.mesReferencia).toBe("2024-12");
    });

    it("deve incluir dataUpload no formato ISO", async () => {
      const resultado = await useCase.executar({
        nomeArquivoOriginal: "relatorio.pdf",
        pdfBuffer,
      });

      expect(resultado.metadados.dataUpload).toMatch(
        /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/,
      );
    });
  });

  describe("propagação de erros", () => {
    it("deve propagar erro do ExtractionService", async () => {
      vi.spyOn(extractionService, "extrairDadosDoRelatorio").mockRejectedValueOnce(
        new Error("Gemini API timeout"),
      );

      await expect(
        useCase.executar({
          nomeArquivoOriginal: "relatorio.pdf",
          pdfBuffer,
        }),
      ).rejects.toThrow("Gemini API timeout");
    });

    it("deve propagar erro do salvarPdf", async () => {
      vi.spyOn(repository, "salvarPdf").mockRejectedValueOnce(
        new Error("Disk full"),
      );

      await expect(
        useCase.executar({
          nomeArquivoOriginal: "relatorio.pdf",
          pdfBuffer,
        }),
      ).rejects.toThrow("Disk full");
    });

    it("deve propagar erro do salvarMetadados", async () => {
      vi.spyOn(repository, "salvarMetadados").mockRejectedValueOnce(
        new Error("Write failed"),
      );

      await expect(
        useCase.executar({
          nomeArquivoOriginal: "relatorio.pdf",
          pdfBuffer,
        }),
      ).rejects.toThrow("Write failed");
    });
  });
});
