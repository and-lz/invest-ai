import { describe, it, expect } from "vitest";
import { gerarConclusaoRetornosMensais } from "@/components/dashboard/monthly-returns-heatmap";
import { gerarConclusaoRiscoConsistencia } from "@/components/dashboard/risk-consistency-card";
import { gerarConclusaoLiquidez } from "@/components/dashboard/liquidity-ladder";
import { gerarConclusaoTodasPosicoes } from "@/components/dashboard/all-positions-table";
import { gerarConclusaoCategorias } from "@/components/dashboard/category-performance-chart";
import { gerarConclusaoMovimentacoes } from "@/components/dashboard/transactions-table";
import { gerarConclusaoEvolucaoAlocacao } from "@/components/dashboard/allocation-evolution-chart";
import { gerarConclusaoComparacaoPeriodos } from "@/components/dashboard/period-comparison-detail";
import type {
  RetornoAnual,
  AnaliseRiscoRetorno,
  FaixaLiquidez,
  PosicaoAtivo,
  RentabilidadePorCategoria,
  Movimentacao,
  AlocacaoMensal,
  ComparacaoPeriodo,
} from "@/schemas/report-extraction.schema";

// ========== Helpers ==========

const criarMoney = (valorEmCentavos: number) => ({
  valorEmCentavos,
  moeda: "BRL",
});

const criarPercentual = (valor: number) => ({ valor });

// ========== gerarConclusaoRetornosMensais ==========

describe("gerarConclusaoRetornosMensais", () => {
  it("retorna vazio para lista vazia", () => {
    expect(gerarConclusaoRetornosMensais([])).toEqual([]);
  });

  it("calcula taxa de consistencia com maioria positiva", () => {
    const retornos: RetornoAnual[] = [
      {
        ano: 2024,
        meses: [
          { mes: 1, rentabilidadeCarteira: criarPercentual(1.5), percentualDoCDI: criarPercentual(120) },
          { mes: 2, rentabilidadeCarteira: criarPercentual(2.0), percentualDoCDI: criarPercentual(150) },
          { mes: 3, rentabilidadeCarteira: criarPercentual(-0.5), percentualDoCDI: null },
          { mes: 4, rentabilidadeCarteira: criarPercentual(0.8), percentualDoCDI: criarPercentual(80) },
          { mes: 5, rentabilidadeCarteira: criarPercentual(1.2), percentualDoCDI: criarPercentual(100) },
          { mes: 6, rentabilidadeCarteira: null, percentualDoCDI: null },
          { mes: 7, rentabilidadeCarteira: null, percentualDoCDI: null },
          { mes: 8, rentabilidadeCarteira: null, percentualDoCDI: null },
          { mes: 9, rentabilidadeCarteira: null, percentualDoCDI: null },
          { mes: 10, rentabilidadeCarteira: null, percentualDoCDI: null },
          { mes: 11, rentabilidadeCarteira: null, percentualDoCDI: null },
          { mes: 12, rentabilidadeCarteira: null, percentualDoCDI: null },
        ],
        rentabilidadeAnual: criarPercentual(5.0),
        rentabilidadeAcumulada: criarPercentual(5.0),
      },
    ];

    const resultado = gerarConclusaoRetornosMensais(retornos);
    expect(resultado.length).toBeGreaterThanOrEqual(1);
    expect(resultado[0]!.tipo).toBe("positivo");
    expect(resultado[0]!.texto).toContain("4 meses positivos");
    expect(resultado[0]!.texto).toContain("80%");
  });

  it("identifica consistencia baixa quando maioria negativa", () => {
    const retornos: RetornoAnual[] = [
      {
        ano: 2024,
        meses: [
          { mes: 1, rentabilidadeCarteira: criarPercentual(-1.5), percentualDoCDI: null },
          { mes: 2, rentabilidadeCarteira: criarPercentual(-2.0), percentualDoCDI: null },
          { mes: 3, rentabilidadeCarteira: criarPercentual(0.5), percentualDoCDI: criarPercentual(50) },
          { mes: 4, rentabilidadeCarteira: criarPercentual(-0.8), percentualDoCDI: null },
          { mes: 5, rentabilidadeCarteira: criarPercentual(-1.2), percentualDoCDI: null },
          { mes: 6, rentabilidadeCarteira: null, percentualDoCDI: null },
          { mes: 7, rentabilidadeCarteira: null, percentualDoCDI: null },
          { mes: 8, rentabilidadeCarteira: null, percentualDoCDI: null },
          { mes: 9, rentabilidadeCarteira: null, percentualDoCDI: null },
          { mes: 10, rentabilidadeCarteira: null, percentualDoCDI: null },
          { mes: 11, rentabilidadeCarteira: null, percentualDoCDI: null },
          { mes: 12, rentabilidadeCarteira: null, percentualDoCDI: null },
        ],
        rentabilidadeAnual: criarPercentual(-5.0),
        rentabilidadeAcumulada: criarPercentual(-5.0),
      },
    ];

    const resultado = gerarConclusaoRetornosMensais(retornos);
    expect(resultado[0]!.tipo).toBe("atencao");
  });

  it("mostra melhor e pior ano quando ha multiplos anos", () => {
    const retornos: RetornoAnual[] = [
      {
        ano: 2023,
        meses: Array.from({ length: 12 }, (_, indice) => ({
          mes: indice + 1,
          rentabilidadeCarteira: criarPercentual(1),
          percentualDoCDI: criarPercentual(100),
        })),
        rentabilidadeAnual: criarPercentual(12),
        rentabilidadeAcumulada: criarPercentual(12),
      },
      {
        ano: 2024,
        meses: Array.from({ length: 12 }, (_, indice) => ({
          mes: indice + 1,
          rentabilidadeCarteira: criarPercentual(0.5),
          percentualDoCDI: criarPercentual(50),
        })),
        rentabilidadeAnual: criarPercentual(6),
        rentabilidadeAcumulada: criarPercentual(18.72),
      },
    ];

    const resultado = gerarConclusaoRetornosMensais(retornos);
    expect(resultado.length).toBe(2);
    expect(resultado[1]!.texto).toContain("Melhor ano: 2023");
    expect(resultado[1]!.texto).toContain("Pior ano: 2024");
  });
});

