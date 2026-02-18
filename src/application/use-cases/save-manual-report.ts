import type { ReportRepository } from "@/domain/interfaces/report-repository";
import type { ReportMetadata } from "@/schemas/report-metadata.schema";
import type { RelatorioExtraido } from "@/schemas/report-extraction.schema";
import { RelatorioExtraidoSchema } from "@/schemas/report-extraction.schema";
import { ValidationError } from "@/domain/errors/app-errors";

interface SalvarRelatorioManualInput {
  jsonBruto: string;
}

interface SalvarRelatorioManualOutput {
  metadados: ReportMetadata;
  dadosExtraidos: RelatorioExtraido;
}

export class SaveManualReportUseCase {
  constructor(private readonly repository: ReportRepository) {}

  async executar(input: SalvarRelatorioManualInput): Promise<SalvarRelatorioManualOutput> {
    let dadosBrutos: unknown;
    try {
      dadosBrutos = JSON.parse(input.jsonBruto);
    } catch {
      throw new ValidationError(
        "JSON invalido. Verifique se voce copiou o JSON completo da resposta da IA.",
      );
    }

    const resultado = RelatorioExtraidoSchema.safeParse(dadosBrutos);

    if (!resultado.success) {
      const errosFormatados = resultado.error.issues
        .slice(0, 10)
        .map((issue) => `- ${issue.path.join(".")}: ${issue.message}`)
        .join("\n");
      throw new ValidationError(`Dados nao correspondem ao schema esperado:\n${errosFormatados}`);
    }

    const dadosExtraidos = resultado.data;
    const identificador = dadosExtraidos.metadados.mesReferencia;

    const caminhoArquivoExtraido = await this.repository.salvarDadosExtraidos(
      identificador,
      dadosExtraidos,
    );

    const metadados: ReportMetadata = {
      identificador,
      mesReferencia: dadosExtraidos.metadados.mesReferencia,
      nomeArquivoOriginal: `manual-${identificador}.json`,
      caminhoArquivoPdf: null,
      caminhoArquivoExtraido,
      caminhoArquivoInsights: null,
      dataUpload: new Date().toISOString(),
      statusExtracao: "concluido",
      origemDados: "importacao-manual",
      erroExtracao: null,
    };

    await this.repository.salvarMetadados(metadados);

    return { metadados, dadosExtraidos };
  }
}
