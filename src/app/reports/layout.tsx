import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Relatorios | Investimentos",
  description: "Gerencie seus relatorios de investimentos Inter Prime",
};

export default function ReportsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
