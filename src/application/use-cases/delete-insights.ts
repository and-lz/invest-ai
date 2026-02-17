import type { ReportRepository } from "@/domain/interfaces/report-repository";
import { InsightsNotFoundError } from "@/domain/errors/app-errors";

export class DeleteInsightsUseCase {
  constructor(private readonly repository: ReportRepository) {}

  async executar(identificador: string): Promise<void> {
    const insights = await this.repository.obterInsights(identificador);
    if (!insights) {
      throw new InsightsNotFoundError(identificador);
    }

    await this.repository.removerInsights(identificador);
  }
}
