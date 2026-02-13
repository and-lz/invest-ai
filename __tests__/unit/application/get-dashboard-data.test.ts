import { describe, it, expect, beforeEach } from "vitest";
import { GetDashboardDataUseCase } from "@/application/use-cases/get-dashboard-data";
import type { ReportRepository } from "@/domain/interfaces/report-repository";
import type { RelatorioExtraido, PosicaoAtivo } from "@/schemas/report-extraction.schema";
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

const criarResumo = (patrimonioTotal: number, patrimonioMesAnterior?: number | null) => ({
  patrimonioTotal: criarMoney(patrimonioTotal),
  patrimonioMesAnterior: patrimonioMesAnterior ? criarMoney(patrimonioMesAnterior) : null,
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
});

const criarPosicaoAtivo = (
  nomeAtivo: string,
  rentabilidadeMes: number,
  saldoBruto: number
): PosicaoAtivo => ({
  nomeAtivo,
  codigoAtivo: `${nomeAtivo.substring(0, 4).toUpperCase()}11`,
  estrategia: "Estrategia 1",
  saldoAnterior: criarMoney(saldoBruto - 10000),
  aplicacoes: criarMoney(5000),
  resgates: criarMoney(0),
  eventosFinanceiros: criarMoney(2000),
  saldoBruto: criarMoney(saldoBruto),
  rentabilidadeMes: criarPercentual(rentabilidadeMes),
  rentabilidade12Meses: criarPercentual(rentabilidadeMes * 10),
  rentabilidadeDesdeInicio: criarPercentual(rentabilidadeMes * 20),
  participacaoNaCarteira: criarPercentual(100 / 10),
});

const criarRelatorioExtraido = (mesAno: string, patrimonioTotal: number, patrimonioMesAnterior?: number | null): RelatorioExtraido => ({
  metadados: {
    mesReferencia: mesAno,
    dataGeracao: new Date().toISOString(),
    instituicao: "Inter Prime",
  },
  resumo: criarResumo(patrimonioTotal, patrimonioMesAnterior),
  evolucaoAlocacao: [
    {
      mesAno,
      categorias: [
        {
          nomeCategoria: "Liquidez" as const,
          percentualDaCarteira: criarPercentual(10),
        },
        {
          nomeCategoria: "Renda Variavel" as const,
          percentualDaCarteira: criarPercentual(60),
        },
      ],
    },
  ],
  evolucaoPatrimonial: [
    {
      mesAno,
      patrimonioTotal: criarMoney(patrimonioTotal),
      totalAportado: criarMoney(100000),
    },
  ],
  comparacaoPeriodos: [],
  analiseRiscoRetorno: {
    mesesAcimaBenchmark: 8,
    mesesAbaixoBenchmark: 2,
    maiorRentabilidade: {
      valor: criarPercentual(3.5),
      mesAno: "2024-03",
    },
    menorRentabilidade: {
      valor: criarPercentual(-1.2),
      mesAno: "2024-02",
    },
  },
  retornosMensais: [],
  comparacaoBenchmarks: [
    {
      periodo: "No mes",
      carteira: criarPercentual(1.5),
      cdi: criarPercentual(0.8),
      ibovespa: criarPercentual(2.1),
      ipca: criarPercentual(0.4),
    },
  ],
  rentabilidadePorCategoria: [],
  eventosFinanceiros: [
    {
      tipoEvento: "Dividendo" as const,
      nomeAtivo: "Ativo 1",
      codigoAtivo: "ATIVO11",
      valor: criarMoney(5000),
      dataEvento: "2024-12-15",
    },
  ],
  ganhosPorEstrategia: [
    {
      nomeEstrategia: "Estrategia 1",
      ganhoNoMes: criarMoney(50000),
      ganhoNoAno: criarMoney(500000),
      ganho3Meses: criarMoney(150000),
      ganho6Meses: criarMoney(300000),
      ganho12Meses: criarMoney(450000),
      ganhoDesdeInicio: criarMoney(1000000),
    },
  ],
  faixasLiquidez: [],
  posicoesDetalhadas: [
    criarPosicaoAtivo("Ativo com Melhor Performance", 5.5, 5000000),
    criarPosicaoAtivo("Ativo 2", 3.2, 2000000),
    criarPosicaoAtivo("Ativo 3", 2.1, 1500000),
    criarPosicaoAtivo("Ativo 4", 0.8, 1000000),
    criarPosicaoAtivo("Ativo 5", -0.5, 800000),
    criarPosicaoAtivo("Ativo 6", -1.2, 600000),
    criarPosicaoAtivo("Ativo 7", -1.8, 400000),
    criarPosicaoAtivo("Ativo 8", -2.5, 300000),
    criarPosicaoAtivo("Ativo 9", -3.2, 200000),
    criarPosicaoAtivo("Ativo com Pior Performance", -4.5, 100000),
  ],
  movimentacoes: [],
});

