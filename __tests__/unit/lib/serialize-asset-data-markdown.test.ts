import { describe, it, expect } from "vitest";
import {
  serializarDadosAtivoMarkdown,
  type DadosAtivoParaPrompt,
} from "@/lib/serialize-asset-data-markdown";

// ========== Test Data Factories ==========

function criarDadosAtivoCompleto(): DadosAtivoParaPrompt {
  return {
    codigoAtivo: "PETR4",
    nomeAtivo: "Petrobras PN",
    estrategia: "Renda Variavel",
    estaNaCarteira: true,
    historicoNaCarteira: [
      {
        mesAno: "2025-01",
        saldoBrutoCentavos: 5000000,
        rentabilidadeMes: 2.5,
        rentabilidade12Meses: 15,
        rentabilidadeDesdeInicio: null,
        participacaoNaCarteira: 10,
      },
    ],
    movimentacoesDoAtivo: [
      {
        data: "2025-01-15",
        tipo: "compra",
        valorCentavos: 200000,
        descricao: "Compra PETR4",
      },
    ],
    eventosFinanceirosDoAtivo: [
      {
        data: "2025-01-10",
        tipo: "dividendo",
        valorCentavos: 5000,
      },
    ],
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
      dividaPatrimonio: 0.5,
      margemLiquida: 25,
      evEbitda: 3.5,
      lucroLiquidoCentavos: 5000000000,
      receitaLiquidaCentavos: 20000000000,
      setor: "Energia",
    },
    historicoDividendosBrapi: [
      {
        dataExDividendo: "2025-01-05",
        dataPagamento: "2025-02-15",
        valor: 0.5,
        tipo: "dividendo",
      },
    ],
    benchmarksCarteira: [
      {
        periodo: "No Mes",
        carteira: { valor: 2.5 },
        cdi: { valor: 1.1 },
        ibovespa: { valor: -0.5 },
        ipca: { valor: 0.4 },
      },
    ],
    contextoMacro: {
      selicAtual: 13.75,
      ipcaAtual: 4.5,
      cdiAtual: 13.65,
    },
  };
}

function criarDadosAtivoMinimo(): DadosAtivoParaPrompt {
  return {
    codigoAtivo: "XPTO11",
    nomeAtivo: "Fundo XPTO",
    estrategia: null,
    estaNaCarteira: false,
    historicoNaCarteira: [],
    movimentacoesDoAtivo: [],
    eventosFinanceirosDoAtivo: [],
    cotacaoAtual: null,
    dadosFundamentalistas: null,
    historicoDividendosBrapi: [],
    benchmarksCarteira: [],
    contextoMacro: {
      selicAtual: 13.75,
      ipcaAtual: 4.5,
      cdiAtual: 13.65,
    },
  };
}

// ========== Tests ==========

