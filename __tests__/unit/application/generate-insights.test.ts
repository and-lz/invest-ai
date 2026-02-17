import { describe, it, expect, beforeEach, vi } from "vitest";
import { GenerateInsightsUseCase } from "@/application/use-cases/generate-insights";
import type { ReportRepository } from "@/domain/interfaces/report-repository";
import type { InsightsService } from "@/domain/interfaces/extraction-service";
import type { RelatorioExtraido } from "@/schemas/report-extraction.schema";
import type { ReportMetadata } from "@/schemas/report-metadata.schema";
import type { InsightsResponse } from "@/schemas/insights.schema";
import { ReportNotFoundError } from "@/domain/errors/app-errors";

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

const criarInsightsResponse = (mesReferencia = "2024-12"): InsightsResponse => ({
  mesReferencia,
  dataGeracao: "2024-12-15",
  resumoExecutivo: "Carteira com performance positiva.",
  insights: [
    {
      titulo: "Boa performance",
      descricao: "Ativos superaram o benchmark.",
      categoria: "performance_positiva",
      prioridade: "alta",
      ativosRelacionados: ["PETR4"],
      acaoSugerida: "Manter posição.",
      impactoEstimado: "Alto",
      concluida: false,
      statusAcao: "pendente",
    },
  ],
  alertas: [],
  recomendacoesLongoPrazo: ["Diversificar mais"],
});

// ========== Mock InsightsService ==========

class MockInsightsService implements InsightsService {
  insightsParaRetornar: InsightsResponse = criarInsightsResponse();
  relatorioAtualRecebido: RelatorioExtraido | null = null;
  relatorioAnteriorRecebido: RelatorioExtraido | null | undefined = undefined;

  async gerarInsights(
    relatorioAtual: RelatorioExtraido,
    relatorioAnterior: RelatorioExtraido | null,
  ): Promise<InsightsResponse> {
    this.relatorioAtualRecebido = relatorioAtual;
    this.relatorioAnteriorRecebido = relatorioAnterior;
    return this.insightsParaRetornar;
  }

  async gerarInsightsConsolidados(): Promise<InsightsResponse> {
    return this.insightsParaRetornar;
  }
}

// ========== Mock Repository ==========

class MockReportRepository implements ReportRepository {
  dadosExtraidos: Map<string, RelatorioExtraido> = new Map();
  insightsSalvos: { identificador: string; insights: InsightsResponse } | null = null;

  async salvarPdf(): Promise<string> {
    return "";
  }

  async salvarDadosExtraidos(): Promise<string> {
    return "";
  }

  async salvarMetadados(): Promise<void> {
    return;
  }

  async salvarInsights(identificador: string, insights: InsightsResponse): Promise<void> {
    this.insightsSalvos = { identificador, insights };
  }

  async obterMetadados(): Promise<ReportMetadata | null> {
    return null;
  }

  async obterDadosExtraidos(identificador: string): Promise<RelatorioExtraido | null> {
    return this.dadosExtraidos.get(identificador) ?? null;
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

describe("GenerateInsightsUseCase", () => {
  let repository: MockReportRepository;
  let insightsService: MockInsightsService;
  let useCase: GenerateInsightsUseCase;

  beforeEach(() => {
    repository = new MockReportRepository();
    insightsService = new MockInsightsService();
    useCase = new GenerateInsightsUseCase(repository, insightsService);
  });

  describe("validação de existência do relatório", () => {
    it("deve rejeitar quando relatório atual não existe", async () => {
      await expect(
        useCase.executar({ identificadorRelatorio: "2024-12" }),
      ).rejects.toThrow(ReportNotFoundError);
    });

    it("deve incluir identificador na mensagem do erro", async () => {
      await expect(
        useCase.executar({ identificadorRelatorio: "2024-12" }),
      ).rejects.toThrow("2024-12");
    });
  });

  describe("geração sem relatório anterior", () => {
    beforeEach(() => {
      repository.dadosExtraidos.set("2024-12", criarRelatorioExtraido("2024-12"));
    });

    it("deve enviar relatório atual ao InsightsService", async () => {
      await useCase.executar({ identificadorRelatorio: "2024-12" });

      expect(insightsService.relatorioAtualRecebido).not.toBeNull();
      expect(insightsService.relatorioAtualRecebido!.metadados.mesReferencia).toBe("2024-12");
    });

    it("deve enviar null como relatório anterior quando não informado", async () => {
      await useCase.executar({ identificadorRelatorio: "2024-12" });

      expect(insightsService.relatorioAnteriorRecebido).toBeNull();
    });

    it("deve retornar insights gerados", async () => {
      const resultado = await useCase.executar({ identificadorRelatorio: "2024-12" });

      expect(resultado.mesReferencia).toBe("2024-12");
      expect(resultado.insights).toHaveLength(1);
      expect(resultado.resumoExecutivo).toBeDefined();
    });

    it("deve salvar insights no repository", async () => {
      await useCase.executar({ identificadorRelatorio: "2024-12" });

      expect(repository.insightsSalvos).not.toBeNull();
      expect(repository.insightsSalvos!.identificador).toBe("2024-12");
    });
  });

  describe("geração com relatório anterior", () => {
    beforeEach(() => {
      repository.dadosExtraidos.set("2024-11", criarRelatorioExtraido("2024-11"));
      repository.dadosExtraidos.set("2024-12", criarRelatorioExtraido("2024-12"));
    });

    it("deve buscar e enviar relatório anterior ao InsightsService", async () => {
      await useCase.executar({
        identificadorRelatorio: "2024-12",
        identificadorRelatorioAnterior: "2024-11",
      });

      expect(insightsService.relatorioAnteriorRecebido).not.toBeNull();
      expect(insightsService.relatorioAnteriorRecebido!.metadados.mesReferencia).toBe("2024-11");
    });

    it("deve enviar null se relatório anterior não for encontrado", async () => {
      await useCase.executar({
        identificadorRelatorio: "2024-12",
        identificadorRelatorioAnterior: "2024-09", // não existe
      });

      expect(insightsService.relatorioAnteriorRecebido).toBeNull();
    });
  });

  describe("propagação de erros", () => {
    beforeEach(() => {
      repository.dadosExtraidos.set("2024-12", criarRelatorioExtraido("2024-12"));
    });

    it("deve propagar erro do InsightsService", async () => {
      vi.spyOn(insightsService, "gerarInsights").mockRejectedValueOnce(
        new Error("Gemini API rate limit"),
      );

      await expect(
        useCase.executar({ identificadorRelatorio: "2024-12" }),
      ).rejects.toThrow("Gemini API rate limit");
    });

    it("deve propagar erro do salvarInsights", async () => {
      vi.spyOn(repository, "salvarInsights").mockRejectedValueOnce(
        new Error("Storage failed"),
      );

      await expect(
        useCase.executar({ identificadorRelatorio: "2024-12" }),
      ).rejects.toThrow("Storage failed");
    });
  });
});
