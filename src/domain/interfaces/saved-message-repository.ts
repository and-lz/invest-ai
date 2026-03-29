import type { SavedMessage, CreateSavedMessage } from "@/schemas/saved-message.schema";

/**
 * Repository for bookmarked/starred chat messages.
 * Messages survive conversation deletion (content is snapshotted).
 */
export interface SavedMessageRepository {
  /**
   * Save (bookmark) a message. Idempotent — duplicate saves are ignored.
   */
  save(data: CreateSavedMessage): Promise<SavedMessage>;

  /**
   * Remove a saved message by its original message ID.
   */
  remove(usuarioId: string, mensagemId: string): Promise<void>;

  /**
   * List all saved messages for a user, ordered by salvadaEm DESC.
   */
  list(usuarioId: string): Promise<SavedMessage[]>;

  /**
   * Batch check which message IDs are saved for a user.
   * Returns a Set of saved message IDs.
   */
  isSaved(usuarioId: string, mensagemIds: string[]): Promise<Set<string>>;
}
