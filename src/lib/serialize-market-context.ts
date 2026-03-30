import type { DadosTendencias } from "@/schemas/trends.schema";
import { formatSimplePercentage } from "@/domain/value-objects/percentage";

const LIMITE_CARACTERES_CONTEXTO = 15_000;

function truncar(texto: string): string {
  return texto.length > LIMITE_CARACTERES_CONTEXTO
    ? texto.slice(0, LIMITE_CARACTERES_CONTEXTO) + "\n...(contexto truncado)"
    : texto;
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
        `- ${indice.nome} (${indice.simbolo}): ${indice.valor.toLocaleString("pt-BR")} (${indice.variacao >= 0 ? "+" : ""}${formatSimplePercentage(indice.variacao)})`,
      );
    }
  }

  // Indicadores macro
  if (dados.indicadoresMacro.length > 0) {
    linhas.push("");
    linhas.push("### Indicadores Macroeconomicos");
    for (const indicador of dados.indicadoresMacro) {
      linhas.push(`- ${indicador.nome}: ${indicador.valorAtual} ${indicador.unidade}`);
    }
  }

  // Maiores altas
  if (dados.maioresAltas.length > 0) {
    linhas.push("");
    linhas.push("### Maiores Altas do Dia");
    for (const ativo of dados.maioresAltas.slice(0, 5)) {
      linhas.push(
        `- ${ativo.ticker} (${ativo.nome}): R$ ${ativo.preco.toFixed(2)} (+${formatSimplePercentage(ativo.variacao)})`,
      );
    }
  }

  // Maiores baixas
  if (dados.maioresBaixas.length > 0) {
    linhas.push("");
    linhas.push("### Maiores Baixas do Dia");
    for (const ativo of dados.maioresBaixas.slice(0, 5)) {
      linhas.push(
        `- ${ativo.ticker} (${ativo.nome}): R$ ${ativo.preco.toFixed(2)} (${formatSimplePercentage(ativo.variacao)})`,
      );
    }
  }

  // Setores
  if (dados.setoresPerformance.length > 0) {
    linhas.push("");
    linhas.push("### Performance por Setor");
    for (const setor of dados.setoresPerformance) {
      linhas.push(
        `- ${setor.setorTraduzido}: ${setor.variacaoMedia >= 0 ? "+" : ""}${formatSimplePercentage(setor.variacaoMedia)} (${setor.quantidadeAtivos} ativos)`,
      );
    }
  }

  return truncar(linhas.join("\n"));
}
