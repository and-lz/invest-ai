import useSWR from "swr";
import type { TarefaBackground } from "@/lib/tarefa-background";

const fetcher = (url: string) =>
  fetch(url).then((resposta) => {
    if (!resposta.ok) return null;
    return resposta.json() as Promise<TarefaBackground>;
  });

export function useTarefaBackground(identificadorTarefa: string | null) {
  const { data, error, isLoading } = useSWR<TarefaBackground | null>(
    identificadorTarefa ? `/api/tasks/${identificadorTarefa}` : null,
    fetcher,
    {
      refreshInterval: (dados: TarefaBackground | null | undefined) =>
        dados?.status === "processando" ? 2000 : 0,
      revalidateOnFocus: false,
    },
  );

  return {
    tarefa: data ?? null,
    estaCarregando: isLoading,
    erro: error as Error | undefined,
    estaProcessando: data?.status === "processando",
    estaConcluido: data?.status === "concluido",
    estaComErro: data?.status === "erro",
  };
}
