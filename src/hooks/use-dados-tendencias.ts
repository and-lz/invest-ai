import useSWR from "swr";
import type { DadosTendencias } from "@/schemas/trends.schema";

interface TendenciasApiResponse {
  tendencias: DadosTendencias;
}

const fetcher = (url: string) =>
  fetch(url).then((resposta) => {
    if (!resposta.ok) throw new Error("Erro ao buscar tendencias");
    return resposta.json() as Promise<TendenciasApiResponse>;
  });

export function useDadosTendencias() {
  const { data, error, isLoading, mutate } = useSWR<TendenciasApiResponse>(
    "/api/trends",
    fetcher,
    {
      revalidateOnFocus: true,
      dedupingInterval: 60_000,
    },
  );

  return {
    dadosTendencias: data?.tendencias ?? null,
    estaCarregando: isLoading,
    erro: error as Error | undefined,
    revalidar: mutate,
  };
}
