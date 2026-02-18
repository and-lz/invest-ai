import type { ReportRepository } from "@/domain/interfaces/report-repository";
import type { InsightsResponse, StatusAcao } from "@/schemas/insights.schema";
import { ReportNotFoundError } from "@/domain/errors/app-errors";

interface AtualizarConclusaoInsightInput {
  identificadorRelatorio: string;
  indiceInsight: number;
  // @deprecated - usar statusAcao
  concluida?: boolean;
  statusAcao?: StatusAcao;
}

export class UpdateInsightConclusionUseCase {
  constructor(private readonly repository: ReportRepository) {}

  async executar(input: AtualizarConclusaoInsightInput): Promise<InsightsResponse> {
    const metadados = await this.repository.obterMetadados(input.identificadorRelatorio);
    if (!metadados) {
      throw new ReportNotFoundError(input.identificadorRelatorio);
    }

    const insightsAtuais = await this.repository.obterInsights(input.identificadorRelatorio);
    if (!insightsAtuais) {
      throw new ReportNotFoundError(
        `Nenhum insight encontrado para ${input.identificadorRelatorio}`,
      );
    }

    if (input.indiceInsight < 0 || input.indiceInsight >= insightsAtuais.insights.length) {
      throw new Error(`Índice de insight inválido: ${input.indiceInsight}`);
    }

    // Determinar novo status: preferir statusAcao, caso contrário derivar de concluida
    const novoStatus: StatusAcao = input.statusAcao ?? (input.concluida ? "concluida" : "pendente");

    // Manter campo concluida para backward compatibility
    const novaConcluida = novoStatus === "concluida";

    const insightsAtualizados: InsightsResponse = {
      ...insightsAtuais,
      insights: insightsAtuais.insights.map((insight, indice) =>
        indice === input.indiceInsight
          ? { ...insight, statusAcao: novoStatus, concluida: novaConcluida }
          : insight,
      ),
    };

    await this.repository.salvarInsights(input.identificadorRelatorio, insightsAtualizados);

    return insightsAtualizados;
  }
}
