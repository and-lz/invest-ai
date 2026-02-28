import { describe, it, expect } from "vitest";
import {
  serializarContextoDashboard,
  serializarContextoInsights,
  serializarContextoTendencias,
  serializarContextoDesempenho,
} from "@/lib/serialize-chat-context";
import type { DashboardData } from "@/application/use-cases/get-dashboard-data";
import type { InsightsResponse } from "@/schemas/insights.schema";
import type { DadosTendencias } from "@/schemas/trends.schema";
import type { DadosAgregadosAtivo } from "@/schemas/asset-analysis.schema";

// ========== Test Data Factories ==========

function criarDashboardDataMinima(): DashboardData {
  return {
    mesAtual: "2025-01",
    quantidadeRelatorios: 3,
    resumoAtual: {
      patrimonioTotal: { valorEmCentavos: 100000000, moeda: "BRL" },
      patrimonioMesAnterior: null,
      ganhosFinanceirosNoMes: { valorEmCentavos: 500000, moeda: "BRL" },
      ganhosFinanceirosMesAnterior: null,
      aplicacoesNoMes: { valorEmCentavos: 0, moeda: "BRL" },
      resgatesNoMes: { valorEmCentavos: 0, moeda: "BRL" },
      eventosFinanceirosNoMes: { valorEmCentavos: 0, moeda: "BRL" },
      eventosFinanceirosMesAnterior: null,
      rentabilidadeMensal: { valor: 1.5 },
      rentabilidadeMensalAnterior: null,
      rentabilidadeAnual: { valor: 12 },
      rentabilidadeAnoAnterior: null,
      rentabilidadeDesdeInicio: { valor: 25 },
      dataInicioCarteira: "2023-01-01",
    },
    variacaoPatrimonialCentavos: 300000,
    comparacaoBenchmarksAtual: [],
    analiseRiscoRetorno: {
      mesesAcimaBenchmark: 8,
      mesesAbaixoBenchmark: 4,
      maiorRentabilidade: { valor: { valor: 5.2 }, mesAno: "2024-06" },
      menorRentabilidade: { valor: { valor: -2.1 }, mesAno: "2024-09" },
    },
    alocacaoAtual: [],
    melhoresPerformers: [],
    pioresPerformers: [],
    ganhosPorEstrategia: [],
    eventosRecentes: [],
    evolucaoPatrimonial: [],
    periodosDisponiveis: ["2025-01"],
    retornosMensais: [],
    faixasLiquidez: [],
    rentabilidadePorCategoria: [],
    movimentacoes: [],
    todasPosicoes: [],
    comparacaoPeriodos: [],
    evolucaoAlocacaoHistorica: [],
  };
}

function criarInsightsData(): InsightsResponse {
  return {
    mesReferencia: "2025-01",
    dataGeracao: "2025-02-01",
    resumoExecutivo: "Your portfolio is balanced.",
    insights: [
      {
        categoria: "risco",
        prioridade: "alta",
        titulo: "Risk alert",
        descricao: "High concentration",
        acaoSugerida: "Diversify",
        ativosRelacionados: [],
        impactoEstimado: null,
        concluida: false,
        statusAcao: "pendente",
      },
    ],
    alertas: [{ tipo: "atencao", mensagem: "Check allocation" }],
    recomendacoesLongoPrazo: ["Consider bonds"],
  };
}

function criarTendenciasData(): DadosTendencias {
  return {
    atualizadoEm: "2025-02-01T12:00:00Z",
    indicesMercado: [
      {
        nome: "Ibovespa",
        simbolo: "IBOV",
        valor: 125000,
        variacao: 1.5,
        atualizadoEm: "2025-02-01T12:00:00Z",
      },
    ],
    indicadoresMacro: [
      {
        nome: "SELIC",
        codigo: 432,
        valorAtual: 13.75,
        unidade: "% a.a.",
        historico: [],
      },
    ],
    maioresAltas: [
      {
        ticker: "PETR4",
        nome: "Petrobras",
        preco: 38.5,
        variacao: 3.2,
        volume: 50000000,
        marketCap: 500000000000,
        setor: "Energia",
        logo: "https://example.com/petr4.png",
      },
    ],
    maioresBaixas: [
      {
        ticker: "VALE3",
        nome: "Vale",
        preco: 62.1,
        variacao: -2.8,
        volume: 30000000,
        marketCap: 300000000000,
        setor: "Mineracao",
        logo: "https://example.com/vale3.png",
      },
    ],
    setoresPerformance: [
      {
        setor: "Energy",
        setorTraduzido: "Energia",
        variacaoMedia: 2.5,
        quantidadeAtivos: 10,
      },
    ],
    maisNegociados: [],
    maioresAltasFundos: [],
  };
}

