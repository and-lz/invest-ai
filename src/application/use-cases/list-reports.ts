import type { ReportRepository } from "@/domain/interfaces/report-repository";
import type { ReportMetadata } from "@/schemas/report-metadata.schema";

export class ListReportsUseCase {
  constructor(private readonly repository: ReportRepository) {}

  async executar(): Promise<ReportMetadata[]> {
    return this.repository.listarTodosMetadados();
  }
}
