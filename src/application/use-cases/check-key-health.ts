import type { UserSettingsRepository } from "@/domain/interfaces/user-settings-repository";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { isQuotaExhaustedError } from "@/lib/classify-ai-error";
import { resolveModelId } from "@/lib/model-tiers";
import type { KeyHealthResponse } from "@/schemas/user-settings.schema";

export class CheckKeyHealthUseCase {
  constructor(private readonly repository: UserSettingsRepository) {}

  async execute(userId: string): Promise<KeyHealthResponse> {
    const settings = await this.repository.getUserSettings(userId);

    if (!settings?.geminiApiKey) {
      return { status: "not_configured", message: "Nenhuma chave de API configurada." };
    }

    const modelId = resolveModelId(settings.modelTier);

    try {
      const client = new GoogleGenerativeAI(settings.geminiApiKey);
      const model = client.getGenerativeModel({ model: modelId });
      await model.generateContent("test");

      return { status: "healthy", message: "Sua chave de API está funcionando." };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erro desconhecido";

      if (message.includes("401") || message.includes("Invalid API Key") || message.includes("authentication")) {
        return { status: "invalid", message: "Sua chave de API é inválida ou foi revogada." };
      }

      if (isQuotaExhaustedError(message)) {
        return { status: "quota_exhausted", message: "Sua chave de API está sem créditos." };
      }

      return { status: "error", message: `Não foi possível verificar a chave: ${message}` };
    }
  }
}
