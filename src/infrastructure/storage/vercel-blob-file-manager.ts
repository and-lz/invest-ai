import { put, del, list, head } from "@vercel/blob";
import type { FileManager } from "@/domain/interfaces/file-manager";
import { FileStorageError } from "@/domain/errors/app-errors";

export class VercelBlobFileManager implements FileManager {
  constructor(private readonly userIdPrefix: string) {}

  private getFullPath(caminhoRelativo: string): string {
    return `${this.userIdPrefix}/${caminhoRelativo}`;
  }

  async salvarArquivo(caminhoRelativo: string, conteudo: Buffer | string): Promise<string> {
    try {
      const blob = await put(this.getFullPath(caminhoRelativo), conteudo, {
        access: "public",
        addRandomSuffix: false,
        cacheControlMaxAge: 0,
      });
      return blob.url;
    } catch (erro) {
      throw new FileStorageError(
        `Falha ao salvar em Blob: ${erro instanceof Error ? erro.message : String(erro)}`,
      );
    }
  }

  async salvarJson<T>(caminhoRelativo: string, dados: T): Promise<string> {
    return this.salvarArquivo(caminhoRelativo, JSON.stringify(dados, null, 2));
  }

  async lerArquivo(caminhoRelativo: string): Promise<Buffer> {
    try {
      const metadata = await head(this.getFullPath(caminhoRelativo));
      if (!metadata.url) throw new FileStorageError("Arquivo nao encontrado");

      // Cache-buster para ignorar CDN cache + no-store para ignorar Next.js Data Cache
      const urlSemCache = `${metadata.url}?t=${Date.now()}`;
      const response = await fetch(urlSemCache, { cache: "no-store" });
      return Buffer.from(await response.arrayBuffer());
    } catch (erro) {
      throw new FileStorageError(
        `Falha ao ler do Blob: ${erro instanceof Error ? erro.message : String(erro)}`,
      );
    }
  }

  async lerJson<T>(caminhoRelativo: string): Promise<T> {
    const buffer = await this.lerArquivo(caminhoRelativo);
    return JSON.parse(buffer.toString("utf-8")) as T;
  }

  async arquivoExiste(caminhoRelativo: string): Promise<boolean> {
    try {
      await head(this.getFullPath(caminhoRelativo));
      return true;
    } catch {
      return false;
    }
  }

  async removerArquivo(caminhoRelativo: string): Promise<void> {
    try {
      await del(this.getFullPath(caminhoRelativo));
    } catch (erro) {
      if (!(erro as Error).message?.includes("not found")) {
        throw new FileStorageError(
          `Falha ao remover do Blob: ${erro instanceof Error ? erro.message : String(erro)}`,
        );
      }
    }
  }

  async listarArquivos(caminhoRelativo: string, extensao?: string): Promise<string[]> {
    const fullPath = this.getFullPath(caminhoRelativo);
    const { blobs } = await list({ prefix: fullPath });

    let arquivos = blobs.map((blob) => blob.pathname.replace(`${fullPath}/`, ""));

    if (extensao) {
      arquivos = arquivos.filter((arquivo) => arquivo.endsWith(extensao));
    }

    return arquivos;
  }
}
