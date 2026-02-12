import type { ReportRepository } from "@/domain/interfaces/report-repository";
import type {
  RelatorioExtraido,
  Resumo,
  AlocacaoMensal,
  PosicaoAtivo,
  ComparacaoBenchmarks,
  GanhosPorEstrategia,
  EventoFinanceiro,
} from "@/schemas/report-extraction.schema";

export interface DashboardData {
  resumoAtual: Resumo;
  mesAtual: string;
  evolucaoPatrimonial: Array<{
    mesAno: string;
    patrimonioTotalCentavos: number;
    totalAportadoCentavos: number;
  }>;
  alocacaoAtual: AlocacaoMensal[];
  comparacaoBenchmarksAtual: ComparacaoBenchmarks[];
  melhoresPerformers: PosicaoAtivo[];
  pioresPerformers: PosicaoAtivo[];
  ganhosPorEstrategia: GanhosPorEstrategia[];
  eventosRecentes: EventoFinanceiro[];
  variacaoPatrimonialCentavos: number | null;
  quantidadeRelatorios: number;
}

const QUANTIDADE_TOP_PERFORMERS = 5;

export class GetDashboardDataUseCase {
  constructor(private readonly repository: ReportRepository) {}

  async executar(): Promise<DashboardData | null> {
    const todosMetadados = await this.repository.listarTodosMetadados();

    if (todosMetadados.length === 0) return null;

    const relatoriosExtraidos: Array<{
      mesAno: string;
      dados: RelatorioExtraido;
    }> = [];

    for (const metadados of todosMetadados) {
      const dados = await this.repository.obterDadosExtraidos(metadados.identificador);
      if (dados) {
        relatoriosExtraidos.push({
          mesAno: metadados.mesReferencia,
          dados,
        });
      }
    }

    if (relatoriosExtraidos.length === 0) return null;

    relatoriosExtraidos.sort((relatorioA, relatorioB) =>
      relatorioA.mesAno.localeCompare(relatorioB.mesAno),
    );

    const relatorioMaisRecente = relatoriosExtraidos[relatoriosExtraidos.length - 1]!;

    const evolucaoPatrimonial = relatoriosExtraidos.map((relatorio) => ({
      mesAno: relatorio.mesAno,
      patrimonioTotalCentavos: relatorio.dados.resumo.patrimonioTotal.valorEmCentavos,
      totalAportadoCentavos: this.calcularTotalAportado(relatorio.dados),
    }));

    const posicoesOrdenadas = [...relatorioMaisRecente.dados.posicoesDetalhadas].sort(
      (posicaoA, posicaoB) =>
        posicaoB.rentabilidadeMes.valor - posicaoA.rentabilidadeMes.valor,
    );

    const melhoresPerformers = posicoesOrdenadas.slice(0, QUANTIDADE_TOP_PERFORMERS);
    const pioresPerformers = posicoesOrdenadas
      .slice(-QUANTIDADE_TOP_PERFORMERS)
      .reverse();

    let variacaoPatrimonialCentavos: number | null = null;
    if (relatoriosExtraidos.length >= 2) {
      const relatorioAnterior = relatoriosExtraidos[relatoriosExtraidos.length - 2]!;
      variacaoPatrimonialCentavos =
        relatorioMaisRecente.dados.resumo.patrimonioTotal.valorEmCentavos -
        relatorioAnterior.dados.resumo.patrimonioTotal.valorEmCentavos;
    } else if (relatorioMaisRecente.dados.resumo.patrimonioMesAnterior) {
      variacaoPatrimonialCentavos =
        relatorioMaisRecente.dados.resumo.patrimonioTotal.valorEmCentavos -
        relatorioMaisRecente.dados.resumo.patrimonioMesAnterior.valorEmCentavos;
    }

    return {
      resumoAtual: relatorioMaisRecente.dados.resumo,
      mesAtual: relatorioMaisRecente.mesAno,
      evolucaoPatrimonial,
      alocacaoAtual: relatorioMaisRecente.dados.evolucaoAlocacao,
      comparacaoBenchmarksAtual: relatorioMaisRecente.dados.comparacaoBenchmarks,
      melhoresPerformers,
      pioresPerformers,
      ganhosPorEstrategia: relatorioMaisRecente.dados.ganhosPorEstrategia,
      eventosRecentes: relatorioMaisRecente.dados.eventosFinanceiros,
      variacaoPatrimonialCentavos,
      quantidadeRelatorios: relatoriosExtraidos.length,
    };
  }

  private calcularTotalAportado(dados: RelatorioExtraido): number {
    const ultimoMesEvolucao =
      dados.evolucaoPatrimonial[dados.evolucaoPatrimonial.length - 1];
    if (ultimoMesEvolucao) {
      return ultimoMesEvolucao.totalAportado.valorEmCentavos;
    }
    return 0;
  }
}
