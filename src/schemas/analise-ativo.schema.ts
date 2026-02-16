import { z } from "zod/v4";

// ============================================================
// Zod schemas para analise de desempenho de ativo individual.
// Fonte unica de verdade para os tipos TypeScript da pagina.
// ============================================================

// ---- Sub-schemas da resposta da IA ----

export const ComparacaoRetornoSchema = z.object({
  periodo: z.string().describe("Ex: 'No mes', '3 meses', '12 meses', 'Desde o inicio'"),
  retornoAtivo: z.number().describe("Percentual. Ex: 14.56"),
  retornoCDI: z.number().nullable(),
  retornoIbovespa: z.number().nullable(),
  retornoIPCA: z.number().nullable(),
  veredictoPeriodo: z.string().describe("Ex: 'Superou CDI em 2.3 p.p.'"),
});

export const AnaliseRendaPassivaSchema = z.object({
  yieldMedioMensal: z.number().nullable().describe("Percentual medio mensal de proventos"),
  yieldAnualizado: z.number().nullable().describe("Yield anualizado (% a.a.)"),
  yieldOnCost: z.number().nullable().describe("Yield sobre o custo medio de aquisicao"),
  totalRecebidoCentavos: z.number().int().describe("Total em centavos de proventos recebidos"),
  consistencia: z.string().describe("Avaliacao da regularidade dos pagamentos"),
  comparacaoComSelic: z.string().nullable().describe("Como se compara com a SELIC vigente"),
});

export const FatorRiscoSchema = z.object({
  descricao: z.string(),
  severidade: z.enum(["alta", "media", "baixa"]),
  impactoPotencial: z.string(),
});

export const AvaliacaoFundamentalistaSchema = z.object({
  precoLucro: z.number().nullable().describe("P/L"),
  precoValorPatrimonial: z.number().nullable().describe("P/VP"),
  retornoSobrePatrimonio: z.number().nullable().describe("ROE %"),
  dividendYield: z.number().nullable().describe("Dividend Yield %"),
  dividaPatrimonio: z.number().nullable().describe("Divida/Patrimonio"),
  resumoAvaliacao: z.string().describe("Interpretacao dos fundamentos em linguagem acessivel"),
  comparacaoSetorial: z.string().nullable().describe("Como se compara com pares do setor"),
});

export const AvaliacaoTimingSchema = z.object({
  resumo: z.string().describe("Avaliacao geral das decisoes de compra/venda"),
  precoMedioEstimadoCentavos: z
    .number()
    .int()
    .nullable()
    .describe("Preco medio de entrada em centavos"),
  momentosFavoraveis: z.array(z.string()).describe("Decisoes que foram boas"),
  momentosDesfavoraveis: z.array(z.string()).describe("Decisoes que poderiam ter sido melhores"),
});

export const VeredictoRecomendacaoEnum = z.enum([
  "manter",
  "aumentar_posicao",
  "reduzir_posicao",
  "realizar_lucro",
  "sair_da_posicao",
  "aguardar",
]);

export const VeredictoSchema = z.object({
  recomendacao: VeredictoRecomendacaoEnum,
  justificativa: z.string().describe("Explicacao clara do porque da recomendacao"),
  horizonteTemporal: z.string().describe("Ex: 'Proximo 3-6 meses', 'Longo prazo (12+ meses)'"),
  condicoesRevisao: z.string().describe("Em que condicoes a recomendacao mudaria"),
});

// ---- Root Schema da resposta da IA ----

export const AnaliseAtivoResponseSchema = z.object({
  codigoAtivo: z.string(),
  nomeAtivo: z.string(),
  dataAnalise: z.string().describe("Formato YYYY-MM-DD"),

  resumoGeral: z.string().describe("2-3 frases com o veredicto principal. Direto e opinativo."),

  analisePerformance: z.object({
    comparacoes: z.array(ComparacaoRetornoSchema),
    tendenciaRecente: z.string().describe("Descricao da tendencia nos ultimos 3 meses"),
    posicaoNaCarteira: z.string().describe("Contexto da participacao % na carteira total"),
  }),

  analiseRendaPassiva: AnaliseRendaPassivaSchema.nullable().describe(
    "Null se o ativo nao gera proventos",
  ),

  fatoresRisco: z.array(FatorRiscoSchema),

  avaliacaoFundamentalista: AvaliacaoFundamentalistaSchema.nullable().describe(
    "Null se dados fundamentalistas nao disponiveis (ex: fundos)",
  ),

  avaliacaoTimingUsuario: AvaliacaoTimingSchema.nullable().describe(
    "Null se o ativo nao esta na carteira do usuario",
  ),

  cenarioMacroImpacto: z
    .string()
    .describe("Como o cenario macro atual (SELIC, inflacao) impacta este ativo"),

  veredicto: VeredictoSchema,

  pontosDeAtencao: z.array(z.string()).describe("Lista de coisas para o usuario monitorar"),
});