// ========== Mock Repository ==========

function criarMetadados(identificador: string, mesReferencia: string): ReportMetadata {
  return {
    identificador,
    mesReferencia,
    nomeArquivoOriginal: `relatorio-${mesReferencia}.pdf`,
    caminhoArquivoPdf: `data/reports/${identificador}.pdf`,
    caminhoArquivoExtraido: `data/extracted/${identificador}.json`,
    caminhoArquivoInsights: null,
    dataUpload: new Date().toISOString(),
    statusExtracao: "concluido",
    origemDados: "upload-automatico",
    erroExtracao: null,
  };
}

class MockReportRepository implements ReportRepository {
  metadados: ReportMetadata[] = [];
  dados: Map<string, RelatorioExtraido> = new Map();

  async listarTodosMetadados(): Promise<ReportMetadata[]> {
    return this.metadados;
  }

  async obterDadosExtraidos(identificador: string): Promise<RelatorioExtraido | null> {
    return this.dados.get(identificador) ?? null;
  }

  async obterMetadados(identificador: string): Promise<ReportMetadata | null> {
    return this.metadados.find((m) => m.identificador === identificador) ?? null;
  }

  async obterInsights(): Promise<InsightsResponse | null> {
    return null;
  }

  async obterPdfComoBase64(): Promise<string> {
    return "";
  }

  async salvarPdf(): Promise<string> {
    return "";
  }

  async salvarDadosExtraidos(): Promise<string> {
    return "";
  }

  async salvarMetadados(): Promise<void> {
    return;
  }

  async salvarInsights(): Promise<void> {
    return;
  }

  async removerRelatorio(): Promise<void> {
    return;
  }

  adicionarRelatorio(
    identificador: string,
    mesReferencia: string,
    dados: RelatorioExtraido,
  ): void {
    this.metadados.push(criarMetadados(identificador, mesReferencia));
    this.dados.set(identificador, dados);
  }

  limpar(): void {
    this.metadados = [];
    this.dados.clear();
  }
}

// ========== Tests ==========

