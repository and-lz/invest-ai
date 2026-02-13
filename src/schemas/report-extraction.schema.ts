import { z } from "zod/v4";

// ============================================================
// Zod schemas para extracao estruturada do PDF via Gemini API.
// Fonte unica de verdade para os tipos TypeScript do relatorio.
// ============================================================

// ---- Value Objects ----

export const MoneySchema = z.object({
  valorEmCentavos: z
    .number()
    .int()
    .describe("Valor em centavos para evitar float. Ex: R$ 415.332,91 = 41533291"),
  moeda: z.string().default("BRL"),
});

export const PercentualSchema = z.object({
  valor: z.number().describe("Valor percentual. Ex: 14,56% = 14.56"),
});

// ---- Resumo (Summary) - Pagina 2 ----

export const ResumoSchema = z.object({
  patrimonioTotal: MoneySchema,
  patrimonioMesAnterior: MoneySchema.nullable(),
  ganhosFinanceirosNoMes: MoneySchema,
  ganhosFinanceirosMesAnterior: MoneySchema.nullable(),
  aplicacoesNoMes: MoneySchema,
  resgatesNoMes: MoneySchema,
  eventosFinanceirosNoMes: MoneySchema,
  eventosFinanceirosMesAnterior: MoneySchema.nullable(),
  rentabilidadeMensal: PercentualSchema,
  rentabilidadeMensalAnterior: PercentualSchema.nullable(),
  rentabilidadeAnual: PercentualSchema,
  rentabilidadeAnoAnterior: PercentualSchema.nullable(),
  rentabilidadeDesdeInicio: PercentualSchema,
  dataInicioCarteira: z.string().describe("Formato: YYYY-MM-DD"),
});

// ---- Evolucao de Alocacao (Asset Allocation) - Pagina 2 ----

export const CategoriaAlocacaoEnum = z.enum([
  "Liquidez",
  "Fundos Listados",
  "Renda Variavel",
  "Global",
  "Outros",
  "Alternativos",
  "Pos-fixado",
  "Inflacao",
  "Multimercado",
]);

export const CategoriaAlocacaoSchema = z.object({
  nomeCategoria: CategoriaAlocacaoEnum,
  percentualDaCarteira: PercentualSchema,
});

export const AlocacaoMensalSchema = z.object({
  mesAno: z.string().describe("Formato: YYYY-MM"),
  categorias: z.array(CategoriaAlocacaoSchema),
});

// ---- Rentabilidade e Evolucao Patrimonial - Pagina 3 ----

export const PontoEvolucaoPatrimonialSchema = z.object({
  mesAno: z.string().describe("Formato: YYYY-MM"),
  patrimonioTotal: MoneySchema,
  totalAportado: MoneySchema,
});

export const ComparacaoPeriodoSchema = z.object({
  periodo: z.string().describe("Ex: 03 meses, 06 meses, 12 meses, Desde o Inicio"),
  rentabilidadeCarteira: PercentualSchema,
  rentabilidadeCDI: PercentualSchema,
  percentualDoCDI: PercentualSchema,
  volatilidade: PercentualSchema.nullable(),
});

export const AnaliseRiscoRetornoSchema = z.object({
  mesesAcimaBenchmark: z.number().int(),
  mesesAbaixoBenchmark: z.number().int(),
  maiorRentabilidade: z.object({
    valor: PercentualSchema,
    mesAno: z.string(),
  }),
  menorRentabilidade: z.object({
    valor: PercentualSchema,
    mesAno: z.string(),
  }),
});

// ---- Rentabilidades Mensais - Pagina 4 ----

export const RetornoMensalDetalheSchema = z.object({
  mes: z.number().int().min(1).max(12),
  rentabilidadeCarteira: PercentualSchema.nullable(),
  percentualDoCDI: PercentualSchema.nullable(),
});

export const RetornoAnualSchema = z.object({
  ano: z.number().int(),
  meses: z.array(RetornoMensalDetalheSchema),
  rentabilidadeAnual: PercentualSchema.nullable(),
  rentabilidadeAcumulada: PercentualSchema.nullable(),
});

export const ComparacaoBenchmarksSchema = z.object({
  periodo: z.string().describe("No mes, No ano, Desde o inicio"),
  carteira: PercentualSchema,
  cdi: PercentualSchema,
  ibovespa: PercentualSchema,
  ipca: PercentualSchema,
});

// ---- Rentabilidade por Categorias - Pagina 5 ----

export const RentabilidadePorCategoriaSchema = z.object({
  nomeCategoria: z.string(),
  rentabilidade12Meses: PercentualSchema,
});

// ---- Eventos Financeiros - Pagina 5 ----

export const TipoEventoFinanceiroEnum = z.enum([
  "Dividendo",
  "JCP",
  "Rendimento",
  "Amortizacao",
  "Aluguel",
  "Outro",
]);

export const EventoFinanceiroSchema = z.object({
  tipoEvento: TipoEventoFinanceiroEnum,
  nomeAtivo: z.string(),
  codigoAtivo: z.string().nullable(),
  valor: MoneySchema,
  dataEvento: z.string().describe("Formato: YYYY-MM-DD").nullable(),
});

