import { describe, it, expect } from "vitest";
import {
  serializarRelatorioMarkdown,
  serializarRelatoriosConsolidadoMarkdown,
} from "@/lib/serialize-report-markdown";
import type {
  RelatorioExtraido,
  Money,
  Percentual,
  Resumo,
  AlocacaoMensal,
  PontoEvolucaoPatrimonial,
  ComparacaoPeriodo,
  RetornoAnual,
  ComparacaoBenchmarks,
  RentabilidadePorCategoria,
  EventoFinanceiro,
  GanhosPorEstrategia,
  FaixaLiquidez,
  PosicaoAtivo,
  Movimentacao,
} from "@/schemas/report-extraction.schema";

// ========== Test Data Factories ==========

const criarMoney = (valorEmCentavos: number): Money => ({
  valorEmCentavos,
  moeda: "BRL",
});

const criarPercentual = (valor: number): Percentual => ({
  valor,
});

const criarResumoCompleto = (): Resumo => ({
  patrimonioTotal: criarMoney(44570063),
  patrimonioMesAnterior: criarMoney(41533291),
  ganhosFinanceirosNoMes: criarMoney(1328905),
  ganhosFinanceirosMesAnterior: criarMoney(551406),
  aplicacoesNoMes: criarMoney(4164755),
  resgatesNoMes: criarMoney(2663437),
  eventosFinanceirosNoMes: criarMoney(119973),
  eventosFinanceirosMesAnterior: criarMoney(24485),
  rentabilidadeMensal: criarPercentual(3.14),
  rentabilidadeMensalAnterior: criarPercentual(1.37),
  rentabilidadeAnual: criarPercentual(3.14),
  rentabilidadeAnoAnterior: criarPercentual(1.67),
  rentabilidadeDesdeInicio: criarPercentual(58.55),
  dataInicioCarteira: "2022-01-20",
});

const criarResumoSemAnteriores = (): Resumo => ({
  patrimonioTotal: criarMoney(44570063),
  patrimonioMesAnterior: null,
  ganhosFinanceirosNoMes: criarMoney(1328905),
  ganhosFinanceirosMesAnterior: null,
  aplicacoesNoMes: criarMoney(4164755),
  resgatesNoMes: criarMoney(2663437),
  eventosFinanceirosNoMes: criarMoney(119973),
  eventosFinanceirosMesAnterior: null,
  rentabilidadeMensal: criarPercentual(3.14),
  rentabilidadeMensalAnterior: null,
  rentabilidadeAnual: criarPercentual(3.14),
  rentabilidadeAnoAnterior: null,
  rentabilidadeDesdeInicio: criarPercentual(58.55),
  dataInicioCarteira: "2022-01-20",
});

