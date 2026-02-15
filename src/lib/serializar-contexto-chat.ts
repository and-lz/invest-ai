import type { DashboardData } from "@/application/use-cases/get-dashboard-data";
import type { InsightsResponse } from "@/schemas/insights.schema";
import type { DadosTendencias } from "@/schemas/trends.schema";
import type { DadosAgregadosAtivo } from "@/schemas/analise-ativo.schema";
import { formatarMoeda } from "@/domain/value-objects/money";
import { formatarPercentualSimples } from "@/domain/value-objects/percentage";

const LIMITE_CARACTERES_CONTEXTO = 15_000;

function truncar(texto: string): string {
  return texto.length > LIMITE_CARACTERES_CONTEXTO
    ? texto.slice(0, LIMITE_CARACTERES_CONTEXTO) + "\n...(contexto truncado)"
    : texto;
}

/**
 * Serializa dados do Dashboard em markdown compacto para contexto do chat.
 */
export function serializarContextoDashboard(dados: DashboardData): string {
  const linhas: string[] = [];

  // Resumo principal
  linhas.push("## Resumo da Carteira");
  linhas.push(
    `- Patrimonio Total: ${formatarMoeda(dados.resumoAtual.patrimonioTotal.valorEmCentavos)}`,
  );
  linhas.push(
    `- Ganhos no Mes: ${formatarMoeda(dados.resumoAtual.ganhosFinanceirosNoMes.valorEmCentavos)}`,
  );
  linhas.push(
    `- Rentabilidade Mensal: ${formatarPercentualSimples(dados.resumoAtual.rentabilidadeMensal.valor)}`,
  );
  linhas.push(
    `- Rentabilidade Anual: ${formatarPercentualSimples(dados.resumoAtual.rentabilidadeAnual.valor)}`,
  );
  linhas.push(
    `- Rentabilidade Desde Inicio: ${formatarPercentualSimples(dados.resumoAtual.rentabilidadeDesdeInicio.valor)}`,
  );
  linhas.push(`- Periodo: ${dados.mesAtual}`);
  linhas.push(`- Quantidade de Relatorios: ${dados.quantidadeRelatorios}`);

  if (dados.variacaoPatrimonialCentavos !== null) {
    linhas.push(
      `- Variacao Patrimonial no Mes: ${formatarMoeda(dados.variacaoPatrimonialCentavos)}`,
    );
  }

  // Benchmarks
  if (dados.comparacaoBenchmarksAtual.length > 0) {
    linhas.push("");
    linhas.push("## Comparacao com Benchmarks");
    for (const comparacao of dados.comparacaoBenchmarksAtual) {
      linhas.push(`### ${comparacao.periodo}`);
      linhas.push(
        `- Carteira: ${formatarPercentualSimples(comparacao.carteira.valor)}`,
      );
      linhas.push(
        `- CDI: ${formatarPercentualSimples(comparacao.cdi.valor)}`,
      );
      linhas.push(
        `- Ibovespa: ${formatarPercentualSimples(comparacao.ibovespa.valor)}`,
      );
      linhas.push(
        `- IPCA: ${formatarPercentualSimples(comparacao.ipca.valor)}`,
      );
    }
  }

  // Risco
  linhas.push("");
  linhas.push("## Analise Risco-Retorno");
  linhas.push(
    `- Meses acima do benchmark: ${dados.analiseRiscoRetorno.mesesAcimaBenchmark}`,
  );
  linhas.push(
    `- Meses abaixo do benchmark: ${dados.analiseRiscoRetorno.mesesAbaixoBenchmark}`,
  );
  linhas.push(
    `- Maior rentabilidade: ${formatarPercentualSimples(dados.analiseRiscoRetorno.maiorRentabilidade.valor.valor)} em ${dados.analiseRiscoRetorno.maiorRentabilidade.mesAno}`,
  );
  linhas.push(
    `- Menor rentabilidade: ${formatarPercentualSimples(dados.analiseRiscoRetorno.menorRentabilidade.valor.valor)} em ${dados.analiseRiscoRetorno.menorRentabilidade.mesAno}`,
  );

  // Alocacao
  if (dados.alocacaoAtual.length > 0) {
    linhas.push("");
    linhas.push("## Alocacao Atual");
    for (const alocacao of dados.alocacaoAtual) {
      for (const categoria of alocacao.categorias) {
        linhas.push(
          `- ${categoria.nomeCategoria}: ${formatarPercentualSimples(categoria.percentualDaCarteira.valor)}`,
        );
      }
    }
  }

  // Top performers
  if (dados.melhoresPerformers.length > 0) {
    linhas.push("");
    linhas.push("## Melhores Ativos do Mes");
    for (const ativo of dados.melhoresPerformers) {
      linhas.push(
        `- ${ativo.nomeAtivo} (${ativo.codigoAtivo ?? "s/c"}): ${formatarPercentualSimples(ativo.rentabilidadeMes.valor)} no mes, saldo ${formatarMoeda(ativo.saldoBruto.valorEmCentavos)}`,
      );
    }
  }

  if (dados.pioresPerformers.length > 0) {
    linhas.push("");
    linhas.push("## Piores Ativos do Mes");
    for (const ativo of dados.pioresPerformers) {
      linhas.push(
        `- ${ativo.nomeAtivo} (${ativo.codigoAtivo ?? "s/c"}): ${formatarPercentualSimples(ativo.rentabilidadeMes.valor)} no mes, saldo ${formatarMoeda(ativo.saldoBruto.valorEmCentavos)}`,
      );
    }
  }

  // Estrategias
  if (dados.ganhosPorEstrategia.length > 0) {
    linhas.push("");
    linhas.push("## Ganhos por Estrategia");
    for (const estrategia of dados.ganhosPorEstrategia) {
      linhas.push(
        `- ${estrategia.nomeEstrategia}: ${formatarMoeda(estrategia.ganhoNoMes.valorEmCentavos)} no mes, ${formatarMoeda(estrategia.ganhoDesdeInicio.valorEmCentavos)} desde inicio`,
      );
    }
  }

  return truncar(linhas.join("\n"));
}

