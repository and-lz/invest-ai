import type {
  HistoricoPosicaoAtivo,
  MovimentacaoAtivo,
  EventoFinanceiroAtivo,
  CotacaoAtual,
  DadosFundamentalistas,
  DividendoHistorico,
} from "@/schemas/asset-analysis.schema";
import type { ComparacaoBenchmarks } from "@/schemas/report-extraction.schema";
import { formatarMoeda, formatCompactCurrency } from "@/domain/value-objects/money";
import { formatarPercentual } from "@/domain/value-objects/percentage";
import { formatarMesAno, formatBrazilianDate } from "@/lib/format-date";

// ============================================================
// Serializacao de dados de ativo individual para Markdown.
// Usado no prompt de analise para reduzir tokens (~60-70%).
// ============================================================

/** Contexto macro condensado para inclusao no prompt */
export interface ContextoMacroCondensado {
  readonly selicAtual: number;
  readonly ipcaAtual: number;
  readonly cdiAtual: number;
}

/** Todos os dados do ativo para serializar no prompt */
export interface DadosAtivoParaPrompt {
  readonly codigoAtivo: string;
  readonly nomeAtivo: string;
  readonly estrategia: string | null;
  readonly estaNaCarteira: boolean;
  readonly historicoNaCarteira: HistoricoPosicaoAtivo[];
  readonly movimentacoesDoAtivo: MovimentacaoAtivo[];
  readonly eventosFinanceirosDoAtivo: EventoFinanceiroAtivo[];
  readonly cotacaoAtual: CotacaoAtual | null;
  readonly dadosFundamentalistas: DadosFundamentalistas | null;
  readonly historicoDividendosBrapi: DividendoHistorico[];
  readonly benchmarksCarteira: ComparacaoBenchmarks[];
  readonly contextoMacro: ContextoMacroCondensado;
}

/**
 * Serializa todos os dados do ativo em markdown compacto para o prompt da IA.
 * Otimizado para token efficiency: tabelas compactas, sem redundancia.
 */
export function serializarDadosAtivoMarkdown(dados: DadosAtivoParaPrompt): string {
  const secoes = [
    serializarCabecalho(dados),
    serializarCotacaoAtual(dados.cotacaoAtual),
    serializarHistoricoCarteira(dados.historicoNaCarteira),
    serializarMovimentacoes(dados.movimentacoesDoAtivo),
    serializarEventosFinanceiros(dados.eventosFinanceirosDoAtivo),
    serializarFundamentalistas(dados.dadosFundamentalistas),
    serializarDividendosBrapi(dados.historicoDividendosBrapi),
    serializarBenchmarks(dados.benchmarksCarteira),
    serializarContextoMacro(dados.contextoMacro),
  ];

  return secoes.filter((secao) => secao.length > 0).join("\n\n");
}

// ---- Serializadores de secao ----

function serializarCabecalho(dados: DadosAtivoParaPrompt): string {
  const linhas = [`# Analise de Ativo: ${dados.nomeAtivo} (${dados.codigoAtivo})`];

  if (dados.estrategia) {
    linhas.push(`- Estrategia: ${dados.estrategia}`);
  }

  linhas.push(`- Na carteira do usuario: ${dados.estaNaCarteira ? "Sim" : "Nao"}`);

  return linhas.join("\n");
}

function serializarCotacaoAtual(cotacao: CotacaoAtual | null): string {
  if (!cotacao) return "";

  const linhas = [
    "## Cotacao Atual",
    `- Preco: ${formatarMoeda(Math.round(cotacao.preco * 100))}`,
    `- Variacao: ${formatarPercentual(cotacao.variacaoPercentual)}`,
    `- Volume: ${cotacao.volume.toLocaleString("pt-BR")}`,
  ];

  if (cotacao.marketCap) {
    linhas.push(`- Market Cap: ${formatCompactCurrency(Math.round(cotacao.marketCap * 100))}`);
  }
  if (cotacao.maxima52Semanas !== null) {
    linhas.push(`- Maxima 52 semanas: ${formatarMoeda(Math.round(cotacao.maxima52Semanas * 100))}`);
  }
  if (cotacao.minima52Semanas !== null) {
    linhas.push(`- Minima 52 semanas: ${formatarMoeda(Math.round(cotacao.minima52Semanas * 100))}`);
  }

  return linhas.join("\n");
}

function serializarHistoricoCarteira(historico: HistoricoPosicaoAtivo[]): string {
  if (historico.length === 0) return "";

  const linhas = [
    "## Historico na Carteira",
    "| Mes | Saldo | Rent. Mes | Rent. 12m | Rent. Inicio | % Carteira |",
    "|---|---|---|---|---|---|",
  ];

  for (const ponto of historico) {
    const mesFormatado = formatarMesAno(ponto.mesAno, "abreviado");
    const saldoFormatado = formatCompactCurrency(ponto.saldoBrutoCentavos);
    const rentabilidadeMes = formatarPercentual(ponto.rentabilidadeMes);
    const rentabilidade12Meses =
      ponto.rentabilidade12Meses !== null ? formatarPercentual(ponto.rentabilidade12Meses) : "N/D";
    const rentabilidadeDesdeInicio =
      ponto.rentabilidadeDesdeInicio !== null
        ? formatarPercentual(ponto.rentabilidadeDesdeInicio)
        : "N/D";
    const participacao = formatarPercentual(ponto.participacaoNaCarteira);

    linhas.push(
      `| ${mesFormatado} | ${saldoFormatado} | ${rentabilidadeMes} | ${rentabilidade12Meses} | ${rentabilidadeDesdeInicio} | ${participacao} |`,
    );
  }

  return linhas.join("\n");
}

