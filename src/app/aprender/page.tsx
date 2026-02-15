import type { Metadata } from "next";
import { AprenderConteudo } from "@/components/aprender/aprender-conteudo";
import { ESTATISTICAS_ARTIGOS } from "@/lib/artigos-registry";

export const metadata: Metadata = {
  title: "Centro de Aprendizado | Investimentos",
  description: `Educação sobre investimentos do básico ao avançado. ${ESTATISTICAS_ARTIGOS.totalArtigos} artigos em ${ESTATISTICAS_ARTIGOS.totalCategorias} categorias.`,
  openGraph: {
    title: "Centro de Aprendizado",
    description: "Educação sobre investimentos do básico ao avançado",
    type: "website",
  },
};

export default function AprenderPage() {
  return <AprenderConteudo />;
}