// ========== gerarConclusaoRiscoConsistencia ==========

describe("gerarConclusaoRiscoConsistencia", () => {
  it("identifica alta consistencia (>60%)", () => {
    const analise: AnaliseRiscoRetorno = {
      mesesAcimaBenchmark: 30,
      mesesAbaixoBenchmark: 10,
      maiorRentabilidade: { valor: criarPercentual(5.0), mesAno: "Mai/2023" },
      menorRentabilidade: { valor: criarPercentual(-2.0), mesAno: "Jun/2022" },
    };

    const resultado = gerarConclusaoRiscoConsistencia(analise);
    expect(resultado[0]!.tipo).toBe("positivo");
    expect(resultado[0]!.texto).toContain("75%");
  });

  it("identifica baixa consistencia (<40%)", () => {
    const analise: AnaliseRiscoRetorno = {
      mesesAcimaBenchmark: 10,
      mesesAbaixoBenchmark: 30,
      maiorRentabilidade: { valor: criarPercentual(2.0), mesAno: "Jan/2023" },
      menorRentabilidade: { valor: criarPercentual(-6.0), mesAno: "Jun/2022" },
    };

    const resultado = gerarConclusaoRiscoConsistencia(analise);
    expect(resultado[0]!.tipo).toBe("atencao");
    expect(resultado[1]!.tipo).toBe("atencao");
  });

  it("identifica resultado misto (40-60%)", () => {
    const analise: AnaliseRiscoRetorno = {
      mesesAcimaBenchmark: 25,
      mesesAbaixoBenchmark: 25,
      maiorRentabilidade: { valor: criarPercentual(3.0), mesAno: "Mar/2023" },
      menorRentabilidade: { valor: criarPercentual(-1.0), mesAno: "Oct/2022" },
    };

    const resultado = gerarConclusaoRiscoConsistencia(analise);
    expect(resultado[0]!.tipo).toBe("neutro");
  });

  it("retorna vazio quando nao ha meses", () => {
    const analise: AnaliseRiscoRetorno = {
      mesesAcimaBenchmark: 0,
      mesesAbaixoBenchmark: 0,
      maiorRentabilidade: { valor: criarPercentual(0), mesAno: "" },
      menorRentabilidade: { valor: criarPercentual(0), mesAno: "" },
    };

    const resultado = gerarConclusaoRiscoConsistencia(analise);
    expect(resultado).toEqual([]);
  });
});

