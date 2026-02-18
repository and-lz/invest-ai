import useSWR from "swr";
import type { DadosAgregadosAtivo } from "@/schemas/asset-analysis.schema";

interface AtivoDaCarteira {
  codigoAtivo: string;
  nomeAtivo: string;
  estrategia: string;
  rentabilidade12Meses: number | null;
}

interface ListaAtivosResponse {
  ativos: AtivoDaCarteira[];
}

/**
 * Hook SWR para buscar dados agregados de um ativo especifico.
 * Nao faz fetch se ticker for null/undefined.
 */
export function useDadosAtivo(ticker: string | null) {
  const { data, error, isLoading, mutate } = useSWR<DadosAgregadosAtivo>(
    ticker ? `/api/asset-performance?ticker=${encodeURIComponent(ticker)}` : null,
  );

  return {
    dadosAtivo: data ?? null,
    estaCarregando: isLoading,
    erro: error as Error | undefined,
    revalidar: mutate,
  };
}

/**
 * Hook SWR para buscar lista de ativos unicos da carteira.
 */
export function useListaAtivosCarteira() {
  const { data, error, isLoading } = useSWR<ListaAtivosResponse>("/api/asset-performance", {
    dedupingInterval: 60_000,
  });

  return {
    ativosCarteira: data?.ativos ?? [],
    estaCarregando: isLoading,
    erro: error as Error | undefined,
  };
}
