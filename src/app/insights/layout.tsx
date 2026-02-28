import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Análises Fortuna | Investimentos",
  description: "Analises inteligentes geradas pela Fortuna sobre seus investimentos",
};

export default function InsightsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