const criarRelatorioMinimo = (
  mesAno = "2026-01",
  resumo: Resumo = criarResumoCompleto(),
): RelatorioExtraido => ({
  metadados: {
    mesReferencia: mesAno,
    dataGeracao: "2026-01-31",
    instituicao: "Inter Prime",
  },
  resumo,
  evolucaoAlocacao: [],
  evolucaoPatrimonial: [],
  comparacaoPeriodos: [],
  analiseRiscoRetorno: {
    mesesAcimaBenchmark: 27,
    mesesAbaixoBenchmark: 22,
    maiorRentabilidade: { valor: criarPercentual(3.46), mesAno: "Maio/2022" },
    menorRentabilidade: { valor: criarPercentual(-6.14), mesAno: "Junho/2022" },
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

const criarRelatorioCompleto = (): RelatorioExtraido => ({
  ...criarRelatorioMinimo(),
  evolucaoAlocacao: criarEvolucaoAlocacao(),
  evolucaoPatrimonial: criarEvolucaoPatrimonial(),
  comparacaoPeriodos: criarComparacaoPeriodos(),
  retornosMensais: criarRetornosMensais(),
  comparacaoBenchmarks: criarComparacaoBenchmarks(),
  rentabilidadePorCategoria: criarRentabilidadePorCategoria(),
  eventosFinanceiros: criarEventosFinanceiros(),
  ganhosPorEstrategia: criarGanhosPorEstrategiaFactory(),
  faixasLiquidez: criarFaixasLiquidez(),
  posicoesDetalhadas: criarPosicoesDetalhadas(),
  movimentacoes: criarMovimentacoes(),
});

// ---- Section factories ----

function criarEvolucaoAlocacao(): AlocacaoMensal[] {
  return [
    {
      mesAno: "2025-12",
      categorias: [
        { nomeCategoria: "Liquidez" as const, percentualDaCarteira: criarPercentual(25) },
        { nomeCategoria: "Renda Variavel" as const, percentualDaCarteira: criarPercentual(33) },
      ],
    },
    {
      mesAno: "2026-01",
      categorias: [
        { nomeCategoria: "Liquidez" as const, percentualDaCarteira: criarPercentual(23.5) },
        { nomeCategoria: "Renda Variavel" as const, percentualDaCarteira: criarPercentual(35) },
      ],
    },
  ];
}

function criarEvolucaoPatrimonial(): PontoEvolucaoPatrimonial[] {
  return [
    { mesAno: "2025-12", patrimonioTotal: criarMoney(41533291), totalAportado: criarMoney(30000000) },
    { mesAno: "2026-01", patrimonioTotal: criarMoney(44570063), totalAportado: criarMoney(31500000) },
  ];
}

function criarComparacaoPeriodos(): ComparacaoPeriodo[] {
  return [
    {
      periodo: "03 meses",
      rentabilidadeCarteira: criarPercentual(5.16),
      rentabilidadeCDI: criarPercentual(3.48),
      percentualDoCDI: criarPercentual(148.32),
      volatilidade: criarPercentual(4.04),
    },
    {
      periodo: "12 meses",
      rentabilidadeCarteira: criarPercentual(15.99),
      rentabilidadeCDI: criarPercentual(14.5),
      percentualDoCDI: criarPercentual(110.31),
      volatilidade: null,
    },
  ];
}

function criarRetornosMensais(): RetornoAnual[] {
  return [
    {
      ano: 2025,
      meses: [
        { mes: 1, rentabilidadeCarteira: criarPercentual(1.67), percentualDoCDI: criarPercentual(165.12) },
        { mes: 2, rentabilidadeCarteira: criarPercentual(-0.43), percentualDoCDI: null },
        { mes: 3, rentabilidadeCarteira: null, percentualDoCDI: null },
      ],
      rentabilidadeAnual: criarPercentual(14.56),
      rentabilidadeAcumulada: criarPercentual(34.18),
    },
    {
      ano: 2026,
      meses: [
        { mes: 1, rentabilidadeCarteira: criarPercentual(3.14), percentualDoCDI: criarPercentual(270.69) },
      ],
      rentabilidadeAnual: criarPercentual(3.14),
      rentabilidadeAcumulada: criarPercentual(58.55),
    },
  ];
}

function criarComparacaoBenchmarks(): ComparacaoBenchmarks[] {
  return [
    {
      periodo: "No mes",
      carteira: criarPercentual(3.14),
      cdi: criarPercentual(1.16),
      ibovespa: criarPercentual(12.56),
      ipca: criarPercentual(0.2),
    },
  ];
}

function criarRentabilidadePorCategoria(): RentabilidadePorCategoria[] {
  return [
    { nomeCategoria: "Unit", rentabilidade12Meses: criarPercentual(24.23) },
    { nomeCategoria: "Acoes", rentabilidade12Meses: criarPercentual(20.86) },
  ];
}

function criarEventosFinanceiros(): EventoFinanceiro[] {
  return [
    {
      tipoEvento: "Dividendo" as const,
      nomeAtivo: "Egie3",
      codigoAtivo: "EGIE3",
      valor: criarMoney(2446),
      dataEvento: "2026-01-30",
    },
    {
      tipoEvento: "Aluguel" as const,
      nomeAtivo: "Nota De Aluguel",
      codigoAtivo: null,
      valor: criarMoney(80),
      dataEvento: null,
    },
  ];
}

function criarGanhosPorEstrategiaFactory(): GanhosPorEstrategia[] {
  return [
    {
      nomeEstrategia: "Liquidez",
      ganhoNoMes: criarMoney(160000),
      ganhoNoAno: criarMoney(160000),
      ganho3Meses: criarMoney(710000),
      ganho6Meses: criarMoney(1810000),
      ganho12Meses: criarMoney(3330000),
      ganhoDesdeInicio: criarMoney(6710000),
    },
  ];
}

function criarFaixasLiquidez(): FaixaLiquidez[] {
  return [
    {
      descricaoPeriodo: "0 a 1",
      diasMinimo: 0,
      diasMaximo: 1,
      percentualDaCarteira: criarPercentual(38.11),
      valor: criarMoney(16986901),
      valorAcumulado: criarMoney(16986901),
      percentualAcumulado: criarPercentual(38.11),
    },
  ];
}

function criarPosicoesDetalhadas(): PosicaoAtivo[] {
  return [
    {
      nomeAtivo: "INTER CONSERVADOR FIRF CP",
      codigoAtivo: null,
      estrategia: "Liquidez",
      saldoAnterior: criarMoney(14000000),
      aplicacoes: criarMoney(0),
      resgates: criarMoney(0),
      eventosFinanceiros: criarMoney(0),
      saldoBruto: criarMoney(14270000),
      rentabilidadeMes: criarPercentual(1.14),
      rentabilidade12Meses: criarPercentual(14.62),
      rentabilidadeDesdeInicio: criarPercentual(59.78),
      participacaoNaCarteira: criarPercentual(32.02),
    },
    {
      nomeAtivo: "FUNDO XYZ FIA",
      codigoAtivo: "XYZ11",
      estrategia: "Renda Variavel",
      saldoAnterior: criarMoney(500000),
      aplicacoes: criarMoney(0),
      resgates: criarMoney(0),
      eventosFinanceiros: criarMoney(0),
      saldoBruto: criarMoney(480000),
      rentabilidadeMes: criarPercentual(-4.0),
      rentabilidade12Meses: null,
      rentabilidadeDesdeInicio: null,
      participacaoNaCarteira: criarPercentual(1.08),
    },
  ];
}

function criarMovimentacoes(): Movimentacao[] {
  return [
    {
      data: "2026-01-30",
      tipoMovimentacao: "Rendimento" as const,
      nomeAtivo: "XPML11",
      codigoAtivo: "XPML11",
      valor: criarMoney(13340),
      descricao: null,
    },
    {
      data: "2026-01-28",
      tipoMovimentacao: "Rendimento" as const,
      nomeAtivo: "BTLG11",
      codigoAtivo: "BTLG11",
      valor: criarMoney(8927),
      descricao: null,
    },
    {
      data: "2026-01-15",
      tipoMovimentacao: "Resgate" as const,
      nomeAtivo: "CDB",
      codigoAtivo: null,
      valor: criarMoney(-2661574),
      descricao: "Resgate CDB",
    },
    {
      data: "2026-01-10",
      tipoMovimentacao: "Aplicacao" as const,
      nomeAtivo: "INTER CONSERVADOR",
      codigoAtivo: null,
      valor: criarMoney(4164755),
      descricao: null,
    },
  ];
}

// Non-breaking space used by Intl.NumberFormat for BRL currency
const NBSP = "\u00a0";

// ========== Tests ==========

describe("serializarRelatorioMarkdown", () => {
  describe("funcao principal", () => {
    it("deve conter heading H1 com mes/ano extenso", () => {
      const resultado = serializarRelatorioMarkdown(criarRelatorioMinimo());
      expect(resultado).toContain("# Relatorio de Investimentos - janeiro de 2026");
    });

    it("deve conter headings de todas as secoes com dados", () => {
      const resultado = serializarRelatorioMarkdown(criarRelatorioCompleto());
      expect(resultado).toContain("## Resumo da Carteira");
      expect(resultado).toContain("## Evolucao da Alocacao");
      expect(resultado).toContain("## Evolucao Patrimonial");
      expect(resultado).toContain("## Comparacao de Periodos");
      expect(resultado).toContain("## Analise de Risco e Retorno");
      expect(resultado).toContain("## Retornos Mensais");
      expect(resultado).toContain("## Comparacao com Benchmarks");
      expect(resultado).toContain("## Rentabilidade por Categoria");
      expect(resultado).toContain("## Eventos Financeiros");
      expect(resultado).toContain("## Ganhos por Estrategia");
      expect(resultado).toContain("## Faixas de Liquidez");
      expect(resultado).toContain("## Posicoes Detalhadas");
      expect(resultado).toContain("## Movimentacoes (Resumo Agregado)");
    });

    it("deve omitir secoes com arrays vazios", () => {
      const resultado = serializarRelatorioMarkdown(criarRelatorioMinimo());
      expect(resultado).not.toContain("## Evolucao da Alocacao");
      expect(resultado).not.toContain("## Evolucao Patrimonial");
      expect(resultado).not.toContain("## Retornos Mensais");
      expect(resultado).not.toContain("## Eventos Financeiros");
      expect(resultado).not.toContain("## Posicoes Detalhadas");
      expect(resultado).not.toContain("## Movimentacoes");
    });

    it("nao deve conter artefatos JSON (valorEmCentavos, moeda, valor como chave)", () => {
      const resultado = serializarRelatorioMarkdown(criarRelatorioCompleto());
      expect(resultado).not.toContain("valorEmCentavos");
      expect(resultado).not.toContain('"moeda"');
      expect(resultado).not.toContain('"valor"');
      expect(resultado).not.toContain('"BRL"');
    });

    it("todos os valores monetarios devem conter R$", () => {
      const resultado = serializarRelatorioMarkdown(criarRelatorioCompleto());
      // Verificar que o resumo tem valores formatados (Intl usa non-breaking space)
      expect(resultado).toContain(`R$${NBSP}445.700,63`);
      expect(resultado).toContain(`R$${NBSP}415.332,91`);
    });

    it("todos os percentuais devem conter %", () => {
      const resultado = serializarRelatorioMarkdown(criarRelatorioCompleto());
      expect(resultado).toContain("3,14%");
      expect(resultado).toContain("58,55%");
    });
  });

  describe("metadados", () => {
    it("deve formatar instituicao e data", () => {
      const resultado = serializarRelatorioMarkdown(criarRelatorioMinimo());
      expect(resultado).toContain("Instituicao: Inter Prime");
      expect(resultado).toContain("Data de geracao: 31/01/2026");
    });
  });

  describe("resumo", () => {
    it("deve incluir comparativos anteriores quando disponiveis", () => {
      const resultado = serializarRelatorioMarkdown(criarRelatorioMinimo());
      expect(resultado).toContain(`(anterior: R$${NBSP}415.332,91)`);
      expect(resultado).toContain("(anterior: 1,37%)");
      expect(resultado).toContain("(anterior: 1,67%)");
    });

    it("deve omitir comparativos quando nao disponiveis", () => {
      const relatorio = criarRelatorioMinimo("2026-01", criarResumoSemAnteriores());
      const resultado = serializarRelatorioMarkdown(relatorio);
      expect(resultado).toContain(`Patrimonio total: R$${NBSP}445.700,63`);
      expect(resultado).not.toContain("(anterior:");
    });

    it("deve incluir data de inicio da carteira", () => {
      const resultado = serializarRelatorioMarkdown(criarRelatorioMinimo());
      expect(resultado).toContain("desde 20/01/2022");
    });
  });

  describe("evolucao alocacao", () => {
    it("deve pivotar categorias como colunas", () => {
      const relatorio: RelatorioExtraido = {
        ...criarRelatorioMinimo(),
        evolucaoAlocacao: criarEvolucaoAlocacao(),
      };
      const resultado = serializarRelatorioMarkdown(relatorio);
      expect(resultado).toContain("| Mes | Liquidez | Renda Variavel |");
      expect(resultado).toContain("| dez/2025 |");
      expect(resultado).toContain("| jan/2026 |");
    });

    it("deve mostrar '-' para categoria ausente em um mes", () => {
      const relatorio: RelatorioExtraido = {
        ...criarRelatorioMinimo(),
        evolucaoAlocacao: [
          {
            mesAno: "2025-12",
            categorias: [
              { nomeCategoria: "Liquidez" as const, percentualDaCarteira: criarPercentual(25) },
              { nomeCategoria: "Renda Variavel" as const, percentualDaCarteira: criarPercentual(33) },
            ],
          },
          {
            mesAno: "2026-01",
            categorias: [
              { nomeCategoria: "Liquidez" as const, percentualDaCarteira: criarPercentual(23.5) },
              // Renda Variavel ausente neste mes
            ],
          },
        ],
      };
      const resultado = serializarRelatorioMarkdown(relatorio);
      // A segunda linha deve ter "-" na coluna de Renda Variavel
      const linhas = resultado.split("\n");
      const linhaJan2026 = linhas.find((linha) => linha.includes("jan/2026"));
      expect(linhaJan2026).toContain("| - |");
    });
  });

  describe("evolucao patrimonial", () => {
    it("deve formatar valores monetarios em tabela", () => {
      const relatorio: RelatorioExtraido = {
        ...criarRelatorioMinimo(),
        evolucaoPatrimonial: criarEvolucaoPatrimonial(),
      };
      const resultado = serializarRelatorioMarkdown(relatorio);
      expect(resultado).toContain("| Mes | Patrimonio | Total Aportado |");
      expect(resultado).toContain(`R$${NBSP}445.700,63`);
      expect(resultado).toContain(`R$${NBSP}315.000,00`);
    });
  });

  describe("comparacao periodos", () => {
    it("deve mostrar N/D para volatilidade null", () => {
      const relatorio: RelatorioExtraido = {
        ...criarRelatorioMinimo(),
        comparacaoPeriodos: criarComparacaoPeriodos(),
      };
      const resultado = serializarRelatorioMarkdown(relatorio);
      expect(resultado).toContain("| 12 meses |");
      // A linha de 12 meses tem volatilidade null
      const linhas = resultado.split("\n");
      const linha12Meses = linhas.find((linha) => linha.includes("12 meses"));
      expect(linha12Meses).toContain("N/D");
    });
  });

  describe("analise risco retorno", () => {
    it("deve formatar meses acima/abaixo e extremos", () => {
      const resultado = serializarRelatorioMarkdown(criarRelatorioMinimo());
      expect(resultado).toContain("Meses acima do benchmark: 27");
      expect(resultado).toContain("Meses abaixo do benchmark: 22");
      expect(resultado).toContain("Maior rentabilidade: 3,46% (Maio/2022)");
      expect(resultado).toContain("Menor rentabilidade: -6,14% (Junho/2022)");
    });
  });

  describe("retornos mensais", () => {
    it("deve filtrar meses com rentabilidade null", () => {
      const relatorio: RelatorioExtraido = {
        ...criarRelatorioMinimo(),
        retornosMensais: criarRetornosMensais(),
      };
      const resultado = serializarRelatorioMarkdown(relatorio);
      // Mes 3 de 2025 tem rentabilidadeCarteira null, nao deve aparecer
      expect(resultado).toContain("| Jan |");
      expect(resultado).toContain("| Fev |");
      // Mar nao deve estar na tabela (null)
      const linhasDe2025 = resultado.split("### 2025")[1]?.split("### 2026")[0] ?? "";
      expect(linhasDe2025).not.toContain("| Mar |");
    });

    it("deve incluir subtitulo com rentabilidade anual e acumulada", () => {
      const relatorio: RelatorioExtraido = {
        ...criarRelatorioMinimo(),
        retornosMensais: criarRetornosMensais(),
      };
      const resultado = serializarRelatorioMarkdown(relatorio);
      expect(resultado).toContain("### 2025 (anual: 14,56% | acumulada: 34,18%)");
    });

    it("deve mostrar N/D para percentualDoCDI null", () => {
      const relatorio: RelatorioExtraido = {
        ...criarRelatorioMinimo(),
        retornosMensais: criarRetornosMensais(),
      };
      const resultado = serializarRelatorioMarkdown(relatorio);
      // Fev/2025 tem percentualDoCDI null
      const linhas = resultado.split("\n");
      const linhaFev = linhas.find((linha) => linha.includes("| Fev |"));
      expect(linhaFev).toContain("N/D");
    });
  });

  describe("comparacao benchmarks", () => {
    it("deve formatar tabela com todos os benchmarks", () => {
      const relatorio: RelatorioExtraido = {
        ...criarRelatorioMinimo(),
        comparacaoBenchmarks: criarComparacaoBenchmarks(),
      };
      const resultado = serializarRelatorioMarkdown(relatorio);
      expect(resultado).toContain("| Periodo | Carteira | CDI | Ibovespa | IPCA |");
      expect(resultado).toContain("| No mes | 3,14% | 1,16% | 12,56% | 0,20% |");
    });
  });

  describe("rentabilidade por categoria", () => {
    it("deve listar categorias com rentabilidade 12 meses", () => {
      const relatorio: RelatorioExtraido = {
        ...criarRelatorioMinimo(),
        rentabilidadePorCategoria: criarRentabilidadePorCategoria(),
      };
      const resultado = serializarRelatorioMarkdown(relatorio);
      expect(resultado).toContain("| Unit | 24,23% |");
      expect(resultado).toContain("| Acoes | 20,86% |");
    });
  });

  describe("eventos financeiros", () => {
    it("deve formatar eventos com data, tipo e valor", () => {
      const relatorio: RelatorioExtraido = {
        ...criarRelatorioMinimo(),
        eventosFinanceiros: criarEventosFinanceiros(),
      };
      const resultado = serializarRelatorioMarkdown(relatorio);
      expect(resultado).toContain(`| 30/01/2026 | Dividendo | Egie3 | EGIE3 | R$${NBSP}24,46 |`);
    });

    it("deve mostrar '-' para codigoAtivo null e N/D para data null", () => {
      const relatorio: RelatorioExtraido = {
        ...criarRelatorioMinimo(),
        eventosFinanceiros: criarEventosFinanceiros(),
      };
      const resultado = serializarRelatorioMarkdown(relatorio);
      expect(resultado).toContain("| N/D | Aluguel | Nota De Aluguel | - |");
    });
  });

  describe("ganhos por estrategia", () => {
    it("deve usar formato compacto para valores", () => {
      const relatorio: RelatorioExtraido = {
        ...criarRelatorioMinimo(),
        ganhosPorEstrategia: criarGanhosPorEstrategiaFactory(),
      };
      const resultado = serializarRelatorioMarkdown(relatorio);
      expect(resultado).toContain("| Liquidez |");
      // formatCompactCurrency usa ponto decimal (toFixed) e espaco regular
      expect(resultado).toContain("R$ 1.6k");
      expect(resultado).toContain("R$ 67.1k");
    });
  });

  describe("faixas de liquidez", () => {
    it("deve formatar faixas com valores e acumulados", () => {
      const relatorio: RelatorioExtraido = {
        ...criarRelatorioMinimo(),
        faixasLiquidez: criarFaixasLiquidez(),
      };
      const resultado = serializarRelatorioMarkdown(relatorio);
      expect(resultado).toContain("| 0 a 1 dias |");
      expect(resultado).toContain("38,11%");
      expect(resultado).toContain(`R$${NBSP}169.869,01`);
    });
  });

  describe("posicoes detalhadas", () => {
    it("deve usar formato compacto para saldo e mostrar contagem no heading", () => {
      const relatorio: RelatorioExtraido = {
        ...criarRelatorioMinimo(),
        posicoesDetalhadas: criarPosicoesDetalhadas(),
      };
      const resultado = serializarRelatorioMarkdown(relatorio);
      expect(resultado).toContain("## Posicoes Detalhadas (2 ativos)");
      // formatCompactCurrency usa ponto decimal e espaco regular
      expect(resultado).toContain("R$ 142.7k");
    });

    it("deve mostrar N/D para rentabilidade12Meses e desdeInicio null", () => {
      const relatorio: RelatorioExtraido = {
        ...criarRelatorioMinimo(),
        posicoesDetalhadas: criarPosicoesDetalhadas(),
      };
      const resultado = serializarRelatorioMarkdown(relatorio);
      // FUNDO XYZ FIA tem rent 12m e inicio null
      const linhas = resultado.split("\n");
      const linhaXYZ = linhas.find((linha) => linha.includes("FUNDO XYZ FIA"));
      expect(linhaXYZ).toContain("N/D");
    });
  });

  describe("movimentacoes agregadas", () => {
    it("deve agregar movimentacoes por tipo com soma correta", () => {
      const relatorio: RelatorioExtraido = {
        ...criarRelatorioMinimo(),
        movimentacoes: criarMovimentacoes(),
      };
      const resultado = serializarRelatorioMarkdown(relatorio);
      // 2 rendimentos: 13340 + 8927 = 22267 centavos = R$ 222,67
      expect(resultado).toContain(`| Rendimento | 2 | R$${NBSP}222,67 |`);
      // 1 resgate: -2661574 centavos
      expect(resultado).toContain("| Resgate | 1 |");
      // 1 aplicacao: 4164755 centavos
      expect(resultado).toContain("| Aplicacao | 1 |");
    });

    it("deve ordenar por valor absoluto descrescente", () => {
      const relatorio: RelatorioExtraido = {
        ...criarRelatorioMinimo(),
        movimentacoes: criarMovimentacoes(),
      };
      const resultado = serializarRelatorioMarkdown(relatorio);
      const linhas = resultado.split("\n");
      const linhasTabela = linhas.filter(
        (linha) => linha.startsWith("| ") && !linha.startsWith("| Tipo") && !linha.startsWith("|---"),
      );
      const movimentacoesSecao = linhasTabela.filter(
        (linha) =>
          linha.includes("Aplicacao") ||
          linha.includes("Resgate") ||
          linha.includes("Rendimento"),
      );
      // Aplicacao (4164755) > Resgate (2661574) > Rendimento (22267)
      expect(movimentacoesSecao.length).toBe(3);
      expect(movimentacoesSecao[0]).toContain("Aplicacao");
      expect(movimentacoesSecao[1]).toContain("Resgate");
      expect(movimentacoesSecao[2]).toContain("Rendimento");
    });

    it("nao deve gerar secao para array vazio", () => {
      const resultado = serializarRelatorioMarkdown(criarRelatorioMinimo());
      expect(resultado).not.toContain("Movimentacoes");
    });
  });
});

describe("serializarRelatoriosConsolidadoMarkdown", () => {
  it("deve incluir header com contagem de meses", () => {
    const relatorios = [criarRelatorioMinimo("2025-12"), criarRelatorioMinimo("2026-01")];
    const resultado = serializarRelatoriosConsolidadoMarkdown(relatorios);
    expect(resultado).toContain("# Historico Consolidado (2 meses)");
  });

  it("deve conter ambos os relatorios separados", () => {
    const relatorios = [criarRelatorioMinimo("2025-12"), criarRelatorioMinimo("2026-01")];
    const resultado = serializarRelatoriosConsolidadoMarkdown(relatorios);
    expect(resultado).toContain("dezembro de 2025");
    expect(resultado).toContain("janeiro de 2026");
  });

  it("deve separar relatorios com ---", () => {
    const relatorios = [criarRelatorioMinimo("2025-12"), criarRelatorioMinimo("2026-01")];
    const resultado = serializarRelatoriosConsolidadoMarkdown(relatorios);
    expect(resultado).toContain("---");
  });

  it("deve tratar array vazio graciosamente", () => {
    const resultado = serializarRelatoriosConsolidadoMarkdown([]);
    expect(resultado).toContain("0 meses");
    expect(resultado).toContain("Nenhum relatorio disponivel");
  });
});
