import type {
  RelatorioExtraido,
  Resumo,
  AlocacaoMensal,
  PontoEvolucaoPatrimonial,
  ComparacaoPeriodo,
  AnaliseRiscoRetorno,
  RetornoAnual,
  ComparacaoBenchmarks,
  RentabilidadePorCategoria,
  EventoFinanceiro,
  GanhosPorEstrategia,
  FaixaLiquidez,
  PosicaoAtivo,
  Movimentacao,
  Money,
  Percentual,
} from "@/schemas/report-extraction.schema";
import { formatarMoeda, formatCompactCurrency } from "@/domain/value-objects/money";
import { formatarPercentual } from "@/domain/value-objects/percentage";
import { formatarMesAno, formatBrazilianDate } from "@/lib/format-date";

// ============================================================
// Serializacao de RelatorioExtraido para Markdown.
// Usado nos prompts de insights para reduzir tokens (~60-70%).
// ============================================================

const MESES_ABREVIADOS = [
  "Jan",
  "Fev",
  "Mar",
  "Abr",
  "Mai",
  "Jun",
  "Jul",
  "Ago",
  "Set",
  "Out",
  "Nov",
  "Dez",
] as const;

// ---- Helpers null-safe ----

function formatarDinheiro(money: Money | null): string {
  if (!money) return "N/D";
  return formatarMoeda(money.valorEmCentavos);
}

function formatarDinheiroCompacto(money: Money | null): string {
  if (!money) return "N/D";
  return formatCompactCurrency(money.valorEmCentavos);
}

function formatarPercent(percentual: Percentual | null): string {
  if (!percentual) return "N/D";
  return formatarPercentual(percentual.valor);
}

// ---- Serializadores de secao ----

function serializarMetadados(metadados: RelatorioExtraido["metadados"]): string {
  const mesAnoExtenso = formatarMesAno(metadados.mesReferencia, "extenso");
  const linhas = [
    `# Relatorio de Investimentos - ${mesAnoExtenso}`,
    `- Instituicao: ${metadados.instituicao}`,
    `- Data de geracao: ${formatBrazilianDate(metadados.dataGeracao)}`,
  ];
  return linhas.join("\n");
}

function serializarResumo(resumo: Resumo): string {
  const linhas = ["## Resumo da Carteira"];

  const adicionarLinhaMoney = (rotulo: string, valor: Money, anterior: Money | null) => {
    let linha = `- ${rotulo}: ${formatarDinheiro(valor)}`;
    if (anterior) linha += ` (anterior: ${formatarDinheiro(anterior)})`;
    linhas.push(linha);
  };

  const adicionarLinhaPercentual = (
    rotulo: string,
    valor: Percentual,
    anterior: Percentual | null,
  ) => {
    let linha = `- ${rotulo}: ${formatarPercent(valor)}`;
    if (anterior) linha += ` (anterior: ${formatarPercent(anterior)})`;
    linhas.push(linha);
  };

  adicionarLinhaMoney("Patrimonio total", resumo.patrimonioTotal, resumo.patrimonioMesAnterior);
  adicionarLinhaMoney(
    "Ganhos financeiros no mes",
    resumo.ganhosFinanceirosNoMes,
    resumo.ganhosFinanceirosMesAnterior,
  );
  linhas.push(`- Aplicacoes no mes: ${formatarDinheiro(resumo.aplicacoesNoMes)}`);
  linhas.push(`- Resgates no mes: ${formatarDinheiro(resumo.resgatesNoMes)}`);
  adicionarLinhaMoney(
    "Eventos financeiros no mes",
    resumo.eventosFinanceirosNoMes,
    resumo.eventosFinanceirosMesAnterior,
  );
  adicionarLinhaPercentual(
    "Rentabilidade mensal",
    resumo.rentabilidadeMensal,
    resumo.rentabilidadeMensalAnterior,
  );
  adicionarLinhaPercentual(
    "Rentabilidade anual",
    resumo.rentabilidadeAnual,
    resumo.rentabilidadeAnoAnterior,
  );
  linhas.push(
    `- Rentabilidade desde inicio: ${formatarPercent(resumo.rentabilidadeDesdeInicio)} (desde ${formatBrazilianDate(resumo.dataInicioCarteira)})`,
  );

  return linhas.join("\n");
}