// ========== gerarConclusaoLiquidez ==========

describe("gerarConclusaoLiquidez", () => {
  it("retorna vazio para lista vazia", () => {
    expect(gerarConclusaoLiquidez([])).toEqual([]);
  });

  it("destaca liquidez de curto prazo adequada", () => {
    const faixas: FaixaLiquidez[] = [
      {
        descricaoPeriodo: "0 a 1",
        diasMinimo: 0,
        diasMaximo: 1,
        percentualDaCarteira: criarPercentual(20),
        valor: criarMoney(8000000),
        valorAcumulado: criarMoney(8000000),
        percentualAcumulado: criarPercentual(20),
      },
      {
        descricaoPeriodo: "2 a 5",
        diasMinimo: 2,
        diasMaximo: 5,
        percentualDaCarteira: criarPercentual(15),
        valor: criarMoney(6000000),
        valorAcumulado: criarMoney(14000000),
        percentualAcumulado: criarPercentual(35),
      },
    ];

    const resultado = gerarConclusaoLiquidez(faixas);
    expect(resultado[0]!.tipo).toBe("positivo");
    expect(resultado[0]!.texto).toContain("35,00%");
    expect(resultado[0]!.texto).toContain("até 5 dias");
  });

  it("alerta quando liquidez de longo prazo e alta", () => {
    const faixas: FaixaLiquidez[] = [
      {
        descricaoPeriodo: "0 a 1",
        diasMinimo: 0,
        diasMaximo: 1,
        percentualDaCarteira: criarPercentual(5),
        valor: criarMoney(2000000),
        valorAcumulado: criarMoney(2000000),
        percentualAcumulado: criarPercentual(5),
      },
      {
        descricaoPeriodo: "91 a 180",
        diasMinimo: 91,
        diasMaximo: 180,
        percentualDaCarteira: criarPercentual(60),
        valor: criarMoney(24000000),
        valorAcumulado: criarMoney(38000000),
        percentualAcumulado: criarPercentual(95),
      },
    ];

    const resultado = gerarConclusaoLiquidez(faixas);
    expect(resultado.length).toBe(2);
    expect(resultado[1]!.tipo).toBe("atencao");
    expect(resultado[1]!.texto).toContain("acima de 90 dias");
  });
});

// ========== gerarConclusaoTodasPosicoes ==========

describe("gerarConclusaoTodasPosicoes", () => {
  const criarPosicao = (
    nome: string,
    rentabilidadeMes: number,
    participacao: number,
  ): PosicaoAtivo => ({
    nomeAtivo: nome,
    codigoAtivo: nome,
    estrategia: "Liquidez",
    saldoAnterior: criarMoney(100000),
    aplicacoes: criarMoney(0),
    resgates: criarMoney(0),
    eventosFinanceiros: criarMoney(0),
    saldoBruto: criarMoney(100000),
    rentabilidadeMes: criarPercentual(rentabilidadeMes),
    rentabilidade12Meses: criarPercentual(rentabilidadeMes * 10),
    rentabilidadeDesdeInicio: criarPercentual(rentabilidadeMes * 20),
    participacaoNaCarteira: criarPercentual(participacao),
  });

  it("retorna vazio para lista vazia", () => {
    expect(gerarConclusaoTodasPosicoes([])).toEqual([]);
  });

  it("conta posicoes positivas e negativas", () => {
    const posicoes = [
      criarPosicao("VALE3", 5.0, 30),
      criarPosicao("ITUB4", 2.0, 20),
      criarPosicao("PETR4", -1.0, 25),
    ];

    const resultado = gerarConclusaoTodasPosicoes(posicoes);
    expect(resultado[0]!.tipo).toBe("positivo");
    expect(resultado[0]!.texto).toContain("3 posições");
    expect(resultado[0]!.texto).toContain("2 estão positivas");
    expect(resultado[0]!.texto).toContain("1 negativas");
  });

  it("destaca posicao muito concentrada", () => {
    const posicoes = [criarPosicao("VALE3", 5.0, 30)];

    const resultado = gerarConclusaoTodasPosicoes(posicoes);
    expect(resultado.length).toBe(2);
    expect(resultado[1]!.texto).toContain("VALE3");
    expect(resultado[1]!.texto).toContain("30,00%");
  });
});

