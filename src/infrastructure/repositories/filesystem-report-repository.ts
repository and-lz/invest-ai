import type { ReportRepository } from "@/domain/interfaces/report-repository";
import type { ReportMetadata } from "@/schemas/report-metadata.schema";
import type { RelatorioExtraido } from "@/schemas/report-extraction.schema";
import type { InsightsResponse } from "@/schemas/insights.schema";
import { ReportMetadataSchema } from "@/schemas/report-metadata.schema";
import { RelatorioExtraidoSchema } from "@/schemas/report-extraction.schema";
import { InsightsResponseSchema } from "@/schemas/insights.schema";
import { LocalFileManager } from "@/infrastructure/storage/local-file-manager";
import { ReportNotFoundError } from "@/domain/errors/app-errors";

export class FilesystemReportRepository implements ReportRepository {
  private readonly fileManager: LocalFileManager;

  constructor(diretorioBase: string) {
    this.fileManager = new LocalFileManager(diretorioBase);
  }

  async salvarPdf(identificador: string, pdfBuffer: Buffer): Promise<string> {
    return this.fileManager.salvarArquivo(`reports/${identificador}.pdf`, pdfBuffer);
  }

  async salvarDadosExtraidos(
    identificador: string,
    dados: RelatorioExtraido,
  ): Promise<string> {
    return this.fileManager.salvarJson(`extracted/${identificador}.json`, dados);
  }

  async salvarMetadados(metadados: ReportMetadata): Promise<void> {
    await this.fileManager.salvarJson(
      `extracted/${metadados.identificador}-metadata.json`,
      metadados,
    );
  }

  async salvarInsights(identificador: string, insights: InsightsResponse): Promise<void> {
    await this.fileManager.salvarJson(`insights/${identificador}.json`, insights);
  }

  async obterMetadados(identificador: string): Promise<ReportMetadata | null> {
    const caminhoMetadados = `extracted/${identificador}-metadata.json`;
    const existe = await this.fileManager.arquivoExiste(caminhoMetadados);

    if (!existe) return null;

    const dadosBrutos = await this.fileManager.lerJson<unknown>(caminhoMetadados);
    return ReportMetadataSchema.parse(dadosBrutos);
  }

  async obterDadosExtraidos(identificador: string): Promise<RelatorioExtraido | null> {
    const caminhoDados = `extracted/${identificador}.json`;
    const existe = await this.fileManager.arquivoExiste(caminhoDados);

    if (!existe) return null;

    const dadosBrutos = await this.fileManager.lerJson<unknown>(caminhoDados);
    return RelatorioExtraidoSchema.parse(dadosBrutos);
  }

  async obterInsights(identificador: string): Promise<InsightsResponse | null> {
    const caminhoInsights = `insights/${identificador}.json`;
    const existe = await this.fileManager.arquivoExiste(caminhoInsights);

    if (!existe) return null;

    const dadosBrutos = await this.fileManager.lerJson<unknown>(caminhoInsights);
    return InsightsResponseSchema.parse(dadosBrutos);
  }

  async obterPdfComoBase64(identificador: string): Promise<string> {
    const caminhoPdf = `reports/${identificador}.pdf`;
    const existe = await this.fileManager.arquivoExiste(caminhoPdf);

    if (!existe) {
      throw new ReportNotFoundError(identificador);
    }

    const buffer = await this.fileManager.lerArquivo(caminhoPdf);
    return buffer.toString("base64");
  }

  async listarTodosMetadados(): Promise<ReportMetadata[]> {
    const arquivos = await this.fileManager.listarArquivos("extracted", "-metadata.json");
    const metadados: ReportMetadata[] = [];

    for (const arquivo of arquivos) {
      const dadosBrutos = await this.fileManager.lerJson<unknown>(`extracted/${arquivo}`);
      const resultado = ReportMetadataSchema.safeParse(dadosBrutos);
      if (resultado.success) {
        metadados.push(resultado.data);
      }
    }

    return metadados.sort((metadadoA, metadadoB) =>
      metadadoB.mesReferencia.localeCompare(metadadoA.mesReferencia),
    );
  }

  async removerRelatorio(identificador: string): Promise<void> {
    await Promise.all([
      this.fileManager.removerArquivo(`reports/${identificador}.pdf`),
      this.fileManager.removerArquivo(`extracted/${identificador}.json`),
      this.fileManager.removerArquivo(`extracted/${identificador}-metadata.json`),
      this.fileManager.removerArquivo(`insights/${identificador}.json`),
    ]);
  }
}
