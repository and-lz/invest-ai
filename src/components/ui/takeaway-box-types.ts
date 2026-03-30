import {
  CheckCircle2,
  AlertCircle,
  Info,
  type LucideIcon,
} from "lucide-react";

export type TipoConclusao = "positivo" | "neutro" | "atencao";

export interface Conclusao {
  readonly texto: string;
  readonly tipo: TipoConclusao;
  readonly acionavel?: boolean;
}

export interface TakeawayBoxProps {
  readonly conclusoes: Conclusao[];
  readonly className?: string;
}

export const INDICATOR_ICONS: Record<TipoConclusao, LucideIcon> = {
  positivo: CheckCircle2,
  atencao: AlertCircle,
  neutro: Info,
};

export const ICON_COLORS: Record<TipoConclusao, string> = {
  positivo: "text-success",
  atencao: "text-warning",
  neutro: "text-muted-foreground",
};

export interface ExplanationState {
  explanations: Record<string, string>;
  status: "idle" | "loading" | "success" | "error";
  errorMessage?: string;
}

export const INITIAL_STATE: ExplanationState = {
  explanations: {},
  status: "idle",
};

export type AddToPlanStatus = "idle" | "loading" | "added" | "error";

export const POLL_INTERVAL_MS = 2000;
export const MAX_POLL_ATTEMPTS = 30; // 60s max
