import { describe, it, expect } from "vitest";
import {
  agregarDadosDoAtivo,
  listarAtivosUnicos,
} from "@/lib/aggregate-asset-data";
import type { RelatorioExtraido } from "@/schemas/report-extraction.schema";

// ============================================================
// Test data factories
// ============================================================

const ZERO_MONEY = { valorEmCentavos: 0, moeda: "BRL" };

function criarRelatorioMinimo(
  overrides: {
    mesReferencia?: string;
    posicoesDetalhadas?: RelatorioExtraido["posicoesDetalhadas"];
    movimentacoes?: RelatorioExtraido["movimentacoes"];
    eventosFinanceiros?: RelatorioExtraido["eventosFinanceiros"];
  } = {},
): RelatorioExtraido {
  return {
    metadados: {
      mesReferencia: overrides.mesReferencia ?? "2025-01",
      dataGeracao: "2025-02-01",
      instituicao: "Inter Prime",
    },
    resumo: {
      patrimonioTotal: { valorEmCentavos: 100000000, moeda: "BRL" },
      patrimonioMesAnterior: null,
      ganhosFinanceirosNoMes: ZERO_MONEY,
      ganhosFinanceirosMesAnterior: null,
      aplicacoesNoMes: ZERO_MONEY,
      resgatesNoMes: ZERO_MONEY,
      eventosFinanceirosNoMes: ZERO_MONEY,
      eventosFinanceirosMesAnterior: null,
      rentabilidadeMensal: { valor: 1.0 },
      rentabilidadeMensalAnterior: null,
      rentabilidadeAnual: { valor: 12.0 },
      rentabilidadeAnoAnterior: null,
      rentabilidadeDesdeInicio: { valor: 30.0 },
      dataInicioCarteira: "2023-01-01",
    },
    evolucaoAlocacao: [],
    evolucaoPatrimonial: [],
    comparacaoPeriodos: [],
    analiseRiscoRetorno: {
      mesesAcimaBenchmark: 8,
      mesesAbaixoBenchmark: 4,
      maiorRentabilidade: { valor: { valor: 3.5 }, mesAno: "2024-06" },
      menorRentabilidade: { valor: { valor: -1.2 }, mesAno: "2024-09" },
    },
    retornosMensais: [],
    comparacaoBenchmarks: [],
    rentabilidadePorCategoria: [],
    eventosFinanceiros: overrides.eventosFinanceiros ?? [],
    ganhosPorEstrategia: [],
    faixasLiquidez: [],
    posicoesDetalhadas: overrides.posicoesDetalhadas ?? [],
    movimentacoes: overrides.movimentacoes ?? [],
  } as RelatorioExtraido;
}

function criarPosicao(
  overrides: {
    nomeAtivo?: string;
    codigoAtivo?: string | null;
    estrategia?: string;
    saldoBrutoCentavos?: number;
    rentabilidadeMes?: number;
    rentabilidade12Meses?: number | null;
    rentabilidadeDesdeInicio?: number | null;
    participacaoNaCarteira?: number;
  } = {},
): RelatorioExtraido["posicoesDetalhadas"][number] {
  return {
    nomeAtivo: overrides.nomeAtivo ?? "Petrobras PN",
    codigoAtivo:
      "codigoAtivo" in overrides ? overrides.codigoAtivo! : "PETR4",
    estrategia: overrides.estrategia ?? "Renda Variavel",
    saldoAnterior: { valorEmCentavos: 80000, moeda: "BRL" },
    aplicacoes: ZERO_MONEY,
    resgates: ZERO_MONEY,
    eventosFinanceiros: ZERO_MONEY,
    saldoBruto: {
      valorEmCentavos: overrides.saldoBrutoCentavos ?? 100000,
      moeda: "BRL",
    },
    rentabilidadeMes: { valor: overrides.rentabilidadeMes ?? 1.5 },
    rentabilidade12Meses:
      overrides.rentabilidade12Meses !== undefined
        ? overrides.rentabilidade12Meses !== null
          ? { valor: overrides.rentabilidade12Meses }
          : null
        : { valor: 10.0 },
    rentabilidadeDesdeInicio:
      overrides.rentabilidadeDesdeInicio !== undefined
        ? overrides.rentabilidadeDesdeInicio !== null
          ? { valor: overrides.rentabilidadeDesdeInicio }
          : null
        : { valor: 15.0 },
    participacaoNaCarteira: {
      valor: overrides.participacaoNaCarteira ?? 25.0,
    },
  };
}

function criarMovimentacao(
  overrides: {
    nomeAtivo?: string;
    codigoAtivo?: string | null;
    tipoMovimentacao?: string;
    data?: string;
    valorEmCentavos?: number;
    descricao?: string | null;
  } = {},
): RelatorioExtraido["movimentacoes"][number] {
  return {
    nomeAtivo: overrides.nomeAtivo ?? "Petrobras PN",
    codigoAtivo:
      "codigoAtivo" in overrides ? overrides.codigoAtivo! : "PETR4",
    tipoMovimentacao: (overrides.tipoMovimentacao ?? "Aplicacao") as "Aplicacao",
    data: overrides.data ?? "2025-01-15",
    valor: {
      valorEmCentavos: overrides.valorEmCentavos ?? 50000,
      moeda: "BRL",
    },
    descricao: overrides.descricao ?? "Compra de PETR4",
  };
}