describe("serializarDadosAtivoMarkdown", () => {
  describe("cabecalho", () => {
    it("Given complete asset data, When serialized, Then output contains header with name and ticker", () => {
      // Given
      const dados = criarDadosAtivoCompleto();

      // When
      const result = serializarDadosAtivoMarkdown(dados);

      // Then
      expect(result).toContain("# Analise de Ativo: Petrobras PN (PETR4)");
    });

    it("Given asset with strategy, When serialized, Then output contains 'Estrategia:' line", () => {
      // Given
      const dados = criarDadosAtivoCompleto();

      // When
      const result = serializarDadosAtivoMarkdown(dados);

      // Then
      expect(result).toContain("- Estrategia: Renda Variavel");
    });

    it("Given asset without strategy, When serialized, Then output omits strategy line", () => {
      // Given
      const dados = criarDadosAtivoMinimo();

      // When
      const result = serializarDadosAtivoMarkdown(dados);

      // Then
      expect(result).not.toContain("Estrategia:");
    });

    it("Given asset in portfolio, When serialized, Then output shows 'Na carteira do usuario: Sim'", () => {
      // Given
      const dados = criarDadosAtivoCompleto();

      // When
      const result = serializarDadosAtivoMarkdown(dados);

      // Then
      expect(result).toContain("Na carteira do usuario: Sim");
    });

    it("Given asset not in portfolio, When serialized, Then output shows 'Na carteira do usuario: Nao'", () => {
      // Given
      const dados = criarDadosAtivoMinimo();

      // When
      const result = serializarDadosAtivoMarkdown(dados);

      // Then
      expect(result).toContain("Na carteira do usuario: Nao");
    });
  });

  describe("cotacao atual", () => {
    it("Given asset with cotacao, When serialized, Then output contains 'Cotacao Atual' section with price", () => {
      // Given
      const dados = criarDadosAtivoCompleto();

      // When
      const result = serializarDadosAtivoMarkdown(dados);

      // Then
      expect(result).toContain("## Cotacao Atual");
      expect(result).toContain("Preco:");
      expect(result).toContain("Variacao:");
      expect(result).toContain("Volume:");
    });

    it("Given asset with cotacao including 52-week data, When serialized, Then output contains max/min", () => {
      // Given
      const dados = criarDadosAtivoCompleto();

      // When
      const result = serializarDadosAtivoMarkdown(dados);

      // Then
      expect(result).toContain("Maxima 52 semanas");
      expect(result).toContain("Minima 52 semanas");
    });

    it("Given asset with cotacao including market cap, When serialized, Then output contains market cap", () => {
      // Given
      const dados = criarDadosAtivoCompleto();

      // When
      const result = serializarDadosAtivoMarkdown(dados);

      // Then
      expect(result).toContain("Market Cap:");
    });

    it("Given asset without cotacao, When serialized, Then output omits cotacao section", () => {
      // Given
      const dados = criarDadosAtivoMinimo();

      // When
      const result = serializarDadosAtivoMarkdown(dados);

      // Then
      expect(result).not.toContain("## Cotacao Atual");
    });
  });

  describe("historico na carteira", () => {
    it("Given asset with historico, When serialized, Then output contains table with entries", () => {
      // Given
      const dados = criarDadosAtivoCompleto();

      // When
      const result = serializarDadosAtivoMarkdown(dados);

      // Then
      expect(result).toContain("## Historico na Carteira");
      expect(result).toContain("| Mes | Saldo | Rent. Mes | Rent. 12m | Rent. Inicio | % Carteira |");
      // Should contain the jan/2025 entry
      expect(result).toContain("jan/2025");
    });

    it("Given asset with null rentabilidadeDesdeInicio, When serialized, Then shows N/D in table", () => {
      // Given
      const dados = criarDadosAtivoCompleto();

      // When
      const result = serializarDadosAtivoMarkdown(dados);

      // Then
      expect(result).toContain("N/D");
    });

    it("Given asset with empty historico, When serialized, Then output omits historico section", () => {
      // Given
      const dados = criarDadosAtivoMinimo();

      // When
      const result = serializarDadosAtivoMarkdown(dados);

      // Then
      expect(result).not.toContain("## Historico na Carteira");
    });
  });

  describe("movimentacoes", () => {
    it("Given asset with movimentacoes, When serialized, Then output contains movimentacoes table", () => {
      // Given
      const dados = criarDadosAtivoCompleto();

      // When
      const result = serializarDadosAtivoMarkdown(dados);

      // Then
      expect(result).toContain("## Movimentacoes do Usuario");
      expect(result).toContain("| Data | Tipo | Valor |");
      expect(result).toContain("compra");
    });

    it("Given asset with empty movimentacoes, When serialized, Then output omits movimentacoes section", () => {
      // Given
      const dados = criarDadosAtivoMinimo();

      // When
      const result = serializarDadosAtivoMarkdown(dados);

      // Then
      expect(result).not.toContain("## Movimentacoes do Usuario");
    });
  });

  describe("eventos financeiros", () => {
    it("Given asset with eventos financeiros, When serialized, Then output contains table with total", () => {
      // Given
      const dados = criarDadosAtivoCompleto();

      // When
      const result = serializarDadosAtivoMarkdown(dados);

      // Then
      expect(result).toContain("## Eventos Financeiros Recebidos");
      expect(result).toContain("| Data | Tipo | Valor |");
      expect(result).toContain("dividendo");
      expect(result).toContain("Total recebido:");
    });

    it("Given asset with multiple eventos, When serialized, Then total sums all values", () => {
      // Given
      const dados = {
        ...criarDadosAtivoCompleto(),
        eventosFinanceirosDoAtivo: [
          { data: "2025-01-10", tipo: "dividendo", valorCentavos: 5000 },
          { data: "2025-01-20", tipo: "JCP", valorCentavos: 3000 },
        ],
      };

      // When
      const result = serializarDadosAtivoMarkdown(dados);

      // Then
      // 5000 + 3000 = 8000 centavos = R$ 80,00
      expect(result).toContain("Total recebido:");
      expect(result).toContain("80,00");
    });

    it("Given asset with empty eventos, When serialized, Then output omits eventos section", () => {
      // Given
      const dados = criarDadosAtivoMinimo();

      // When
      const result = serializarDadosAtivoMarkdown(dados);

      // Then
      expect(result).not.toContain("## Eventos Financeiros Recebidos");
    });
  });

  describe("dados fundamentalistas", () => {
    it("Given asset with full fundamentalistas, When serialized, Then output contains all indicators", () => {
      // Given
      const dados = criarDadosAtivoCompleto();

      // When
      const result = serializarDadosAtivoMarkdown(dados);

      // Then
      expect(result).toContain("## Dados Fundamentalistas");
      expect(result).toContain("P/L (Preco/Lucro): 5.20x");
      expect(result).toContain("P/VP (Preco/Valor Patrimonial): 1.10x");
      expect(result).toContain("ROE (Retorno s/ Patrimonio): 28.00%");
      expect(result).toContain("Dividend Yield: 12.00%");
      expect(result).toContain("Divida/Patrimonio: 0.50x");
      expect(result).toContain("Margem Liquida: 25.00%");
      expect(result).toContain("EV/EBITDA: 3.50x");
      expect(result).toContain("Lucro Liquido:");
      expect(result).toContain("Receita Liquida:");
      expect(result).toContain("Setor: Energia");
    });

    it("Given asset with null fundamentalistas fields, When serialized, Then output omits null entries", () => {
      // Given
      const dados = {
        ...criarDadosAtivoCompleto(),
        dadosFundamentalistas: {
          precoLucro: 5.2,
          precoValorPatrimonial: null,
          retornoSobrePatrimonio: null,
          dividendYield: null,
          dividaPatrimonio: null,
          margemLiquida: null,
          evEbitda: null,
          lucroLiquidoCentavos: null,
          receitaLiquidaCentavos: null,
          setor: null,
        },
      };

      // When
      const result = serializarDadosAtivoMarkdown(dados);

      // Then
      expect(result).toContain("P/L (Preco/Lucro): 5.20x");
      expect(result).not.toContain("P/VP");
      expect(result).not.toContain("ROE");
      expect(result).not.toContain("Dividend Yield");
      expect(result).not.toContain("Setor:");
    });

    it("Given asset without fundamentalistas, When serialized, Then output omits fundamentals section", () => {
      // Given
      const dados = criarDadosAtivoMinimo();

      // When
      const result = serializarDadosAtivoMarkdown(dados);

      // Then
      expect(result).not.toContain("## Dados Fundamentalistas");
    });
  });

  describe("dividendos brapi", () => {
    it("Given asset with dividendos historico, When serialized, Then output contains dividendos table", () => {
      // Given
      const dados = criarDadosAtivoCompleto();

      // When
      const result = serializarDadosAtivoMarkdown(dados);

      // Then
      expect(result).toContain("## Historico de Dividendos (brapi)");
      expect(result).toContain("| Data Ex | Pagamento | Valor | Tipo |");
      expect(result).toContain("R$ 0.50");
      expect(result).toContain("dividendo");
    });

    it("Given asset with dividendo without payment date, When serialized, Then shows N/D", () => {
      // Given
      const dados = {
        ...criarDadosAtivoCompleto(),
        historicoDividendosBrapi: [
          {
            ...criarDadosAtivoCompleto().historicoDividendosBrapi[0]!,
            dataPagamento: null,
          },
        ],
      };

      // When
      const result = serializarDadosAtivoMarkdown(dados);

      // Then
      expect(result).toContain("N/D");
    });

    it("Given asset with empty dividendos, When serialized, Then output omits dividendos section", () => {
      // Given
      const dados = criarDadosAtivoMinimo();

      // When
      const result = serializarDadosAtivoMarkdown(dados);

      // Then
      expect(result).not.toContain("## Historico de Dividendos");
    });
  });

  describe("benchmarks da carteira", () => {
    it("Given asset with benchmarks, When serialized, Then output contains benchmarks table", () => {
      // Given
      const dados = criarDadosAtivoCompleto();

      // When
      const result = serializarDadosAtivoMarkdown(dados);

      // Then
      expect(result).toContain("## Benchmarks da Carteira (para comparacao)");
      expect(result).toContain("| Periodo | Carteira | CDI | Ibovespa | IPCA |");
      expect(result).toContain("No Mes");
    });

    it("Given asset with empty benchmarks, When serialized, Then output omits benchmarks section", () => {
      // Given
      const dados = criarDadosAtivoMinimo();

      // When
      const result = serializarDadosAtivoMarkdown(dados);

      // Then
      expect(result).not.toContain("## Benchmarks da Carteira");
    });
  });

  describe("contexto macroeconomico", () => {
    it("Given asset data with macro context, When serialized, Then output contains macro section", () => {
      // Given
      const dados = criarDadosAtivoCompleto();

      // When
      const result = serializarDadosAtivoMarkdown(dados);

      // Then
      expect(result).toContain("## Contexto Macroeconomico Atual");
      expect(result).toContain("SELIC: 13.75% a.a.");
      expect(result).toContain("IPCA: 4.50% (ultimos 12m)");
      expect(result).toContain("CDI: 13.65% a.a.");
    });

    it("Given minimal asset data, When serialized, Then output still contains macro section", () => {
      // Given
      const dados = criarDadosAtivoMinimo();

      // When
      const result = serializarDadosAtivoMarkdown(dados);

      // Then
      expect(result).toContain("## Contexto Macroeconomico Atual");
      expect(result).toContain("SELIC: 13.75% a.a.");
    });
  });

  describe("minimal data", () => {
    it("Given minimal asset data (all empty/null), When serialized, Then produces cabecalho + macro only", () => {
      // Given
      const dados = criarDadosAtivoMinimo();

      // When
      const result = serializarDadosAtivoMarkdown(dados);

      // Then
      expect(result).toContain("# Analise de Ativo: Fundo XPTO (XPTO11)");
      expect(result).toContain("Na carteira do usuario: Nao");
      expect(result).toContain("## Contexto Macroeconomico Atual");

      // Optional sections should all be absent
      expect(result).not.toContain("## Cotacao Atual");
      expect(result).not.toContain("## Historico na Carteira");
      expect(result).not.toContain("## Movimentacoes do Usuario");
      expect(result).not.toContain("## Eventos Financeiros Recebidos");
      expect(result).not.toContain("## Dados Fundamentalistas");
      expect(result).not.toContain("## Historico de Dividendos");
      expect(result).not.toContain("## Benchmarks da Carteira");
    });
  });

  describe("section joining", () => {
    it("Given complete data, When serialized, Then sections are separated by double newlines", () => {
      // Given
      const dados = criarDadosAtivoCompleto();

      // When
      const result = serializarDadosAtivoMarkdown(dados);

      // Then
      // Sections should be joined with "\n\n" (double newline)
      expect(result).toContain("## Cotacao Atual");
      expect(result).toContain("## Historico na Carteira");
      expect(result).toContain("## Contexto Macroeconomico Atual");

      // Check that all expected sections are present
      const sections = result.split("\n\n");
      expect(sections.length).toBeGreaterThanOrEqual(5);
    });
  });
});