function criarDesempenhoData(): DadosAgregadosAtivo {
  return {
    nomeAtivo: "Petrobras PN",
    codigoAtivo: "PETR4",
    estrategia: "Renda Variavel",
    estaNaCarteira: true,
    saldoAtualCentavos: 5000000,
    participacaoAtualCarteira: 15.5,
    cotacaoAtual: {
      preco: 38.5,
      variacao: 0.46,
      variacaoPercentual: 1.2,
      volume: 50000000,
      marketCap: 500000000000,
      maxima52Semanas: 42,
      minima52Semanas: 28,
      atualizadoEm: "2025-02-01T12:00:00Z",
    },
    dadosFundamentalistas: {
      precoLucro: 5.2,
      precoValorPatrimonial: 1.1,
      retornoSobrePatrimonio: 28,
      dividendYield: 12,
      dividaPatrimonio: null,
      margemLiquida: null,
      evEbitda: null,
      lucroLiquidoCentavos: null,
      receitaLiquidaCentavos: null,
      setor: "Energia",
    },
    historicoNaCarteira: [
      {
        mesAno: "2025-01",
        saldoBrutoCentavos: 5000000,
        rentabilidadeMes: 2,
        rentabilidade12Meses: 15,
        rentabilidadeDesdeInicio: null,
        participacaoNaCarteira: 15,
      },
    ],
    movimentacoesDoAtivo: [],
    eventosFinanceirosDoAtivo: [],
    historicoDividendos: [],
    analiseCacheada: { existe: false, dataAnalise: null },
  };
}

// ========== Tests ==========

