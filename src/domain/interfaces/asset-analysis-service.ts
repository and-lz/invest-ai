import type { AnaliseAtivoResponse } from "@/schemas/analise-ativo.schema";
import type { DadosAtivoParaPrompt } from "@/lib/serializar-dados-ativo-markdown";

export interface AssetAnalysisService {
  analisarAtivo(dadosAtivo: DadosAtivoParaPrompt): Promise<AnaliseAtivoResponse>;
}
