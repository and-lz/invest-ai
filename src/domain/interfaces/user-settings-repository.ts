/**
 * Interface for user settings persistence.
 */
export interface UserSettingsRepository {
  /**
   * Returns user settings, or null if none exist yet.
   */
  getUserSettings(userId: string): Promise<{
    identificador: string;
    usuarioId: string;
    claudeModelTier?: string;
    criadaEm: Date;
    atualizadaEm: Date;
  } | null>;

  /**
   * Updates the Claude model tier preference.
   * Creates settings row if it doesn't exist yet.
   */
  updateClaudeModelTier(userId: string, tier: string): Promise<void>;
}