/**
 * Serializa insights de IA em markdown compacto para contexto do chat.
 */
export function serializarContextoInsights(dados: InsightsResponse): string {
  const linhas: string[] = [];

  linhas.push("## Insights da Carteira");
  linhas.push(`- Mes Referencia: ${dados.mesReferencia}`);
  linhas.push(`- Data Geracao: ${dados.dataGeracao}`);
  linhas.push("");
  linhas.push("### Resumo Executivo");
  linhas.push(dados.resumoExecutivo);

  // Insights por categoria
  if (dados.insights.length > 0) {
    linhas.push("");
    linhas.push("### Insights");
    for (const insight of dados.insights) {
      linhas.push(
        `- [${insight.categoria}] (${insight.prioridade}) ${insight.titulo}: ${insight.descricao}`,
      );
      if (insight.acaoSugerida) {
        linhas.push(`  Acao: ${insight.acaoSugerida}`);
      }
    }
  }

  // Alertas
  if (dados.alertas.length > 0) {
    linhas.push("");
    linhas.push("### Alertas");
    for (const alerta of dados.alertas) {
      linhas.push(`- [${alerta.tipo}] ${alerta.mensagem}`);
    }
  }

  // Recomendacoes
  if (dados.recomendacoesLongoPrazo.length > 0) {
    linhas.push("");
    linhas.push("### Recomendacoes de Longo Prazo");
    for (const recomendacao of dados.recomendacoesLongoPrazo) {
      linhas.push(`- ${recomendacao}`);
    }
  }

  return truncar(linhas.join("\n"));
}

/**
 * Serializa dados de tendencias de mercado em markdown compacto para contexto do chat.
 */
