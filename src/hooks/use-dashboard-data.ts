import useSWR from "swr";
import type { DashboardData } from "@/application/use-cases/get-dashboard-data";

interface DashboardApiResponse {
  dadosDashboard: DashboardData | null;
  vazio: boolean;
}

const fetcher = (url: string) => fetch(url).then((res) => res.json() as Promise<DashboardApiResponse>);

export function useDashboardData() {
  const { data, error, isLoading, mutate } = useSWR<DashboardApiResponse>(
    "/api/dashboard",
    fetcher,
  );

  return {
    dadosDashboard: data?.dadosDashboard ?? null,
    estaVazio: data?.vazio ?? true,
    estaCarregando: isLoading,
    erro: error as Error | undefined,
    revalidar: mutate,
  };
}
