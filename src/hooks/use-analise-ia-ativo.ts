import useSWR from "swr";
import type { AnaliseAtivoResponse } from "@/schemas/analise-ativo.schema";

interface AnaliseApiResponse {
  analise: AnaliseAtivoResponse | null;
}

const fetcher = (url: string) =>
  fetch(url).then((resposta) => {
    if (!resposta.ok) throw new Error("Erro ao buscar analise do ativo");
    return resposta.json() as Promise<AnaliseApiResponse>;
  });

/**
 * Hook SWR para buscar analise IA cacheada de um ativo.
 * Nao faz fetch se ticker for null/undefined.
 */
export function useAnaliseIaAtivo(ticker: string | null) {
  const { data, error, isLoading, mutate } = useSWR<AnaliseApiResponse>(
    ticker ? `/api/asset-performance/analysis?ticker=${encodeURIComponent(ticker)}` : null,
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 10_000,
    },
  );

  return {
    analise: data?.analise ?? null,
    estaCarregando: isLoading,
    erro: error as Error | undefined,
    revalidar: mutate,
  };
}

/**
 * Dispara analise IA de um ativo em background.
 * Retorna o identificador da tarefa para polling.
 */
export async function dispararAnaliseIaAtivo(
  codigoAtivo: string,
): Promise<string> {
  const resposta = await fetch("/api/asset-performance/analyze", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ codigoAtivo }),
  });

  if (!resposta.ok) {
    throw new Error("Falha ao iniciar analise do ativo");
  }

  const dados = (await resposta.json()) as { identificadorTarefa: string };
  return dados.identificadorTarefa;
}
