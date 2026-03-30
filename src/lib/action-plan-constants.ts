import { CheckCircle2, AlertCircle, Info, type LucideIcon } from "lucide-react";
import { badgeColor } from "@/lib/design-system";
import type { TipoConclusaoPlano } from "@/schemas/action-plan.schema";

export const CONCLUSION_ICONS: Record<TipoConclusaoPlano, LucideIcon> = {
  positivo: CheckCircle2,
  atencao: AlertCircle,
  neutro: Info,
};

export const CONCLUSION_COLORS: Record<TipoConclusaoPlano, string> = {
  positivo: "text-success",
  atencao: "text-warning",
  neutro: "text-muted-foreground",
};

export const CONCLUSION_BADGE_STYLES: Record<TipoConclusaoPlano, string> = {
  positivo: badgeColor("success"),
  atencao: badgeColor("warning"),
  neutro: "bg-muted text-muted-foreground border-border",
};

export const CONCLUSION_LABELS: Record<TipoConclusaoPlano, string> = {
  positivo: "Oportunidade",
  atencao: "Atenção",
  neutro: "Informativo",
};

export const ORIGIN_LABELS: Record<string, string> = {
  "takeaway-dashboard": "Dashboard",
  "insight-acao-sugerida": "Análise Fortuna",
};
