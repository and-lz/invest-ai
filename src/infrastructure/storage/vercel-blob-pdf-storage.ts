import { put, del, head } from "@vercel/blob";
import { unstable_noStore as noStore } from "next/cache";
import type { PdfStorage } from "./pdf-storage";
import { FileStorageError } from "@/domain/errors/app-errors";

export class VercelBlobPdfStorage implements PdfStorage {
  private getFullPath(usuarioId: string, identificador: string): string {
    return `${usuarioId}/reports/${identificador}.pdf`;
  }

  async salvarPdf(usuarioId: string, identificador: string, pdfBuffer: Buffer): Promise<string> {
    noStore();
    try {
      const blob = await put(this.getFullPath(usuarioId, identificador), pdfBuffer, {
        access: "public",
        addRandomSuffix: false,
        cacheControlMaxAge: 0,
        contentType: "application/pdf",
      });
      return blob.url;
    } catch (erro) {
      throw new FileStorageError(
        `Falha ao salvar PDF no Blob: ${erro instanceof Error ? erro.message : String(erro)}`,
      );
    }
  }

  async obterPdfComoBase64(usuarioId: string, identificador: string): Promise<string> {
    noStore();
    try {
      const metadata = await head(this.getFullPath(usuarioId, identificador));
      if (!metadata.url) throw new FileStorageError("PDF nao encontrado no Blob");

      const urlSemCache = `${metadata.url}?t=${Date.now()}`;
      const response = await fetch(urlSemCache, { cache: "no-store" });
      const buffer = Buffer.from(await response.arrayBuffer());
      return buffer.toString("base64");
    } catch (erro) {
      throw new FileStorageError(
        `Falha ao ler PDF do Blob: ${erro instanceof Error ? erro.message : String(erro)}`,
      );
    }
  }

  async removerPdf(usuarioId: string, identificador: string): Promise<void> {
    noStore();
    try {
      await del(this.getFullPath(usuarioId, identificador));
    } catch (erro) {
      if (!(erro as Error).message?.includes("not found")) {
        throw new FileStorageError(
          `Falha ao remover PDF do Blob: ${erro instanceof Error ? erro.message : String(erro)}`,
        );
      }
    }
  }
}
