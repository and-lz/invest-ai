import { z } from "zod/v4";

// ============================================================
// Zod schemas para dados de tendencias de mercado.
// Fonte unica de verdade para os tipos TypeScript de trends.
// ============================================================

// ---- Resposta brapi.dev /api/quote/list ----

export const AtivoListaBrapiSchema = z.object({
  stock: z.string(),
  name: z.string(),
  close: z.number(),
  change: z.number(),
  volume: z.number(),
  market_cap: z.number().nullable(),
  logo: z.string(),
  sector: z.string().nullable(),
  type: z.string(),
});

export const RespostaListaBrapiSchema = z.object({
  stocks: z.array(AtivoListaBrapiSchema),
  availableSectors: z.array(z.string()),
  availableStockTypes: z.array(z.string()),
  currentPage: z.number(),
  totalPages: z.number(),
  itemsPerPage: z.number(),
  totalCount: z.number(),
});

// ---- Resposta brapi.dev /api/quote/{ticker} ----

export const CotacaoIndiceBrapiSchema = z.object({
  currency: z.string().nullable(),
  shortName: z.string(),
  longName: z.string(),
  regularMarketChange: z.number(),
  regularMarketChangePercent: z.number(),
  regularMarketPrice: z.number(),
  regularMarketPreviousClose: z.number(),
  regularMarketTime: z.string(),
  symbol: z.string(),
});

export const RespostaCotacaoBrapiSchema = z.object({
  results: z.array(CotacaoIndiceBrapiSchema),
  requestedAt: z.string(),
});

// ---- Resposta BCB API ----

export const PontoDadoBcbSchema = z.object({
  data: z.string().describe("Formato DD/MM/YYYY"),
  valor: z.string(),
});

export const RespostaBcbSchema = z.array(PontoDadoBcbSchema);

// ---- Dados agregados para o frontend ----

export const AtivoRankingSchema = z.object({
  ticker: z.string(),
  nome: z.string(),
  preco: z.number(),
  variacao: z.number().describe("Percentual. Ex: +13.17 = 13.17%"),
  volume: z.number(),
  marketCap: z.number().nullable(),
  setor: z.string().nullable(),
  logo: z.string(),
});

export const IndiceMercadoSchema = z.object({
  nome: z.string(),
  simbolo: z.string(),
  valor: z.number(),
  variacao: z.number().describe("Percentual de variacao"),
  atualizadoEm: z.string().describe("ISO 8601"),
});

export const PontoHistoricoMacroSchema = z.object({
  data: z.string().describe("Formato YYYY-MM-DD"),
  valor: z.number(),
});

export const IndicadorMacroSchema = z.object({
  nome: z.string(),
  codigo: z.number().describe("Codigo da serie BCB"),
  valorAtual: z.number(),
  unidade: z.string().describe("Ex: % a.a., % a.m., BRL"),
  historico: z.array(PontoHistoricoMacroSchema),
});

export const SetorPerformanceSchema = z.object({
  setor: z.string(),
  setorTraduzido: z.string(),
  variacaoMedia: z.number().describe("Media da variacao dos ativos do setor"),
  quantidadeAtivos: z.number(),
});

export const DadosTendenciasSchema = z.object({
  maioresAltas: z.array(AtivoRankingSchema),
  maioresBaixas: z.array(AtivoRankingSchema),
  maisNegociados: z.array(AtivoRankingSchema),
  maioresAltasFundos: z.array(AtivoRankingSchema),
  indicesMercado: z.array(IndiceMercadoSchema),
  indicadoresMacro: z.array(IndicadorMacroSchema),
  setoresPerformance: z.array(SetorPerformanceSchema),
  atualizadoEm: z.string().describe("ISO 8601"),
});

// ---- Tipos inferidos ----

export type AtivoListaBrapi = z.infer<typeof AtivoListaBrapiSchema>;
export type RespostaListaBrapi = z.infer<typeof RespostaListaBrapiSchema>;
export type CotacaoIndiceBrapi = z.infer<typeof CotacaoIndiceBrapiSchema>;
export type RespostaCotacaoBrapi = z.infer<typeof RespostaCotacaoBrapiSchema>;
export type PontoDadoBcb = z.infer<typeof PontoDadoBcbSchema>;
export type AtivoRanking = z.infer<typeof AtivoRankingSchema>;
export type IndiceMercado = z.infer<typeof IndiceMercadoSchema>;
export type PontoHistoricoMacro = z.infer<typeof PontoHistoricoMacroSchema>;
export type IndicadorMacro = z.infer<typeof IndicadorMacroSchema>;
export type SetorPerformance = z.infer<typeof SetorPerformanceSchema>;
export type DadosTendencias = z.infer<typeof DadosTendenciasSchema>;
