import type {
  AtivoRanking,
  IndiceMercado,
  IndicadorMacro,
  SetorPerformance,
} from "@/schemas/trends.schema";

export interface MarketDataService {
  obterRankingAcoes(
    ordenarPor: string,
    ordem: "asc" | "desc",
    limite: number,
  ): Promise<AtivoRanking[]>;

  obterRankingFundos(
    ordenarPor: string,
    ordem: "asc" | "desc",
    limite: number,
  ): Promise<AtivoRanking[]>;

  obterCotacaoIndice(simbolo: string): Promise<IndiceMercado>;

  obterSetoresPerformance(): Promise<SetorPerformance[]>;
}

export interface MacroDataService {
  obterIndicadores(): Promise<IndicadorMacro[]>;
}
