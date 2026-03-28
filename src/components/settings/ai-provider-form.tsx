"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, Bot, Check, Loader2, Wifi, WifiOff } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { typography, icon } from "@/lib/design-system";
import { AI_PROVIDER_OPTIONS, CLAUDE_MODEL_TIER_OPTIONS } from "@/lib/model-tiers";
import type { AiProvider, ClaudeModelTier } from "@/lib/model-tiers";

interface AiProviderFormProps {
  initialProvider: AiProvider;
  initialClaudeTier: ClaudeModelTier;
  onProviderChange?: (provider: AiProvider) => void;
}

export function AiProviderForm({
  initialProvider,
  initialClaudeTier,
  onProviderChange,
}: AiProviderFormProps) {
  const [selectedProvider, setSelectedProvider] = useState<AiProvider>(initialProvider);
  const [selectedTier, setSelectedTier] = useState<ClaudeModelTier>(initialClaudeTier);
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ reachable: boolean; message: string } | null>(
    null,
  );

  async function handleTestProxy() {
    setIsTesting(true);
    setTestResult(null);

    try {
      const response = await fetch("/api/settings/test-proxy", { method: "POST" });
      const result = await response.json();
      setTestResult(result);
    } catch (err) {
      setTestResult({
        reachable: false,
        message: err instanceof Error ? err.message : "Erro ao testar conexão",
      });
    } finally {
      setIsTesting(false);
    }
  }

  async function handleSave() {
    setIsSaving(true);

    try {
      const response = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          aiProvider: selectedProvider,
          claudeModelTier: selectedTier,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        toast.error(error.erro || "Falha ao salvar configuração");
        return;
      }

      toast.success("Provedor de IA atualizado");
      onProviderChange?.(selectedProvider);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Falha ao salvar configuração");
    } finally {
      setIsSaving(false);
    }
  }

  const isDirty = selectedProvider !== initialProvider || selectedTier !== initialClaudeTier;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bot className={cn(icon.cardTitle, "text-primary")} />
          Provedor de IA
        </CardTitle>
        <CardDescription>
          Escolha o provedor de IA usado pela Fortuna em todas as funcionalidades.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Provider selection */}
        <div className="grid gap-3 sm:grid-cols-2">
          {AI_PROVIDER_OPTIONS.map((option) => {
            const isSelected = selectedProvider === option.value;
            return (
              <button
                key={option.value}
                type="button"
                disabled={isSaving}
                onClick={() => {
                  setSelectedProvider(option.value);
                  setTestResult(null);
                }}
                className={cn(
                  "relative flex flex-col items-start gap-1.5 rounded-lg border p-4 text-left transition-all",
                  isSelected
                    ? "border-primary bg-primary/5 ring-1 ring-primary"
                    : "border-border hover:border-primary/30 hover:bg-muted/50",
                  isSaving && "opacity-60 cursor-not-allowed",
                )}
              >
                <span className={cn(typography.label, isSelected && "text-primary")}>
                  {option.label}
                </span>
                <p className={typography.helper}>{option.description}</p>
              </button>
            );
          })}
        </div>

        {/* Claude model tier (shown only when Claude proxy is selected) */}
        {selectedProvider === "claude-proxy" && (
          <div className="space-y-2">
            <p className={cn(typography.label, "text-muted-foreground")}>Modelo Claude</p>
            <div className="grid gap-2 sm:grid-cols-3">
              {CLAUDE_MODEL_TIER_OPTIONS.map((option) => {
                const isSelected = selectedTier === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    disabled={isSaving}
                    onClick={() => setSelectedTier(option.value)}
                    className={cn(
                      "flex flex-col items-start gap-1 rounded-lg border p-3 text-left transition-all",
                      isSelected
                        ? "border-primary bg-primary/5 ring-1 ring-primary"
                        : "border-border hover:border-primary/30 hover:bg-muted/50",
                      isSaving && "opacity-60 cursor-not-allowed",
                    )}
                  >
                    <span className={cn(typography.label, isSelected && "text-primary")}>
                      {option.label}
                    </span>
                    <p className={typography.helper}>{option.description}</p>
                  </button>
                );
              })}
            </div>

            {/* Info box */}
            <div className="rounded-md border border-primary/30 bg-primary/5 p-3 text-sm text-muted-foreground">
              <p>
                <span className="font-medium text-foreground">Requisitos:</span> claude CLI instalado
                e proxy rodando localmente (<code className="text-xs font-mono">npm run proxy</code>
                ).
              </p>
              <p className="mt-1">
                Quando Claude não está disponível, Gemini é usado automaticamente como fallback (se
                chave de API configurada).
              </p>
            </div>

            {/* Test proxy connection */}
            <div className="space-y-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleTestProxy}
                disabled={isTesting}
              >
                {isTesting ? (
                  <Loader2 className={cn(icon.button, "mr-2 animate-spin")} />
                ) : (
                  <Wifi className={cn(icon.button, "mr-2")} />
                )}
                {isTesting ? "Testando..." : "Testar conexão com proxy"}
              </Button>

              {testResult && (
                <div
                  className={cn(
                    "flex items-start gap-2 p-3 rounded-md text-sm",
                    testResult.reachable
                      ? "bg-success/10 border border-success/30"
                      : "bg-destructive/10 border border-destructive/30",
                  )}
                >
                  {testResult.reachable ? (
                    <Check className={cn(icon.button, "text-success flex-shrink-0 mt-0.5")} />
                  ) : testResult.reachable === false ? (
                    <WifiOff className={cn(icon.button, "text-destructive flex-shrink-0 mt-0.5")} />
                  ) : (
                    <AlertCircle
                      className={cn(icon.button, "text-destructive flex-shrink-0 mt-0.5")}
                    />
                  )}
                  <p className={testResult.reachable ? "text-success" : "text-destructive"}>
                    {testResult.message}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Save button */}
        <Button
          type="button"
          onClick={handleSave}
          disabled={!isDirty || isSaving}
          className="w-full sm:w-auto"
        >
          {isSaving && <Loader2 className={cn(icon.button, "mr-2 animate-spin")} />}
          {isSaving ? "Salvando..." : "Salvar"}
        </Button>
      </CardContent>
    </Card>
  );
}
