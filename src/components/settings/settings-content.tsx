"use client";

import { useCallback, useEffect, useState } from "react";
import { Settings } from "lucide-react";
import { GeminiApiKeyForm } from "@/components/settings/gemini-api-key-form";
import { ApiKeyInfo } from "@/components/settings/api-key-info";
import { ModelTierSelector } from "@/components/settings/model-tier-selector";
import { typography, icon, layout } from "@/lib/design-system";
import { cn } from "@/lib/utils";
import type { ModelTier } from "@/lib/model-tiers";
import type { KeyHealthStatus } from "@/schemas/user-settings.schema";

interface SettingsContentProps {
  initialKeyConfigured: boolean;
  initialModelTier: ModelTier;
}

export function SettingsContent({ initialKeyConfigured, initialModelTier }: SettingsContentProps) {
  const [isKeyConfigured, setIsKeyConfigured] = useState(initialKeyConfigured);
  const [modelTier, setModelTier] = useState<ModelTier>(initialModelTier);
  const [keyHealth, setKeyHealth] = useState<KeyHealthStatus | null>(null);
  const [isCheckingHealth, setIsCheckingHealth] = useState(initialKeyConfigured);

  const checkKeyHealth = useCallback(async () => {
    setIsCheckingHealth(true);
    try {
      const response = await fetch("/api/settings/check-key-health");
      if (!response.ok) return;
      const data = await response.json();
      setKeyHealth(data.status);
    } catch {
      // Silently fail
    } finally {
      setIsCheckingHealth(false);
    }
  }, []);

  useEffect(() => {
    if (initialKeyConfigured) {
      checkKeyHealth();
    }
  }, [initialKeyConfigured, checkKeyHealth]);

  function handleApiKeySuccess() {
    setIsKeyConfigured(true);
    checkKeyHealth();
  }

  return (
    <div className={cn(layout.pageSpacing, "max-w-2xl mx-auto py-6")}>
      <div className={cn(layout.pageHeader, "mb-6")}>
        <Settings className={cn(icon.pageTitle, "text-primary")} />
        <h1 className={typography.h1}>Configurações</h1>
      </div>

      <div className={cn(layout.sectionSpacing)}>
        <GeminiApiKeyForm
          onSuccess={handleApiKeySuccess}
          isKeyConfigured={isKeyConfigured}
          keyHealth={keyHealth}
          isCheckingHealth={isCheckingHealth}
          onRefreshHealth={checkKeyHealth}
        />
        <ModelTierSelector currentTier={modelTier} onTierChange={setModelTier} />
        <ApiKeyInfo />
      </div>
    </div>
  );
}
