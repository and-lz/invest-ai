import { auth } from "@/auth";
import { obterGetUserSettingsUseCase } from "@/lib/container";
import { DEFAULT_CLAUDE_MODEL_TIER } from "@/lib/model-tiers";
import type { ClaudeModelTier } from "@/lib/model-tiers";
import { SettingsContent } from "@/components/settings/settings-content";

export default async function SettingsPage() {
  let claudeTier: ClaudeModelTier = DEFAULT_CLAUDE_MODEL_TIER;

  try {
    const session = await auth();
    if (session?.user?.userId) {
      const useCase = obterGetUserSettingsUseCase();
      const settings = await useCase.executar(session.user.userId);
      claudeTier = settings.claudeModelTier;
    }
  } catch {
    // Silently fail — page still works with defaults
  }

  return <SettingsContent initialClaudeTier={claudeTier} />;
}
