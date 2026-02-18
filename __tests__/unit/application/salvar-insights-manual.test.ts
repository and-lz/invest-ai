import { describe, it, expect, beforeEach, vi } from "vitest";
import { SaveManualInsightsUseCase } from "@/application/use-cases/save-manual-insights";
import type { ReportRepository } from "@/domain/interfaces/report-repository";
import type { RelatorioExtraido } from "@/schemas/report-extraction.schema";
import type { ReportMetadata } from "@/schemas/report-metadata.schema";
import type { InsightsResponse } from "@/schemas/insights.schema";
import { ValidationError, ReportNotFoundError } from "@/domain/errors/app-errors";

// ========== Test Data Factories ==========

const criarInsightsValidos = (mesReferencia = "2024-12"): InsightsResponse => ({
  mesReferencia,
  dataGeracao: "2024-12-15",
  resumoExecutivo: "Carteira apresentou performance positiva no mês.",
  insights: [
    {
      titulo: "Performance positiva em renda variável",
      descricao: "Ativos de renda variável superaram o benchmark no período.",
      categoria: "performance_positiva",
      prioridade: "alta",
      ativosRelacionados: ["PETR4", "VALE3"],
      acaoSugerida: "Manter posição atual.",
      impactoEstimado: "Alto",
      concluida: false,
      statusAcao: "pendente",
    },
  ],
  alertas: [
    {
      tipo: "atencao",
      mensagem: "Concentração acima de 30% em um único ativo.",
    },
  ],
  recomendacoesLongoPrazo: ["Diversificar em ativos internacionais"],
});

const criarMetadados = (identificador: string): ReportMetadata => ({
  identificador,
  mesReferencia: identificador,
  nomeArquivoOriginal: `relatorio-${identificador}.pdf`,
  caminhoArquivoPdf: `data/reports/${identificador}.pdf`,
  caminhoArquivoExtraido: `data/extracted/${identificador}.json`,
  caminhoArquivoInsights: null,
  dataUpload: new Date().toISOString(),
  statusExtracao: "concluido",
  origemDados: "upload-automatico",
  erroExtracao: null,
});

// ========== Mock Repository ==========

class MockReportRepository implements ReportRepository {
  metadados: Map<string, ReportMetadata> = new Map();
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

