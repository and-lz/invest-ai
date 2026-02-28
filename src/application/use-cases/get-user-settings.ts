import type { UserSettingsRepository } from "@/domain/interfaces/user-settings-repository";
import { UserSettingsResponseSchema } from "@/schemas/user-settings.schema";
import type { UserSettingsResponse } from "@/schemas/user-settings.schema";

export class GetUserSettingsUseCase {
  constructor(private readonly repository: UserSettingsRepository) {}

  async executar(userId: string): Promise<UserSettingsResponse> {
    const settings = await this.repository.getUserSettings(userId);

    // Se nao existem configuracoes, retorna valores padrao
    if (!settings) {
      const now = new Date();
      return UserSettingsResponseSchema.parse({
        identificador: "",
        usuarioId: userId,
        geminiApiKeyConfigured: false,
        criadaEm: now,
        atualizadaEm: now,
      });
    }

    return UserSettingsResponseSchema.parse({
      identificador: settings.identificador,
      usuarioId: settings.usuarioId,
      geminiApiKeyConfigured: !!settings.geminiApiKey,
      criadaEm: settings.criadaEm,
      atualizadaEm: settings.atualizadaEm,
    });
  }
}
