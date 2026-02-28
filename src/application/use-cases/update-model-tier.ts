import type { UserSettingsRepository } from "@/domain/interfaces/user-settings-repository";
import { ModelTierSchema } from "@/schemas/user-settings.schema";

export class UpdateModelTierUseCase {
  constructor(private readonly repository: UserSettingsRepository) {}

  async executar(userId: string, modelTier: string): Promise<void> {
    const validated = ModelTierSchema.parse(modelTier);
    await this.repository.updateModelTier(userId, validated);
  }
}
