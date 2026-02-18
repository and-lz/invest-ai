import type { Metadata } from "next";
import { GlossarioConteudo } from "@/components/aprender/glossary-content";
import { ESTATISTICAS_GLOSSARIO } from "@/lib/navigable-glossary";

export const metadata: Metadata = {
  title: "Glossário Financeiro | Investimentos",
  description: `Todos os termos de investimento explicados de forma simples. ${ESTATISTICAS_GLOSSARIO.totalTermos} termos disponíveis.`,
  openGraph: {
    title: "Glossário Financeiro",
    description: "Todos os termos de investimento explicados de forma simples",
    type: "website",
  },
};

export default function GlossarioPage() {
  return <GlossarioConteudo />;
}
