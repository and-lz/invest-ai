import useSWR from "swr";
import { useRef, useEffect } from "react";
import type { TarefaBackground } from "@/lib/tarefa-background";

/** Fetcher customizado: retorna null em vez de lançar erro para 404 (tarefa nao encontrada) */
const fetcherTarefa = (url: string) =>
  fetch(url).then((resposta) => {
    if (!resposta.ok) return null;
    return resposta.json() as Promise<TarefaBackground>;
  });

export function useTarefaBackground(identificadorTarefa: string | null) {
  const timestampConclusaoRef = useRef<number | null>(null);

  const { data, error, isLoading } = useSWR<TarefaBackground | null>(
    identificadorTarefa ? `/api/tasks/${identificadorTarefa}` : null,
    fetcherTarefa,
    {
      refreshInterval: (dados: TarefaBackground | null | undefined) => {
        // Continua fazendo polling enquanto processando
        if (dados?.status === "processando") {
          return 2000;
        }

        // Se concluído/erro/cancelada, continua polling por mais 10 segundos
        // para garantir que o estado seja propagado corretamente
        if (
          dados &&
          (dados.status === "concluido" ||
            dados.status === "erro" ||
            dados.status === "cancelada")
        ) {
          const agora = Date.now();

          // Primeira vez que detecta conclusão
          if (timestampConclusaoRef.current === null) {
            timestampConclusaoRef.current = agora;
          }

          const tempoDecorrido = agora - timestampConclusaoRef.current;
          const JANELA_GRACIOSIDADE_MS = 10000; // 10 segundos

          // Continua polling por 10s após conclusão
          if (tempoDecorrido < JANELA_GRACIOSIDADE_MS) {
            return 2000;
          }
        }

        // Para o polling definitivamente
        return 0;
      },
      revalidateOnFocus: false,
    },
  );

  // Reset do timestamp se tarefa voltar a processar
  useEffect(() => {
    if (data?.status === "processando") {
      timestampConclusaoRef.current = null;
    }
  }, [data?.status]);

  return {
    tarefa: data ?? null,
    estaCarregando: isLoading,
    erro: error as Error | undefined,
    estaProcessando: data?.status === "processando",
    estaConcluido: data?.status === "concluido",
    estaComErro: data?.status === "erro",
    estaCancelada: data?.status === "cancelada",
  };
}
