"use client";

import { BookOpen, DollarSign, TrendingUp, Building2, BarChart3, Target, Receipt, PiggyBank } from "lucide-react";
import { Header } from "@/components/layout/header";
import { CardCategoria } from "@/components/aprender/card-categoria";
import { INFORMACOES_CATEGORIAS } from "@/schemas/artigo-educacional.schema";
import { obterContagemPorCategoria, ESTATISTICAS_ARTIGOS } from "@/lib/artigos-registry";
import type { CategoriaArtigo } from "@/schemas/artigo-educacional.schema";

// Mapeamento de ícones por categoria
const ICONES_CATEGORIAS: Record<CategoriaArtigo, typeof BookOpen> = {
  fundamentos: BookOpen,
  "renda-fixa": DollarSign,
  "renda-variavel": TrendingUp,
  fundos: Building2,
  "analise-carteira": BarChart3,
  estrategias: Target,
  impostos: Receipt,
  planejamento: PiggyBank,
};

export default function AprenderPage() {
  const contagemPorCategoria = obterContagemPorCategoria();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <BookOpen className="text-muted-foreground h-6 w-6" aria-hidden="true" />
        <Header
          titulo="Centro de Aprendizado"
          descricao="Educação sobre investimentos do básico ao avançado"
        />
      </div>

      {/* Estatísticas */}
      <div className="bg-muted/50 flex flex-wrap items-center gap-6 rounded-lg px-6 py-4">
        <div className="flex items-center gap-2">
          <BookOpen className="text-muted-foreground h-5 w-5" aria-hidden="true" />
          <span className="text-sm">
            <strong className="font-semibold">{ESTATISTICAS_ARTIGOS.totalArtigos}</strong> artigos
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Target className="text-muted-foreground h-5 w-5" aria-hidden="true" />
          <span className="text-sm">
            <strong className="font-semibold">{ESTATISTICAS_ARTIGOS.totalCategorias}</strong> categorias
          </span>
        </div>

        <div className="flex items-center gap-2">
          <BarChart3 className="text-muted-foreground h-5 w-5" aria-hidden="true" />
          <span className="text-sm">
            Tempo total: <strong className="font-semibold">{ESTATISTICAS_ARTIGOS.tempoLeituraTotal}</strong> min
          </span>
        </div>
      </div>

      {/* Grid de Categorias */}
      <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {INFORMACOES_CATEGORIAS.map((categoria) => (
          <CardCategoria
            key={categoria.slug}
            slug={categoria.slug}
            titulo={categoria.titulo}
            descricao={categoria.descricao}
            Icone={ICONES_CATEGORIAS[categoria.slug]}
            quantidadeArtigos={contagemPorCategoria.get(categoria.slug) ?? 0}
          />
        ))}
      </section>
    </div>
  );
}
