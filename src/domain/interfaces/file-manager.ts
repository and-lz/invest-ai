export interface FileManager {
  salvarArquivo(caminhoRelativo: string, conteudo: Buffer | string): Promise<string>;
  salvarJson<T>(caminhoRelativo: string, dados: T): Promise<string>;
  lerArquivo(caminhoRelativo: string): Promise<Buffer>;
  lerJson<T>(caminhoRelativo: string): Promise<T>;
  arquivoExiste(caminhoRelativo: string): Promise<boolean>;
  removerArquivo(caminhoRelativo: string): Promise<void>;
  listarArquivos(caminhoRelativo: string, extensao?: string): Promise<string[]>;
}