function criarEvento(
  overrides: {
    nomeAtivo?: string;
    codigoAtivo?: string | null;
    tipoEvento?: string;
    dataEvento?: string | null;
    valorEmCentavos?: number;
  } = {},
): RelatorioExtraido["eventosFinanceiros"][number] {
  return {
    nomeAtivo: overrides.nomeAtivo ?? "Petrobras PN",
    codigoAtivo:
      "codigoAtivo" in overrides ? overrides.codigoAtivo! : "PETR4",
    tipoEvento: (overrides.tipoEvento ?? "Dividendo") as "Dividendo",
    dataEvento:
      "dataEvento" in overrides ? overrides.dataEvento! : "2025-01-10",
    valor: {
      valorEmCentavos: overrides.valorEmCentavos ?? 500,
      moeda: "BRL",
    },
  };
}

// ============================================================
// agregarDadosDoAtivo
// ============================================================

describe("agregarDadosDoAtivo", () => {
  describe("Given no reports", () => {
    it("When aggregating with an empty array, Then returns null", () => {
      // Given
      const relatorios: RelatorioExtraido[] = [];

      // When
      const result = agregarDadosDoAtivo(relatorios, "PETR4");

      // Then
      expect(result).toBeNull();
    });
  });

  describe("Given reports that do not contain the searched asset", () => {
    it("When the asset is not found in any report, Then returns null", () => {
      // Given
      const relatorio = criarRelatorioMinimo({
        posicoesDetalhadas: [
          criarPosicao({ nomeAtivo: "Vale SA", codigoAtivo: "VALE3" }),
        ],
        movimentacoes: [
          criarMovimentacao({ nomeAtivo: "Vale SA", codigoAtivo: "VALE3" }),
        ],
      });

      // When
      const result = agregarDadosDoAtivo([relatorio], "PETR4");

      // Then
      expect(result).toBeNull();
    });
  });

  describe("Given a report with the asset matched by codigoAtivo", () => {
    it("When searching by exact ticker (case-insensitive), Then finds the asset and returns correct data", () => {
      // Given
      const relatorio = criarRelatorioMinimo({
        mesReferencia: "2025-03",
        posicoesDetalhadas: [
          criarPosicao({
            nomeAtivo: "Petrobras PN",
            codigoAtivo: "PETR4",
            saldoBrutoCentavos: 200000,
            rentabilidadeMes: 2.5,
            participacaoNaCarteira: 15.0,
          }),
        ],
        movimentacoes: [
          criarMovimentacao({
            data: "2025-03-10",
            tipoMovimentacao: "Aplicacao",
            valorEmCentavos: 60000,
          }),
        ],
        eventosFinanceiros: [
          criarEvento({
            dataEvento: "2025-03-15",
            tipoEvento: "Dividendo",
            valorEmCentavos: 1200,
          }),
        ],
      });

      // When
      const result = agregarDadosDoAtivo([relatorio], "petr4");

      // Then
      expect(result).not.toBeNull();
      expect(result!.codigoAtivo).toBe("PETR4");
      expect(result!.nomeAtivo).toBe("Petrobras PN");
      expect(result!.estrategia).toBe("Renda Variavel");
      expect(result!.historicoNaCarteira).toHaveLength(1);
      expect(result!.historicoNaCarteira[0]).toEqual({
        mesAno: "2025-03",
        saldoBrutoCentavos: 200000,
        rentabilidadeMes: 2.5,
        rentabilidade12Meses: 10.0,
        rentabilidadeDesdeInicio: 15.0,
        participacaoNaCarteira: 15.0,
      });
      expect(result!.movimentacoesDoAtivo).toHaveLength(1);
      expect(result!.movimentacoesDoAtivo[0]).toEqual({
        data: "2025-03-10",
        tipo: "Aplicacao",
        valorCentavos: 60000,
        descricao: "Compra de PETR4",
      });
      expect(result!.eventosFinanceirosDoAtivo).toHaveLength(1);
      expect(result!.eventosFinanceirosDoAtivo[0]).toEqual({
        data: "2025-03-15",
        tipo: "Dividendo",
        valorCentavos: 1200,
      });
      expect(result!.saldoAtualCentavos).toBe(200000);
      expect(result!.participacaoAtualCarteira).toBe(15.0);
    });

    it("When searching with extra whitespace, Then still matches correctly", () => {
      // Given
      const relatorio = criarRelatorioMinimo({
        posicoesDetalhadas: [
          criarPosicao({ nomeAtivo: "Petrobras PN", codigoAtivo: "PETR4" }),
        ],
      });

      // When
      const result = agregarDadosDoAtivo([relatorio], "  PETR4  ");

      // Then
      expect(result).not.toBeNull();
      expect(result!.codigoAtivo).toBe("PETR4");
    });
  });

  describe("Given a report with the asset matched by nomeAtivo", () => {
    it("When searching by full name (case-insensitive), Then finds the asset", () => {
      // Given
      const relatorio = criarRelatorioMinimo({
        posicoesDetalhadas: [
          criarPosicao({
            nomeAtivo: "Petrobras PN",
            codigoAtivo: "PETR4",
            saldoBrutoCentavos: 120000,
          }),
        ],
      });

      // When
      const result = agregarDadosDoAtivo([relatorio], "petrobras pn");

      // Then
      expect(result).not.toBeNull();
      expect(result!.nomeAtivo).toBe("Petrobras PN");
      expect(result!.saldoAtualCentavos).toBe(120000);
    });

    it("When the asset has no codigoAtivo, Then uses nomeAtivo as codigoAtivo fallback", () => {
      // Given
      const relatorio = criarRelatorioMinimo({
        posicoesDetalhadas: [
          criarPosicao({
            nomeAtivo: "Fundo XP Macro",
            codigoAtivo: null,
          }),
        ],
      });

      // When
      const result = agregarDadosDoAtivo([relatorio], "Fundo XP Macro");

      // Then
      expect(result).not.toBeNull();
      expect(result!.codigoAtivo).toBe("Fundo XP Macro");
      expect(result!.nomeAtivo).toBe("Fundo XP Macro");
    });

    it("When searching by nomeAtivo with extra whitespace and mixed case, Then matches correctly", () => {
      // Given
      const relatorio = criarRelatorioMinimo({
        posicoesDetalhadas: [
          criarPosicao({
            nomeAtivo: "Tesouro Selic 2029",
            codigoAtivo: null,
            saldoBrutoCentavos: 150000,
          }),
        ],
      });

      // When
      const result = agregarDadosDoAtivo(relatorio ? [relatorio] : [], "  tesouro selic 2029  ");

      // Then
      expect(result).not.toBeNull();
      expect(result!.nomeAtivo).toBe("Tesouro Selic 2029");
      expect(result!.codigoAtivo).toBe("Tesouro Selic 2029");
      expect(result!.saldoAtualCentavos).toBe(150000);
    });
  });

  describe("Given multiple reports with the same asset", () => {
    it("When reports are in non-chronological order, Then historico is sorted chronologically (oldest first)", () => {
      // Given
      const relatorioFeb = criarRelatorioMinimo({
        mesReferencia: "2025-02",
        posicoesDetalhadas: [
          criarPosicao({
            saldoBrutoCentavos: 110000,
            rentabilidadeMes: 2.0,
            participacaoNaCarteira: 26.0,
          }),
        ],
      });
      const relatorioJan = criarRelatorioMinimo({
        mesReferencia: "2025-01",
        posicoesDetalhadas: [
          criarPosicao({
            saldoBrutoCentavos: 100000,
            rentabilidadeMes: 1.5,
            participacaoNaCarteira: 25.0,
          }),
        ],
      });
      const relatorioDec = criarRelatorioMinimo({
        mesReferencia: "2024-12",
        posicoesDetalhadas: [
          criarPosicao({
            saldoBrutoCentavos: 95000,
            rentabilidadeMes: 0.8,
            participacaoNaCarteira: 24.0,
          }),
        ],
      });

      // When
      const result = agregarDadosDoAtivo(
        [relatorioFeb, relatorioDec, relatorioJan],
        "PETR4",
      );

      // Then
      expect(result).not.toBeNull();
      expect(result!.historicoNaCarteira).toHaveLength(3);
      expect(result!.historicoNaCarteira[0]!.mesAno).toBe("2024-12");
      expect(result!.historicoNaCarteira[0]!.saldoBrutoCentavos).toBe(95000);
      expect(result!.historicoNaCarteira[1]!.mesAno).toBe("2025-01");
      expect(result!.historicoNaCarteira[1]!.saldoBrutoCentavos).toBe(100000);
      expect(result!.historicoNaCarteira[2]!.mesAno).toBe("2025-02");
      expect(result!.historicoNaCarteira[2]!.saldoBrutoCentavos).toBe(110000);
    });

    it("When multiple reports exist, Then saldoAtualCentavos comes from the most recent entry", () => {
      // Given
      const relatorioOlder = criarRelatorioMinimo({
        mesReferencia: "2025-01",
        posicoesDetalhadas: [
          criarPosicao({ saldoBrutoCentavos: 100000 }),
        ],
      });
      const relatorioNewer = criarRelatorioMinimo({
        mesReferencia: "2025-03",
        posicoesDetalhadas: [
          criarPosicao({ saldoBrutoCentavos: 150000 }),
        ],
      });

      // When
      const result = agregarDadosDoAtivo(
        [relatorioOlder, relatorioNewer],
        "PETR4",
      );

      // Then
      expect(result!.saldoAtualCentavos).toBe(150000);
    });

    it("When multiple reports exist, Then participacaoAtualCarteira comes from the most recent entry", () => {
      // Given
      const relatorioOlder = criarRelatorioMinimo({
        mesReferencia: "2025-01",
        posicoesDetalhadas: [
          criarPosicao({ participacaoNaCarteira: 20.0 }),
        ],
      });
      const relatorioNewer = criarRelatorioMinimo({
        mesReferencia: "2025-03",
        posicoesDetalhadas: [
          criarPosicao({ participacaoNaCarteira: 30.0 }),
        ],
      });

      // When
      const result = agregarDadosDoAtivo(
        [relatorioOlder, relatorioNewer],
        "PETR4",
      );

      // Then
      expect(result!.participacaoAtualCarteira).toBe(30.0);
    });
  });

  describe("Given reports with movimentacoes for the asset", () => {
    it("When the report has movimentacoes for multiple assets, Then only includes movimentacoes for the searched asset", () => {
      // Given
      const relatorio = criarRelatorioMinimo({
        posicoesDetalhadas: [
          criarPosicao({ nomeAtivo: "Petrobras PN", codigoAtivo: "PETR4" }),
        ],
        movimentacoes: [
          criarMovimentacao({
            nomeAtivo: "Petrobras PN",
            codigoAtivo: "PETR4",
            tipoMovimentacao: "Aplicacao",
            data: "2025-01-10",
            valorEmCentavos: 50000,
          }),
          criarMovimentacao({
            nomeAtivo: "Vale SA",
            codigoAtivo: "VALE3",
            tipoMovimentacao: "Resgate",
            data: "2025-01-12",
            valorEmCentavos: 30000,
          }),
          criarMovimentacao({
            nomeAtivo: "Petrobras PN",
            codigoAtivo: "PETR4",
            tipoMovimentacao: "Dividendo",
            data: "2025-01-20",
            valorEmCentavos: 800,
          }),
        ],
      });

      // When
      const result = agregarDadosDoAtivo([relatorio], "PETR4");

      // Then
      expect(result!.movimentacoesDoAtivo).toHaveLength(2);
      expect(result!.movimentacoesDoAtivo[0]!.tipo).toBe("Aplicacao");
      expect(result!.movimentacoesDoAtivo[1]!.tipo).toBe("Dividendo");
    });

    it("When mapping movimentacao fields, Then correctly transforms to MovimentacaoAtivo shape", () => {
      // Given
      const relatorio = criarRelatorioMinimo({
        posicoesDetalhadas: [criarPosicao()],
        movimentacoes: [
          criarMovimentacao({
            tipoMovimentacao: "Aplicacao",
            data: "2025-01-15",
            valorEmCentavos: 75000,
            descricao: "Compra programada",
          }),
        ],
      });

      // When
      const result = agregarDadosDoAtivo([relatorio], "PETR4");

      // Then
      const mov = result!.movimentacoesDoAtivo[0]!;
      expect(mov.data).toBe("2025-01-15");
      expect(mov.tipo).toBe("Aplicacao");
      expect(mov.valorCentavos).toBe(75000);
      expect(mov.descricao).toBe("Compra programada");
    });
  });

  describe("Given reports with eventosFinanceiros for the asset", () => {
    it("When the report has eventos for multiple assets, Then only includes eventos for the searched asset", () => {
      // Given
      const relatorio = criarRelatorioMinimo({
        posicoesDetalhadas: [criarPosicao()],
        eventosFinanceiros: [
          criarEvento({
            nomeAtivo: "Petrobras PN",
            codigoAtivo: "PETR4",
            tipoEvento: "Dividendo",
            dataEvento: "2025-01-10",
            valorEmCentavos: 500,
          }),
          criarEvento({
            nomeAtivo: "Itau Unibanco",
            codigoAtivo: "ITUB4",
            tipoEvento: "JCP",
            dataEvento: "2025-01-15",
            valorEmCentavos: 300,
          }),
          criarEvento({
            nomeAtivo: "Petrobras PN",
            codigoAtivo: "PETR4",
            tipoEvento: "JCP",
            dataEvento: "2025-01-20",
            valorEmCentavos: 200,
          }),
        ],
      });

      // When
      const result = agregarDadosDoAtivo([relatorio], "PETR4");

      // Then
      expect(result!.eventosFinanceirosDoAtivo).toHaveLength(2);
      expect(result!.eventosFinanceirosDoAtivo[0]!.tipo).toBe("Dividendo");
      expect(result!.eventosFinanceirosDoAtivo[1]!.tipo).toBe("JCP");
    });

    it("When mapping evento fields, Then correctly transforms to EventoFinanceiroAtivo shape", () => {
      // Given
      const relatorio = criarRelatorioMinimo({
        posicoesDetalhadas: [criarPosicao()],
        eventosFinanceiros: [
          criarEvento({
            tipoEvento: "Rendimento",
            dataEvento: "2025-01-05",
            valorEmCentavos: 1200,
          }),
        ],
      });

      // When
      const result = agregarDadosDoAtivo([relatorio], "PETR4");

      // Then
      const evento = result!.eventosFinanceirosDoAtivo[0]!;
      expect(evento.data).toBe("2025-01-05");
      expect(evento.tipo).toBe("Rendimento");
      expect(evento.valorCentavos).toBe(1200);
    });
  });

  describe("Given duplicate movimentacoes across reports", () => {
    it("When same movimentacao (data+tipo+valor) appears in two reports, Then deduplicates to one", () => {
      // Given
      const relatorioJan = criarRelatorioMinimo({
        mesReferencia: "2025-01",
        posicoesDetalhadas: [criarPosicao()],
        movimentacoes: [
          criarMovimentacao({
            data: "2025-01-15",
            tipoMovimentacao: "Aplicacao",
            valorEmCentavos: 50000,
            descricao: "Compra PETR4",
          }),
        ],
      });
      const relatorioFeb = criarRelatorioMinimo({
        mesReferencia: "2025-02",
        posicoesDetalhadas: [criarPosicao()],
        movimentacoes: [
          criarMovimentacao({
            data: "2025-01-15",
            tipoMovimentacao: "Aplicacao",
            valorEmCentavos: 50000,
            descricao: "Compra PETR4",
          }),
        ],
      });

      // When
      const result = agregarDadosDoAtivo(
        [relatorioJan, relatorioFeb],
        "PETR4",
      );

      // Then
      expect(result!.movimentacoesDoAtivo).toHaveLength(1);
      expect(result!.movimentacoesDoAtivo[0]!.valorCentavos).toBe(50000);
    });

    it("When movimentacoes differ by date only, Then keeps both", () => {
      // Given
      const relatorio = criarRelatorioMinimo({
        posicoesDetalhadas: [criarPosicao()],
        movimentacoes: [
          criarMovimentacao({
            data: "2025-01-10",
            tipoMovimentacao: "Aplicacao",
            valorEmCentavos: 50000,
          }),
          criarMovimentacao({
            data: "2025-01-20",
            tipoMovimentacao: "Aplicacao",
            valorEmCentavos: 50000,
          }),
        ],
      });

      // When
      const result = agregarDadosDoAtivo([relatorio], "PETR4");

      // Then
      expect(result!.movimentacoesDoAtivo).toHaveLength(2);
    });

    it("When movimentacoes differ by tipo only, Then keeps both", () => {
      // Given
      const relatorio = criarRelatorioMinimo({
        posicoesDetalhadas: [criarPosicao()],
        movimentacoes: [
          criarMovimentacao({
            data: "2025-01-15",
            tipoMovimentacao: "Aplicacao",
            valorEmCentavos: 50000,
          }),
          criarMovimentacao({
            data: "2025-01-15",
            tipoMovimentacao: "Resgate",
            valorEmCentavos: 50000,
          }),
        ],
      });

      // When
      const result = agregarDadosDoAtivo([relatorio], "PETR4");

      // Then
      expect(result!.movimentacoesDoAtivo).toHaveLength(2);
    });

    it("When movimentacoes differ by valor only, Then keeps both", () => {
      // Given
      const relatorio = criarRelatorioMinimo({
        posicoesDetalhadas: [criarPosicao()],
        movimentacoes: [
          criarMovimentacao({
            data: "2025-01-15",
            tipoMovimentacao: "Aplicacao",
            valorEmCentavos: 50000,
          }),
          criarMovimentacao({
            data: "2025-01-15",
            tipoMovimentacao: "Aplicacao",
            valorEmCentavos: 75000,
          }),
        ],
      });

      // When
      const result = agregarDadosDoAtivo([relatorio], "PETR4");

      // Then
      expect(result!.movimentacoesDoAtivo).toHaveLength(2);
    });

    it("When movimentacoes are out of order, Then sorts by date ascending after deduplication", () => {
      // Given
      const relatorio = criarRelatorioMinimo({
        posicoesDetalhadas: [criarPosicao()],
        movimentacoes: [
          criarMovimentacao({
            data: "2025-01-25",
            tipoMovimentacao: "Resgate",
            valorEmCentavos: 20000,
          }),
          criarMovimentacao({
            data: "2025-01-05",
            tipoMovimentacao: "Aplicacao",
            valorEmCentavos: 50000,
          }),
          criarMovimentacao({
            data: "2025-01-15",
            tipoMovimentacao: "Dividendo",
            valorEmCentavos: 800,
          }),
        ],
      });

      // When
      const result = agregarDadosDoAtivo([relatorio], "PETR4");

      // Then
      expect(result!.movimentacoesDoAtivo[0]!.data).toBe("2025-01-05");
      expect(result!.movimentacoesDoAtivo[1]!.data).toBe("2025-01-15");
      expect(result!.movimentacoesDoAtivo[2]!.data).toBe("2025-01-25");
    });
  });

  describe("Given duplicate eventosFinanceiros across reports", () => {
    it("When same evento (data+tipo+valor) appears in two reports, Then deduplicates to one", () => {
      // Given
      const relatorioJan = criarRelatorioMinimo({
        mesReferencia: "2025-01",
        posicoesDetalhadas: [criarPosicao()],
        eventosFinanceiros: [
          criarEvento({
            dataEvento: "2025-01-10",
            tipoEvento: "Dividendo",
            valorEmCentavos: 500,
          }),
        ],
      });
      const relatorioFeb = criarRelatorioMinimo({
        mesReferencia: "2025-02",
        posicoesDetalhadas: [criarPosicao()],
        eventosFinanceiros: [
          criarEvento({
            dataEvento: "2025-01-10",
            tipoEvento: "Dividendo",
            valorEmCentavos: 500,
          }),
        ],
      });

      // When
      const result = agregarDadosDoAtivo(
        [relatorioJan, relatorioFeb],
        "PETR4",
      );

      // Then
      expect(result!.eventosFinanceirosDoAtivo).toHaveLength(1);
    });

    it("When eventos differ by tipo only, Then keeps both", () => {
      // Given
      const relatorio = criarRelatorioMinimo({
        posicoesDetalhadas: [criarPosicao()],
        eventosFinanceiros: [
          criarEvento({
            dataEvento: "2025-01-10",
            tipoEvento: "Dividendo",
            valorEmCentavos: 500,
          }),
          criarEvento({
            dataEvento: "2025-01-10",
            tipoEvento: "JCP",
            valorEmCentavos: 500,
          }),
        ],
      });

      // When
      const result = agregarDadosDoAtivo([relatorio], "PETR4");

      // Then
      expect(result!.eventosFinanceirosDoAtivo).toHaveLength(2);
    });

    it("When eventos have null dataEvento with different tipo, Then keeps both using 'sem-data' dedup key", () => {
      // Given
      const relatorio = criarRelatorioMinimo({
        posicoesDetalhadas: [criarPosicao()],
        eventosFinanceiros: [
          criarEvento({
            dataEvento: null,
            tipoEvento: "Dividendo",
            valorEmCentavos: 500,
          }),
          criarEvento({
            dataEvento: null,
            tipoEvento: "JCP",
            valorEmCentavos: 500,
          }),
        ],
      });

      // When
      const result = agregarDadosDoAtivo([relatorio], "PETR4");

      // Then
      expect(result!.eventosFinanceirosDoAtivo).toHaveLength(2);
    });

    it("When eventos have null dataEvento with same tipo+valor across reports, Then deduplicates to one", () => {
      // Given
      const relatorioJan = criarRelatorioMinimo({
        mesReferencia: "2025-01",
        posicoesDetalhadas: [criarPosicao()],
        eventosFinanceiros: [
          criarEvento({
            dataEvento: null,
            tipoEvento: "Rendimento",
            valorEmCentavos: 1000,
          }),
        ],
      });
      const relatorioFeb = criarRelatorioMinimo({
        mesReferencia: "2025-02",
        posicoesDetalhadas: [criarPosicao()],
        eventosFinanceiros: [
          criarEvento({
            dataEvento: null,
            tipoEvento: "Rendimento",
            valorEmCentavos: 1000,
          }),
        ],
      });

      // When
      const result = agregarDadosDoAtivo(
        [relatorioJan, relatorioFeb],
        "PETR4",
      );

      // Then
      expect(result!.eventosFinanceirosDoAtivo).toHaveLength(1);
    });

    it("When eventos have mixed null and non-null dates, Then sorts null dates first (ascending)", () => {
      // Given
      const relatorio = criarRelatorioMinimo({
        posicoesDetalhadas: [criarPosicao()],
        eventosFinanceiros: [
          criarEvento({
            dataEvento: "2025-01-20",
            tipoEvento: "JCP",
            valorEmCentavos: 200,
          }),
          criarEvento({
            dataEvento: null,
            tipoEvento: "Rendimento",
            valorEmCentavos: 100,
          }),
          criarEvento({
            dataEvento: "2025-01-05",
            tipoEvento: "Dividendo",
            valorEmCentavos: 500,
          }),
        ],
      });

      // When
      const result = agregarDadosDoAtivo([relatorio], "PETR4");

      // Then
      expect(result!.eventosFinanceirosDoAtivo[0]!.data).toBeNull();
      expect(result!.eventosFinanceirosDoAtivo[1]!.data).toBe("2025-01-05");
      expect(result!.eventosFinanceirosDoAtivo[2]!.data).toBe("2025-01-20");
    });
  });

  describe("Given the asset has nullable rentabilidade fields", () => {
    it("When rentabilidade12Meses and rentabilidadeDesdeInicio are null, Then historico maps them as null", () => {
      // Given
      const relatorio = criarRelatorioMinimo({
        posicoesDetalhadas: [
          criarPosicao({
            rentabilidade12Meses: null,
            rentabilidadeDesdeInicio: null,
          }),
        ],
      });

      // When
      const result = agregarDadosDoAtivo([relatorio], "PETR4");

      // Then
      const historico = result!.historicoNaCarteira[0]!;
      expect(historico.rentabilidade12Meses).toBeNull();
      expect(historico.rentabilidadeDesdeInicio).toBeNull();
    });
  });

  describe("Given the asset is found only in movimentacoes (no posicao)", () => {
    it("When the asset has movimentacoes but no positions, Then returns non-null with empty historico and zero saldo", () => {
      // Given
      const relatorio = criarRelatorioMinimo({
        posicoesDetalhadas: [],
        movimentacoes: [
          criarMovimentacao({
            nomeAtivo: "Petrobras PN",
            codigoAtivo: "PETR4",
            data: "2025-01-15",
            tipoMovimentacao: "Resgate",
            valorEmCentavos: 100000,
            descricao: "Resgate total",
          }),
        ],
      });

      // When
      const result = agregarDadosDoAtivo([relatorio], "PETR4");

      // Then
      expect(result).not.toBeNull();
      expect(result!.historicoNaCarteira).toHaveLength(0);
      expect(result!.movimentacoesDoAtivo).toHaveLength(1);
      expect(result!.saldoAtualCentavos).toBe(0);
      expect(result!.participacaoAtualCarteira).toBe(0);
      expect(result!.estrategia).toBeNull();
    });
  });

  describe("Given the asset has no codigoAtivo in positions", () => {
    it("When no codigoAtivo exists, Then uses nomeAtivo as fallback for both nomeAtivo and codigoAtivo", () => {
      // Given
      const relatorio = criarRelatorioMinimo({
        posicoesDetalhadas: [
          criarPosicao({
            nomeAtivo: "Tesouro Prefixado 2027",
            codigoAtivo: null,
            saldoBrutoCentavos: 80000,
          }),
        ],
      });

      // When
      const result = agregarDadosDoAtivo([relatorio], "Tesouro Prefixado 2027");

      // Then
      expect(result).not.toBeNull();
      expect(result!.codigoAtivo).toBe("Tesouro Prefixado 2027");
      expect(result!.nomeAtivo).toBe("Tesouro Prefixado 2027");
    });
  });

  describe("Given estrategia changes across reports", () => {
    it("When the asset's estrategia changes, Then uses estrategia from the most recent report (last processed chronologically)", () => {
      // Given
      const relatorioOlder = criarRelatorioMinimo({
        mesReferencia: "2025-01",
        posicoesDetalhadas: [
          criarPosicao({ estrategia: "Renda Variavel" }),
        ],
      });
      const relatorioNewer = criarRelatorioMinimo({
        mesReferencia: "2025-03",
        posicoesDetalhadas: [
          criarPosicao({ estrategia: "Global" }),
        ],
      });

      // When
      const result = agregarDadosDoAtivo(
        [relatorioNewer, relatorioOlder],
        "PETR4",
      );

      // Then
      expect(result!.estrategia).toBe("Global");
    });
  });

  describe("Given a complete scenario with positions, movimentacoes, and eventos across three months", () => {
    it("When aggregating all data, Then correctly builds the full aggregated result", () => {
      // Given
      const relatorioJan = criarRelatorioMinimo({
        mesReferencia: "2025-01",
        posicoesDetalhadas: [
          criarPosicao({
            saldoBrutoCentavos: 100000,
            rentabilidadeMes: 1.5,
            participacaoNaCarteira: 25.0,
          }),
        ],
        movimentacoes: [
          criarMovimentacao({
            data: "2025-01-10",
            tipoMovimentacao: "Aplicacao",
            valorEmCentavos: 50000,
          }),
        ],
        eventosFinanceiros: [
          criarEvento({
            dataEvento: "2025-01-15",
            tipoEvento: "Dividendo",
            valorEmCentavos: 500,
          }),
        ],
      });
      const relatorioFeb = criarRelatorioMinimo({
        mesReferencia: "2025-02",
        posicoesDetalhadas: [
          criarPosicao({
            saldoBrutoCentavos: 120000,
            rentabilidadeMes: 2.0,
            participacaoNaCarteira: 27.0,
          }),
        ],
        movimentacoes: [
          criarMovimentacao({
            data: "2025-02-05",
            tipoMovimentacao: "Aplicacao",
            valorEmCentavos: 20000,
          }),
        ],
        eventosFinanceiros: [
          criarEvento({
            dataEvento: "2025-02-10",
            tipoEvento: "JCP",
            valorEmCentavos: 300,
          }),
        ],
      });
      const relatorioMar = criarRelatorioMinimo({
        mesReferencia: "2025-03",
        posicoesDetalhadas: [
          criarPosicao({
            saldoBrutoCentavos: 140000,
            rentabilidadeMes: 1.8,
            participacaoNaCarteira: 28.5,
          }),
        ],
        movimentacoes: [],
        eventosFinanceiros: [],
      });

      // When
      const result = agregarDadosDoAtivo(
        [relatorioMar, relatorioJan, relatorioFeb],
        "PETR4",
      );

      // Then
      expect(result).not.toBeNull();
      expect(result!.nomeAtivo).toBe("Petrobras PN");
      expect(result!.codigoAtivo).toBe("PETR4");
      expect(result!.estrategia).toBe("Renda Variavel");

      expect(result!.historicoNaCarteira).toHaveLength(3);
      expect(result!.historicoNaCarteira[0]!.mesAno).toBe("2025-01");
      expect(result!.historicoNaCarteira[2]!.mesAno).toBe("2025-03");

      expect(result!.saldoAtualCentavos).toBe(140000);
      expect(result!.participacaoAtualCarteira).toBe(28.5);

      expect(result!.movimentacoesDoAtivo).toHaveLength(2);
      expect(result!.eventosFinanceirosDoAtivo).toHaveLength(2);
    });
  });

  describe("Given the asset has zero saldo in all positions", () => {
    it("When no positions exist (only movimentacoes), Then returns saldoAtualCentavos as 0 and participacaoAtualCarteira as 0", () => {
      // Given
      const relatorio = criarRelatorioMinimo({
        posicoesDetalhadas: [],
        movimentacoes: [
          criarMovimentacao({ data: "2025-01-15", valorEmCentavos: 10000 }),
        ],
      });

      // When
      const result = agregarDadosDoAtivo([relatorio], "PETR4");

      // Then
      expect(result!.saldoAtualCentavos).toBe(0);
      expect(result!.participacaoAtualCarteira).toBe(0);
    });
  });
});

