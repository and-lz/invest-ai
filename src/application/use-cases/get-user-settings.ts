import type { UserSettingsRepository } from "@/domain/interfaces/user-settings-repository";
import { UserSettingsResponseSchema } from "@/schemas/user-settings.schema";
import type { UserSettingsResponse } from "@/schemas/user-settings.schema";
import { DEFAULT_MODEL_TIER } from "@/lib/model-tiers";

export class GetUserSettingsUseCase {
  constructor(private readonly repository: UserSettingsRepository) {}

  async executar(userId: string): Promise<UserSettingsResponse> {
    const settings = await this.repository.getUserSettings(userId);

    if (!settings) {
      const now = new Date();
      return UserSettingsResponseSchema.parse({
        identificador: "",
        usuarioId: userId,
        geminiApiKeyConfigured: false,
        modelTier: DEFAULT_MODEL_TIER,
        criadaEm: now,
        atualizadaEm: now,
      });
    }

    return UserSettingsResponseSchema.parse({
      identificador: settings.identificador,
      usuarioId: settings.usuarioId,
      geminiApiKeyConfigured: !!settings.geminiApiKey,
      modelTier: settings.modelTier || DEFAULT_MODEL_TIER,
      criadaEm: settings.criadaEm,
      atualizadaEm: settings.atualizadaEm,
    });
  }
}
