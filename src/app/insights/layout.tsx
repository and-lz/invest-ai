import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Insights | Investimentos",
  description: "Insights e analises geradas por IA sobre seus investimentos",
};

export default function InsightsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