function serializarEvolucaoAlocacao(evolucaoAlocacao: AlocacaoMensal[]): string {
  if (evolucaoAlocacao.length === 0) return "";

  // Coletar todas as categorias unicas
  const categoriasUnicas = [
    ...new Set(evolucaoAlocacao.flatMap((mes) => mes.categorias.map((c) => c.nomeCategoria))),
  ];

  const linhas = ["## Evolucao da Alocacao"];

  // Header da tabela
  linhas.push(`| Mes | ${categoriasUnicas.join(" | ")} |`);
  linhas.push(`|---|${categoriasUnicas.map(() => "---").join("|")}|`);

  // Linhas da tabela
  for (const mesAlocacao of evolucaoAlocacao) {
    const mesFormatado = formatarMesAno(mesAlocacao.mesAno, "abreviado");
    const valores = categoriasUnicas.map((nomeCategoria) => {
      const categoria = mesAlocacao.categorias.find((c) => c.nomeCategoria === nomeCategoria);
      return categoria ? formatarPercent(categoria.percentualDaCarteira) : "-";
    });
    linhas.push(`| ${mesFormatado} | ${valores.join(" | ")} |`);
  }

  return linhas.join("\n");
}

function serializarEvolucaoPatrimonial(evolucaoPatrimonial: PontoEvolucaoPatrimonial[]): string {
  if (evolucaoPatrimonial.length === 0) return "";

  const linhas = [
    "## Evolucao Patrimonial",
    "| Mes | Patrimonio | Total Aportado |",
    "|---|---|---|",
  ];

  for (const ponto of evolucaoPatrimonial) {
    const mesFormatado = formatarMesAno(ponto.mesAno, "abreviado");
    linhas.push(
      `| ${mesFormatado} | ${formatarDinheiro(ponto.patrimonioTotal)} | ${formatarDinheiro(ponto.totalAportado)} |`,
    );
  }

  return linhas.join("\n");
}

function serializarComparacaoPeriodos(comparacaoPeriodos: ComparacaoPeriodo[]): string {
  if (comparacaoPeriodos.length === 0) return "";

  const linhas = [
    "## Comparacao de Periodos",
    "| Periodo | Carteira | CDI | % CDI | Volatilidade |",
    "|---|---|---|---|---|",
  ];

  for (const periodo of comparacaoPeriodos) {
    linhas.push(
      `| ${periodo.periodo} | ${formatarPercent(periodo.rentabilidadeCarteira)} | ${formatarPercent(periodo.rentabilidadeCDI)} | ${formatarPercent(periodo.percentualDoCDI)} | ${formatarPercent(periodo.volatilidade)} |`,
    );
  }

  return linhas.join("\n");
}

function serializarAnaliseRiscoRetorno(analise: AnaliseRiscoRetorno): string {
  const linhas = [
    "## Analise de Risco e Retorno",
    `- Meses acima do benchmark: ${analise.mesesAcimaBenchmark}`,
    `- Meses abaixo do benchmark: ${analise.mesesAbaixoBenchmark}`,
    `- Maior rentabilidade: ${formatarPercent(analise.maiorRentabilidade.valor)} (${analise.maiorRentabilidade.mesAno})`,
    `- Menor rentabilidade: ${formatarPercent(analise.menorRentabilidade.valor)} (${analise.menorRentabilidade.mesAno})`,
  ];

  return linhas.join("\n");
}

function serializarRetornosMensais(retornosMensais: RetornoAnual[]): string {
  if (retornosMensais.length === 0) return "";

  const linhas = ["## Retornos Mensais"];

  for (const retornoAnual of retornosMensais) {
    // Header do ano com rentabilidade anual e acumulada
    const partsSubtitulo = [`### ${retornoAnual.ano}`];
    const detalhesAnuais: string[] = [];
    if (retornoAnual.rentabilidadeAnual) {
      detalhesAnuais.push(`anual: ${formatarPercent(retornoAnual.rentabilidadeAnual)}`);
    }
    if (retornoAnual.rentabilidadeAcumulada) {
      detalhesAnuais.push(`acumulada: ${formatarPercent(retornoAnual.rentabilidadeAcumulada)}`);
    }
    if (detalhesAnuais.length > 0) {
      partsSubtitulo.push(`(${detalhesAnuais.join(" | ")})`);
    }
    linhas.push(partsSubtitulo.join(" "));

    // Filtrar meses com dados (omitir null)
    const mesesComDados = retornoAnual.meses.filter(
      (mesDetalhe) => mesDetalhe.rentabilidadeCarteira !== null,
    );

    if (mesesComDados.length === 0) continue;

    linhas.push("| Mes | Carteira | % CDI |");
    linhas.push("|---|---|---|");

    for (const mesDetalhe of mesesComDados) {
      const nomeAbreviado = MESES_ABREVIADOS[mesDetalhe.mes - 1] ?? `${mesDetalhe.mes}`;
      linhas.push(
        `| ${nomeAbreviado} | ${formatarPercent(mesDetalhe.rentabilidadeCarteira)} | ${formatarPercent(mesDetalhe.percentualDoCDI)} |`,
      );
    }
  }

  return linhas.join("\n");
}