// ---- Ganhos Financeiros por Estrategia - Pagina 6 ----

export const GanhosPorEstrategiaSchema = z.object({
  nomeEstrategia: z.string(),
  ganhoNoMes: MoneySchema,
  ganhoNoAno: MoneySchema,
  ganho3Meses: MoneySchema,
  ganho6Meses: MoneySchema,
  ganho12Meses: MoneySchema,
  ganhoDesdeInicio: MoneySchema,
});

// ---- Liquidez - Pagina 7 ----

export const FaixaLiquidezSchema = z.object({
  descricaoPeriodo: z.string().describe("Ex: 0 a 1, 2 a 5, 6 a 15, 31 a 90"),
  diasMinimo: z.number().int(),
  diasMaximo: z.number().int(),
  percentualDaCarteira: PercentualSchema,
  valor: MoneySchema,
  valorAcumulado: MoneySchema,
  percentualAcumulado: PercentualSchema,
});

// ---- Posicao Detalhada de Ativos - Paginas 8-11 ----

export const PosicaoAtivoSchema = z.object({
  nomeAtivo: z.string(),
  codigoAtivo: z.string().nullable(),
  estrategia: z.string(),
  saldoAnterior: MoneySchema,
  aplicacoes: MoneySchema,
  resgates: MoneySchema,
  eventosFinanceiros: MoneySchema,
  saldoBruto: MoneySchema,
  rentabilidadeMes: PercentualSchema,
  rentabilidade12Meses: PercentualSchema.nullable(),
  rentabilidadeDesdeInicio: PercentualSchema.nullable(),
  participacaoNaCarteira: PercentualSchema,
});

// ---- Movimentacoes - Paginas 12-14 ----

export const TipoMovimentacaoEnum = z.enum([
  "Aplicacao",
  "Resgate",
  "Dividendo",
  "JCP",
  "Rendimento",
  "Amortizacao",
  "Aluguel",
  "Outro",
]);

export const MovimentacaoSchema = z.object({
  data: z.string().describe("Formato: YYYY-MM-DD"),
  tipoMovimentacao: TipoMovimentacaoEnum,
  nomeAtivo: z.string(),
  codigoAtivo: z.string().nullable(),
  valor: MoneySchema,
  descricao: z.string().nullable(),
});

// ============================================================
// ROOT SCHEMA: Relatorio completo extraido
// ============================================================

export const RelatorioExtraidoSchema = z.object({
  metadados: z.object({
    mesReferencia: z.string().describe("Formato: YYYY-MM"),
    dataGeracao: z.string().describe("Data de geracao do relatorio"),
    instituicao: z.string().default("Inter Prime"),
  }),
  resumo: ResumoSchema,
  evolucaoAlocacao: z.array(AlocacaoMensalSchema),
  evolucaoPatrimonial: z.array(PontoEvolucaoPatrimonialSchema),
  comparacaoPeriodos: z.array(ComparacaoPeriodoSchema),
  analiseRiscoRetorno: AnaliseRiscoRetornoSchema,
  retornosMensais: z.array(RetornoAnualSchema),
  comparacaoBenchmarks: z.array(ComparacaoBenchmarksSchema),
  rentabilidadePorCategoria: z.array(RentabilidadePorCategoriaSchema),
  eventosFinanceiros: z.array(EventoFinanceiroSchema),
  ganhosPorEstrategia: z.array(GanhosPorEstrategiaSchema),
  faixasLiquidez: z.array(FaixaLiquidezSchema),
  posicoesDetalhadas: z.array(PosicaoAtivoSchema),
  movimentacoes: z.array(MovimentacaoSchema),
});

// ---- Tipos inferidos ----

export type RelatorioExtraido = z.infer<typeof RelatorioExtraidoSchema>;
export type Resumo = z.infer<typeof ResumoSchema>;
export type AlocacaoMensal = z.infer<typeof AlocacaoMensalSchema>;
export type PontoEvolucaoPatrimonial = z.infer<typeof PontoEvolucaoPatrimonialSchema>;
export type ComparacaoPeriodo = z.infer<typeof ComparacaoPeriodoSchema>;
export type AnaliseRiscoRetorno = z.infer<typeof AnaliseRiscoRetornoSchema>;
export type RetornoAnual = z.infer<typeof RetornoAnualSchema>;
export type ComparacaoBenchmarks = z.infer<typeof ComparacaoBenchmarksSchema>;
export type RentabilidadePorCategoria = z.infer<typeof RentabilidadePorCategoriaSchema>;
export type EventoFinanceiro = z.infer<typeof EventoFinanceiroSchema>;
export type GanhosPorEstrategia = z.infer<typeof GanhosPorEstrategiaSchema>;
export type FaixaLiquidez = z.infer<typeof FaixaLiquidezSchema>;
export type PosicaoAtivo = z.infer<typeof PosicaoAtivoSchema>;
export type Movimentacao = z.infer<typeof MovimentacaoSchema>;
export type Money = z.infer<typeof MoneySchema>;
export type Percentual = z.infer<typeof PercentualSchema>;
