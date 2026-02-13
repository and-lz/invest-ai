import type { ReportRepository } from "@/domain/interfaces/report-repository";
import type { InsightsResponse } from "@/schemas/insights.schema";
import { InsightsResponseSchema } from "@/schemas/insights.schema";
import { ReportNotFoundError, ValidationError } from "@/domain/errors/app-errors";

const IDENTIFICADOR_CONSOLIDADO = "consolidado";

interface SalvarInsightsManualInput {
  identificadorRelatorio: string;
  jsonBruto: string;
}

export class SalvarInsightsManualUseCase {
  constructor(private readonly repository: ReportRepository) {}

  async executar(input: SalvarInsightsManualInput): Promise<InsightsResponse> {
    const ehConsolidado = input.identificadorRelatorio === IDENTIFICADOR_CONSOLIDADO;

    if (!ehConsolidado) {
      const metadados = await this.repository.obterMetadados(input.identificadorRelatorio);
      if (!metadados) {
        throw new ReportNotFoundError(input.identificadorRelatorio);
      }
    }

    let dadosBrutos: unknown;
    try {
      dadosBrutos = JSON.parse(input.jsonBruto);
    } catch {
      throw new ValidationError(
        "JSON invalido. Verifique se voce copiou o JSON completo da resposta da IA.",
      );
    }

    const resultado = InsightsResponseSchema.safeParse(dadosBrutos);

    if (!resultado.success) {
      const errosFormatados = resultado.error.issues
        .slice(0, 10)
        .map((issue) => `- ${issue.path.join(".")}: ${issue.message}`)
        .join("\n");
      throw new ValidationError(
        `Dados nao correspondem ao schema de insights esperado:\n${errosFormatados}`,
      );
    }

    const insightsValidados = resultado.data;

    await this.repository.salvarInsights(input.identificadorRelatorio, insightsValidados);

    return insightsValidados;
  }
}
