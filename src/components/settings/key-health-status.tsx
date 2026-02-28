"use client";

import { AlertCircle, AlertTriangle, Check, Loader2, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { typography, icon } from "@/lib/design-system";
import type { KeyHealthStatus } from "@/schemas/user-settings.schema";

interface KeyHealthStatusProps {
  status: KeyHealthStatus | null;
  isLoading: boolean;
  onRefresh: () => void;
}

const STATUS_CONFIG: Record<
  Exclude<KeyHealthStatus, "not_configured">,
  {
    icon: typeof Check;
    iconClass: string;
    bgClass: string;
    borderClass: string;
    textClass: string;
  }
> = {
  healthy: {
    icon: Check,
    iconClass: "text-success",
    bgClass: "bg-success/10",
    borderClass: "border-success/30",
    textClass: "text-success",
  },
  invalid: {
    icon: AlertCircle,
    iconClass: "text-destructive",
    bgClass: "bg-destructive/10",
    borderClass: "border-destructive/30",
    textClass: "text-destructive",
  },
  quota_exhausted: {
    icon: AlertTriangle,
    iconClass: "text-warning",
    bgClass: "bg-warning/10",
    borderClass: "border-warning/30",
    textClass: "text-warning",
  },
  error: {
    icon: AlertCircle,
    iconClass: "text-muted-foreground",
    bgClass: "bg-muted/50",
    borderClass: "border-border",
    textClass: "text-muted-foreground",
  },
};

const STATUS_MESSAGES: Record<Exclude<KeyHealthStatus, "not_configured">, string> = {
  healthy: "Sua chave de API está funcionando.",
  invalid: "Sua chave de API é inválida ou foi revogada. Insira uma nova chave abaixo.",
  quota_exhausted: "Sua chave de API está sem créditos.",
  error: "Não foi possível verificar sua chave. Pode ser temporário.",
};

export function KeyHealthStatusBanner({ status, isLoading, onRefresh }: KeyHealthStatusProps) {
  if (isLoading) {
    return (
      <div className="flex items-center gap-2 p-3 rounded-md bg-muted/50 border border-border">
        <Loader2 className={cn(icon.button, "text-muted-foreground animate-spin")} />
        <span className={cn(typography.body, "text-muted-foreground")}>Verificando chave de API...</span>
      </div>
    );
  }

  if (!status || status === "not_configured") {
    return null;
  }

  const config = STATUS_CONFIG[status];
  const Icon = config.icon;

  return (
    <div className={cn("flex items-start gap-3 p-3 rounded-md border", config.bgClass, config.borderClass)}>
      <Icon className={cn(icon.button, config.iconClass, "flex-shrink-0 mt-0.5")} />
      <div className="flex-1 min-w-0">
        <p className={cn(typography.body, config.textClass)}>
          {STATUS_MESSAGES[status]}
        </p>
        {status === "quota_exhausted" && (
          <a
            href="https://aistudio.google.com/apikey"
            target="_blank"
            rel="noopener noreferrer"
            className={cn(typography.body, "text-primary hover:underline mt-1 inline-block")}
          >
            Adicionar créditos no Google AI Studio
          </a>
        )}
      </div>
      <button
        type="button"
        onClick={onRefresh}
        className="flex-shrink-0 text-muted-foreground hover:text-foreground transition-colors p-1"
        title="Verificar novamente"
      >
        <RefreshCw className={cn(icon.button)} />
      </button>
    </div>
  );
}