// ========== gerarConclusaoCategorias ==========

describe("gerarConclusaoCategorias", () => {
  it("retorna vazio para lista vazia", () => {
    expect(gerarConclusaoCategorias([])).toEqual([]);
  });

  it("identifica melhor e pior categoria", () => {
    const categorias: RentabilidadePorCategoria[] = [
      { nomeCategoria: "Renda Variavel", rentabilidade12Meses: criarPercentual(25) },
      { nomeCategoria: "Liquidez", rentabilidade12Meses: criarPercentual(14) },
      { nomeCategoria: "Global", rentabilidade12Meses: criarPercentual(-5) },
    ];

    const resultado = gerarConclusaoCategorias(categorias);
    expect(resultado[0]!.texto).toContain("Renda Variavel");
    expect(resultado[0]!.texto).toContain("Global");
    expect(resultado[0]!.tipo).toBe("positivo");
  });

  it("compara com CDI quando fornecido", () => {
    const categorias: RentabilidadePorCategoria[] = [
      { nomeCategoria: "Renda Variavel", rentabilidade12Meses: criarPercentual(25) },
      { nomeCategoria: "Liquidez", rentabilidade12Meses: criarPercentual(14) },
      { nomeCategoria: "Global", rentabilidade12Meses: criarPercentual(5) },
    ];

    const resultado = gerarConclusaoCategorias(categorias, 14.5);
    expect(resultado.length).toBe(2);
    expect(resultado[1]!.texto).toContain("1 de 3 categorias bateram o CDI");
  });
});

// ========== gerarConclusaoMovimentacoes ==========

describe("gerarConclusaoMovimentacoes", () => {
  it("retorna vazio para lista vazia", () => {
    expect(gerarConclusaoMovimentacoes([])).toEqual([]);
  });

  it("calcula fluxo liquido positivo", () => {
    const movimentacoes: Movimentacao[] = [
      {
        data: "2024-01-15",
        tipoMovimentacao: "Aplicacao",
        nomeAtivo: "Inter Conservador",
        codigoAtivo: null,
        valor: criarMoney(500000),
        descricao: null,
      },
      {
        data: "2024-01-20",
        tipoMovimentacao: "Resgate",
        nomeAtivo: "CDB",
        codigoAtivo: null,
        valor: criarMoney(200000),
        descricao: null,
      },
    ];

    const resultado = gerarConclusaoMovimentacoes(movimentacoes);
    expect(resultado[0]!.tipo).toBe("positivo");
    expect(resultado[0]!.texto).toContain("Fluxo líquido");
  });

  it("identifica fluxo negativo como atencao", () => {
    const movimentacoes: Movimentacao[] = [
      {
        data: "2024-01-15",
        tipoMovimentacao: "Resgate",
        nomeAtivo: "CDB",
        codigoAtivo: null,
        valor: criarMoney(500000),
        descricao: null,
      },
      {
        data: "2024-01-20",
        tipoMovimentacao: "Aplicacao",
        nomeAtivo: "Inter Conservador",
        codigoAtivo: null,
        valor: criarMoney(100000),
        descricao: null,
      },
    ];

    const resultado = gerarConclusaoMovimentacoes(movimentacoes);
    expect(resultado[0]!.tipo).toBe("atencao");
  });
});

// ========== gerarConclusaoEvolucaoAlocacao ==========

