import useSWR from "swr";
import type { DadosAgregadosAtivo } from "@/schemas/analise-ativo.schema";

const fetcher = (url: string) =>
  fetch(url).then((resposta) => {
    if (!resposta.ok) throw new Error("Erro ao buscar dados do ativo");
    return resposta.json() as Promise<DadosAgregadosAtivo>;
  });

interface AtivoDaCarteira {
  codigoAtivo: string;
  nomeAtivo: string;
  estrategia: string;
  rentabilidade12Meses: number | null;
}

interface ListaAtivosResponse {
  ativos: AtivoDaCarteira[];
}

const fetcherLista = (url: string) =>
  fetch(url).then((resposta) => {
    if (!resposta.ok) throw new Error("Erro ao buscar lista de ativos");
    return resposta.json() as Promise<ListaAtivosResponse>;
  });

/**
 * Hook SWR para buscar dados agregados de um ativo especifico.
 * Nao faz fetch se ticker for null/undefined.
 */
export function useDadosAtivo(ticker: string | null) {
  const { data, error, isLoading, mutate } = useSWR<DadosAgregadosAtivo>(
    ticker ? `/api/asset-performance?ticker=${encodeURIComponent(ticker)}` : null,
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 30_000,
    },
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
  const { data, error, isLoading } = useSWR<ListaAtivosResponse>(
    "/api/asset-performance",
    fetcherLista,
    {
      revalidateOnFocus: false,
      dedupingInterval: 60_000,
    },
  );

  return {
    ativosCarteira: data?.ativos ?? [],
    estaCarregando: isLoading,
    erro: error as Error | undefined,
  };
}
