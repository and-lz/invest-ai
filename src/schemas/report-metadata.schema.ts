import { z } from "zod/v4";

// ============================================================
// Zod schema para metadados do relatorio armazenado.
// ============================================================

export const StatusExtracaoEnum = z.enum(["pendente", "processando", "concluido", "erro"]);

export const ReportMetadataSchema = z.object({
  identificador: z.string().describe("Formato YYYY-MM como identificador unico"),
  mesReferencia: z.string().describe("Formato: YYYY-MM"),
  nomeArquivoOriginal: z.string(),
  caminhoArquivoPdf: z.string(),
  caminhoArquivoExtraido: z.string(),
  caminhoArquivoInsights: z.string().nullable(),
  dataUpload: z.string().describe("ISO 8601 datetime"),
  statusExtracao: StatusExtracaoEnum,
  erroExtracao: z.string().nullable(),
});

// ---- Tipos inferidos ----

export type ReportMetadata = z.infer<typeof ReportMetadataSchema>;
export type StatusExtracao = z.infer<typeof StatusExtracaoEnum>;
