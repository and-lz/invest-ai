import useSWR from "swr";
import { useCallback, useMemo } from "react";
import type { ItemPlanoAcao, StatusItemPlano } from "@/schemas/action-plan.schema";

interface PlanoAcaoApiResponse {
  itens: ItemPlanoAcao[];
}

/**
 * SWR hook for the action plan page.
 * Provides items list, status updates, and deletion with optimistic updates.
 */
export function usePlanoAcao() {
  const { data, error, isLoading, mutate } = useSWR<PlanoAcaoApiResponse>(
    "/api/action-plan",
    {
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      // Poll every 3s while any item is waiting for AI enrichment (with 2min safety timeout)
      refreshInterval: (latestData) => {
        const itens = (latestData as PlanoAcaoApiResponse | undefined)?.itens ?? [];
        const ENRICHMENT_TIMEOUT_MS = 2 * 60 * 1000;
        const now = Date.now();
        const hasRecentPendingEnrichment = itens.some(
          (item) =>
            item.recomendacaoEnriquecida === null &&
            now - new Date(item.criadoEm).getTime() < ENRICHMENT_TIMEOUT_MS,
        );
        return hasRecentPendingEnrichment ? 3000 : 0;
      },
    },
  );

  const itens = useMemo(() => data?.itens ?? [], [data?.itens]);

  const itensPendentes = useMemo(
    () => itens.filter((item) => item.status === "pendente"),
    [itens],
  );

  const itensConcluidos = useMemo(
    () => itens.filter((item) => item.status === "concluida"),
    [itens],
  );

  const itensIgnorados = useMemo(
    () => itens.filter((item) => item.status === "ignorada"),
    [itens],
  );

  const atualizarStatus = useCallback(
    async (identificador: string, status: StatusItemPlano) => {
      const dadosOtimistas: PlanoAcaoApiResponse = {
        itens: itens.map((item) =>
          item.identificador === identificador
            ? {
                ...item,
                status,
                atualizadoEm: new Date().toISOString(),
                concluidoEm: status === "concluida" ? new Date().toISOString() : null,
              }
            : item,
        ),
      };

      try {
        await mutate(
          async () => {
            const response = await fetch(`/api/action-plan/${identificador}`, {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ status }),
            });
            if (!response.ok) {
              throw new Error(`Error updating status: ${response.status}`);
            }
            return dadosOtimistas;
          },
          {
            optimisticData: dadosOtimistas,
            rollbackOnError: true,
            revalidate: true,
          },
        );
      } catch (erro) {
        console.error("Error updating action plan item status:", erro);
        throw erro;
      }
    },
    [mutate, itens],
  );

  const removerItem = useCallback(
    async (identificador: string) => {
      const dadosOtimistas: PlanoAcaoApiResponse = {
        itens: itens.filter((item) => item.identificador !== identificador),
      };

      try {
        await mutate(
          async () => {
            const response = await fetch(`/api/action-plan/${identificador}`, {
              method: "DELETE",
            });
            if (!response.ok) {
              throw new Error(`Error deleting item: ${response.status}`);
            }
            return dadosOtimistas;
          },
          {
            optimisticData: dadosOtimistas,
            rollbackOnError: true,
            revalidate: true,
          },
        );
      } catch (erro) {
        console.error("Error deleting action plan item:", erro);
        throw erro;
      }
    },
    [mutate, itens],
  );

  return {
    itens,
    itensPendentes,
    itensConcluidos,
    itensIgnorados,
    estaCarregando: isLoading,
    erro: error as Error | undefined,
    atualizarStatus,
    removerItem,
    revalidar: mutate,
  };
}