describe("serializarContextoDashboard", () => {
  it("Given dashboard data, When serialized, Then output contains 'Resumo da Carteira' header", () => {
    // Given
    const dados = criarDashboardDataMinima();

    // When
    const result = serializarContextoDashboard(dados);

    // Then
    expect(result).toContain("## Resumo da Carteira");
  });

  it("Given dashboard data with patrimonio, When serialized, Then output contains 'Patrimonio Total' label", () => {
    // Given
    const dados = criarDashboardDataMinima();

    // When
    const result = serializarContextoDashboard(dados);

    // Then
    expect(result).toContain("Patrimonio Total");
  });

  it("Given dashboard data with patrimonio of R$ 1.000.000,00, When serialized, Then output contains formatted currency", () => {
    // Given
    const dados = criarDashboardDataMinima();
    // 100000000 centavos = R$ 1.000.000,00

    // When
    const result = serializarContextoDashboard(dados);

    // Then
    expect(result).toContain("1.000.000,00");
  });

  it("Given dashboard data with rentabilidade values, When serialized, Then output contains formatted percentages", () => {
    // Given
    const dados = criarDashboardDataMinima();

    // When
    const result = serializarContextoDashboard(dados);

    // Then
    expect(result).toContain("Rentabilidade Mensal: 1,50%");
    expect(result).toContain("Rentabilidade Anual: 12,00%");
    expect(result).toContain("Rentabilidade Desde Inicio: 25,00%");
  });

  it("Given dashboard data with variacao patrimonial, When serialized, Then output includes variacao line", () => {
    // Given
    const dados = criarDashboardDataMinima();

    // When
    const result = serializarContextoDashboard(dados);

    // Then
    expect(result).toContain("Variacao Patrimonial no Mes");
  });

  it("Given dashboard data with null variacao patrimonial, When serialized, Then output omits variacao line", () => {
    // Given
    const dados = criarDashboardDataMinima();
    dados.variacaoPatrimonialCentavos = null;

    // When
    const result = serializarContextoDashboard(dados);

    // Then
    expect(result).not.toContain("Variacao Patrimonial no Mes");
  });

  it("Given dashboard data with risco-retorno analysis, When serialized, Then output contains analytics section", () => {
    // Given
    const dados = criarDashboardDataMinima();

    // When
    const result = serializarContextoDashboard(dados);

    // Then
    expect(result).toContain("## Analise Risco-Retorno");
    expect(result).toContain("Meses acima do benchmark: 8");
    expect(result).toContain("Meses abaixo do benchmark: 4");
    expect(result).toContain("Maior rentabilidade: 5,20%");
    expect(result).toContain("2024-06");
    expect(result).toContain("Menor rentabilidade: -2,10%");
    expect(result).toContain("2024-09");
  });

  it("Given dashboard data with empty optional sections, When serialized, Then output still contains core sections", () => {
    // Given
    const dados = criarDashboardDataMinima();

    // When
    const result = serializarContextoDashboard(dados);

    // Then
    expect(result).toContain("## Resumo da Carteira");
    expect(result).toContain("## Analise Risco-Retorno");
    expect(result).not.toContain("## Comparacao com Benchmarks");
    expect(result).not.toContain("## Alocacao Atual");
    expect(result).not.toContain("## Melhores Ativos do Mes");
    expect(result).not.toContain("## Piores Ativos do Mes");
    expect(result).not.toContain("## Ganhos por Estrategia");
  });

  it("Given dashboard data with benchmarks, When serialized, Then output contains benchmark section", () => {
    // Given
    const dados = criarDashboardDataMinima();
    dados.comparacaoBenchmarksAtual = [
      {
        periodo: "No mes",
        carteira: { valor: 1.5 },
        cdi: { valor: 1.1 },
        ibovespa: { valor: -0.5 },
        ipca: { valor: 0.4 },
      },
    ];

    // When
    const result = serializarContextoDashboard(dados);

    // Then
    expect(result).toContain("## Comparacao com Benchmarks");
    expect(result).toContain("### No mes");
    expect(result).toContain("Carteira: 1,50%");
    expect(result).toContain("CDI: 1,10%");
    expect(result).toContain("Ibovespa: -0,50%");
    expect(result).toContain("IPCA: 0,40%");
  });

  it("Given dashboard data with top performers, When serialized, Then output contains performer sections", () => {
    // Given
    const dados = criarDashboardDataMinima();
    dados.melhoresPerformers = [
      {
        nomeAtivo: "Petrobras PN",
        codigoAtivo: "PETR4",
        estrategia: "Renda Variavel",
        saldoAnterior: { valorEmCentavos: 4000000, moeda: "BRL" },
        aplicacoes: { valorEmCentavos: 0, moeda: "BRL" },
        resgates: { valorEmCentavos: 0, moeda: "BRL" },
        eventosFinanceiros: { valorEmCentavos: 0, moeda: "BRL" },
        saldoBruto: { valorEmCentavos: 5000000, moeda: "BRL" },
        rentabilidadeMes: { valor: 3.5 },
        rentabilidade12Meses: null,
        rentabilidadeDesdeInicio: null,
        participacaoNaCarteira: { valor: 10 },
      },
    ];
    dados.pioresPerformers = [
      {
        nomeAtivo: "Vale ON",
        codigoAtivo: "VALE3",
        estrategia: "Renda Variavel",
        saldoAnterior: { valorEmCentavos: 3000000, moeda: "BRL" },
        aplicacoes: { valorEmCentavos: 0, moeda: "BRL" },
        resgates: { valorEmCentavos: 0, moeda: "BRL" },
        eventosFinanceiros: { valorEmCentavos: 0, moeda: "BRL" },
        saldoBruto: { valorEmCentavos: 2800000, moeda: "BRL" },
        rentabilidadeMes: { valor: -2.0 },
        rentabilidade12Meses: null,
        rentabilidadeDesdeInicio: null,
        participacaoNaCarteira: { valor: 7 },
      },
    ];

    // When
    const result = serializarContextoDashboard(dados);

    // Then
    expect(result).toContain("## Melhores Ativos do Mes");
    expect(result).toContain("Petrobras PN (PETR4)");
    expect(result).toContain("3,50%");
    expect(result).toContain("## Piores Ativos do Mes");
    expect(result).toContain("Vale ON (VALE3)");
    expect(result).toContain("-2,00%");
  });

  it("Given dashboard data with estrategias, When serialized, Then output contains strategy gains", () => {
    // Given
    const dados = criarDashboardDataMinima();
    dados.ganhosPorEstrategia = [
      {
        nomeEstrategia: "Renda Variavel",
        ganhoNoMes: { valorEmCentavos: 150000, moeda: "BRL" },
        ganhoNoAno: { valorEmCentavos: 300000, moeda: "BRL" },
        ganho3Meses: { valorEmCentavos: 200000, moeda: "BRL" },
        ganho6Meses: { valorEmCentavos: 250000, moeda: "BRL" },
        ganho12Meses: { valorEmCentavos: 400000, moeda: "BRL" },
        ganhoDesdeInicio: { valorEmCentavos: 800000, moeda: "BRL" },
      },
    ];

    // When
    const result = serializarContextoDashboard(dados);

    // Then
    expect(result).toContain("## Ganhos por Estrategia");
    expect(result).toContain("Renda Variavel");
  });

  it("Given dashboard data with periodo and relatorios count, When serialized, Then output includes metadata", () => {
    // Given
    const dados = criarDashboardDataMinima();

    // When
    const result = serializarContextoDashboard(dados);

    // Then
    expect(result).toContain("Periodo: 2025-01");
    expect(result).toContain("Quantidade de Relatorios: 3");
  });
});

