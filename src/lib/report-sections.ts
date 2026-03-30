import type {
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
} from "@/schemas/report-extraction.schema";
import { formatarMesAno, formatBrazilianDate } from "@/lib/format-date";
import {
  MESES_ABREVIADOS,
  formatarDinheiro,
  formatarDinheiroCompacto,
  formatarPercent,
} from "@/lib/report-formatters";

// Re-export detail section serializers so existing importers don't break
export {
  serializarFaixasLiquidez,
  serializarPosicoesDetalhadas,
  serializarMovimentacoesAgregadas,
} from "@/lib/report-sections-detail";

export function serializarResumo(resumo: Resumo): string {
  const linhas = ["## Resumo da Carteira"];

  const adicionarLinhaMoney = (rotulo: string, valor: Resumo["patrimonioTotal"], anterior: Resumo["patrimonioMesAnterior"]) => {
    let linha = `- ${rotulo}: ${formatarDinheiro(valor)}`;
    if (anterior) linha += ` (anterior: ${formatarDinheiro(anterior)})`;
    linhas.push(linha);
  };

  const adicionarLinhaPercentual = (
    rotulo: string,
    valor: Resumo["rentabilidadeMensal"],
    anterior: Resumo["rentabilidadeMensalAnterior"],
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

export function serializarEvolucaoAlocacao(evolucaoAlocacao: AlocacaoMensal[]): string {
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

export function serializarEvolucaoPatrimonial(evolucaoPatrimonial: PontoEvolucaoPatrimonial[]): string {
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

export function serializarComparacaoPeriodos(comparacaoPeriodos: ComparacaoPeriodo[]): string {
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

export function serializarAnaliseRiscoRetorno(analise: AnaliseRiscoRetorno): string {
  const linhas = [
    "## Analise de Risco e Retorno",
    `- Meses acima do benchmark: ${analise.mesesAcimaBenchmark}`,
    `- Meses abaixo do benchmark: ${analise.mesesAbaixoBenchmark}`,
    `- Maior rentabilidade: ${formatarPercent(analise.maiorRentabilidade.valor)} (${analise.maiorRentabilidade.mesAno})`,
    `- Menor rentabilidade: ${formatarPercent(analise.menorRentabilidade.valor)} (${analise.menorRentabilidade.mesAno})`,
  ];

  return linhas.join("\n");
}

export function serializarRetornosMensais(retornosMensais: RetornoAnual[]): string {
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

export function serializarComparacaoBenchmarks(comparacaoBenchmarks: ComparacaoBenchmarks[]): string {
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

export function serializarRentabilidadePorCategoria(categorias: RentabilidadePorCategoria[]): string {
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

export function serializarEventosFinanceiros(eventos: EventoFinanceiro[]): string {
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

export function serializarGanhosPorEstrategia(estrategias: GanhosPorEstrategia[]): string {
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

