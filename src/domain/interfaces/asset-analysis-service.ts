import type { AnaliseAtivoResponse } from "@/schemas/asset-analysis.schema";
import type { DadosAtivoParaPrompt } from "@/lib/serialize-asset-data-markdown";

export interface AssetAnalysisService {
  analisarAtivo(dadosAtivo: DadosAtivoParaPrompt): Promise<AnaliseAtivoResponse>;
}
