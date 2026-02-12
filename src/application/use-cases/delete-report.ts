import type { ReportRepository } from "@/domain/interfaces/report-repository";
import { ReportNotFoundError } from "@/domain/errors/app-errors";

export class DeleteReportUseCase {
  constructor(private readonly repository: ReportRepository) {}

  async executar(identificador: string): Promise<void> {
    const metadados = await this.repository.obterMetadados(identificador);
    if (!metadados) {
      throw new ReportNotFoundError(identificador);
    }

    await this.repository.removerRelatorio(identificador);
  }
}
