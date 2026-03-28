"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Cpu, Loader2, Zap, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { typography, icon } from "@/lib/design-system";
import { CLAUDE_MODEL_TIER_OPTIONS } from "@/lib/model-tiers";
import type { ClaudeModelTier } from "@/lib/model-tiers";

const TIER_ICONS: Record<ClaudeModelTier, typeof Zap> = {
  haiku: Zap,
  sonnet: Cpu,
  opus: Sparkles,
};

interface ModelTierSelectorProps {
  currentTier: ClaudeModelTier;
}

export function ModelTierSelector({ currentTier }: ModelTierSelectorProps) {
  const [selectedTier, setSelectedTier] = useState<ClaudeModelTier>(currentTier);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setSelectedTier(currentTier);
  }, [currentTier]);

  async function handleSelect(tier: ClaudeModelTier) {
    if (tier === selectedTier || isSaving) return;

    const previous = selectedTier;
    setSelectedTier(tier);
    setIsSaving(true);

    try {
      const response = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ claudeModelTier: tier }),
      });

      if (!response.ok) {
        setSelectedTier(previous);
        toast.error("Falha ao salvar preferência de modelo");
        return;
      }

      toast.success("Modelo atualizado");
    } catch {
      setSelectedTier(previous);
      toast.error("Falha ao salvar preferência de modelo");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Modelo de IA</CardTitle>
        <CardDescription>
          Escolha o modelo Claude usado pela Fortuna em todas as funcionalidades.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3 sm:grid-cols-3">
          {CLAUDE_MODEL_TIER_OPTIONS.map((option) => {
            const Icon = TIER_ICONS[option.value];
            const isSelected = selectedTier === option.value;

            return (
              <button
                key={option.value}
                type="button"
                disabled={isSaving}
                onClick={() => handleSelect(option.value)}
                className={cn(
                  "relative flex flex-col items-start gap-1.5 rounded-lg border p-4 text-left transition-all",
                  isSelected
                    ? "border-primary bg-primary/5 ring-1 ring-primary"
                    : "border-border hover:border-primary/30 hover:bg-muted/50",
                  isSaving && "opacity-60 cursor-not-allowed",
                )}
              >
                <div className="flex w-full items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Icon
                      className={cn(
                        icon.button,
                        isSelected ? "text-primary" : "text-muted-foreground",
                      )}
                    />
                    <span className={cn(typography.label, isSelected && "text-primary")}>
                      {option.label}
                    </span>
                  </div>
                  {isSaving && isSelected && (
                    <Loader2 className={cn(icon.button, "animate-spin text-primary")} />
                  )}
                </div>
                <p className={typography.helper}>{option.description}</p>
              </button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
