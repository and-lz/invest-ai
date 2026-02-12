import type { ReportRepository } from "@/domain/interfaces/report-repository";
import type { ExtractionService } from "@/domain/interfaces/extraction-service";
import type { ReportMetadata } from "@/schemas/report-metadata.schema";
import type { RelatorioExtraido } from "@/schemas/report-extraction.schema";

interface UploadReportInput {
  nomeArquivoOriginal: string;
  pdfBuffer: Buffer;
}

interface UploadReportOutput {
  metadados: ReportMetadata;
  dadosExtraidos: RelatorioExtraido;
}

export class UploadReportUseCase {
  constructor(
    private readonly repository: ReportRepository,
    private readonly extractionService: ExtractionService,
  ) {}

  async executar(input: UploadReportInput): Promise<UploadReportOutput> {
    const pdfBase64 = input.pdfBuffer.toString("base64");
    const dadosExtraidos = await this.extractionService.extrairDadosDoRelatorio(pdfBase64);
    const identificador = dadosExtraidos.metadados.mesReferencia;

    const caminhoArquivoPdf = await this.repository.salvarPdf(identificador, input.pdfBuffer);
    const caminhoArquivoExtraido = await this.repository.salvarDadosExtraidos(
      identificador,
      dadosExtraidos,
    );

    const metadados: ReportMetadata = {
      identificador,
      mesReferencia: dadosExtraidos.metadados.mesReferencia,
      nomeArquivoOriginal: input.nomeArquivoOriginal,
      caminhoArquivoPdf,
      caminhoArquivoExtraido,
      caminhoArquivoInsights: null,
      dataUpload: new Date().toISOString(),
      statusExtracao: "concluido",
      origemDados: "upload-automatico",
      erroExtracao: null,
    };

    await this.repository.salvarMetadados(metadados);

    return { metadados, dadosExtraidos };
  }
}
