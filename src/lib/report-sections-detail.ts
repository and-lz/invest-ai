import type {
  FaixaLiquidez,
  PosicaoAtivo,
  Movimentacao,
} from "@/schemas/report-extraction.schema";
import { formatarMoeda } from "@/domain/value-objects/money";
import {
  formatarDinheiro,
  formatarDinheiroCompacto,
  formatarPercent,
} from "@/lib/report-formatters";

export function serializarFaixasLiquidez(faixas: FaixaLiquidez[]): string {
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

export function serializarPosicoesDetalhadas(posicoes: PosicaoAtivo[]): string {
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

export function serializarMovimentacoesAgregadas(movimentacoes: Movimentacao[]): string {
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
