import type { ReportRepository } from "@/domain/interfaces/report-repository";
import type { InsightsService } from "@/domain/interfaces/extraction-service";
import type { InsightsResponse } from "@/schemas/insights.schema";
import { ReportNotFoundError } from "@/domain/errors/app-errors";

interface GenerateInsightsInput {
  identificadorRelatorio: string;
  identificadorRelatorioAnterior?: string;
}

export class GenerateInsightsUseCase {
  constructor(
    private readonly repository: ReportRepository,
    private readonly insightsService: InsightsService,
  ) {}

  async executar(input: GenerateInsightsInput): Promise<InsightsResponse> {
    const dadosAtuais = await this.repository.obterDadosExtraidos(input.identificadorRelatorio);
    if (!dadosAtuais) {
      throw new ReportNotFoundError(input.identificadorRelatorio);
    }

    let dadosAnteriores = null;
    if (input.identificadorRelatorioAnterior) {
      dadosAnteriores = await this.repository.obterDadosExtraidos(
        input.identificadorRelatorioAnterior,
      );
    }

    const insights = await this.insightsService.gerarInsights(dadosAtuais, dadosAnteriores);

    await this.repository.salvarInsights(input.identificadorRelatorio, insights);

    return insights;
  }
}