describe("gerarConclusaoEvolucaoAlocacao", () => {
  it("retorna vazio para menos de 2 meses", () => {
    const evolucao: AlocacaoMensal[] = [
      {
        mesAno: "2024-01",
        categorias: [{ nomeCategoria: "Liquidez", percentualDaCarteira: criarPercentual(100) }],
      },
    ];

    expect(gerarConclusaoEvolucaoAlocacao(evolucao)).toEqual([]);
  });

  it("identifica maior mudanca de alocacao", () => {
    const evolucao: AlocacaoMensal[] = [
      {
        mesAno: "2024-01",
        categorias: [
          { nomeCategoria: "Liquidez", percentualDaCarteira: criarPercentual(50) },
          { nomeCategoria: "Renda Variavel", percentualDaCarteira: criarPercentual(50) },
        ],
      },
      {
        mesAno: "2024-06",
        categorias: [
          { nomeCategoria: "Liquidez", percentualDaCarteira: criarPercentual(20) },
          { nomeCategoria: "Renda Variavel", percentualDaCarteira: criarPercentual(80) },
        ],
      },
    ];

    const resultado = gerarConclusaoEvolucaoAlocacao(evolucao);
    expect(resultado.length).toBe(1);
    expect(resultado[0]!.texto).toContain("maior mudança");
  });
});

// ========== gerarConclusaoComparacaoPeriodos ==========

describe("gerarConclusaoComparacaoPeriodos", () => {
  it("retorna vazio para lista vazia", () => {
    expect(gerarConclusaoComparacaoPeriodos([])).toEqual([]);
  });

  it("conta periodos que batem o CDI", () => {
    const periodos: ComparacaoPeriodo[] = [
      {
        periodo: "03 meses",
        rentabilidadeCarteira: criarPercentual(5),
        rentabilidadeCDI: criarPercentual(3),
        percentualDoCDI: criarPercentual(166),
        volatilidade: criarPercentual(4),
      },
      {
        periodo: "12 meses",
        rentabilidadeCarteira: criarPercentual(12),
        rentabilidadeCDI: criarPercentual(14),
        percentualDoCDI: criarPercentual(85),
        volatilidade: criarPercentual(5),
      },
      {
        periodo: "Desde o Inicio",
        rentabilidadeCarteira: criarPercentual(50),
        rentabilidadeCDI: criarPercentual(55),
        percentualDoCDI: criarPercentual(90),
        volatilidade: criarPercentual(6),
      },
    ];

    const resultado = gerarConclusaoComparacaoPeriodos(periodos);
    expect(resultado[0]!.texto).toContain("1 de 3");
    expect(resultado[0]!.tipo).toBe("neutro");
  });

  it("calcula volatilidade media", () => {
    const periodos: ComparacaoPeriodo[] = [
      {
        periodo: "03 meses",
        rentabilidadeCarteira: criarPercentual(5),
        rentabilidadeCDI: criarPercentual(3),
        percentualDoCDI: criarPercentual(166),
        volatilidade: criarPercentual(3),
      },
      {
        periodo: "12 meses",
        rentabilidadeCarteira: criarPercentual(15),
        rentabilidadeCDI: criarPercentual(14),
        percentualDoCDI: criarPercentual(107),
        volatilidade: criarPercentual(7),
      },
    ];

    const resultado = gerarConclusaoComparacaoPeriodos(periodos);
    expect(resultado.length).toBe(2);
    expect(resultado[1]!.texto).toContain("5,00%");
  });

  it("classifica como positivo quando maioria bate CDI", () => {
    const periodos: ComparacaoPeriodo[] = [
      {
        periodo: "03 meses",
        rentabilidadeCarteira: criarPercentual(5),
        rentabilidadeCDI: criarPercentual(3),
        percentualDoCDI: criarPercentual(166),
        volatilidade: null,
      },
      {
        periodo: "12 meses",
        rentabilidadeCarteira: criarPercentual(16),
        rentabilidadeCDI: criarPercentual(14),
        percentualDoCDI: criarPercentual(114),
        volatilidade: null,
      },
    ];

    const resultado = gerarConclusaoComparacaoPeriodos(periodos);
    expect(resultado[0]!.tipo).toBe("positivo");
    expect(resultado[0]!.texto).toContain("2 de 2");
  });
});
