import type { DashboardData } from "@/application/use-cases/get-dashboard-data";
import { formatarMoeda } from "@/domain/value-objects/money";
import { formatSimplePercentage } from "@/domain/value-objects/percentage";

// Re-export extracted functions so existing importers don't break
export { serializarContextoInsights } from "./serialize-insights-context";
export { serializarContextoTendencias } from "./serialize-market-context";
export { serializarContextoDesempenho } from "./serialize-asset-context";
export { serializarContextoCompletoUsuario } from "./serialize-full-user-context";

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
      linhas.push(`- Carteira: ${formatSimplePercentage(comparacao.carteira.valor)}`);
      linhas.push(`- CDI: ${formatSimplePercentage(comparacao.cdi.valor)}`);
      linhas.push(`- Ibovespa: ${formatSimplePercentage(comparacao.ibovespa.valor)}`);
      linhas.push(`- IPCA: ${formatSimplePercentage(comparacao.ipca.valor)}`);
    }
  }

  // Risco
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

  // Alocacao
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

  // Top performers
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

