import { auth } from "@/auth";
import { obterGetUserSettingsUseCase } from "@/lib/container";
import { DEFAULT_MODEL_TIER, DEFAULT_AI_PROVIDER, DEFAULT_CLAUDE_MODEL_TIER } from "@/lib/model-tiers";
import type { ModelTier, AiProvider, ClaudeModelTier } from "@/lib/model-tiers";
import { SettingsContent } from "@/components/settings/settings-content";

export default async function SettingsPage() {
  let isKeyConfigured = false;
  let modelTier: ModelTier = DEFAULT_MODEL_TIER;
  let aiProvider: AiProvider = DEFAULT_AI_PROVIDER;
  let claudeTier: ClaudeModelTier = DEFAULT_CLAUDE_MODEL_TIER;

  try {
    const session = await auth();
    if (session?.user?.userId) {
      const useCase = obterGetUserSettingsUseCase();
      const settings = await useCase.executar(session.user.userId);
      isKeyConfigured = settings.geminiApiKeyConfigured;
      modelTier = (settings.modelTier as ModelTier) || DEFAULT_MODEL_TIER;
      aiProvider = (settings.aiProvider as AiProvider) || DEFAULT_AI_PROVIDER;
      claudeTier = (settings.claudeModelTier as ClaudeModelTier) || DEFAULT_CLAUDE_MODEL_TIER;
    }
  } catch {
    // Silently fail — page still works with defaults
  }

  return (
    <SettingsContent
      initialKeyConfigured={isKeyConfigured}
      initialModelTier={modelTier}
      initialAiProvider={aiProvider}
      initialClaudeTier={claudeTier}
    />
  );
}
