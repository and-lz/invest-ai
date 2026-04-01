import type { DashboardData } from "@/application/use-cases/get-dashboard-data";
import type { InsightsResponse } from "@/schemas/insights.schema";
import type { ItemPlanoAcao } from "@/schemas/action-plan.schema";
import { formatarMoeda } from "@/domain/value-objects/money";
import { formatSimplePercentage } from "@/domain/value-objects/percentage";

const LIMITE_CARACTERES_CONTEXTO = 15_000;

interface SuplementoContexto {
  insights?: InsightsResponse | null;
  itensPendentes?: ItemPlanoAcao[];
}

function truncar(texto: string): string {
  return texto.length > LIMITE_CARACTERES_CONTEXTO
    ? texto.slice(0, LIMITE_CARACTERES_CONTEXTO) + "\n...(contexto truncado)"
    : texto;
}

/**
 * Serializa dados completos do usuario (todos os campos do DashboardData)
 * para contexto do chat quando nao ha contexto de pagina especifico.
 * @param suplemento - Dados opcionais de insights e plano de acao para enriquecer o contexto
 */
export function serializarContextoCompletoUsuario(
  dados: DashboardData,
  suplemento?: SuplementoContexto,
): string {
  const linhas: string[] = [];

  // === Resumo principal (same as serializarContextoDashboard) ===
  linhas.push("## Resumo da Carteira");
  linhas.push(
    `- Patrimonio Total: ${formatarMoeda(dados.resumoAtual.patrimonioTotal.valorEmCentavos)}`,
  );
  linhas.push(
    `- Ganhos no Mes: ${formatarMoeda(dados.resumoAtual.ganhosFinanceirosNoMes.valorEmCentavos)}`,
  );
  linhas.push(
    `- Rentabilidade Mensal: ${formatSimplePercentage(dados.resumoAtual.rentabilidadeMensal.valor)}`,
  );
  linhas.push(
    `- Rentabilidade Anual: ${formatSimplePercentage(dados.resumoAtual.rentabilidadeAnual.valor)}`,
  );
  linhas.push(
    `- Rentabilidade Desde Inicio: ${formatSimplePercentage(dados.resumoAtual.rentabilidadeDesdeInicio.valor)}`,
  );
  linhas.push(`- Periodo: ${dados.mesAtual}`);
  linhas.push(`- Quantidade de Relatorios: ${dados.quantidadeRelatorios}`);
  linhas.push(`- Periodos Disponiveis: ${dados.periodosDisponiveis.join(", ")}`);

  if (dados.variacaoPatrimonialCentavos !== null) {
    linhas.push(
      `- Variacao Patrimonial no Mes: ${formatarMoeda(dados.variacaoPatrimonialCentavos)}`,
    );
  }

  if (dados.resumoAtual.aplicacoesNoMes.valorEmCentavos !== 0) {
    linhas.push(
      `- Aplicacoes no Mes: ${formatarMoeda(dados.resumoAtual.aplicacoesNoMes.valorEmCentavos)}`,
    );
  }
  if (dados.resumoAtual.resgatesNoMes.valorEmCentavos !== 0) {
    linhas.push(
      `- Resgates no Mes: ${formatarMoeda(dados.resumoAtual.resgatesNoMes.valorEmCentavos)}`,
    );
  }
  if (dados.resumoAtual.eventosFinanceirosNoMes.valorEmCentavos !== 0) {
    linhas.push(
      `- Eventos Financeiros no Mes: ${formatarMoeda(dados.resumoAtual.eventosFinanceirosNoMes.valorEmCentavos)}`,
    );
  }

  // === Insights ativos (alta prioridade) ===
  if (suplemento?.insights) {
    const insights = suplemento.insights;
    const insightsAlta = insights.insights.filter(
      (i) => i.prioridade === "alta" && i.statusAcao !== "ignorada",
    );
    const insightsMedia = insights.insights.filter(
      (i) => i.prioridade === "media" && i.statusAcao !== "ignorada",
    );
    linhas.push("");
    linhas.push(`## Insights Ativos (${insights.mesReferencia})`);
    if (insights.alertas.length > 0) {
      for (const alerta of insights.alertas) {
        linhas.push(`- [${alerta.tipo.toUpperCase()}] ${alerta.mensagem}`);
      }
    }
    if (insightsAlta.length > 0) {
      linhas.push("### Alta Prioridade");
      for (const insight of insightsAlta.slice(0, 4)) {
        const acao = insight.acaoSugerida ? ` → ${insight.acaoSugerida}` : "";
        linhas.push(`- ${insight.titulo}: ${insight.descricao}${acao}`);
      }
    }
    if (insightsMedia.length > 0) {
      linhas.push(`### Media Prioridade (${insightsMedia.length} insights)`);
      for (const insight of insightsMedia.slice(0, 3)) {
        linhas.push(`- ${insight.titulo}`);
      }
    }
    if (insights.recomendacoesLongoPrazo.length > 0) {
      linhas.push("### Recomendacoes de Longo Prazo");
      for (const rec of insights.recomendacoesLongoPrazo.slice(0, 3)) {
        linhas.push(`- ${rec}`);
      }
    }
  }

  // === Plano de acao pendente ===
  if (suplemento?.itensPendentes && suplemento.itensPendentes.length > 0) {
    linhas.push("");
    linhas.push("## Plano de Acao Pendente");
    for (const item of suplemento.itensPendentes.slice(0, 5)) {
      linhas.push(`- [${item.identificador.slice(0, 8)}] (${item.tipoConclusao}) ${item.textoOriginal}`);
    }
  }

  // === Benchmarks ===
  if (dados.comparacaoBenchmarksAtual.length > 0) {
    linhas.push("");
    linhas.push("## Comparacao com Benchmarks");
    for (const comparacao of dados.comparacaoBenchmarksAtual) {
      linhas.push(`### ${comparacao.periodo}`);
      linhas.push(`- Carteira: ${formatSimplePercentage(comparacao.carteira.valor)}`);
      linhas.push(`- CDI: ${formatSimplePercentage(comparacao.cdi.valor)}`);
      linhas.push(`- Ibovespa: ${formatSimplePercentage(comparacao.ibovespa.valor)}`);
      linhas.push(`- IPCA: ${formatSimplePercentage(comparacao.ipca.valor)}`);
    }
  }

  // === Comparacao por periodos ===
  if (dados.comparacaoPeriodos.length > 0) {
    linhas.push("");
    linhas.push("## Comparacao por Periodos");
    for (const periodo of dados.comparacaoPeriodos) {
      linhas.push(
        `- ${periodo.periodo}: Carteira ${formatSimplePercentage(periodo.rentabilidadeCarteira.valor)}, CDI ${formatSimplePercentage(periodo.rentabilidadeCDI.valor)}, %CDI ${formatSimplePercentage(periodo.percentualDoCDI.valor)}${periodo.volatilidade ? `, Vol ${formatSimplePercentage(periodo.volatilidade.valor)}` : ""}`,
      );
    }
  }

  // === Risco ===
  linhas.push("");
  linhas.push("## Analise Risco-Retorno");
  linhas.push(`- Meses acima do benchmark: ${dados.analiseRiscoRetorno.mesesAcimaBenchmark}`);
  linhas.push(`- Meses abaixo do benchmark: ${dados.analiseRiscoRetorno.mesesAbaixoBenchmark}`);
  linhas.push(
    `- Maior rentabilidade: ${formatSimplePercentage(dados.analiseRiscoRetorno.maiorRentabilidade.valor.valor)} em ${dados.analiseRiscoRetorno.maiorRentabilidade.mesAno}`,
  );
  linhas.push(
    `- Menor rentabilidade: ${formatSimplePercentage(dados.analiseRiscoRetorno.menorRentabilidade.valor.valor)} em ${dados.analiseRiscoRetorno.menorRentabilidade.mesAno}`,
  );

  // === Alocacao ===
  if (dados.alocacaoAtual.length > 0) {
    linhas.push("");
    linhas.push("## Alocacao Atual");
    for (const alocacao of dados.alocacaoAtual) {
      for (const categoria of alocacao.categorias) {
        linhas.push(
          `- ${categoria.nomeCategoria}: ${formatSimplePercentage(categoria.percentualDaCarteira.valor)}`,
        );
      }
    }
  }

  // === Rentabilidade por Categoria ===
  if (dados.rentabilidadePorCategoria.length > 0) {
    linhas.push("");
    linhas.push("## Rentabilidade por Categoria (12 meses)");
    for (const cat of dados.rentabilidadePorCategoria) {
      linhas.push(
        `- ${cat.nomeCategoria}: ${formatSimplePercentage(cat.rentabilidade12Meses.valor)}`,
      );
    }
  }

  // === Top performers ===
  if (dados.melhoresPerformers.length > 0) {
    linhas.push("");
    linhas.push("## Melhores Ativos do Mes");
    for (const ativo of dados.melhoresPerformers) {
      linhas.push(
        `- ${ativo.nomeAtivo} (${ativo.codigoAtivo ?? "s/c"}): ${formatSimplePercentage(ativo.rentabilidadeMes.valor)} no mes, saldo ${formatarMoeda(ativo.saldoBruto.valorEmCentavos)}`,
      );
    }
  }

  if (dados.pioresPerformers.length > 0) {
    linhas.push("");
    linhas.push("## Piores Ativos do Mes");
    for (const ativo of dados.pioresPerformers) {
      linhas.push(
        `- ${ativo.nomeAtivo} (${ativo.codigoAtivo ?? "s/c"}): ${formatSimplePercentage(ativo.rentabilidadeMes.valor)} no mes, saldo ${formatarMoeda(ativo.saldoBruto.valorEmCentavos)}`,
      );
    }
  }

  // === Todas as posicoes ===
  if (dados.todasPosicoes.length > 0) {
    linhas.push("");
    linhas.push("## Todas as Posicoes da Carteira");
    for (const ativo of dados.todasPosicoes) {
      linhas.push(
        `- ${ativo.nomeAtivo} (${ativo.codigoAtivo ?? "s/c"}) [${ativo.estrategia}]: saldo ${formatarMoeda(ativo.saldoBruto.valorEmCentavos)}, rent. mes ${formatSimplePercentage(ativo.rentabilidadeMes.valor)}, part. ${formatSimplePercentage(ativo.participacaoNaCarteira.valor)}`,
      );
    }
  }

  // === Estrategias ===
  if (dados.ganhosPorEstrategia.length > 0) {
    linhas.push("");
    linhas.push("## Ganhos por Estrategia");
    for (const estrategia of dados.ganhosPorEstrategia) {
      linhas.push(
        `- ${estrategia.nomeEstrategia}: ${formatarMoeda(estrategia.ganhoNoMes.valorEmCentavos)} no mes, ${formatarMoeda(estrategia.ganhoNoAno.valorEmCentavos)} no ano, ${formatarMoeda(estrategia.ganhoDesdeInicio.valorEmCentavos)} desde inicio`,
      );
    }
  }

  // === Eventos financeiros ===
  if (dados.eventosRecentes.length > 0) {
    linhas.push("");
    linhas.push("## Eventos Financeiros Recentes");
    for (const evento of dados.eventosRecentes) {
      linhas.push(
        `- ${evento.tipoEvento}: ${evento.nomeAtivo} (${evento.codigoAtivo ?? "s/c"}) ${formatarMoeda(evento.valor.valorEmCentavos)}${evento.dataEvento ? ` em ${evento.dataEvento}` : ""}`,
      );
    }
  }

  // === Movimentacoes ===
  if (dados.movimentacoes.length > 0) {
    linhas.push("");
    linhas.push("## Movimentacoes Recentes");
    for (const mov of dados.movimentacoes) {
      linhas.push(
        `- ${mov.data} ${mov.tipoMovimentacao}: ${mov.nomeAtivo} (${mov.codigoAtivo ?? "s/c"}) ${formatarMoeda(mov.valor.valorEmCentavos)}`,
      );
    }
  }

  // === Liquidez ===
  if (dados.faixasLiquidez.length > 0) {
    linhas.push("");
    linhas.push("## Faixas de Liquidez");
    for (const faixa of dados.faixasLiquidez) {
      linhas.push(
        `- ${faixa.descricaoPeriodo} dias: ${formatSimplePercentage(faixa.percentualDaCarteira.valor)} (${formatarMoeda(faixa.valor.valorEmCentavos)}), acumulado ${formatSimplePercentage(faixa.percentualAcumulado.valor)}`,
      );
    }
  }

  // === Evolucao patrimonial ===
  if (dados.evolucaoPatrimonial.length > 0) {
    linhas.push("");
    linhas.push("## Evolucao Patrimonial");
    for (const ponto of dados.evolucaoPatrimonial) {
      linhas.push(
        `- ${ponto.mesAno}: patrimonio ${formatarMoeda(ponto.patrimonioTotalCentavos)}, aportado ${formatarMoeda(ponto.totalAportadoCentavos)}`,
      );
    }
  }

  // === Retornos mensais ===
  if (dados.retornosMensais.length > 0) {
    linhas.push("");
    linhas.push("## Retornos Mensais");
    for (const ano of dados.retornosMensais) {
      const mesesComDados = ano.meses.filter((m) => m.rentabilidadeCarteira !== null);
      if (mesesComDados.length > 0) {
        const retornos = mesesComDados
          .map(
            (m) =>
              `M${m.mes}:${formatSimplePercentage(m.rentabilidadeCarteira!.valor)}`,
          )
          .join(", ");
        linhas.push(
          `- ${ano.ano}: ${retornos}${ano.rentabilidadeAnual ? ` | Anual: ${formatSimplePercentage(ano.rentabilidadeAnual.valor)}` : ""}`,
        );
      }
    }
  }

  return truncar(linhas.join("\n"));
}
