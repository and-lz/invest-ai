import { describe, it, expect, beforeEach, vi } from "vitest";
import { SalvarRelatorioManualUseCase } from "@/application/use-cases/salvar-relatorio-manual";
import type { ReportRepository } from "@/domain/interfaces/report-repository";
import type { RelatorioExtraido } from "@/schemas/report-extraction.schema";
import type { ReportMetadata } from "@/schemas/report-metadata.schema";
import type { InsightsResponse } from "@/schemas/insights.schema";
import { ValidationError } from "@/domain/errors/app-errors";

// ========== Test Data Factories ==========

const criarMoney = (valorEmCentavos: number) => ({
  valorEmCentavos,
  moeda: "BRL",
});

const criarPercentual = (valor: number) => ({
  valor,
});

const criarRelatorioExtraidoValido = (mesAno = "2024-12"): RelatorioExtraido => ({
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

// ========== Mock Repository ==========

class MockReportRepository implements ReportRepository {
  metadadosSalvos: ReportMetadata | null = null;
  dadosSalvos: { identificador: string; dados: RelatorioExtraido } | null = null;

  async salvarPdf(): Promise<string> {
    return "data/reports/test.pdf";
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
}

// ========== Tests ==========

describe("SalvarRelatorioManualUseCase", () => {
  let repository: MockReportRepository;
  let useCase: SalvarRelatorioManualUseCase;

  beforeEach(() => {
    repository = new MockReportRepository();
    useCase = new SalvarRelatorioManualUseCase(repository);
  });

  describe("validação de JSON", () => {
    it("deve rejeitar JSON inválido com ValidationError", async () => {
      await expect(
        useCase.executar({ jsonBruto: "isso não é json {" }),
      ).rejects.toThrow(ValidationError);
    });

    it("deve incluir mensagem amigável para JSON inválido", async () => {
      await expect(
        useCase.executar({ jsonBruto: "{malformed" }),
      ).rejects.toThrow("JSON invalido");
    });

    it("deve rejeitar string vazia", async () => {
      await expect(
        useCase.executar({ jsonBruto: "" }),
      ).rejects.toThrow(ValidationError);
    });
  });

  describe("validação do schema Zod", () => {
    it("deve rejeitar JSON válido que não corresponde ao schema", async () => {
      const jsonSemCampos = JSON.stringify({ foo: "bar" });

      await expect(
        useCase.executar({ jsonBruto: jsonSemCampos }),
      ).rejects.toThrow(ValidationError);
    });

    it("deve rejeitar JSON com campos parciais do schema", async () => {
      const jsonParcial = JSON.stringify({
        metadados: { mesReferencia: "2024-12" },
        // faltam todos os outros campos obrigatórios
      });

      await expect(
        useCase.executar({ jsonBruto: jsonParcial }),
      ).rejects.toThrow(ValidationError);
    });

    it("deve incluir detalhes dos erros de validação na mensagem", async () => {
      const jsonParcial = JSON.stringify({ metadados: {} });

      try {
        await useCase.executar({ jsonBruto: jsonParcial });
        expect.unreachable("deveria ter lançado ValidationError");
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationError);
        expect((error as ValidationError).message).toContain(
          "Dados nao correspondem ao schema esperado",
        );
      }
    });

    it("deve limitar erros de validação a no máximo 10", async () => {
      // Um objeto vazio vai gerar muitos erros de validação
      const jsonVazio = JSON.stringify({});

      try {
        await useCase.executar({ jsonBruto: jsonVazio });
        expect.unreachable("deveria ter lançado ValidationError");
      } catch (error) {
        const mensagem = (error as ValidationError).message;
        const linhasDeErro = mensagem.split("\n").filter((l) => l.startsWith("- "));
        expect(linhasDeErro.length).toBeLessThanOrEqual(10);
      }
    });
  });

  describe("persistência com dados válidos", () => {
    it("deve salvar dados extraídos e metadados no repository", async () => {
      const dadosValidos = criarRelatorioExtraidoValido("2024-12");
      const jsonBruto = JSON.stringify(dadosValidos);

      await useCase.executar({ jsonBruto });

      expect(repository.dadosSalvos).not.toBeNull();
      expect(repository.dadosSalvos!.identificador).toBe("2024-12");
      expect(repository.metadadosSalvos).not.toBeNull();
    });

    it("deve usar mesReferencia como identificador", async () => {
      const dadosValidos = criarRelatorioExtraidoValido("2025-01");
      const jsonBruto = JSON.stringify(dadosValidos);

      const resultado = await useCase.executar({ jsonBruto });

      expect(resultado.metadados.identificador).toBe("2025-01");
      expect(resultado.metadados.mesReferencia).toBe("2025-01");
    });

    it("deve retornar metadados com origemDados importacao-manual", async () => {
      const dadosValidos = criarRelatorioExtraidoValido();
      const jsonBruto = JSON.stringify(dadosValidos);

      const resultado = await useCase.executar({ jsonBruto });

      expect(resultado.metadados.origemDados).toBe("importacao-manual");
    });

    it("deve retornar metadados com caminhoArquivoPdf null", async () => {
      const dadosValidos = criarRelatorioExtraidoValido();
      const jsonBruto = JSON.stringify(dadosValidos);

      const resultado = await useCase.executar({ jsonBruto });

      expect(resultado.metadados.caminhoArquivoPdf).toBeNull();
    });

    it("deve retornar metadados com statusExtracao concluido", async () => {
      const dadosValidos = criarRelatorioExtraidoValido();
      const jsonBruto = JSON.stringify(dadosValidos);

      const resultado = await useCase.executar({ jsonBruto });

      expect(resultado.metadados.statusExtracao).toBe("concluido");
    });

    it("deve retornar metadados com nomeArquivoOriginal no formato manual-{id}.json", async () => {
      const dadosValidos = criarRelatorioExtraidoValido("2024-11");
      const jsonBruto = JSON.stringify(dadosValidos);

      const resultado = await useCase.executar({ jsonBruto });

      expect(resultado.metadados.nomeArquivoOriginal).toBe("manual-2024-11.json");
    });

    it("deve retornar os dados extraídos validados pelo Zod", async () => {
      const dadosValidos = criarRelatorioExtraidoValido("2024-12");
      const jsonBruto = JSON.stringify(dadosValidos);

      const resultado = await useCase.executar({ jsonBruto });

      expect(resultado.dadosExtraidos.metadados.mesReferencia).toBe("2024-12");
      expect(resultado.dadosExtraidos.resumo.patrimonioTotal.valorEmCentavos).toBe(100000000);
    });

    it("deve aplicar defaults do Zod (ex: moeda BRL)", async () => {
      const dadosValidos = criarRelatorioExtraidoValido();
      // Remove a moeda para testar o default
      const json = JSON.parse(JSON.stringify(dadosValidos));
      delete json.resumo.patrimonioTotal.moeda;
      const jsonBruto = JSON.stringify(json);

      const resultado = await useCase.executar({ jsonBruto });

      expect(resultado.dadosExtraidos.resumo.patrimonioTotal.moeda).toBe("BRL");
    });
  });

  describe("propagação de erros do repository", () => {
    it("deve propagar erro se salvarDadosExtraidos falhar", async () => {
      const dadosValidos = criarRelatorioExtraidoValido();
      const jsonBruto = JSON.stringify(dadosValidos);

      vi.spyOn(repository, "salvarDadosExtraidos").mockRejectedValueOnce(
        new Error("Disk full"),
      );

      await expect(useCase.executar({ jsonBruto })).rejects.toThrow("Disk full");
    });

    it("deve propagar erro se salvarMetadados falhar", async () => {
      const dadosValidos = criarRelatorioExtraidoValido();
      const jsonBruto = JSON.stringify(dadosValidos);

      vi.spyOn(repository, "salvarMetadados").mockRejectedValueOnce(
        new Error("Write failed"),
      );

      await expect(useCase.executar({ jsonBruto })).rejects.toThrow("Write failed");
    });
  });
});
