import useSWR from "swr";
import type { DashboardData } from "@/application/use-cases/get-dashboard-data";

interface DashboardApiResponse {
  dadosDashboard: DashboardData | null;
  vazio: boolean;
}

interface UseDashboardDataParams {
  mesAno?: string; // Período específico no formato "YYYY-MM". Se não fornecido, usa o último mês disponível
}

export function useDashboardData(params?: UseDashboardDataParams) {
  // Construir URL com query param se mesAno for fornecido
  const url = params?.mesAno
    ? `/api/dashboard?mesAno=${encodeURIComponent(params.mesAno)}`
    : "/api/dashboard";

  const { data, error, isLoading, mutate } = useSWR<DashboardApiResponse>(url);

  return {
    dadosDashboard: data?.dadosDashboard ?? null,
    estaVazio: data?.vazio ?? true,
    estaCarregando: isLoading,
    erro: error as Error | undefined,
    revalidar: mutate,
  };
}
