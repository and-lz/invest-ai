import useSWR from "swr";
import { useCallback, useMemo } from "react";

interface ConversaMetadata {
  identificador: string;
  titulo: string;
  identificadorPagina: string;
  criadaEm: string;
  atualizadaEm: string;
  previewMensagem: string;
  contagemMensagens: number;
}

interface ConversasApiResponse {
  conversas: ConversaMetadata[];
}

/**
 * Hook SWR para listar conversas do chat.
 * Retorna apenas metadata (sem mensagens completas) para performance.
 */
export function useConversas() {
  const { data, error, isLoading, mutate } = useSWR<ConversasApiResponse>("/api/conversations", {
    revalidateOnFocus: true,
    revalidateOnReconnect: true,
  });

  const conversas = useMemo(() => data?.conversas ?? [], [data?.conversas]);

  const deletarConversa = useCallback(
    async (identificador: string) => {
      const filtrar = (dados?: ConversasApiResponse): ConversasApiResponse => ({
        conversas: (dados?.conversas ?? []).filter((c) => c.identificador !== identificador),
      });

      try {
        await mutate(
          async (dadosAtuais) => {
            const resposta = await fetch(`/api/conversations/${identificador}`, {
              method: "DELETE",
            });
            if (!resposta.ok) {
              throw new Error(`Erro ao deletar conversa: ${resposta.status}`);
            }
            return filtrar(dadosAtuais);
          },
          {
            optimisticData: filtrar,
            rollbackOnError: true,
            revalidate: false,
          },
        );
      } catch (erro) {
        console.error("Erro ao deletar conversa:", erro);
      }
    },
    [mutate],
  );

  return {
    conversas,
    estaCarregando: isLoading,
    erro: error as Error | undefined,
    deletarConversa,
    revalidar: mutate,
  };
}
