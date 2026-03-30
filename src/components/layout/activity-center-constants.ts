import {
  CheckCircle,
  OctagonX,
  AlertTriangle,
  Info,
} from "lucide-react";

export const ICONES_TIPO = {
  success: CheckCircle,
  error: OctagonX,
  warning: AlertTriangle,
  info: Info,
} as const;

export const CORES_TIPO = {
  success: "text-success",
  error: "text-destructive",
  warning: "text-warning",
  info: "text-muted-foreground",
} as const;

export function ehAcaoDeRetry(url: string): boolean {
  return url.includes("/retry");
}
