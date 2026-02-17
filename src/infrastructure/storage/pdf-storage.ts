// ============================================================
// Interface para armazenamento de arquivos PDF binários.
// Dados estruturados (JSON) migram para PostgreSQL via Drizzle,
// mas PDFs permanecem em armazenamento de arquivos (Blob ou filesystem).
// ============================================================

export interface PdfStorage {
  salvarPdf(usuarioId: string, identificador: string, pdfBuffer: Buffer): Promise<string>;
  obterPdfComoBase64(usuarioId: string, identificador: string): Promise<string>;
  removerPdf(usuarioId: string, identificador: string): Promise<void>;
}
