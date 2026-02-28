/**
 * Interface para persistencia de configuracoes de usuario
 */
export interface UserSettingsRepository {
  /**
   * Obtem as configuracoes do usuario
   * Retorna null se usuario nao tem configuracoes ainda
   */
  getUserSettings(userId: string): Promise<{
    identificador: string;
    usuarioId: string;
    geminiApiKey?: string;
    criadaEm: Date;
    atualizadaEm: Date;
  } | null>;

  /**
   * Atualiza a chave de API Gemini do usuario
   * Cria configuracoes se nao existirem
   */
  updateGeminiApiKey(userId: string, geminiApiKey: string): Promise<void>;

  /**
   * Deleta a chave de API Gemini do usuario
   */
  deleteGeminiApiKey(userId: string): Promise<void>;
}
