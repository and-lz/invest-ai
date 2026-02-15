import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Desempenho de Ativos | Investimentos",
  description: "Analise detalhada de desempenho dos ativos da sua carteira",
};

export default function DesempenhoLayout({ children }: { children: React.ReactNode }) {
  return children;
}
