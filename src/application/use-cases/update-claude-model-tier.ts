import type { UserSettingsRepository } from "@/domain/interfaces/user-settings-repository";
import { ClaudeModelTierSchema } from "@/schemas/user-settings.schema";

export class UpdateClaudeModelTierUseCase {
  constructor(private readonly repository: UserSettingsRepository) {}

  async executar(userId: string, tier: string): Promise<void> {
    const validated = ClaudeModelTierSchema.parse(tier);
    await this.repository.updateClaudeModelTier(userId, validated);
  }
}