describe("serializarContextoInsights", () => {
  it("Given insights data, When serialized, Then output contains insights header", () => {
    // Given
    const dados = criarInsightsData();

    // When
    const result = serializarContextoInsights(dados);

    // Then
    expect(result).toContain("## Insights da Carteira");
  });

  it("Given insights data with mes referencia, When serialized, Then output includes period metadata", () => {
    // Given
    const dados = criarInsightsData();

    // When
    const result = serializarContextoInsights(dados);

    // Then
    expect(result).toContain("Mes Referencia: 2025-01");
    expect(result).toContain("Data Geracao: 2025-02-01");
  });

  it("Given insights data with resumo executivo, When serialized, Then output contains executive summary", () => {
    // Given
    const dados = criarInsightsData();

    // When
    const result = serializarContextoInsights(dados);

    // Then
    expect(result).toContain("### Resumo Executivo");
    expect(result).toContain("Your portfolio is balanced.");
  });

  it("Given insights data with insights list, When serialized, Then output contains categorized insights", () => {
    // Given
    const dados = criarInsightsData();

    // When
    const result = serializarContextoInsights(dados);

    // Then
    expect(result).toContain("### Insights");
    expect(result).toContain("[risco] (alta) Risk alert: High concentration");
    expect(result).toContain("Acao: Diversify");
  });

  it("Given insights data with alertas, When serialized, Then output contains alerts section", () => {
    // Given
    const dados = criarInsightsData();

    // When
    const result = serializarContextoInsights(dados);

    // Then
    expect(result).toContain("### Alertas");
    expect(result).toContain("[atencao] Check allocation");
  });

  it("Given insights data with recomendacoes, When serialized, Then output contains recommendations", () => {
    // Given
    const dados = criarInsightsData();

    // When
    const result = serializarContextoInsights(dados);

    // Then
    expect(result).toContain("### Recomendacoes de Longo Prazo");
    expect(result).toContain("Consider bonds");
  });

  it("Given insights data with empty arrays, When serialized, Then output omits empty sections", () => {
    // Given
    const dados: InsightsResponse = {
      mesReferencia: "2025-01",
      dataGeracao: "2025-02-01",
      resumoExecutivo: "All good.",
      insights: [],
      alertas: [],
      recomendacoesLongoPrazo: [],
    };

    // When
    const result = serializarContextoInsights(dados);

    // Then
    expect(result).toContain("## Insights da Carteira");
    expect(result).toContain("### Resumo Executivo");
    expect(result).not.toContain("### Insights");
    expect(result).not.toContain("### Alertas");
    expect(result).not.toContain("### Recomendacoes de Longo Prazo");
  });

  it("Given insight without acao sugerida, When serialized, Then output omits action line", () => {
    // Given
    const dados = criarInsightsData();
    dados.insights[0]!.acaoSugerida = null;

    // When
    const result = serializarContextoInsights(dados);

    // Then
    expect(result).toContain("[risco] (alta) Risk alert: High concentration");
    expect(result).not.toContain("Acao:");
  });
});

