import type { ReportRepository } from "@/domain/interfaces/report-repository";
import type { ReportMetadata } from "@/schemas/report-metadata.schema";
import type { RelatorioExtraido } from "@/schemas/report-extraction.schema";
import type { InsightsResponse } from "@/schemas/insights.schema";
import { ReportMetadataSchema } from "@/schemas/report-metadata.schema";
import { RelatorioExtraidoSchema } from "@/schemas/report-extraction.schema";
import { InsightsResponseSchema } from "@/schemas/insights.schema";
import { db } from "@/lib/db";
import { relatoriosMetadados, relatoriosExtraidos, relatoriosInsights } from "@/lib/schema";
import { eq, and, desc } from "drizzle-orm";
import type { PdfStorage } from "@/infrastructure/storage/pdf-storage";
import { ReportNotFoundError } from "@/domain/errors/app-errors";

export class DbReportRepository implements ReportRepository {
  constructor(
    private readonly usuarioId: string,
    private readonly pdfStorage: PdfStorage,
  ) {}

  async salvarPdf(identificador: string, pdfBuffer: Buffer): Promise<string> {
    return this.pdfStorage.salvarPdf(this.usuarioId, identificador, pdfBuffer);
  }

  async salvarDadosExtraidos(identificador: string, dados: RelatorioExtraido): Promise<string> {
    await db
      .insert(relatoriosExtraidos)
      .values({
        identificador,
        usuarioId: this.usuarioId,
        dados: dados as unknown as Record<string, unknown>,
        atualizadoEm: new Date(),
      })
      .onConflictDoUpdate({
        target: [relatoriosExtraidos.usuarioId, relatoriosExtraidos.identificador],
        set: {
          dados: dados as unknown as Record<string, unknown>,
          atualizadoEm: new Date(),
        },
      });
    return `db://${this.usuarioId}/extracted/${identificador}`;
  }

  async salvarMetadados(metadados: ReportMetadata): Promise<void> {
    await db
      .insert(relatoriosMetadados)
      .values({
        identificador: metadados.identificador,
        usuarioId: this.usuarioId,
        mesReferencia: metadados.mesReferencia,
        nomeArquivoOriginal: metadados.nomeArquivoOriginal,
        caminhoArquivoPdf: metadados.caminhoArquivoPdf,
        statusExtracao: metadados.statusExtracao,
        origemDados: metadados.origemDados,
        erroExtracao: metadados.erroExtracao,
        dataUpload: new Date(metadados.dataUpload),
      })
      .onConflictDoUpdate({
        target: [relatoriosMetadados.usuarioId, relatoriosMetadados.identificador],
        set: {
          mesReferencia: metadados.mesReferencia,
          nomeArquivoOriginal: metadados.nomeArquivoOriginal,
          caminhoArquivoPdf: metadados.caminhoArquivoPdf,
          statusExtracao: metadados.statusExtracao,
          origemDados: metadados.origemDados,
          erroExtracao: metadados.erroExtracao,
        },
      });
  }

  async salvarInsights(identificador: string, insights: InsightsResponse): Promise<void> {
    await db
      .insert(relatoriosInsights)
      .values({
        identificador,
        usuarioId: this.usuarioId,
        dados: insights as unknown as Record<string, unknown>,
        atualizadoEm: new Date(),
      })
      .onConflictDoUpdate({
        target: [relatoriosInsights.usuarioId, relatoriosInsights.identificador],
        set: {
          dados: insights as unknown as Record<string, unknown>,
          atualizadoEm: new Date(),
        },
      });
  }

  async obterMetadados(identificador: string): Promise<ReportMetadata | null> {
    const rows = await db
      .select()
      .from(relatoriosMetadados)
      .where(
        and(
          eq(relatoriosMetadados.usuarioId, this.usuarioId),
          eq(relatoriosMetadados.identificador, identificador),
        ),
      )
      .limit(1);

    if (rows.length === 0) return null;
    return this.mapearMetadados(rows[0]!);
  }

  async obterDadosExtraidos(identificador: string): Promise<RelatorioExtraido | null> {
    const rows = await db
      .select()
      .from(relatoriosExtraidos)
      .where(
        and(
          eq(relatoriosExtraidos.usuarioId, this.usuarioId),
          eq(relatoriosExtraidos.identificador, identificador),
        ),
      )
      .limit(1);

    if (rows.length === 0) return null;
    return RelatorioExtraidoSchema.parse(rows[0]!.dados);
  }

  async obterInsights(identificador: string): Promise<InsightsResponse | null> {
    const rows = await db
      .select()
      .from(relatoriosInsights)
      .where(
        and(
          eq(relatoriosInsights.usuarioId, this.usuarioId),
          eq(relatoriosInsights.identificador, identificador),
        ),
      )
      .limit(1);

    if (rows.length === 0) return null;
    return InsightsResponseSchema.parse(rows[0]!.dados);
  }

  async obterPdfComoBase64(identificador: string): Promise<string> {
    const metadados = await this.obterMetadados(identificador);
    if (!metadados) {
      throw new ReportNotFoundError(identificador);
    }
    return this.pdfStorage.obterPdfComoBase64(this.usuarioId, identificador);
  }

  async listarTodosMetadados(): Promise<ReportMetadata[]> {
    const rows = await db
      .select()
      .from(relatoriosMetadados)
      .where(eq(relatoriosMetadados.usuarioId, this.usuarioId))
      .orderBy(desc(relatoriosMetadados.mesReferencia));

    return rows.map((row) => this.mapearMetadados(row));
  }

  async removerRelatorio(identificador: string): Promise<void> {
    await Promise.all([
      db
        .delete(relatoriosMetadados)
        .where(
          and(
            eq(relatoriosMetadados.usuarioId, this.usuarioId),
            eq(relatoriosMetadados.identificador, identificador),
          ),
        ),
      db
        .delete(relatoriosExtraidos)
        .where(
          and(
            eq(relatoriosExtraidos.usuarioId, this.usuarioId),
            eq(relatoriosExtraidos.identificador, identificador),
          ),
        ),
      db
        .delete(relatoriosInsights)
        .where(
          and(
            eq(relatoriosInsights.usuarioId, this.usuarioId),
            eq(relatoriosInsights.identificador, identificador),
          ),
        ),
      this.pdfStorage.removerPdf(this.usuarioId, identificador).catch(() => {
        // Remoção de PDF é best-effort — não falhar toda a operação
        console.warn(`[DbReportRepository] Falha ao remover PDF para ${identificador}`);
      }),
    ]);
  }

  private mapearMetadados(row: typeof relatoriosMetadados.$inferSelect): ReportMetadata {
    return ReportMetadataSchema.parse({
      identificador: row.identificador,
      mesReferencia: row.mesReferencia,
      nomeArquivoOriginal: row.nomeArquivoOriginal,
      caminhoArquivoPdf: row.caminhoArquivoPdf,
      // Campos legados de caminho de arquivo — sintetizados para manter compatibilidade com o schema
      caminhoArquivoExtraido: `db://${this.usuarioId}/extracted/${row.identificador}`,
      caminhoArquivoInsights: row.caminhoArquivoPdf
        ? `db://${this.usuarioId}/insights/${row.identificador}`
        : null,
      dataUpload: row.dataUpload.toISOString(),
      statusExtracao: row.statusExtracao,
      origemDados: row.origemDados,
      erroExtracao: row.erroExtracao,
    });
  }
}
