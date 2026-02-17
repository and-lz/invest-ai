import useSWR from "swr";
import { useCallback, useEffect, useMemo } from "react";
import type { InsightsMetadata } from "@/schemas/insights.schema";

interface InsightsListApiResponse {
  insightsMetadados: InsightsMetadata[];
}

/**
 * SWR hook to list all generated insights metadata.
 * Supports optimistic delete with rollback and auto-revalidates
 * when background tasks complete.
 */
export function useInsightsList() {
  const { data, error, isLoading, mutate } = useSWR<InsightsListApiResponse>(
    "/api/insights?list=true",
    {
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
    },
  );

  const insightsMetadados = useMemo(
    () => data?.insightsMetadados ?? [],
    [data?.insightsMetadados],
  );

  // Revalidate when background tasks complete (insights generation)
  useEffect(() => {
    const handleTaskCompleted = () => {
      void mutate();
    };

    window.addEventListener("tarefa-background-concluida", handleTaskCompleted);
    return () => {
      window.removeEventListener("tarefa-background-concluida", handleTaskCompleted);
    };
  }, [mutate]);

  const deleteInsights = useCallback(
    async (identificador: string) => {
      const optimisticData: InsightsListApiResponse = {
        insightsMetadados: insightsMetadados.filter(
          (item) => item.identificador !== identificador,
        ),
      };

      try {
        await mutate(
          async () => {
            const response = await fetch(
              `/api/insights?identificador=${encodeURIComponent(identificador)}`,
              { method: "DELETE" },
            );
            if (!response.ok) {
              throw new Error(`Error deleting insights: ${response.status}`);
            }
            return optimisticData;
          },
          {
            optimisticData,
            rollbackOnError: true,
            revalidate: true,
          },
        );
      } catch (erro) {
        console.error("Error deleting insights:", erro);
        throw erro;
      }
    },
    [mutate, insightsMetadados],
  );

  return {
    insightsMetadados,
    isLoading,
    error: error as Error | undefined,
    deleteInsights,
    revalidate: mutate,
  };
}