  async obterMetadados(identificador: string): Promise<ReportMetadata | null> {
    return this.metadados.get(identificador) ?? null;
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
    return Array.from(this.metadados.values());
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

describe("SaveManualInsightsUseCase", () => {
  let repository: MockReportRepository;
  let useCase: SaveManualInsightsUseCase;

  beforeEach(() => {
    repository = new MockReportRepository();
    useCase = new SaveManualInsightsUseCase(repository);
  });

  describe("validação de existência do relatório", () => {
    it("deve rejeitar quando relatório não existe", async () => {
      await expect(
        useCase.executar({
          identificadorRelatorio: "2024-12",
          jsonBruto: JSON.stringify(criarInsightsValidos()),
        }),
      ).rejects.toThrow(ReportNotFoundError);
    });

    it("deve não verificar existência para relatório consolidado", async () => {
      const jsonBruto = JSON.stringify(criarInsightsValidos());

      const resultado = await useCase.executar({
        identificadorRelatorio: "consolidado",
        jsonBruto,
      });

      expect(resultado).toBeDefined();
      expect(resultado.mesReferencia).toBe("2024-12");
    });

    it("deve aceitar quando relatório existe", async () => {
      repository.metadados.set("2024-12", criarMetadados("2024-12"));
      const jsonBruto = JSON.stringify(criarInsightsValidos());

      const resultado = await useCase.executar({
        identificadorRelatorio: "2024-12",
        jsonBruto,
      });

      expect(resultado).toBeDefined();
    });
  });

  describe("validação de JSON", () => {
    beforeEach(() => {
      repository.metadados.set("2024-12", criarMetadados("2024-12"));
    });

    it("deve rejeitar JSON inválido com ValidationError", async () => {
      await expect(
        useCase.executar({
          identificadorRelatorio: "2024-12",
          jsonBruto: "não é json {",
        }),
      ).rejects.toThrow(ValidationError);
    });

    it("deve incluir mensagem amigável para JSON inválido", async () => {
      await expect(
        useCase.executar({
          identificadorRelatorio: "2024-12",
          jsonBruto: "{malformed",
        }),
      ).rejects.toThrow("JSON invalido");
    });

    it("deve rejeitar string vazia", async () => {
      await expect(
        useCase.executar({
          identificadorRelatorio: "2024-12",
          jsonBruto: "",
        }),
      ).rejects.toThrow(ValidationError);
    });
  });

  describe("validação do schema de insights", () => {
    beforeEach(() => {
      repository.metadados.set("2024-12", criarMetadados("2024-12"));
    });

    it("deve rejeitar JSON que não corresponde ao InsightsResponseSchema", async () => {
      const jsonInvalido = JSON.stringify({ foo: "bar" });

      await expect(
        useCase.executar({
          identificadorRelatorio: "2024-12",
          jsonBruto: jsonInvalido,
        }),
      ).rejects.toThrow(ValidationError);
    });

    it("deve rejeitar insights com campos parciais", async () => {
      const jsonParcial = JSON.stringify({
        mesReferencia: "2024-12",
        // faltam campos obrigatórios
      });

      await expect(
        useCase.executar({
          identificadorRelatorio: "2024-12",
          jsonBruto: jsonParcial,
        }),
      ).rejects.toThrow(ValidationError);
    });

    it("deve incluir detalhes dos erros na mensagem", async () => {
      try {
        await useCase.executar({
          identificadorRelatorio: "2024-12",
          jsonBruto: JSON.stringify({}),
        });
        expect.unreachable("deveria ter lançado ValidationError");
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationError);
        expect((error as ValidationError).message).toContain(
          "Dados nao correspondem ao schema de insights esperado",
        );
      }
    });

    it("deve rejeitar insight com categoria inválida", async () => {
      const insightsComCategoriaInvalida = criarInsightsValidos();
      const json = JSON.parse(JSON.stringify(insightsComCategoriaInvalida));
      json.insights[0].categoria = "categoria_inexistente";

      await expect(
        useCase.executar({
          identificadorRelatorio: "2024-12",
          jsonBruto: JSON.stringify(json),
        }),
      ).rejects.toThrow(ValidationError);
    });

    it("deve rejeitar alerta com tipo inválido", async () => {
      const insightsComAlertaInvalido = criarInsightsValidos();
      const json = JSON.parse(JSON.stringify(insightsComAlertaInvalido));
      json.alertas[0].tipo = "tipo_invalido";

      await expect(
        useCase.executar({
          identificadorRelatorio: "2024-12",
          jsonBruto: JSON.stringify(json),
        }),
      ).rejects.toThrow(ValidationError);
    });
  });

  describe("persistência com dados válidos", () => {
    beforeEach(() => {
      repository.metadados.set("2024-12", criarMetadados("2024-12"));
    });

    it("deve salvar insights no repository com identificador correto", async () => {
      const jsonBruto = JSON.stringify(criarInsightsValidos());

      await useCase.executar({
        identificadorRelatorio: "2024-12",
        jsonBruto,
      });

      expect(repository.insightsSalvos).not.toBeNull();
      expect(repository.insightsSalvos!.identificador).toBe("2024-12");
    });

    it("deve retornar insights validados pelo Zod", async () => {
      const jsonBruto = JSON.stringify(criarInsightsValidos());

      const resultado = await useCase.executar({
        identificadorRelatorio: "2024-12",
        jsonBruto,
      });

      expect(resultado.mesReferencia).toBe("2024-12");
      expect(resultado.insights).toHaveLength(1);
      expect(resultado.insights[0]!.categoria).toBe("performance_positiva");
      expect(resultado.alertas).toHaveLength(1);
      expect(resultado.recomendacoesLongoPrazo).toHaveLength(1);
    });

    it("deve aplicar defaults do Zod (concluida e statusAcao)", async () => {
      const insights = criarInsightsValidos();
      const json = JSON.parse(JSON.stringify(insights));
      delete json.insights[0].concluida;
      delete json.insights[0].statusAcao;

      const resultado = await useCase.executar({
        identificadorRelatorio: "2024-12",
        jsonBruto: JSON.stringify(json),
      });

      expect(resultado.insights[0]!.concluida).toBe(false);
      expect(resultado.insights[0]!.statusAcao).toBe("pendente");
    });

    it("deve salvar insights consolidados sem verificar existência de relatório", async () => {
      const jsonBruto = JSON.stringify(criarInsightsValidos());

      await useCase.executar({
        identificadorRelatorio: "consolidado",
        jsonBruto,
      });

      expect(repository.insightsSalvos!.identificador).toBe("consolidado");
    });
  });

  describe("propagação de erros do repository", () => {
    beforeEach(() => {
      repository.metadados.set("2024-12", criarMetadados("2024-12"));
    });

    it("deve propagar erro se salvarInsights falhar", async () => {
      const jsonBruto = JSON.stringify(criarInsightsValidos());

      vi.spyOn(repository, "salvarInsights").mockRejectedValueOnce(
        new Error("Storage error"),
      );

      await expect(
        useCase.executar({
          identificadorRelatorio: "2024-12",
          jsonBruto,
        }),
      ).rejects.toThrow("Storage error");
    });
  });
});
