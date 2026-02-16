import type { Conversa, CriarConversa, AtualizarConversa } from "@/schemas/conversa.schema";

/**
 * Interface abstrata para repository de conversas do chat.
 *
 * Implementacoes:
 * - FilesystemConversaRepository (dev)
 * - VercelBlobConversaRepository (prod)
 */
export interface ConversaRepository {
  /**
   * Salva uma nova conversa para o usuario.
   * Gera automaticamente: UUID, timestamps.
   * Aplica FIFO de 100 conversas por usuario.
   */
  salvarConversa(conversa: CriarConversa): Promise<Conversa>;

  /**
   * Obtem uma conversa especifica por ID.
   * Retorna null se nao encontrada.
   */
  obterConversaPorUsuario(usuarioId: string, identificador: string): Promise<Conversa | null>;

  /**
   * Lista todas as conversas de um usuario.
   * Ordenadas por atualizadaEm DESC (mais recente primeiro).
   */
  listarConversasDoUsuario(usuarioId: string): Promise<Conversa[]>;

  /**
   * Atualiza titulo e/ou mensagens de uma conversa.
   * Atualiza automaticamente o campo atualizadaEm.
   */
  atualizarConversa(
    usuarioId: string,
    identificador: string,
    atualizacao: AtualizarConversa,
  ): Promise<void>;

  /**
   * Remove uma conversa permanentemente.
   */
  removerConversa(usuarioId: string, identificador: string): Promise<void>;
}
