import type { InsightsResponse } from "@/schemas/insights.schema";

const LIMITE_CARACTERES_CONTEXTO = 15_000;

function truncar(texto: string): string {
  return texto.length > LIMITE_CARACTERES_CONTEXTO
    ? texto.slice(0, LIMITE_CARACTERES_CONTEXTO) + "\n...(contexto truncado)"
    : texto;
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
