import type { ReportMetadata } from "@/schemas/report-metadata.schema";
import type { RelatorioExtraido } from "@/schemas/report-extraction.schema";
import type { InsightsResponse, InsightsMetadata } from "@/schemas/insights.schema";

export interface ReportRepository {
  salvarPdf(identificador: string, pdfBuffer: Buffer): Promise<string>;
  salvarDadosExtraidos(identificador: string, dados: RelatorioExtraido): Promise<string>;
  salvarMetadados(metadados: ReportMetadata): Promise<void>;
  salvarInsights(identificador: string, insights: InsightsResponse): Promise<void>;

  obterMetadados(identificador: string): Promise<ReportMetadata | null>;
  obterDadosExtraidos(identificador: string): Promise<RelatorioExtraido | null>;
  obterInsights(identificador: string): Promise<InsightsResponse | null>;
  obterPdfComoBase64(identificador: string): Promise<string>;

  listarTodosMetadados(): Promise<ReportMetadata[]>;
  listarInsightsMetadados(): Promise<InsightsMetadata[]>;

  removerRelatorio(identificador: string): Promise<void>;
  removerInsights(identificador: string): Promise<void>;
}
