import type { RelatorioExtraido } from "@/schemas/report-extraction.schema";
import type {
  HistoricoPosicaoAtivo,
  MovimentacaoAtivo,
  EventoFinanceiroAtivo,
} from "@/schemas/analise-ativo.schema";

// ============================================================
// Agrega dados de um ativo especifico across todos os relatorios.
// Funcao pura: recebe relatorios, retorna dados filtrados do ativo.
// ============================================================

/** Resultado da agregacao de dados de um ativo nos relatorios */
export interface DadosAtivoAgregados {
  readonly nomeAtivo: string;
  readonly codigoAtivo: string;
  readonly estrategia: string | null;
  readonly historicoNaCarteira: HistoricoPosicaoAtivo[];
  readonly movimentacoesDoAtivo: MovimentacaoAtivo[];
  readonly eventosFinanceirosDoAtivo: EventoFinanceiroAtivo[];
  readonly saldoAtualCentavos: number;
  readonly participacaoAtualCarteira: number;
}

/**
 * Verifica se um ativo corresponde ao identificador buscado.
 * Compara por codigoAtivo (exato) ou por nomeAtivo (case-insensitive).
 */
function ativoCorresponde(
  nomeAtivo: string,
  codigoAtivo: string | null,
  identificadorBuscado: string,
): boolean {
  const identificadorNormalizado = identificadorBuscado.trim().toUpperCase();

  if (codigoAtivo && codigoAtivo.trim().toUpperCase() === identificadorNormalizado) {
    return true;
  }

  return nomeAtivo.trim().toUpperCase() === identificadorNormalizado;
}

/**
 * Agrega dados de um ativo especifico across todos os relatorios disponíveis.
 *
 * @param relatorios - Todos os relatórios extraídos (ordenados por mesReferencia)
 * @param identificadorAtivo - Ticker (PETR4) ou nome completo do ativo
 * @returns Dados agregados do ativo ou null se não encontrado
 */
export function agregarDadosDoAtivo(
  relatorios: RelatorioExtraido[],
  identificadorAtivo: string,
): DadosAtivoAgregados | null {
  const historicoNaCarteira: HistoricoPosicaoAtivo[] = [];
  const movimentacoesDoAtivo: MovimentacaoAtivo[] = [];
  const eventosFinanceirosDoAtivo: EventoFinanceiroAtivo[] = [];

  let nomeAtivoEncontrado = identificadorAtivo;
  let codigoAtivoEncontrado = identificadorAtivo;
  let estrategiaEncontrada: string | null = null;

  // Ordenar relatorios por data (mais antigo primeiro)
  const relatoriosOrdenados = [...relatorios].sort((relatorioA, relatorioB) =>
    relatorioA.metadados.mesReferencia.localeCompare(relatorioB.metadados.mesReferencia),
  );

  for (const relatorio of relatoriosOrdenados) {
    const mesAnoReferencia = relatorio.metadados.mesReferencia;

    // Buscar posicao do ativo neste mes
    const posicaoNoMes = relatorio.posicoesDetalhadas.find((posicao) =>
      ativoCorresponde(posicao.nomeAtivo, posicao.codigoAtivo, identificadorAtivo),
    );

    if (posicaoNoMes) {
      nomeAtivoEncontrado = posicaoNoMes.nomeAtivo;
      codigoAtivoEncontrado = posicaoNoMes.codigoAtivo ?? posicaoNoMes.nomeAtivo;
      estrategiaEncontrada = posicaoNoMes.estrategia;

      historicoNaCarteira.push({
        mesAno: mesAnoReferencia,
        saldoBrutoCentavos: posicaoNoMes.saldoBruto.valorEmCentavos,
        rentabilidadeMes: posicaoNoMes.rentabilidadeMes.valor,
        rentabilidade12Meses: posicaoNoMes.rentabilidade12Meses?.valor ?? null,
        rentabilidadeDesdeInicio: posicaoNoMes.rentabilidadeDesdeInicio?.valor ?? null,
        participacaoNaCarteira: posicaoNoMes.participacaoNaCarteira.valor,
      });
    }

    // Filtrar movimentacoes deste ativo neste relatorio
    for (const movimentacao of relatorio.movimentacoes) {
      if (ativoCorresponde(movimentacao.nomeAtivo, movimentacao.codigoAtivo, identificadorAtivo)) {
        movimentacoesDoAtivo.push({
          data: movimentacao.data,
          tipo: movimentacao.tipoMovimentacao,
          valorCentavos: movimentacao.valor.valorEmCentavos,
          descricao: movimentacao.descricao,
        });
      }
    }

    // Filtrar eventos financeiros deste ativo neste relatorio
    for (const evento of relatorio.eventosFinanceiros) {
      if (ativoCorresponde(evento.nomeAtivo, evento.codigoAtivo, identificadorAtivo)) {
        eventosFinanceirosDoAtivo.push({
          data: evento.dataEvento,
          tipo: evento.tipoEvento,
          valorCentavos: evento.valor.valorEmCentavos,
        });
      }
    }
  }

  // Se nao encontrou o ativo em nenhum relatorio, retorna null
  if (historicoNaCarteira.length === 0 && movimentacoesDoAtivo.length === 0) {
    return null;
  }

  // Deduplica movimentacoes (podem repetir entre relatorios adjacentes)
  const movimentacoesUnicas = deduplicarMovimentacoes(movimentacoesDoAtivo);

  // Deduplica eventos financeiros
  const eventosUnicos = deduplicarEventos(eventosFinanceirosDoAtivo);

  // Saldo e participacao mais recentes
  const posicaoMaisRecente = historicoNaCarteira.at(-1);
  const saldoAtualCentavos = posicaoMaisRecente?.saldoBrutoCentavos ?? 0;
  const participacaoAtualCarteira = posicaoMaisRecente?.participacaoNaCarteira ?? 0;

  return {
    nomeAtivo: nomeAtivoEncontrado,
    codigoAtivo: codigoAtivoEncontrado,
    estrategia: estrategiaEncontrada,
    historicoNaCarteira,
    movimentacoesDoAtivo: movimentacoesUnicas,
    eventosFinanceirosDoAtivo: eventosUnicos,
    saldoAtualCentavos,
    participacaoAtualCarteira,
  };
}

