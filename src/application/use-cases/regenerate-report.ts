import type { ReportRepository } from "@/domain/interfaces/report-repository";
import type { ExtractionService } from "@/domain/interfaces/extraction-service";
import type { ReportMetadata } from "@/schemas/report-metadata.schema";
import type { RelatorioExtraido } from "@/schemas/report-extraction.schema";

interface RegenerateReportInput {
  identificador: string;
}

interface RegenerateReportOutput {
  metadados: ReportMetadata;
  dadosExtraidos: RelatorioExtraido;
}

export class RegenerateReportUseCase {
  constructor(
    private readonly repository: ReportRepository,
    private readonly extractionService: ExtractionService,
  ) {}

  async executar(input: RegenerateReportInput): Promise<RegenerateReportOutput> {
    const metadadosExistentes = await this.repository.obterMetadados(input.identificador);
    if (!metadadosExistentes) {
      throw new Error(`Relatorio ${input.identificador} nao encontrado`);
    }

    const pdfBase64 = await this.repository.obterPdfComoBase64(input.identificador);
    const dadosExtraidos = await this.extractionService.extrairDadosDoRelatorio(pdfBase64);

    const caminhoArquivoExtraido = await this.repository.salvarDadosExtraidos(
      input.identificador,
      dadosExtraidos,
    );

    const metadados: ReportMetadata = {
      ...metadadosExistentes,
      caminhoArquivoExtraido,
      statusExtracao: "concluido",
      erroExtracao: null,
    };

    await this.repository.salvarMetadados(metadados);

    return { metadados, dadosExtraidos };
  }
}
