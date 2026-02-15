import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard | Investimentos",
  description: "Visao geral dos seus investimentos com analises e graficos detalhados",
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return children;
}
