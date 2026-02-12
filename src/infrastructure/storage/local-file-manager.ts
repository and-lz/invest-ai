import { promises as fs } from "fs";
import path from "path";
import { FileStorageError } from "@/domain/errors/app-errors";

export class LocalFileManager {
  constructor(private readonly diretorioBase: string) {}

  async salvarArquivo(caminhoRelativo: string, conteudo: Buffer | string): Promise<string> {
    const caminhoCompleto = path.resolve(this.diretorioBase, caminhoRelativo);
    const diretorio = path.dirname(caminhoCompleto);

    try {
      await fs.mkdir(diretorio, { recursive: true });
      await fs.writeFile(caminhoCompleto, conteudo);
      return caminhoCompleto;
    } catch (erro) {
      throw new FileStorageError(
        `Falha ao salvar arquivo em ${caminhoCompleto}: ${erro instanceof Error ? erro.message : String(erro)}`,
      );
    }
  }

  async salvarJson<T>(caminhoRelativo: string, dados: T): Promise<string> {
    const conteudo = JSON.stringify(dados, null, 2);
    return this.salvarArquivo(caminhoRelativo, conteudo);
  }

  async lerArquivo(caminhoRelativo: string): Promise<Buffer> {
    const caminhoCompleto = path.resolve(this.diretorioBase, caminhoRelativo);

    try {
      return await fs.readFile(caminhoCompleto);
    } catch (erro) {
      if ((erro as NodeJS.ErrnoException).code === "ENOENT") {
        throw new FileStorageError(`Arquivo nao encontrado: ${caminhoCompleto}`);
      }
      throw new FileStorageError(
        `Falha ao ler arquivo ${caminhoCompleto}: ${erro instanceof Error ? erro.message : String(erro)}`,
      );
    }
  }

  async lerJson<T>(caminhoRelativo: string): Promise<T> {
    const conteudo = await this.lerArquivo(caminhoRelativo);
    try {
      return JSON.parse(conteudo.toString("utf-8")) as T;
    } catch {
      throw new FileStorageError(`Falha ao parsear JSON de ${caminhoRelativo}`);
    }
  }

  async arquivoExiste(caminhoRelativo: string): Promise<boolean> {
    const caminhoCompleto = path.resolve(this.diretorioBase, caminhoRelativo);
    try {
      await fs.access(caminhoCompleto);
      return true;
    } catch {
      return false;
    }
  }

  async removerArquivo(caminhoRelativo: string): Promise<void> {
    const caminhoCompleto = path.resolve(this.diretorioBase, caminhoRelativo);
    try {
      await fs.unlink(caminhoCompleto);
    } catch (erro) {
      if ((erro as NodeJS.ErrnoException).code !== "ENOENT") {
        throw new FileStorageError(
          `Falha ao remover arquivo ${caminhoCompleto}: ${erro instanceof Error ? erro.message : String(erro)}`,
        );
      }
    }
  }

  async listarArquivos(caminhoRelativo: string, extensao?: string): Promise<string[]> {
    const caminhoCompleto = path.resolve(this.diretorioBase, caminhoRelativo);

    try {
      const arquivos = await fs.readdir(caminhoCompleto);
      if (extensao) {
        return arquivos.filter((arquivo) => arquivo.endsWith(extensao));
      }
      return arquivos;
    } catch (erro) {
      if ((erro as NodeJS.ErrnoException).code === "ENOENT") {
        return [];
      }
      throw new FileStorageError(
        `Falha ao listar arquivos em ${caminhoCompleto}: ${erro instanceof Error ? erro.message : String(erro)}`,
      );
    }
  }
}
