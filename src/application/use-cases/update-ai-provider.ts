import type { UserSettingsRepository } from "@/domain/interfaces/user-settings-repository";
import { AiProviderSchema, ClaudeModelTierSchema } from "@/schemas/user-settings.schema";

export class UpdateAiProviderUseCase {
  constructor(private readonly repository: UserSettingsRepository) {}

  async executar(userId: string, provider: string, claudeModelTier: string): Promise<void> {
    const validatedProvider = AiProviderSchema.parse(provider);
    const validatedTier = ClaudeModelTierSchema.parse(claudeModelTier);
    await this.repository.updateAiProvider(userId, validatedProvider, validatedTier);
  }
}