function serializarComparacaoBenchmarks(comparacaoBenchmarks: ComparacaoBenchmarks[]): string {
  if (comparacaoBenchmarks.length === 0) return "";

  const linhas = [
    "## Comparacao com Benchmarks",
    "| Periodo | Carteira | CDI | Ibovespa | IPCA |",
    "|---|---|---|---|---|",
  ];

  for (const comparacao of comparacaoBenchmarks) {
    linhas.push(
      `| ${comparacao.periodo} | ${formatarPercent(comparacao.carteira)} | ${formatarPercent(comparacao.cdi)} | ${formatarPercent(comparacao.ibovespa)} | ${formatarPercent(comparacao.ipca)} |`,
    );
  }

  return linhas.join("\n");
}

function serializarRentabilidadePorCategoria(categorias: RentabilidadePorCategoria[]): string {
  if (categorias.length === 0) return "";

  const linhas = [
    "## Rentabilidade por Categoria (12 meses)",
    "| Categoria | Rentabilidade |",
    "|---|---|",
  ];

  for (const categoria of categorias) {
    linhas.push(
      `| ${categoria.nomeCategoria} | ${formatarPercent(categoria.rentabilidade12Meses)} |`,
    );
  }

  return linhas.join("\n");
}

function serializarEventosFinanceiros(eventos: EventoFinanceiro[]): string {
  if (eventos.length === 0) return "";

  const linhas = [
    "## Eventos Financeiros",
    "| Data | Tipo | Ativo | Codigo | Valor |",
    "|---|---|---|---|---|",
  ];

  for (const evento of eventos) {
    const dataFormatada = evento.dataEvento ? formatBrazilianDate(evento.dataEvento) : "N/D";
    linhas.push(
      `| ${dataFormatada} | ${evento.tipoEvento} | ${evento.nomeAtivo} | ${evento.codigoAtivo ?? "-"} | ${formatarDinheiro(evento.valor)} |`,
    );
  }

  return linhas.join("\n");
}

function serializarGanhosPorEstrategia(estrategias: GanhosPorEstrategia[]): string {
  if (estrategias.length === 0) return "";

  const linhas = [
    "## Ganhos por Estrategia",
    "| Estrategia | Mes | Ano | 3m | 6m | 12m | Desde inicio |",
    "|---|---|---|---|---|---|---|",
  ];

  for (const estrategia of estrategias) {
    linhas.push(
      `| ${estrategia.nomeEstrategia} | ${formatarDinheiroCompacto(estrategia.ganhoNoMes)} | ${formatarDinheiroCompacto(estrategia.ganhoNoAno)} | ${formatarDinheiroCompacto(estrategia.ganho3Meses)} | ${formatarDinheiroCompacto(estrategia.ganho6Meses)} | ${formatarDinheiroCompacto(estrategia.ganho12Meses)} | ${formatarDinheiroCompacto(estrategia.ganhoDesdeInicio)} |`,
    );
  }

  return linhas.join("\n");
}

function serializarFaixasLiquidez(faixas: FaixaLiquidez[]): string {
  if (faixas.length === 0) return "";

  const linhas = [
    "## Faixas de Liquidez",
    "| Periodo | % Carteira | Valor | Acumulado | % Acumulado |",
    "|---|---|---|---|---|",
  ];

  for (const faixa of faixas) {
    linhas.push(
      `| ${faixa.descricaoPeriodo} dias | ${formatarPercent(faixa.percentualDaCarteira)} | ${formatarDinheiro(faixa.valor)} | ${formatarDinheiro(faixa.valorAcumulado)} | ${formatarPercent(faixa.percentualAcumulado)} |`,
    );
  }

  return linhas.join("\n");
}