describe("GetDashboardDataUseCase", () => {
  let repository: MockReportRepository;
  let useCase: GetDashboardDataUseCase;

  beforeEach(() => {
    repository = new MockReportRepository();
    useCase = new GetDashboardDataUseCase(repository);
  });

  describe("sem relatórios", () => {
    it("deve retornar null quando não há metadados", async () => {
      const resultado = await useCase.executar();
      expect(resultado).toBeNull();
    });

    it("deve retornar null quando há metadados mas sem dados extraídos", async () => {
      repository.metadados.push(criarMetadados("rel-1", "2024-12"));

      const resultado = await useCase.executar();
      expect(resultado).toBeNull();
    });
  });

  describe("relatório único", () => {
    beforeEach(() => {
      const relatorio = criarRelatorioExtraido("2024-12", 100000000);
      repository.adicionarRelatorio("rel-1", "2024-12", relatorio);
    });

    it("deve retornar dados do dashboard com um relatório", async () => {
      const resultado = await useCase.executar();

      expect(resultado).not.toBeNull();
      expect(resultado?.mesAtual).toBe("2024-12");
      expect(resultado?.quantidadeRelatorios).toBe(1);
    });

    it("deve ter variação patrimonial null sem relatório anterior", async () => {
      const resultado = await useCase.executar();
      expect(resultado?.variacaoPatrimonialCentavos).toBeNull();
    });

    it("deve calcular variação patrimonial do mês anterior quando disponível", async () => {
      repository.limpar();
      const relatorio = criarRelatorioExtraido("2024-12", 100000000, 90000000);
      repository.adicionarRelatorio("rel-1", "2024-12", relatorio);

      const resultado = await useCase.executar();

      expect(resultado?.variacaoPatrimonialCentavos).toBe(10000000);
    });

    it("deve incluir resumo, alocação e comparação do relatório", async () => {
      const resultado = await useCase.executar();

      expect(resultado?.resumoAtual).toBeDefined();
      expect(resultado?.alocacaoAtual).toBeDefined();
      expect(resultado?.comparacaoBenchmarksAtual).toBeDefined();
    });

    it("deve incluir todos os períodos disponíveis", async () => {
      const resultado = await useCase.executar();
      expect(resultado?.periodosDisponiveis).toEqual(["2024-12"]);
    });
  });

  describe("múltiplos relatórios", () => {
    beforeEach(() => {
      repository.adicionarRelatorio("rel-1", "2024-10", criarRelatorioExtraido("2024-10", 80000000));
      repository.adicionarRelatorio("rel-2", "2024-12", criarRelatorioExtraido("2024-12", 100000000, 90000000));
      repository.adicionarRelatorio("rel-3", "2024-11", criarRelatorioExtraido("2024-11", 90000000));
    });

    it("deve ordenar relatórios cronologicamente", async () => {
      const resultado = await useCase.executar();

      expect(resultado?.periodosDisponiveis).toEqual(["2024-10", "2024-11", "2024-12"]);
    });

    it("deve usar o relatório mais recente por padrão", async () => {
      const resultado = await useCase.executar();

      expect(resultado?.mesAtual).toBe("2024-12");
      expect(resultado?.resumoAtual.patrimonioTotal.valorEmCentavos).toBe(100000000);
    });

    it("deve calcular evolução patrimonial com todos os relatórios", async () => {
      const resultado = await useCase.executar();

      expect(resultado?.evolucaoPatrimonial).toHaveLength(3);
      expect(resultado!.evolucaoPatrimonial[0]!.mesAno).toBe("2024-10");
      expect(resultado!.evolucaoPatrimonial[2]!.mesAno).toBe("2024-12");
    });

    it("deve calcular variação como diferença entre últimos dois relatórios", async () => {
      const resultado = await useCase.executar();

      expect(resultado?.variacaoPatrimonialCentavos).toBe(10000000);
    });

    it("deve retornar quantidade correta de relatórios", async () => {
      const resultado = await useCase.executar();
      expect(resultado?.quantidadeRelatorios).toBe(3);
    });
  });

  describe("seleção de período", () => {
    beforeEach(() => {
      repository.adicionarRelatorio("rel-1", "2024-10", criarRelatorioExtraido("2024-10", 80000000));
      repository.adicionarRelatorio("rel-2", "2024-11", criarRelatorioExtraido("2024-11", 90000000));
      repository.adicionarRelatorio("rel-3", "2024-12", criarRelatorioExtraido("2024-12", 100000000));
    });

    it("deve usar período selecionado quando fornecido", async () => {
      const resultado = await useCase.executar("2024-11");

      expect(resultado?.mesAtual).toBe("2024-11");
      expect(resultado?.resumoAtual.patrimonioTotal.valorEmCentavos).toBe(90000000);
    });

    it("deve retornar null para período inexistente", async () => {
      const resultado = await useCase.executar("2024-09");

      expect(resultado).toBeNull();
    });

    it("deve retornar todos os períodos disponíveis mesmo com período selecionado", async () => {
      const resultado = await useCase.executar("2024-10");

      expect(resultado?.periodosDisponiveis).toEqual(["2024-10", "2024-11", "2024-12"]);
    });
  });

  describe("melhores e piores performers", () => {
    it("deve selecionar top 5 melhores performers", async () => {
      const relatorio = criarRelatorioExtraido("2024-12", 100000000);
      repository.adicionarRelatorio("rel-1", "2024-12", relatorio);

      const resultado = await useCase.executar();

      expect(resultado?.melhoresPerformers).toHaveLength(5);
      expect(resultado!.melhoresPerformers[0]!.nomeAtivo).toBe("Ativo com Melhor Performance");
      expect(resultado!.melhoresPerformers[0]!.rentabilidadeMes.valor).toBe(5.5);
    });

    it("deve ordenar melhores performers por rentabilidade descendente", async () => {
      const relatorio = criarRelatorioExtraido("2024-12", 100000000);
      repository.adicionarRelatorio("rel-1", "2024-12", relatorio);

      const resultado = await useCase.executar();

      const rentabilidades = resultado?.melhoresPerformers.map((p) => p.rentabilidadeMes.valor);
      expect(rentabilidades).toEqual([5.5, 3.2, 2.1, 0.8, -0.5]);
    });

    it("deve selecionar bottom 5 piores performers", async () => {
      const relatorio = criarRelatorioExtraido("2024-12", 100000000);
      repository.adicionarRelatorio("rel-1", "2024-12", relatorio);

      const resultado = await useCase.executar();

      expect(resultado?.pioresPerformers).toHaveLength(5);
      expect(resultado!.pioresPerformers[0]!.nomeAtivo).toBe("Ativo com Pior Performance");
      expect(resultado!.pioresPerformers[0]!.rentabilidadeMes.valor).toBe(-4.5);
    });

    it("deve ordenar piores performers com pior primeiro (reversed)", async () => {
      const relatorio = criarRelatorioExtraido("2024-12", 100000000);
      repository.adicionarRelatorio("rel-1", "2024-12", relatorio);

      const resultado = await useCase.executar();

      const rentabilidades = resultado?.pioresPerformers.map((p) => p.rentabilidadeMes.valor);
      expect(rentabilidades).toEqual([-4.5, -3.2, -2.5, -1.8, -1.2]);
    });
  });

  describe("dados retornados", () => {
    beforeEach(() => {
      const relatorio = criarRelatorioExtraido("2024-12", 100000000);
      repository.adicionarRelatorio("rel-1", "2024-12", relatorio);
    });

    it("deve incluir todos os campos de DashboardData", async () => {
      const resultado = await useCase.executar();

      expect(resultado).toHaveProperty("resumoAtual");
      expect(resultado).toHaveProperty("mesAtual");
      expect(resultado).toHaveProperty("periodosDisponiveis");
      expect(resultado).toHaveProperty("evolucaoPatrimonial");
      expect(resultado).toHaveProperty("alocacaoAtual");
      expect(resultado).toHaveProperty("comparacaoBenchmarksAtual");
      expect(resultado).toHaveProperty("melhoresPerformers");
      expect(resultado).toHaveProperty("pioresPerformers");
      expect(resultado).toHaveProperty("ganhosPorEstrategia");
      expect(resultado).toHaveProperty("eventosRecentes");
      expect(resultado).toHaveProperty("variacaoPatrimonialCentavos");
      expect(resultado).toHaveProperty("quantidadeRelatorios");
      expect(resultado).toHaveProperty("analiseRiscoRetorno");
      expect(resultado).toHaveProperty("retornosMensais");
      expect(resultado).toHaveProperty("faixasLiquidez");
      expect(resultado).toHaveProperty("rentabilidadePorCategoria");
      expect(resultado).toHaveProperty("movimentacoes");
      expect(resultado).toHaveProperty("todasPosicoes");
      expect(resultado).toHaveProperty("comparacaoPeriodos");
      expect(resultado).toHaveProperty("evolucaoAlocacaoHistorica");
    });

    it("deve incluir eventos financeiros do relatório", async () => {
      const resultado = await useCase.executar();

      expect(resultado?.eventosRecentes).toHaveLength(1);
      expect(resultado!.eventosRecentes[0]!.tipoEvento).toBe("Dividendo");
    });

    it("deve incluir ganhos por estratégia", async () => {
      const resultado = await useCase.executar();

      expect(resultado?.ganhosPorEstrategia).toHaveLength(1);
      expect(resultado!.ganhosPorEstrategia[0]!.nomeEstrategia).toBe("Estrategia 1");
    });

    it("deve incluir análise de risco e retorno", async () => {
      const resultado = await useCase.executar();

      expect(resultado?.analiseRiscoRetorno).toBeDefined();
      expect(resultado!.analiseRiscoRetorno.mesesAcimaBenchmark).toBe(8);
      expect(resultado!.analiseRiscoRetorno.mesesAbaixoBenchmark).toBe(2);
    });

    it("deve incluir todas as posições (não apenas top 5)", async () => {
      const resultado = await useCase.executar();

      expect(resultado?.todasPosicoes).toHaveLength(10);
    });

    it("deve fazer passthrough direto dos novos campos do relatório", async () => {
      const resultado = await useCase.executar();

      expect(resultado?.retornosMensais).toEqual([]);
      expect(resultado?.faixasLiquidez).toEqual([]);
      expect(resultado?.rentabilidadePorCategoria).toEqual([]);
      expect(resultado?.movimentacoes).toEqual([]);
      expect(resultado?.comparacaoPeriodos).toEqual([]);
    });

    it("deve usar evolucaoAlocacao como evolucaoAlocacaoHistorica", async () => {
      const resultado = await useCase.executar();

      expect(resultado?.evolucaoAlocacaoHistorica).toHaveLength(1);
      expect(resultado!.evolucaoAlocacaoHistorica[0]!.mesAno).toBe("2024-12");
    });
  });
});
