import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Análises IA | Investimentos",
  description: "Analises inteligentes geradas por IA sobre seus investimentos",
};

export default function InsightsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