export function serializarContextoTendencias(dados: DadosTendencias): string {
  const linhas: string[] = [];

  linhas.push(`## Tendencias de Mercado (atualizado em ${dados.atualizadoEm})`);

  // Indices
  if (dados.indicesMercado.length > 0) {
    linhas.push("");
    linhas.push("### Indices de Mercado");
    for (const indice of dados.indicesMercado) {
      linhas.push(
        `- ${indice.nome} (${indice.simbolo}): ${indice.valor.toLocaleString("pt-BR")} (${indice.variacao >= 0 ? "+" : ""}${formatarPercentualSimples(indice.variacao)})`,
      );
    }
  }

  // Indicadores macro
  if (dados.indicadoresMacro.length > 0) {
    linhas.push("");
    linhas.push("### Indicadores Macroeconomicos");
    for (const indicador of dados.indicadoresMacro) {
      linhas.push(
        `- ${indicador.nome}: ${indicador.valorAtual} ${indicador.unidade}`,
      );
    }
  }

  // Maiores altas
  if (dados.maioresAltas.length > 0) {
    linhas.push("");
    linhas.push("### Maiores Altas do Dia");
    for (const ativo of dados.maioresAltas.slice(0, 5)) {
      linhas.push(
        `- ${ativo.ticker} (${ativo.nome}): R$ ${ativo.preco.toFixed(2)} (+${formatarPercentualSimples(ativo.variacao)})`,
      );
    }
  }

  // Maiores baixas
  if (dados.maioresBaixas.length > 0) {
    linhas.push("");
    linhas.push("### Maiores Baixas do Dia");
    for (const ativo of dados.maioresBaixas.slice(0, 5)) {
      linhas.push(
        `- ${ativo.ticker} (${ativo.nome}): R$ ${ativo.preco.toFixed(2)} (${formatarPercentualSimples(ativo.variacao)})`,
      );
    }
  }

  // Setores
  if (dados.setoresPerformance.length > 0) {
    linhas.push("");
    linhas.push("### Performance por Setor");
    for (const setor of dados.setoresPerformance) {
      linhas.push(
        `- ${setor.setorTraduzido}: ${setor.variacaoMedia >= 0 ? "+" : ""}${formatarPercentualSimples(setor.variacaoMedia)} (${setor.quantidadeAtivos} ativos)`,
      );
    }
  }

  return truncar(linhas.join("\n"));
}

/**
 * Serializa dados de desempenho de ativo individual em markdown compacto para contexto do chat.
 */
export function serializarContextoDesempenho(
  dados: DadosAgregadosAtivo,
): string {
  const linhas: string[] = [];

  linhas.push(`## Ativo: ${dados.nomeAtivo} (${dados.codigoAtivo})`);
  linhas.push(`- Estrategia: ${dados.estrategia ?? "N/A"}`);
  linhas.push(`- Esta na Carteira: ${dados.estaNaCarteira ? "Sim" : "Nao"}`);
  linhas.push(
    `- Saldo Atual: ${formatarMoeda(dados.saldoAtualCentavos)}`,
  );
  linhas.push(
    `- Participacao na Carteira: ${formatarPercentualSimples(dados.participacaoAtualCarteira)}`,
  );

  // Cotacao atual
  if (dados.cotacaoAtual) {
    linhas.push("");
    linhas.push("### Cotacao Atual");
    linhas.push(`- Preco: R$ ${dados.cotacaoAtual.preco.toFixed(2)}`);
    linhas.push(
      `- Variacao Dia: ${formatarPercentualSimples(dados.cotacaoAtual.variacaoPercentual)}`,
    );
  }

  // Dados fundamentalistas
  if (dados.dadosFundamentalistas) {
    linhas.push("");
    linhas.push("### Dados Fundamentalistas");
    const fundamentalistas = dados.dadosFundamentalistas;
    if (fundamentalistas.precoLucro !== null) {
      linhas.push(`- P/L: ${fundamentalistas.precoLucro.toFixed(2)}`);
    }
    if (fundamentalistas.precoValorPatrimonial !== null) {
      linhas.push(
        `- P/VP: ${fundamentalistas.precoValorPatrimonial.toFixed(2)}`,
      );
    }
    if (fundamentalistas.retornoSobrePatrimonio !== null) {
      linhas.push(
        `- ROE: ${formatarPercentualSimples(fundamentalistas.retornoSobrePatrimonio)}`,
      );
    }
    if (fundamentalistas.dividendYield !== null) {
      linhas.push(
        `- Dividend Yield: ${formatarPercentualSimples(fundamentalistas.dividendYield)}`,
      );
    }
  }

  // Historico na carteira (ultimos 6 meses)
  if (dados.historicoNaCarteira.length > 0) {
    linhas.push("");
    linhas.push("### Historico na Carteira (ultimos meses)");
    const historioRecente = dados.historicoNaCarteira.slice(-6);
    for (const ponto of historioRecente) {
      linhas.push(
        `- ${ponto.mesAno}: saldo ${formatarMoeda(ponto.saldoBrutoCentavos)}, rent. ${formatarPercentualSimples(ponto.rentabilidadeMes)}`,
      );
    }
  }

  // Analise IA cacheada
  if (dados.analiseCacheada.existe) {
    linhas.push("");
    linhas.push(
      `### Analise IA (gerada em ${dados.analiseCacheada.dataAnalise ?? "data desconhecida"})`,
    );
    linhas.push("Existe uma analise completa de IA disponivel para este ativo.");
  }

  return truncar(linhas.join("\n"));
}
