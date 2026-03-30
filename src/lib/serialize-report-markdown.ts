import type { RelatorioExtraido } from "@/schemas/report-extraction.schema";
import { formatarMesAno, formatBrazilianDate } from "@/lib/format-date";
import {
  serializarResumo,
  serializarEvolucaoAlocacao,
  serializarEvolucaoPatrimonial,
  serializarComparacaoPeriodos,
  serializarAnaliseRiscoRetorno,
  serializarRetornosMensais,
  serializarComparacaoBenchmarks,
  serializarRentabilidadePorCategoria,
  serializarEventosFinanceiros,
  serializarGanhosPorEstrategia,
  serializarFaixasLiquidez,
  serializarPosicoesDetalhadas,
  serializarMovimentacoesAgregadas,
} from "@/lib/report-sections";

// ============================================================
// Serializacao de RelatorioExtraido para Markdown.
// Usado nos prompts de insights para reduzir tokens (~60-70%).
// ============================================================

function serializarMetadados(metadados: RelatorioExtraido["metadados"]): string {
  const mesAnoExtenso = formatarMesAno(metadados.mesReferencia, "extenso");
  const linhas = [
    `# Relatório Fortuna - ${mesAnoExtenso}`,
    `- Instituicao: ${metadados.instituicao}`,
    `- Data de geracao: ${formatBrazilianDate(metadados.dataGeracao)}`,
  ];
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
