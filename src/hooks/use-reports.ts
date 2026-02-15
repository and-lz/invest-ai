import useSWR from "swr";
import type { ReportMetadata } from "@/schemas/report-metadata.schema";

interface ReportsApiResponse {
  relatorios: ReportMetadata[];
}

export function useReports() {
  const { data, error, isLoading, mutate } = useSWR<ReportsApiResponse>("/api/reports");

  return {
    relatorios: data?.relatorios ?? [],
    estaCarregando: isLoading,
    erro: error as Error | undefined,
    revalidar: mutate,
  };
}
