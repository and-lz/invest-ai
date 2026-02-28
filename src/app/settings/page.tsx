import { auth } from "@/auth";
import { obterGetUserSettingsUseCase } from "@/lib/container";
import { DEFAULT_MODEL_TIER } from "@/lib/model-tiers";
import type { ModelTier } from "@/lib/model-tiers";
import { SettingsContent } from "@/components/settings/settings-content";

export default async function SettingsPage() {
  let isKeyConfigured = false;
  let modelTier: ModelTier = DEFAULT_MODEL_TIER;

  try {
    const session = await auth();
    if (session?.user?.userId) {
      const useCase = obterGetUserSettingsUseCase();
      const settings = await useCase.executar(session.user.userId);
      isKeyConfigured = settings.geminiApiKeyConfigured;
      modelTier = (settings.modelTier as ModelTier) || DEFAULT_MODEL_TIER;
    }
  } catch {
    // Silently fail — page still works with defaults
  }

  return (
    <SettingsContent
      initialKeyConfigured={isKeyConfigured}
      initialModelTier={modelTier}
    />
  );
}
