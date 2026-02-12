import type { ReportRepository } from "@/domain/interfaces/report-repository";
import type { ReportMetadata } from "@/schemas/report-metadata.schema";
import type { RelatorioExtraido } from "@/schemas/report-extraction.schema";
import { ReportNotFoundError } from "@/domain/errors/app-errors";

interface ReportDetailOutput {
  metadados: ReportMetadata;
  dados: RelatorioExtraido;
}

export class GetReportDetailUseCase {
  constructor(private readonly repository: ReportRepository) {}

  async executar(identificador: string): Promise<ReportDetailOutput> {
    const metadados = await this.repository.obterMetadados(identificador);
    if (!metadados) {
      throw new ReportNotFoundError(identificador);
    }

    const dados = await this.repository.obterDadosExtraidos(identificador);
    if (!dados) {
      throw new ReportNotFoundError(identificador);
    }

    return { metadados, dados };
  }
}
