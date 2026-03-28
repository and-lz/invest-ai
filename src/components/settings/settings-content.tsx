"use client";

import { Settings } from "lucide-react";
import { ModelTierSelector } from "@/components/settings/model-tier-selector";
import { typography, icon, layout } from "@/lib/design-system";
import { cn } from "@/lib/utils";
import type { ClaudeModelTier } from "@/lib/model-tiers";

interface SettingsContentProps {
  initialClaudeTier: ClaudeModelTier;
}

export function SettingsContent({ initialClaudeTier }: SettingsContentProps) {
  return (
    <div className={cn(layout.pageSpacing, "max-w-2xl mx-auto py-6")}>
      <div className={cn(layout.pageHeader, "mb-6")}>
        <Settings className={cn(icon.pageTitle, "text-primary")} />
        <h1 className={typography.h1}>Configurações</h1>
      </div>

      <ModelTierSelector currentTier={initialClaudeTier} />
    </div>
  );
}