describe("serializarContextoTendencias", () => {
  it("Given trends data, When serialized, Then output contains header with timestamp", () => {
    // Given
    const dados = criarTendenciasData();

    // When
    const result = serializarContextoTendencias(dados);

    // Then
    expect(result).toContain("## Tendencias de Mercado (atualizado em 2025-02-01T12:00:00Z)");
  });

  it("Given trends data with indices, When serialized, Then output contains market indices section", () => {
    // Given
    const dados = criarTendenciasData();

    // When
    const result = serializarContextoTendencias(dados);

    // Then
    expect(result).toContain("### Indices de Mercado");
    expect(result).toContain("Ibovespa (IBOV)");
    expect(result).toContain("+1,50%");
  });

  it("Given trends data with macro indicators, When serialized, Then output contains macro section", () => {
    // Given
    const dados = criarTendenciasData();

    // When
    const result = serializarContextoTendencias(dados);

    // Then
    expect(result).toContain("### Indicadores Macroeconomicos");
    expect(result).toContain("SELIC: 13.75 % a.a.");
  });

  it("Given trends data with top gainers, When serialized, Then output contains highest gains section", () => {
    // Given
    const dados = criarTendenciasData();

    // When
    const result = serializarContextoTendencias(dados);

    // Then
    expect(result).toContain("### Maiores Altas do Dia");
    expect(result).toContain("PETR4 (Petrobras)");
    expect(result).toContain("R$ 38.50");
    expect(result).toContain("+3,20%");
  });

  it("Given trends data with top losers, When serialized, Then output contains highest losses section", () => {
    // Given
    const dados = criarTendenciasData();

    // When
    const result = serializarContextoTendencias(dados);

    // Then
    expect(result).toContain("### Maiores Baixas do Dia");
    expect(result).toContain("VALE3 (Vale)");
    expect(result).toContain("R$ 62.10");
    expect(result).toContain("-2,80%");
  });

  it("Given trends data with sector performance, When serialized, Then output contains sector section", () => {
    // Given
    const dados = criarTendenciasData();

    // When
    const result = serializarContextoTendencias(dados);

    // Then
    expect(result).toContain("### Performance por Setor");
    expect(result).toContain("Energia");
    expect(result).toContain("+2,50%");
    expect(result).toContain("10 ativos");
  });

  it("Given trends data with all empty arrays, When serialized, Then output only contains header", () => {
    // Given
    const dados: DadosTendencias = {
      atualizadoEm: "2025-02-01T12:00:00Z",
      indicesMercado: [],
      indicadoresMacro: [],
      maioresAltas: [],
      maioresBaixas: [],
      setoresPerformance: [],
      maisNegociados: [],
      maioresAltasFundos: [],
    };

    // When
    const result = serializarContextoTendencias(dados);

    // Then
    expect(result).toContain("## Tendencias de Mercado");
    expect(result).not.toContain("### Indices de Mercado");
    expect(result).not.toContain("### Indicadores Macroeconomicos");
    expect(result).not.toContain("### Maiores Altas do Dia");
    expect(result).not.toContain("### Maiores Baixas do Dia");
    expect(result).not.toContain("### Performance por Setor");
  });

  it("Given trends data with negative index variation, When serialized, Then output omits plus sign", () => {
    // Given
    const dados = criarTendenciasData();
    dados.indicesMercado[0]!.variacao = -1.3;

    // When
    const result = serializarContextoTendencias(dados);

    // Then
    expect(result).toContain("-1,30%");
    expect(result).not.toContain("+-1,30%");
  });
});

