import type { ReportRepository } from "@/domain/interfaces/report-repository";
import type { InsightsService } from "@/domain/interfaces/extraction-service";
import type { InsightsResponse } from "@/schemas/insights.schema";
import type { RelatorioExtraido } from "@/schemas/report-extraction.schema";

const IDENTIFICADOR_CONSOLIDADO = "consolidado";

export class GenerateConsolidatedInsightsUseCase {
  constructor(
    private readonly repository: ReportRepository,
    private readonly insightsService: InsightsService,
  ) {}

  async executar(): Promise<InsightsResponse> {
    const todosMetadados = await this.repository.listarTodosMetadados();

    if (todosMetadados.length === 0) {
      throw new Error("Nenhum relatório disponível para gerar insights consolidados");
    }

    const relatoriosExtraidos: RelatorioExtraido[] = [];

    for (const metadados of todosMetadados) {
      const dadosExtraidos = await this.repository.obterDadosExtraidos(metadados.identificador);
      if (dadosExtraidos) {
        relatoriosExtraidos.push(dadosExtraidos);
      }
    }

    if (relatoriosExtraidos.length === 0) {
      throw new Error("Nenhum relatório com dados extraídos disponível");
    }

    // Ordenar cronologicamente (mais antigo primeiro)
    const relatoriosOrdenados = relatoriosExtraidos.sort((relatorioA, relatorioB) =>
      relatorioA.metadados.mesReferencia.localeCompare(relatorioB.metadados.mesReferencia),
    );

    const insights = await this.insightsService.gerarInsightsConsolidados(relatoriosOrdenados);

    await this.repository.salvarInsights(IDENTIFICADOR_CONSOLIDADO, insights);

    return insights;
  }
}
