import fs from "fs/promises";
import path from "path";
import type { PdfStorage } from "./pdf-storage";
import { FileStorageError } from "@/domain/errors/app-errors";

export class LocalPdfStorage implements PdfStorage {
  constructor(private readonly diretorioBase: string) {}

  private getFullPath(usuarioId: string, identificador: string): string {
    return path.join(this.diretorioBase, "reports", usuarioId, `${identificador}.pdf`);
  }

  async salvarPdf(usuarioId: string, identificador: string, pdfBuffer: Buffer): Promise<string> {
    const caminhoCompleto = this.getFullPath(usuarioId, identificador);
    try {
      await fs.mkdir(path.dirname(caminhoCompleto), { recursive: true });
      await fs.writeFile(caminhoCompleto, pdfBuffer);
      return caminhoCompleto;
    } catch (erro) {
      throw new FileStorageError(
        `Falha ao salvar PDF localmente: ${erro instanceof Error ? erro.message : String(erro)}`,
      );
    }
  }

  async obterPdfComoBase64(usuarioId: string, identificador: string): Promise<string> {
    const caminhoCompleto = this.getFullPath(usuarioId, identificador);
    try {
      const buffer = await fs.readFile(caminhoCompleto);
      return buffer.toString("base64");
    } catch (erro) {
      throw new FileStorageError(
        `Falha ao ler PDF local: ${erro instanceof Error ? erro.message : String(erro)}`,
      );
    }
  }

  async removerPdf(usuarioId: string, identificador: string): Promise<void> {
    const caminhoCompleto = this.getFullPath(usuarioId, identificador);
    try {
      await fs.unlink(caminhoCompleto);
    } catch (erro) {
      if ((erro as NodeJS.ErrnoException).code !== "ENOENT") {
        throw new FileStorageError(
          `Falha ao remover PDF local: ${erro instanceof Error ? erro.message : String(erro)}`,
        );
      }
    }
  }
}
