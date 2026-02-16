import type {
  CotacaoAtual,
  DadosFundamentalistas,
  DividendoHistorico,
} from "@/schemas/analise-ativo.schema";
import { z } from "zod/v4";

// ============================================================
// Servico para buscar dados detalhados de um ativo via brapi.dev.
// Retorna cotacao, fundamentos e dividendos de forma tipada.
// ============================================================

const BASE_URL_BRAPI = "https://brapi.dev/api";

// ---- Schemas de resposta brapi (quote/{ticker}) ----

const ResultadoCotacaoBrapiSchema = z.object({
  symbol: z.string(),
  shortName: z.string().optional(),
  longName: z.string().optional(),
  regularMarketPrice: z.number(),
  regularMarketChange: z.number(),
  regularMarketChangePercent: z.number(),
  regularMarketVolume: z.number().optional().default(0),
  marketCap: z.number().optional().nullable(),
  fiftyTwoWeekHigh: z.number().optional().nullable(),
  fiftyTwoWeekLow: z.number().optional().nullable(),
  regularMarketTime: z.string().optional(),
  // Fundamentals (when modules include financialData/defaultKeyStatistics)
  priceEarnings: z.number().optional().nullable(),
  earningsPerShare: z.number().optional().nullable(),
  priceToBook: z.number().optional().nullable(),
  returnOnEquity: z.number().optional().nullable(),
  dividendYield: z.number().optional().nullable(),
  debtToEquity: z.number().optional().nullable(),
  netMargin: z.number().optional().nullable(),
  netIncome: z.number().optional().nullable(),
  netRevenue: z.number().optional().nullable(),
  evToEbitda: z.number().optional().nullable(),
  sector: z.string().optional().nullable(),
  // Dividends
  dividendsData: z
    .object({
      cashDividends: z
        .array(
          z.object({
            exDate: z.string(),
            paymentDate: z.string().optional().nullable(),
            rate: z.number(),
            type: z.string(),
          }),
        )
        .optional()
        .default([]),
    })
    .optional()
    .nullable(),
});

const RespostaCotacaoDetalheBrapiSchema = z.object({
  results: z.array(ResultadoCotacaoBrapiSchema),
});

/** Resultado completo da busca de detalhes de um ativo */
export interface DetalhesAtivoBrapi {
  readonly cotacaoAtual: CotacaoAtual;
  readonly dadosFundamentalistas: DadosFundamentalistas | null;
  readonly historicoDividendos: DividendoHistorico[];
  readonly nomeAtivo: string;
}

export class BrapiAssetDetailService {
  constructor(private readonly token: string) {}

  /**
   * Busca dados detalhados de um ativo no brapi.
   * Inclui cotacao, fundamentos e dividendos em uma unica chamada.
   *
   * @returns Detalhes do ativo ou null se ticker nao encontrado
   */
  async obterDetalhesAtivo(ticker: string): Promise<DetalhesAtivoBrapi | null> {
    const parametros = new URLSearchParams({
      token: this.token,
      modules: "defaultKeyStatistics,financialData",
      dividends: "true",
      range: "1y",
      interval: "1mo",
    });

    const url = `${BASE_URL_BRAPI}/quote/${encodeURIComponent(ticker)}?${parametros.toString()}`;

    try {
      const resposta = await fetch(url);

      if (!resposta.ok) {
        if (resposta.status === 404) return null;
        console.warn(`[BrapiAssetDetail] Erro HTTP ${resposta.status} para ticker ${ticker}`);
        return null;
      }

      const dadosBrutos: unknown = await resposta.json();
      const parseResult = RespostaCotacaoDetalheBrapiSchema.safeParse(dadosBrutos);

      if (!parseResult.success) {
        console.warn(`[BrapiAssetDetail] Resposta invalida para ${ticker}:`, parseResult.error);
        return null;
      }

      const resultado = parseResult.data.results[0];
      if (!resultado) return null;

      return this.mapearParaDetalhes(resultado);
    } catch (erro) {
      console.warn(`[BrapiAssetDetail] Falha ao buscar ${ticker}:`, erro);
      return null;
    }
  }

  private mapearParaDetalhes(
    resultado: z.infer<typeof ResultadoCotacaoBrapiSchema>,
  ): DetalhesAtivoBrapi {
    const cotacaoAtual: CotacaoAtual = {
      preco: resultado.regularMarketPrice,
      variacao: resultado.regularMarketChange,
      variacaoPercentual: resultado.regularMarketChangePercent,
      volume: resultado.regularMarketVolume,
      marketCap: resultado.marketCap ?? null,
      maxima52Semanas: resultado.fiftyTwoWeekHigh ?? null,
      minima52Semanas: resultado.fiftyTwoWeekLow ?? null,
      atualizadoEm: resultado.regularMarketTime ?? new Date().toISOString(),
    };

    const temFundamentos =
      resultado.priceEarnings !== undefined ||
      resultado.priceToBook !== undefined ||
      resultado.returnOnEquity !== undefined;

    const dadosFundamentalistas: DadosFundamentalistas | null = temFundamentos
      ? {
          precoLucro: resultado.priceEarnings ?? null,
          precoValorPatrimonial: resultado.priceToBook ?? null,
          retornoSobrePatrimonio: resultado.returnOnEquity ?? null,
          dividendYield: resultado.dividendYield ?? null,
          dividaPatrimonio: resultado.debtToEquity ?? null,
          margemLiquida: resultado.netMargin ?? null,
          lucroLiquidoCentavos: resultado.netIncome ? Math.round(resultado.netIncome * 100) : null,
          receitaLiquidaCentavos: resultado.netRevenue
            ? Math.round(resultado.netRevenue * 100)
            : null,
          evEbitda: resultado.evToEbitda ?? null,
          setor: resultado.sector ?? null,
        }
      : null;

    const historicoDividendos: DividendoHistorico[] =
      resultado.dividendsData?.cashDividends?.map((dividendo) => ({
        dataExDividendo: dividendo.exDate,
        dataPagamento: dividendo.paymentDate ?? null,
        valor: dividendo.rate,
        tipo: dividendo.type,
      })) ?? [];

    const nomeAtivo = resultado.longName ?? resultado.shortName ?? resultado.symbol;

    return {
      cotacaoAtual,
      dadosFundamentalistas,
      historicoDividendos,
      nomeAtivo,
    };
  }
}