describe("serializarContextoDesempenho", () => {
  it("Given asset performance data, When serialized, Then output contains asset name and ticker", () => {
    // Given
    const dados = criarDesempenhoData();

    // When
    const result = serializarContextoDesempenho(dados);

    // Then
    expect(result).toContain("## Ativo: Petrobras PN (PETR4)");
  });

  it("Given asset performance data with estrategia, When serialized, Then output contains strategy", () => {
    // Given
    const dados = criarDesempenhoData();

    // When
    const result = serializarContextoDesempenho(dados);

    // Then
    expect(result).toContain("Estrategia: Renda Variavel");
  });

  it("Given asset in portfolio, When serialized, Then output shows 'Sim' for carteira status", () => {
    // Given
    const dados = criarDesempenhoData();

    // When
    const result = serializarContextoDesempenho(dados);

    // Then
    expect(result).toContain("Esta na Carteira: Sim");
  });

  it("Given asset not in portfolio, When serialized, Then output shows 'Nao' for carteira status", () => {
    // Given
    const dados = criarDesempenhoData();
    dados.estaNaCarteira = false;

    // When
    const result = serializarContextoDesempenho(dados);

    // Then
    expect(result).toContain("Esta na Carteira: Nao");
  });

  it("Given asset with saldo, When serialized, Then output contains formatted balance", () => {
    // Given
    const dados = criarDesempenhoData();

    // When
    const result = serializarContextoDesempenho(dados);

    // Then
    // 5000000 centavos = R$ 50.000,00
    expect(result).toContain("Saldo Atual");
    expect(result).toContain("50.000,00");
  });

  it("Given asset with cotacao, When serialized, Then output contains price section", () => {
    // Given
    const dados = criarDesempenhoData();

    // When
    const result = serializarContextoDesempenho(dados);

    // Then
    expect(result).toContain("### Cotacao Atual");
    expect(result).toContain("Preco: R$ 38.50");
    expect(result).toContain("Variacao Dia: 1,20%");
  });

  it("Given asset without cotacao, When serialized, Then output omits cotacao section", () => {
    // Given
    const dados = criarDesempenhoData();
    dados.cotacaoAtual = null;

    // When
    const result = serializarContextoDesempenho(dados);

    // Then
    expect(result).not.toContain("### Cotacao Atual");
  });

  it("Given asset with fundamentalistas data, When serialized, Then output contains fundamentals section", () => {
    // Given
    const dados = criarDesempenhoData();

    // When
    const result = serializarContextoDesempenho(dados);

    // Then
    expect(result).toContain("### Dados Fundamentalistas");
    expect(result).toContain("P/L: 5.20");
    expect(result).toContain("P/VP: 1.10");
    expect(result).toContain("ROE: 28,00%");
    expect(result).toContain("Dividend Yield: 12,00%");
  });

  it("Given asset with null fundamentalistas fields, When serialized, Then output omits null entries", () => {
    // Given
    const dados = criarDesempenhoData();
    // dividaPatrimonio, margemLiquida, evEbitda are already null

    // When
    const result = serializarContextoDesempenho(dados);

    // Then
    expect(result).not.toContain("Divida/Patrimonio");
    expect(result).not.toContain("Margem Liquida");
  });

  it("Given asset without fundamentalistas, When serialized, Then output omits fundamentals section", () => {
    // Given
    const dados = criarDesempenhoData();
    dados.dadosFundamentalistas = null;

    // When
    const result = serializarContextoDesempenho(dados);

    // Then
    expect(result).not.toContain("### Dados Fundamentalistas");
  });

  it("Given asset with historico na carteira, When serialized, Then output contains history entries", () => {
    // Given
    const dados = criarDesempenhoData();

    // When
    const result = serializarContextoDesempenho(dados);

    // Then
    expect(result).toContain("### Historico na Carteira (ultimos meses)");
    expect(result).toContain("2025-01");
    expect(result).toContain("2,00%");
  });

  it("Given asset with empty historico, When serialized, Then output omits history section", () => {
    // Given
    const dados = criarDesempenhoData();
    dados.historicoNaCarteira = [];

    // When
    const result = serializarContextoDesempenho(dados);

    // Then
    expect(result).not.toContain("### Historico na Carteira");
  });

  it("Given asset with cached analysis, When serialized, Then output mentions analysis exists", () => {
    // Given
    const dados = criarDesempenhoData();
    dados.analiseCacheada = { existe: true, dataAnalise: "2025-01-15" };

    // When
    const result = serializarContextoDesempenho(dados);

    // Then
    expect(result).toContain("Análise Fortuna");
    expect(result).toContain("2025-01-15");
  });

  it("Given asset without cached analysis, When serialized, Then output omits analysis section", () => {
    // Given
    const dados = criarDesempenhoData();

    // When
    const result = serializarContextoDesempenho(dados);

    // Then
    expect(result).not.toContain("Análise Fortuna");
  });

  it("Given asset with null estrategia, When serialized, Then output shows N/A", () => {
    // Given
    const dados = criarDesempenhoData();
    dados.estrategia = null;

    // When
    const result = serializarContextoDesempenho(dados);

    // Then
    expect(result).toContain("Estrategia: N/A");
  });

  it("Given asset with participacao, When serialized, Then output contains formatted percentage", () => {
    // Given
    const dados = criarDesempenhoData();

    // When
    const result = serializarContextoDesempenho(dados);

    // Then
    expect(result).toContain("Participacao na Carteira: 15,50%");
  });
});
