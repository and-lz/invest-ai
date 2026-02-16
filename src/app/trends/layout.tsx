import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tendencias de Mercado | Investimentos",
  description:
    "Dados do mercado financeiro brasileiro: maiores altas, baixas, indicadores macro e setores",
};

export default function TrendsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
