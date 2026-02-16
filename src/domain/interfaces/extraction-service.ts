import type { RelatorioExtraido } from "@/schemas/report-extraction.schema";
import type { InsightsResponse } from "@/schemas/insights.schema";

export interface ExtractionService {
  extrairDadosDoRelatorio(pdfBase64: string): Promise<RelatorioExtraido>;
}

export interface InsightsService {
  gerarInsights(
    relatorioAtual: RelatorioExtraido,
    relatorioAnterior: RelatorioExtraido | null,
  ): Promise<InsightsResponse>;

  gerarInsightsConsolidados(todosRelatorios: RelatorioExtraido[]): Promise<InsightsResponse>;
}
