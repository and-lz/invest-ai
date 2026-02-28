"use client";

import { useEffect, useState } from "react";
import { Settings } from "lucide-react";
import { GeminiApiKeyForm } from "@/components/settings/gemini-api-key-form";
import { ApiKeyInfo } from "@/components/settings/api-key-info";
import { ModelTierSelector } from "@/components/settings/model-tier-selector";
import { typography, icon, layout } from "@/lib/design-system";
import { cn } from "@/lib/utils";
import { DEFAULT_MODEL_TIER } from "@/lib/model-tiers";
import type { ModelTier } from "@/lib/model-tiers";

export default function SettingsPage() {
  const [isKeyConfigured, setIsKeyConfigured] = useState(false);
  const [modelTier, setModelTier] = useState<ModelTier>(DEFAULT_MODEL_TIER);

  useEffect(() => {
    async function loadSettings() {
      try {
        const response = await fetch("/api/settings");
        if (!response.ok) return;
        const data = await response.json();
        setIsKeyConfigured(data.geminiApiKeyConfigured);
        if (data.modelTier) {
          setModelTier(data.modelTier);
        }
      } catch {
        // Silently fail — page still works without loading status
      }
    }

    loadSettings();
  }, []);

  function handleApiKeySuccess() {
    setIsKeyConfigured(true);
  }

  return (
    <div className={cn(layout.pageSpacing, "max-w-2xl mx-auto py-6")}>
      <div className={cn(layout.pageHeader, "mb-6")}>
        <Settings className={cn(icon.pageTitle, "text-primary")} />
        <h1 className={typography.h1}>Configurações</h1>
      </div>

      <div className={cn(layout.sectionSpacing)}>
        <GeminiApiKeyForm onSuccess={handleApiKeySuccess} isKeyConfigured={isKeyConfigured} />
        <ModelTierSelector currentTier={modelTier} onTierChange={setModelTier} />
        <ApiKeyInfo />
      </div>
    </div>
  );
}
