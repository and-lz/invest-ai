import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Plano de Ação | Investimentos",
  description: "Seu plano de ação com recomendações de investimento enriquecidas pela Fortuna",
};

export default function PlanoAcaoLayout({ children }: { children: React.ReactNode }) {
  return children;
}
