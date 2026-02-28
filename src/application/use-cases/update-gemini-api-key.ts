import type { UserSettingsRepository } from "@/domain/interfaces/user-settings-repository";
import { UpdateGeminiApiKeySchema } from "@/schemas/user-settings.schema";

export class UpdateGeminiApiKeyUseCase {
  constructor(private readonly repository: UserSettingsRepository) {}

  async executar(userId: string, geminiApiKey: string): Promise<void> {
    // Valida o formato da chave
    const validated = UpdateGeminiApiKeySchema.parse({ geminiApiKey });

    // Atualiza no repositorio
    await this.repository.updateGeminiApiKey(userId, validated.geminiApiKey);
  }
}