function serializarPosicoesDetalhadas(posicoes: PosicaoAtivo[]): string {
  if (posicoes.length === 0) return "";

  const linhas = [
    `## Posicoes Detalhadas (${posicoes.length} ativos)`,
    "| Ativo | Estrategia | Saldo | Rent. Mes | Rent. 12m | Rent. Inicio | % Carteira |",
    "|---|---|---|---|---|---|---|",
  ];

  for (const posicao of posicoes) {
    linhas.push(
      `| ${posicao.nomeAtivo} | ${posicao.estrategia} | ${formatarDinheiroCompacto(posicao.saldoBruto)} | ${formatarPercent(posicao.rentabilidadeMes)} | ${formatarPercent(posicao.rentabilidade12Meses)} | ${formatarPercent(posicao.rentabilidadeDesdeInicio)} | ${formatarPercent(posicao.participacaoNaCarteira)} |`,
    );
  }

  return linhas.join("\n");
}

function serializarMovimentacoesAgregadas(movimentacoes: Movimentacao[]): string {
  if (movimentacoes.length === 0) return "";

  // Agregar por tipo de movimentacao
  const agregadoPorTipo = new Map<string, { quantidade: number; totalCentavos: number }>();

  for (const movimentacao of movimentacoes) {
    const tipo = movimentacao.tipoMovimentacao;
    const existente = agregadoPorTipo.get(tipo) ?? { quantidade: 0, totalCentavos: 0 };
    existente.quantidade += 1;
    existente.totalCentavos += movimentacao.valor.valorEmCentavos;
    agregadoPorTipo.set(tipo, existente);
  }

  // Ordenar por valor absoluto descrescente
  const tiposOrdenados = [...agregadoPorTipo.entries()].sort(
    ([, agregadoA], [, agregadoB]) =>
      Math.abs(agregadoB.totalCentavos) - Math.abs(agregadoA.totalCentavos),
  );

  const linhas = [
    "## Movimentacoes (Resumo Agregado)",
    "| Tipo | Quantidade | Total |",
    "|---|---|---|",
  ];

  for (const [tipo, agregado] of tiposOrdenados) {
    linhas.push(`| ${tipo} | ${agregado.quantidade} | ${formatarMoeda(agregado.totalCentavos)} |`);
  }

  return linhas.join("\n");
}

// ---- Funcoes principais ----

export function serializarRelatorioMarkdown(relatorio: RelatorioExtraido): string {
  const secoes = [
    serializarMetadados(relatorio.metadados),
    serializarResumo(relatorio.resumo),
    serializarEvolucaoAlocacao(relatorio.evolucaoAlocacao),
    serializarEvolucaoPatrimonial(relatorio.evolucaoPatrimonial),
    serializarComparacaoPeriodos(relatorio.comparacaoPeriodos),
    serializarAnaliseRiscoRetorno(relatorio.analiseRiscoRetorno),
    serializarRetornosMensais(relatorio.retornosMensais),
    serializarComparacaoBenchmarks(relatorio.comparacaoBenchmarks),
    serializarRentabilidadePorCategoria(relatorio.rentabilidadePorCategoria),
    serializarEventosFinanceiros(relatorio.eventosFinanceiros),
    serializarGanhosPorEstrategia(relatorio.ganhosPorEstrategia),
    serializarFaixasLiquidez(relatorio.faixasLiquidez),
    serializarPosicoesDetalhadas(relatorio.posicoesDetalhadas),
    serializarMovimentacoesAgregadas(relatorio.movimentacoes),
  ];

  return secoes.filter((secao) => secao.length > 0).join("\n\n");
}

export function serializarRelatoriosConsolidadoMarkdown(relatorios: RelatorioExtraido[]): string {
  if (relatorios.length === 0)
    return "# Historico Consolidado (0 meses)\n\nNenhum relatorio disponivel.";

  const header = `# Historico Consolidado (${relatorios.length} meses)`;
  const relatoriosSerializados = relatorios
    .map((relatorio) => serializarRelatorioMarkdown(relatorio))
    .join("\n\n---\n\n");

  return `${header}\n\n${relatoriosSerializados}`;
}
