import useSWR from "swr";
import type { DadosTendencias } from "@/schemas/trends.schema";

interface TendenciasApiResponse {
  tendencias: DadosTendencias;
}

export function useDadosTendencias() {
  const { data, error, isLoading, mutate } = useSWR<TendenciasApiResponse>("/api/trends", {
    dedupingInterval: 60_000,
  });

  return {
    dadosTendencias: data?.tendencias ?? null,
    estaCarregando: isLoading,
    erro: error as Error | undefined,
    revalidar: mutate,
  };
}
