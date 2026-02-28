"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle, Check, Eye, EyeOff, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { typography, icon } from "@/lib/design-system";
import { KeyHealthStatusBanner } from "@/components/settings/key-health-status";
import type { KeyHealthStatus } from "@/schemas/user-settings.schema";

interface GeminiApiKeyFormProps {
  onSuccess?: () => void;
  isKeyConfigured?: boolean;
  keyHealth?: KeyHealthStatus | null;
  isCheckingHealth?: boolean;
  onRefreshHealth?: () => void;
}

export function GeminiApiKeyForm({
  onSuccess,
  isKeyConfigured = false,
  keyHealth,
  isCheckingHealth = false,
  onRefreshHealth,
}: GeminiApiKeyFormProps) {
  const [apiKey, setApiKey] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ valid: boolean; message: string } | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  async function handleTestKey() {
    if (!apiKey.trim()) {
      toast.error("Insira uma chave de API primeiro");
      return;
    }

    setIsTesting(true);
    setTestResult(null);

    try {
      const response = await fetch("/api/settings/test-gemini-key", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ geminiApiKey: apiKey }),
      });

      if (!response.ok) {
        const error = await response.json();
        setTestResult({
          valid: false,
          message: error.erro || "Falha ao testar chave de API",
        });
        return;
      }

      const result = await response.json();
      setTestResult(result);

      if (result.valid) {
        toast.success("Chave de API válida");
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erro desconhecido";
      setTestResult({
        valid: false,
        message: `Erro: ${message}`,
      });
      toast.error("Falha ao testar chave de API");
    } finally {
      setIsTesting(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!apiKey.trim()) {
      toast.error("Insira uma chave de API");
      return;
    }

    setIsSaving(true);

    try {
      const response = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ geminiApiKey: apiKey }),
      });

      if (!response.ok) {
        const error = await response.json();
        toast.error(error.erro || "Falha ao salvar chave de API");
        return;
      }

      toast.success("Chave de API salva com sucesso");
      setApiKey("");
      onSuccess?.();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Falha ao salvar chave de API");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Chave de API Gemini</CardTitle>
        <CardDescription>
          {isKeyConfigured
            ? "Você já configurou uma chave de API. Insira uma nova para atualizá-la."
            : "Insira sua chave de API Gemini para habilitar a Fortuna, incluindo análise de PDFs e geração de insights."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isKeyConfigured && (
          <div className="mb-4">
            <KeyHealthStatusBanner
              status={keyHealth ?? null}
              isLoading={isCheckingHealth}
              onRefresh={onRefreshHealth ?? (() => {})}
            />
          </div>
        )}
        <form onSubmit={handleSubmit} ref={formRef} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="apiKey" className={typography.label}>
              Chave de API
            </Label>
            <div className="relative">
              <Input
                id="apiKey"
                type={showKey ? "text" : "password"}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Insira sua chave de API Gemini..."
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showKey ? <EyeOff className={cn(icon.button)} /> : <Eye className={cn(icon.button)} />}
              </button>
            </div>
            <p className={cn(typography.helper, "text-muted-foreground")}>
              Obtenha sua chave em{" "}
              <a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                Google AI Studio
              </a>
            </p>
          </div>

          {testResult && (
            <div
              className={cn(
                "flex items-start gap-3 p-3 rounded-md",
                testResult.valid ? "bg-success/10 border border-success/30" : "bg-destructive/10 border border-destructive/30",
              )}
            >
              {testResult.valid ? (
                <Check className={cn(icon.button, "text-success flex-shrink-0 mt-0.5")} />
              ) : (
                <AlertCircle className={cn(icon.button, "text-destructive flex-shrink-0 mt-0.5")} />
              )}
              <p
                className={cn(
                  typography.body,
                  testResult.valid ? "text-success" : "text-destructive",
                )}
              >
                {testResult.message}
              </p>
            </div>
          )}

          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleTestKey}
              disabled={!apiKey.trim() || isTesting || isSaving}
              className="flex-1"
            >
              {isTesting && <Loader2 className={cn(icon.button, "mr-2 animate-spin")} />}
              {isTesting ? "Testando..." : "Testar Chave"}
            </Button>
            <Button
              type="submit"
              disabled={!apiKey.trim() || isSaving || isTesting}
              className="flex-1"
            >
              {isSaving && <Loader2 className={cn(icon.button, "mr-2 animate-spin")} />}
              {isSaving ? "Salvando..." : "Salvar Chave"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
