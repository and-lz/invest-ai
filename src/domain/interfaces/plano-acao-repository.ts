import type {
  ItemPlanoAcao,
  CriarItemPlano,
  EnriquecimentoAi,
  StatusItemPlano,
} from "@/schemas/plano-acao.schema";

/**
 * Abstract repository for action plan items.
 * Each item is a takeaway conclusion enriched by AI
 * with contextual investment recommendations.
 */
export interface PlanoAcaoRepository {
  /**
   * Saves a new action plan item with AI enrichment data.
   * Auto-generates: UUID, timestamps.
   */
  salvarItem(
    usuarioId: string,
    item: CriarItemPlano,
    enriquecimento: EnriquecimentoAi,
  ): Promise<ItemPlanoAcao>;

  /**
   * Lists all action plan items for a user.
   * Ordered by criadoEm DESC (most recent first).
   */
  listarItensDoUsuario(usuarioId: string): Promise<ItemPlanoAcao[]>;

  /**
   * Updates the status of an action plan item.
   * Sets concluidoEm when status = "concluida".
   */
  atualizarStatus(
    usuarioId: string,
    identificador: string,
    status: StatusItemPlano,
  ): Promise<void>;

  /**
   * Permanently removes an action plan item.
   */
  removerItem(usuarioId: string, identificador: string): Promise<void>;

  /**
   * Checks if an item with the same textoOriginal already exists
   * for the user (case-insensitive). Used to prevent duplicates.
   */
  existeComTexto(usuarioId: string, textoOriginal: string): Promise<boolean>;
}