function serializarMovimentacoes(movimentacoes: MovimentacaoAtivo[]): string {
  if (movimentacoes.length === 0) return "";

  const linhas = ["## Movimentacoes do Usuario", "| Data | Tipo | Valor |", "|---|---|---|"];

  for (const movimentacao of movimentacoes) {
    const dataFormatada = formatBrazilianDate(movimentacao.data);
    const valorFormatado = formatarMoeda(movimentacao.valorCentavos);
    linhas.push(`| ${dataFormatada} | ${movimentacao.tipo} | ${valorFormatado} |`);
  }

  return linhas.join("\n");
}

function serializarEventosFinanceiros(eventos: EventoFinanceiroAtivo[]): string {
  if (eventos.length === 0) return "";

  const linhas = ["## Eventos Financeiros Recebidos", "| Data | Tipo | Valor |", "|---|---|---|"];

  for (const evento of eventos) {
    const dataFormatada = evento.data ? formatBrazilianDate(evento.data) : "N/D";
    const valorFormatado = formatarMoeda(evento.valorCentavos);
    linhas.push(`| ${dataFormatada} | ${evento.tipo} | ${valorFormatado} |`);
  }

  // Total recebido
  const totalCentavos = eventos.reduce((soma, evento) => soma + evento.valorCentavos, 0);
  linhas.push(`\nTotal recebido: ${formatarMoeda(totalCentavos)}`);

  return linhas.join("\n");
}

function serializarFundamentalistas(dados: DadosFundamentalistas | null): string {
  if (!dados) return "";

  const linhas = ["## Dados Fundamentalistas"];

  const adicionarSeDisponivel = (rotulo: string, valor: number | null, sufixo = "") => {
    if (valor !== null) {
      linhas.push(`- ${rotulo}: ${valor.toFixed(2)}${sufixo}`);
    }
  };

  adicionarSeDisponivel("P/L (Preco/Lucro)", dados.precoLucro, "x");
  adicionarSeDisponivel("P/VP (Preco/Valor Patrimonial)", dados.precoValorPatrimonial, "x");
  adicionarSeDisponivel("ROE (Retorno s/ Patrimonio)", dados.retornoSobrePatrimonio, "%");
  adicionarSeDisponivel("Dividend Yield", dados.dividendYield, "%");
  adicionarSeDisponivel("Divida/Patrimonio", dados.dividaPatrimonio, "x");
  adicionarSeDisponivel("Margem Liquida", dados.margemLiquida, "%");
  adicionarSeDisponivel("EV/EBITDA", dados.evEbitda, "x");

  if (dados.lucroLiquidoCentavos !== null) {
    linhas.push(`- Lucro Liquido: ${formatCompactCurrency(dados.lucroLiquidoCentavos)}`);
  }
  if (dados.receitaLiquidaCentavos !== null) {
    linhas.push(`- Receita Liquida: ${formatCompactCurrency(dados.receitaLiquidaCentavos)}`);
  }
  if (dados.setor) {
    linhas.push(`- Setor: ${dados.setor}`);
  }

  return linhas.length > 1 ? linhas.join("\n") : "";
}

function serializarDividendosBrapi(dividendos: DividendoHistorico[]): string {
  if (dividendos.length === 0) return "";

  const linhas = [
    "## Historico de Dividendos (brapi)",
    "| Data Ex | Pagamento | Valor | Tipo |",
    "|---|---|---|---|",
  ];

  // Limitar a ultimos 12 para economia de tokens
  const ultimosDividendos = dividendos.slice(-12);

  for (const dividendo of ultimosDividendos) {
    const dataEx = formatBrazilianDate(dividendo.dataExDividendo);
    const dataPagamento = dividendo.dataPagamento
      ? formatBrazilianDate(dividendo.dataPagamento)
      : "N/D";
    linhas.push(
      `| ${dataEx} | ${dataPagamento} | R$ ${dividendo.valor.toFixed(2)} | ${dividendo.tipo} |`,
    );
  }

  return linhas.join("\n");
}

function serializarBenchmarks(benchmarks: ComparacaoBenchmarks[]): string {
  if (benchmarks.length === 0) return "";

  const linhas = [
    "## Benchmarks da Carteira (para comparacao)",
    "| Periodo | Carteira | CDI | Ibovespa | IPCA |",
    "|---|---|---|---|---|",
  ];

  for (const benchmark of benchmarks) {
    linhas.push(
      `| ${benchmark.periodo} | ${formatarPercentual(benchmark.carteira.valor)} | ${formatarPercentual(benchmark.cdi.valor)} | ${formatarPercentual(benchmark.ibovespa.valor)} | ${formatarPercentual(benchmark.ipca.valor)} |`,
    );
  }

  return linhas.join("\n");
}

function serializarContextoMacro(contexto: ContextoMacroCondensado): string {
  const linhas = [
    "## Contexto Macroeconomico Atual",
    `- SELIC: ${contexto.selicAtual.toFixed(2)}% a.a.`,
    `- IPCA: ${contexto.ipcaAtual.toFixed(2)}% (ultimos 12m)`,
    `- CDI: ${contexto.cdiAtual.toFixed(2)}% a.a.`,
  ];

  return linhas.join("\n");
}
