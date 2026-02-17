import type { ReportRepository } from "@/domain/interfaces/report-repository";
import type { InsightsMetadata } from "@/schemas/insights.schema";

export class ListInsightsUseCase {
  constructor(private readonly repository: ReportRepository) {}

  async executar(): Promise<InsightsMetadata[]> {
    return this.repository.listarInsightsMetadados();
  }
}
