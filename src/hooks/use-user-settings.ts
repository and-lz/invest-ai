import useSWR from "swr";
import type { ClaudeModelTier } from "@/lib/model-tiers";

interface SettingsApiResponse {
  claudeModelTier: ClaudeModelTier;
}

export function useUserSettings() {
  const { data, error, isLoading } = useSWR<SettingsApiResponse>("/api/settings");

  return {
    claudeModelTier: data?.claudeModelTier,
    estaCarregando: isLoading,
    erro: error as Error | undefined,
  };
}
