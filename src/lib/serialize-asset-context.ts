import type { DadosAgregadosAtivo } from "@/schemas/asset-analysis.schema";
import { formatarMoeda } from "@/domain/value-objects/money";
import { formatSimplePercentage } from "@/domain/value-objects/percentage";

const LIMITE_CARACTERES_CONTEXTO = 15_000;

function truncar(texto: string): string {
  return texto.length > LIMITE_CARACTERES_CONTEXTO
    ? texto.slice(0, LIMITE_CARACTERES_CONTEXTO) + "\n...(contexto truncado)"
    : texto;
}

/**
 * Serializa dados de desempenho de ativo individual em markdown compacto para contexto do chat.
 */
export function serializarContextoDesempenho(dados: DadosAgregadosAtivo): string {
  const linhas: string[] = [];

  linhas.push(`## Ativo: ${dados.nomeAtivo} (${dados.codigoAtivo})`);
  linhas.push(`- Estrategia: ${dados.estrategia ?? "N/A"}`);
  linhas.push(`- Esta na Carteira: ${dados.estaNaCarteira ? "Sim" : "Nao"}`);
  linhas.push(`- Saldo Atual: ${formatarMoeda(dados.saldoAtualCentavos)}`);
  linhas.push(
    `- Participacao na Carteira: ${formatSimplePercentage(dados.participacaoAtualCarteira)}`,
  );

  // Cotacao atual
  if (dados.cotacaoAtual) {
    linhas.push("");
    linhas.push("### Cotacao Atual");
    linhas.push(`- Preco: R$ ${dados.cotacaoAtual.preco.toFixed(2)}`);
    linhas.push(
      `- Variacao Dia: ${formatSimplePercentage(dados.cotacaoAtual.variacaoPercentual)}`,
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
      linhas.push(`- P/VP: ${fundamentalistas.precoValorPatrimonial.toFixed(2)}`);
    }
    if (fundamentalistas.retornoSobrePatrimonio !== null) {
      linhas.push(`- ROE: ${formatSimplePercentage(fundamentalistas.retornoSobrePatrimonio)}`);
    }
    if (fundamentalistas.dividendYield !== null) {
      linhas.push(`- Dividend Yield: ${formatSimplePercentage(fundamentalistas.dividendYield)}`);
    }
  }

  // Historico na carteira (ultimos 6 meses)
  if (dados.historicoNaCarteira.length > 0) {
    linhas.push("");
    linhas.push("### Historico na Carteira (ultimos meses)");
    const historioRecente = dados.historicoNaCarteira.slice(-6);
    for (const ponto of historioRecente) {
      linhas.push(
        `- ${ponto.mesAno}: saldo ${formatarMoeda(ponto.saldoBrutoCentavos)}, rent. ${formatSimplePercentage(ponto.rentabilidadeMes)}`,
      );
    }
  }

  // Analise IA cacheada
  if (dados.analiseCacheada.existe) {
    linhas.push("");
    linhas.push(
      `### Análise Fortuna (gerada em ${dados.analiseCacheada.dataAnalise ?? "data desconhecida"})`,
    );
    linhas.push("Existe uma análise completa da Fortuna disponível para este ativo.");
  }

  return truncar(linhas.join("\n"));
}