// ============================================================
// listarAtivosUnicos
// ============================================================

describe("listarAtivosUnicos", () => {
  describe("Given no reports", () => {
    it("When listing unique assets with an empty array, Then returns empty array", () => {
      // Given / When
      const result = listarAtivosUnicos([]);

      // Then
      expect(result).toEqual([]);
    });
  });

  describe("Given a single report with one asset", () => {
    it("When listing unique assets, Then returns that single asset with correct fields", () => {
      // Given
      const relatorio = criarRelatorioMinimo({
        posicoesDetalhadas: [
          criarPosicao({
            nomeAtivo: "Petrobras PN",
            codigoAtivo: "PETR4",
            estrategia: "Renda Variavel",
            rentabilidade12Meses: 10.0,
          }),
        ],
      });

      // When
      const result = listarAtivosUnicos([relatorio]);

      // Then
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        codigoAtivo: "PETR4",
        nomeAtivo: "Petrobras PN",
        estrategia: "Renda Variavel",
        rentabilidade12Meses: 10.0,
      });
    });
  });

  describe("Given a single report with multiple assets", () => {
    it("When listing unique assets, Then returns all assets sorted by nomeAtivo alphabetically", () => {
      // Given
      const relatorio = criarRelatorioMinimo({
        posicoesDetalhadas: [
          criarPosicao({
            nomeAtivo: "Vale SA",
            codigoAtivo: "VALE3",
            estrategia: "Renda Variavel",
          }),
          criarPosicao({
            nomeAtivo: "Itau Unibanco",
            codigoAtivo: "ITUB4",
            estrategia: "Renda Variavel",
          }),
          criarPosicao({
            nomeAtivo: "Petrobras PN",
            codigoAtivo: "PETR4",
            estrategia: "Renda Variavel",
          }),
        ],
      });

      // When
      const result = listarAtivosUnicos([relatorio]);

      // Then
      expect(result).toHaveLength(3);
      expect(result[0]!.nomeAtivo).toBe("Itau Unibanco");
      expect(result[1]!.nomeAtivo).toBe("Petrobras PN");
      expect(result[2]!.nomeAtivo).toBe("Vale SA");
    });
  });

  describe("Given multiple reports with the same asset", () => {
    it("When the asset appears in older and newer reports, Then uses data from the most recent report", () => {
      // Given
      const relatorioOlder = criarRelatorioMinimo({
        mesReferencia: "2025-01",
        posicoesDetalhadas: [
          criarPosicao({
            nomeAtivo: "Petrobras PN",
            codigoAtivo: "PETR4",
            estrategia: "Renda Variavel",
            rentabilidade12Meses: 8.0,
          }),
        ],
      });
      const relatorioNewer = criarRelatorioMinimo({
        mesReferencia: "2025-03",
        posicoesDetalhadas: [
          criarPosicao({
            nomeAtivo: "Petrobras PN",
            codigoAtivo: "PETR4",
            estrategia: "Renda Variavel",
            rentabilidade12Meses: 12.5,
          }),
        ],
      });

      // When
      const result = listarAtivosUnicos([relatorioOlder, relatorioNewer]);

      // Then
      expect(result).toHaveLength(1);
      expect(result[0]!.rentabilidade12Meses).toBe(12.5);
    });
  });

  describe("Given assets with duplicate codes (case-insensitive)", () => {
    it("When two reports have the same asset with different code casing, Then deduplicates by uppercased key", () => {
      // Given
      const relatorio1 = criarRelatorioMinimo({
        mesReferencia: "2025-01",
        posicoesDetalhadas: [
          criarPosicao({
            nomeAtivo: "Vale S.A.",
            codigoAtivo: "VALE3",
            estrategia: "Renda Variavel",
            rentabilidade12Meses: 5.0,
          }),
        ],
      });
      const relatorio2 = criarRelatorioMinimo({
        mesReferencia: "2025-03",
        posicoesDetalhadas: [
          criarPosicao({
            nomeAtivo: "Vale SA",
            codigoAtivo: "vale3",
            estrategia: "Renda Variavel",
            rentabilidade12Meses: 7.0,
          }),
        ],
      });

      // When
      const result = listarAtivosUnicos([relatorio1, relatorio2]);

      // Then
      expect(result).toHaveLength(1);
      expect(result[0]!.rentabilidade12Meses).toBe(7.0);
    });
  });

  describe("Given an asset without codigoAtivo", () => {
    it("When the asset has null codigoAtivo, Then uses nomeAtivo as codigoAtivo and as unique key", () => {
      // Given
      const relatorio = criarRelatorioMinimo({
        posicoesDetalhadas: [
          criarPosicao({
            nomeAtivo: "Fundo XP Macro FIM",
            codigoAtivo: null,
            estrategia: "Multimercado",
            rentabilidade12Meses: 5.5,
          }),
        ],
      });

      // When
      const result = listarAtivosUnicos([relatorio]);

      // Then
      expect(result).toHaveLength(1);
      expect(result[0]!.codigoAtivo).toBe("Fundo XP Macro FIM");
      expect(result[0]!.nomeAtivo).toBe("Fundo XP Macro FIM");
    });

    it("When the same nomeAtivo appears in two reports without codigoAtivo, Then deduplicates using nomeAtivo as key", () => {
      // Given
      const relatorioOlder = criarRelatorioMinimo({
        mesReferencia: "2025-01",
        posicoesDetalhadas: [
          criarPosicao({
            nomeAtivo: "Fundo XP Macro FIM",
            codigoAtivo: null,
            rentabilidade12Meses: 4.0,
          }),
        ],
      });
      const relatorioNewer = criarRelatorioMinimo({
        mesReferencia: "2025-02",
        posicoesDetalhadas: [
          criarPosicao({
            nomeAtivo: "Fundo XP Macro FIM",
            codigoAtivo: null,
            rentabilidade12Meses: 6.0,
          }),
        ],
      });

      // When
      const result = listarAtivosUnicos([relatorioOlder, relatorioNewer]);

      // Then
      expect(result).toHaveLength(1);
      expect(result[0]!.rentabilidade12Meses).toBe(6.0);
    });
  });

  describe("Given an asset with null rentabilidade12Meses", () => {
    it("When the asset has no 12-month track record, Then returns null for rentabilidade12Meses", () => {
      // Given
      const relatorio = criarRelatorioMinimo({
        posicoesDetalhadas: [
          criarPosicao({
            nomeAtivo: "Novo Fundo",
            codigoAtivo: "NF11",
            rentabilidade12Meses: null,
          }),
        ],
      });

      // When
      const result = listarAtivosUnicos([relatorio]);

      // Then
      expect(result).toHaveLength(1);
      expect(result[0]!.rentabilidade12Meses).toBeNull();
    });
  });

  describe("Given multiple reports with assets appearing and disappearing", () => {
    it("When assets come and go across reports, Then lists all assets ever seen", () => {
      // Given
      const relatorioJan = criarRelatorioMinimo({
        mesReferencia: "2025-01",
        posicoesDetalhadas: [
          criarPosicao({
            nomeAtivo: "Petrobras PN",
            codigoAtivo: "PETR4",
            estrategia: "Renda Variavel",
            rentabilidade12Meses: 10.0,
          }),
          criarPosicao({
            nomeAtivo: "Itau Unibanco",
            codigoAtivo: "ITUB4",
            estrategia: "Renda Variavel",
            rentabilidade12Meses: 8.0,
          }),
        ],
      });
      const relatorioFeb = criarRelatorioMinimo({
        mesReferencia: "2025-02",
        posicoesDetalhadas: [
          criarPosicao({
            nomeAtivo: "Vale SA",
            codigoAtivo: "VALE3",
            estrategia: "Renda Variavel",
            rentabilidade12Meses: 15.0,
          }),
          criarPosicao({
            nomeAtivo: "Itau Unibanco",
            codigoAtivo: "ITUB4",
            estrategia: "Renda Variavel",
            rentabilidade12Meses: 9.0,
          }),
        ],
      });

      // When
      const result = listarAtivosUnicos([relatorioJan, relatorioFeb]);

      // Then
      expect(result).toHaveLength(3);
      const tickers = result.map((a) => a.codigoAtivo);
      expect(tickers).toContain("PETR4");
      expect(tickers).toContain("VALE3");
      expect(tickers).toContain("ITUB4");

      // ITUB4 uses most recent (Feb) data
      const itub = result.find((a) => a.codigoAtivo === "ITUB4")!;
      expect(itub.rentabilidade12Meses).toBe(9.0);
    });
  });

  describe("Given reports with mixed assets (with and without codigoAtivo)", () => {
    it("When listing, Then correctly handles both types and sorts alphabetically by nomeAtivo", () => {
      // Given
      const relatorio = criarRelatorioMinimo({
        posicoesDetalhadas: [
          criarPosicao({
            nomeAtivo: "Zcash Fund FI",
            codigoAtivo: null,
            estrategia: "Alternativos",
          }),
          criarPosicao({
            nomeAtivo: "Ambev SA",
            codigoAtivo: "ABEV3",
            estrategia: "Renda Variavel",
          }),
          criarPosicao({
            nomeAtivo: "Bradesco PN",
            codigoAtivo: "BBDC4",
            estrategia: "Renda Variavel",
          }),
        ],
      });

      // When
      const result = listarAtivosUnicos([relatorio]);

      // Then
      expect(result).toHaveLength(3);
      expect(result[0]!.nomeAtivo).toBe("Ambev SA");
      expect(result[1]!.nomeAtivo).toBe("Bradesco PN");
      expect(result[2]!.nomeAtivo).toBe("Zcash Fund FI");
      expect(result[2]!.codigoAtivo).toBe("Zcash Fund FI");
    });
  });
});
