import useSWR from "swr";
import type { ReportMetadata } from "@/schemas/report-metadata.schema";

interface ReportsApiResponse {
  relatorios: ReportMetadata[];
}

const fetcher = (url: string) => fetch(url).then((res) => res.json() as Promise<ReportsApiResponse>);

export function useReports() {
  const { data, error, isLoading, mutate } = useSWR<ReportsApiResponse>(
    "/api/reports",
    fetcher,
  );

  return {
    relatorios: data?.relatorios ?? [],
    estaCarregando: isLoading,
    erro: error as Error | undefined,
    revalidar: mutate,
  };
}