/**
 * Lista todos os ativos unicos presentes nos relatorios.
 * Retorna ticker + nome + estrategia para o seletor de ativos.
 */
export function listarAtivosUnicos(
  relatorios: RelatorioExtraido[],
): Array<{ codigoAtivo: string; nomeAtivo: string; estrategia: string }> {
  const ativosMap = new Map<string, { nomeAtivo: string; estrategia: string }>();

  for (const relatorio of relatorios) {
    for (const posicao of relatorio.posicoesDetalhadas) {
      const chave = (posicao.codigoAtivo ?? posicao.nomeAtivo).toUpperCase();
      // Sobrescreve com o mais recente (ultimo relatorio ganha)
      ativosMap.set(chave, {
        nomeAtivo: posicao.nomeAtivo,
        estrategia: posicao.estrategia,
      });
    }
  }

  return [...ativosMap.entries()]
    .map(([codigoAtivo, dados]) => ({
      codigoAtivo,
      nomeAtivo: dados.nomeAtivo,
      estrategia: dados.estrategia,
    }))
    .sort((ativoA, ativoB) => ativoA.nomeAtivo.localeCompare(ativoB.nomeAtivo));
}

// ---- Helpers de deduplicacao ----

function deduplicarMovimentacoes(
  movimentacoes: MovimentacaoAtivo[],
): MovimentacaoAtivo[] {
  const chaves = new Set<string>();
  const resultado: MovimentacaoAtivo[] = [];

  for (const movimentacao of movimentacoes) {
    const chave = `${movimentacao.data}|${movimentacao.tipo}|${movimentacao.valorCentavos}`;
    if (!chaves.has(chave)) {
      chaves.add(chave);
      resultado.push(movimentacao);
    }
  }

  return resultado.sort((movimentacaoA, movimentacaoB) =>
    movimentacaoA.data.localeCompare(movimentacaoB.data),
  );
}

function deduplicarEventos(
  eventos: EventoFinanceiroAtivo[],
): EventoFinanceiroAtivo[] {
  const chaves = new Set<string>();
  const resultado: EventoFinanceiroAtivo[] = [];

  for (const evento of eventos) {
    const chave = `${evento.data ?? "sem-data"}|${evento.tipo}|${evento.valorCentavos}`;
    if (!chaves.has(chave)) {
      chaves.add(chave);
      resultado.push(evento);
    }
  }

  return resultado.sort((eventoA, eventoB) =>
    (eventoA.data ?? "").localeCompare(eventoB.data ?? ""),
  );
}
