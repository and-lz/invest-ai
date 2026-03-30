import type { VeredictoRecomendacao } from "@/schemas/asset-analysis.schema";

export const ROTULOS_RECOMENDACAO: Record<VeredictoRecomendacao, string> = {
  manter: "Manter",
  aumentar_posicao: "Aumentar Posicao",
  reduzir_posicao: "Reduzir Posicao",
  realizar_lucro: "Realizar Lucro",
  sair_da_posicao: "Sair da Posicao",
  aguardar: "Aguardar",
};

export const CORES_RECOMENDACAO: Record<VeredictoRecomendacao, string> = {
  manter: "bg-secondary text-secondary-foreground",
  aumentar_posicao: "bg-success/15 text-success border-success/30",
  reduzir_posicao: "bg-warning/15 text-warning border-warning/30",
  realizar_lucro: "bg-success/15 text-success border-success/30",
  sair_da_posicao: "bg-destructive/15 text-destructive border-destructive/30",
  aguardar: "bg-secondary text-secondary-foreground",
};

export const ROTULOS_SEVERIDADE: Record<string, string> = {
  alta: "Alta",
  media: "Media",
  baixa: "Baixa",
};

export const CORES_SEVERIDADE: Record<string, string> = {
  alta: "bg-destructive/15 text-destructive border-destructive/30",
  media: "bg-warning/15 text-warning border-warning/30",
  baixa: "bg-secondary text-secondary-foreground",
};