// ---- Schemas de dados agregados para a pagina ----

export const HistoricoPosicaoAtivoSchema = z.object({
  mesAno: z.string().describe("Formato YYYY-MM"),
  saldoBrutoCentavos: z.number().int(),
  rentabilidadeMes: z.number(),
  rentabilidade12Meses: z.number().nullable(),
  rentabilidadeDesdeInicio: z.number().nullable(),
  participacaoNaCarteira: z.number(),
});

export const CotacaoAtualSchema = z.object({
  preco: z.number(),
  variacao: z.number(),
  variacaoPercentual: z.number(),
  volume: z.number(),
  marketCap: z.number().nullable(),
  maxima52Semanas: z.number().nullable(),
  minima52Semanas: z.number().nullable(),
  atualizadoEm: z.string(),
});

export const DividendoHistoricoSchema = z.object({
  dataExDividendo: z.string(),
  dataPagamento: z.string().nullable(),
  valor: z.number(),
  tipo: z.string(),
});

export const DadosFundamentalistasSchema = z.object({
  precoLucro: z.number().nullable(),
  precoValorPatrimonial: z.number().nullable(),
  retornoSobrePatrimonio: z.number().nullable(),
  dividendYield: z.number().nullable(),
  dividaPatrimonio: z.number().nullable(),
  margemLiquida: z.number().nullable(),
  lucroLiquidoCentavos: z.number().int().nullable(),
  receitaLiquidaCentavos: z.number().int().nullable(),
  evEbitda: z.number().nullable(),
  setor: z.string().nullable(),
});

export const MovimentacaoAtivoSchema = z.object({
  data: z.string().describe("Formato YYYY-MM-DD"),
  tipo: z.string(),
  valorCentavos: z.number().int(),
  descricao: z.string().nullable(),
});

export const EventoFinanceiroAtivoSchema = z.object({
  data: z.string().nullable(),
  tipo: z.string(),
  valorCentavos: z.number().int(),
});

export const DadosAgregadosAtivoSchema = z.object({
  codigoAtivo: z.string(),
  nomeAtivo: z.string(),
  estrategia: z.string().nullable(),
  estaNaCarteira: z.boolean(),
  historicoNaCarteira: z.array(HistoricoPosicaoAtivoSchema),
  movimentacoesDoAtivo: z.array(MovimentacaoAtivoSchema),
  eventosFinanceirosDoAtivo: z.array(EventoFinanceiroAtivoSchema),
  cotacaoAtual: CotacaoAtualSchema.nullable(),
  dadosFundamentalistas: DadosFundamentalistasSchema.nullable(),
  historicoDividendos: z.array(DividendoHistoricoSchema),
  saldoAtualCentavos: z.number().int(),
  participacaoAtualCarteira: z.number(),
  analiseCacheada: z.object({
    existe: z.boolean(),
    dataAnalise: z.string().nullable(),
  }),
});

// ---- Tipos inferidos ----

export type AnaliseAtivoResponse = z.infer<typeof AnaliseAtivoResponseSchema>;
export type ComparacaoRetorno = z.infer<typeof ComparacaoRetornoSchema>;
export type AnaliseRendaPassiva = z.infer<typeof AnaliseRendaPassivaSchema>;
export type FatorRisco = z.infer<typeof FatorRiscoSchema>;
export type AvaliacaoFundamentalista = z.infer<typeof AvaliacaoFundamentalistaSchema>;
export type AvaliacaoTiming = z.infer<typeof AvaliacaoTimingSchema>;
export type Veredicto = z.infer<typeof VeredictoSchema>;
export type VeredictoRecomendacao = z.infer<typeof VeredictoRecomendacaoEnum>;
export type HistoricoPosicaoAtivo = z.infer<typeof HistoricoPosicaoAtivoSchema>;
export type CotacaoAtual = z.infer<typeof CotacaoAtualSchema>;
export type DividendoHistorico = z.infer<typeof DividendoHistoricoSchema>;
export type DadosFundamentalistas = z.infer<typeof DadosFundamentalistasSchema>;
export type MovimentacaoAtivo = z.infer<typeof MovimentacaoAtivoSchema>;
export type EventoFinanceiroAtivo = z.infer<typeof EventoFinanceiroAtivoSchema>;
export type DadosAgregadosAtivo = z.infer<typeof DadosAgregadosAtivoSchema>;
