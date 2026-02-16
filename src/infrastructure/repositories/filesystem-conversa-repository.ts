import type { ConversaRepository } from "@/domain/interfaces/conversa-repository";
import type { Conversa, CriarConversa, AtualizarConversa } from "@/schemas/conversa.schema";
import { IndiceConversasSchema } from "@/schemas/conversa.schema";
import type { FileManager } from "@/domain/interfaces/file-manager";
import { FileStorageError } from "@/domain/errors/app-errors";
import type { IndiceConversas } from "@/schemas/conversa.schema";

const SUBDIRETORIO_CONVERSAS = "conversations";
const NOME_ARQUIVO_INDICE = "index.json";
const LIMITE_CONVERSAS_POR_USUARIO = 100; // FIFO queue

export class FilesystemConversaRepository implements ConversaRepository {
  constructor(private readonly fileManager: FileManager) {}

  async salvarConversa(criarConversa: CriarConversa): Promise<Conversa> {
    const conversasExistentes = await this.listarConversasDoUsuario(criarConversa.usuarioId);

    const novaConversa: Conversa = {
      ...criarConversa,
      identificador: crypto.randomUUID(),
      criadaEm: new Date().toISOString(),
      atualizadaEm: new Date().toISOString(),
    };

    // FIFO: Remove conversas mais antigas se exceder limite
    const conversasAtualizadas = [novaConversa, ...conversasExistentes].slice(
      0,
      LIMITE_CONVERSAS_POR_USUARIO,
    );

    await this.salvarIndice(criarConversa.usuarioId, { conversas: conversasAtualizadas });
    return novaConversa;
  }

  async obterConversaPorUsuario(
    usuarioId: string,
    identificador: string,
  ): Promise<Conversa | null> {
    const conversas = await this.listarConversasDoUsuario(usuarioId);
    return conversas.find((conversa) => conversa.identificador === identificador) ?? null;
  }

  async listarConversasDoUsuario(usuarioId: string): Promise<Conversa[]> {
    const caminhoRelativo = `${SUBDIRETORIO_CONVERSAS}/${usuarioId}/${NOME_ARQUIVO_INDICE}`;
    const existe = await this.fileManager.arquivoExiste(caminhoRelativo);

    if (!existe) return [];

    try {
      const dadosBrutos = await this.fileManager.lerJson<unknown>(caminhoRelativo);
      const resultado = IndiceConversasSchema.safeParse(dadosBrutos);

      if (!resultado.success) {
        console.warn(`[Conversas] JSON invalido em ${caminhoRelativo}`, resultado.error);
        return [];
      }

      // Ordena por atualizadaEm DESC (mais recente primeiro)
      return resultado.data.conversas.sort(
        (conversa1, conversa2) =>
          new Date(conversa2.atualizadaEm).getTime() - new Date(conversa1.atualizadaEm).getTime(),
      );
    } catch (erro) {
      console.error(`[Conversas] Erro ao ler indice de ${usuarioId}:`, erro);
      return [];
    }
  }

  async atualizarConversa(
    usuarioId: string,
    identificador: string,
    atualizacao: AtualizarConversa,
  ): Promise<void> {
    const conversas = await this.listarConversasDoUsuario(usuarioId);
    const indiceConversa = conversas.findIndex(
      (conversa) => conversa.identificador === identificador,
    );

    if (indiceConversa === -1) {
      throw new FileStorageError(`Conversa nao encontrada: ${identificador}`);
    }

    const conversasAtualizadas = [...conversas];
    conversasAtualizadas[indiceConversa] = {
      ...conversasAtualizadas[indiceConversa]!,
      ...atualizacao,
      atualizadaEm: new Date().toISOString(),
    };

    await this.salvarIndice(usuarioId, { conversas: conversasAtualizadas });
  }

  async removerConversa(usuarioId: string, identificador: string): Promise<void> {
    const conversas = await this.listarConversasDoUsuario(usuarioId);
    const conversasAtualizadas = conversas.filter(
      (conversa) => conversa.identificador !== identificador,
    );
    await this.salvarIndice(usuarioId, { conversas: conversasAtualizadas });
  }

  private async salvarIndice(usuarioId: string, indice: IndiceConversas): Promise<void> {
    const caminhoRelativo = `${SUBDIRETORIO_CONVERSAS}/${usuarioId}/${NOME_ARQUIVO_INDICE}`;
    await this.fileManager.salvarJson(caminhoRelativo, indice);
  }
}
