"use client";

import { SWRConfig } from "swr";
import { fetcherPadrao } from "@/lib/swr-fetcher";

interface ProvedorSwrProps {
  children: React.ReactNode;
}

export function ProvedorSwr({ children }: ProvedorSwrProps) {
  return (
    <SWRConfig
      value={{
        fetcher: fetcherPadrao,
        dedupingInterval: 30_000,
        revalidateOnFocus: false,
        errorRetryCount: 3,
        errorRetryInterval: 5_000,
      }}
    >
      {children}
    </SWRConfig>
  );
}
