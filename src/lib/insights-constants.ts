import {
  Lightbulb,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Target,
  Shield,
} from "lucide-react";
import { formatarMesAno, validarMesAno } from "@/lib/format-date";

export const ICONES_CATEGORIA: Record<string, typeof TrendingUp> = {
  performance_positiva: TrendingUp,
  performance_negativa: TrendingDown,
  acao_recomendada: Target,
  risco: Shield,
  oportunidade: Lightbulb,
  diversificacao: Target,
  custos: AlertTriangle,
};

export const CORES_PRIORIDADE: Record<string, string> = {
  alta: "bg-destructive/15 text-destructive",
  media: "bg-muted text-muted-foreground",
  baixa: "bg-muted text-muted-foreground",
};

export const LABELS_CATEGORIA: Record<string, string> = {
  performance_positiva: "Performance positiva",
  performance_negativa: "Performance negativa",
  acao_recomendada: "Ação recomendada",
  risco: "Risco",
  oportunidade: "Oportunidade",
  diversificacao: "Diversificação",
  custos: "Custos",
};

export const INSIGHT_TO_CONCLUSAO: Record<string, string> = {
  performance_positiva: "positivo",
  performance_negativa: "atencao",
  acao_recomendada: "neutro",
  risco: "atencao",
  oportunidade: "positivo",
  diversificacao: "neutro",
  custos: "atencao",
};

/** Formata mesReferencia de forma segura: se já estiver formatado, retorna como está */
export function formatarMesReferenciaSeguro(mesReferencia: string): string {
  if (validarMesAno(mesReferencia)) {
    return formatarMesAno(mesReferencia, "extenso");
  }
  // Valor já formatado pela Gemini (ex: "janeiro de 2026") — retornar como está
  return mesReferencia;
}
