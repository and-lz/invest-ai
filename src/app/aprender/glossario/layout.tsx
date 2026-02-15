import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Glossario Financeiro | Investimentos",
  description: "Dicionario de termos financeiros e de investimentos com explicacoes acessiveis",
};

export default function GlossarioLayout({ children }: { children: React.ReactNode }) {
  return children;
}
