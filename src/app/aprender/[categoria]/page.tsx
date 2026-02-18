import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { BookOpen, ChevronLeft } from "lucide-react";
import Link from "next/link";
import { Header } from "@/components/layout/header";
import { CardArtigo } from "@/components/aprender/article-card";
import { Button } from "@/components/ui/button";
import { obterArtigosPorCategoria } from "@/lib/artigos-registry";
import { INFORMACOES_CATEGORIAS, CategoriaArtigoEnum } from "@/schemas/educational-article.schema";
import type { CategoriaArtigo } from "@/schemas/educational-article.schema";

interface CategoriaPageProps {
  params: Promise<{
    categoria: string;
  }>;
}

export async function generateStaticParams() {
  return INFORMACOES_CATEGORIAS.map((cat) => ({
    categoria: cat.slug,
  }));
}

export async function generateMetadata({ params }: CategoriaPageProps): Promise<Metadata> {
  const { categoria: categoriaSlug } = await params;

  const parseResultado = CategoriaArtigoEnum.safeParse(categoriaSlug);

  if (!parseResultado.success) {
    return {};
  }

  const categoria = parseResultado.data as CategoriaArtigo;
  const categoriaInfo = INFORMACOES_CATEGORIAS.find((c) => c.slug === categoria);

  if (!categoriaInfo) {
    return {};
  }

  const artigos = obterArtigosPorCategoria(categoria);

  return {
    title: `${categoriaInfo.titulo} | Investimentos`,
    description: `${categoriaInfo.descricao} - ${artigos.length} ${artigos.length === 1 ? "artigo disponível" : "artigos disponíveis"}`,
    openGraph: {
      title: categoriaInfo.titulo,
      description: categoriaInfo.descricao,
      type: "website",
    },
  };
}

export default async function CategoriaPage({ params }: CategoriaPageProps) {
  const { categoria: categoriaSlug } = await params;

  // Validar categoria
  const parseResultado = CategoriaArtigoEnum.safeParse(categoriaSlug);

  if (!parseResultado.success) {
    notFound();
  }

  const categoria = parseResultado.data as CategoriaArtigo;

  const categoriaInfo = INFORMACOES_CATEGORIAS.find((c) => c.slug === categoria);

  if (!categoriaInfo) {
    notFound();
  }

  const artigos = obterArtigosPorCategoria(categoria);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Link href="/aprender">
          <Button variant="ghost" size="sm" className="mb-4">
            <ChevronLeft className="mr-2 h-4 w-4" />
            Voltar para Centro de Aprendizado
          </Button>
        </Link>

        <div className="flex items-center gap-3">
          <BookOpen className="text-muted-foreground h-6 w-6" aria-hidden="true" />
          <Header titulo={categoriaInfo.titulo} descricao={categoriaInfo.descricao} />
        </div>
      </div>

      {/* Estatísticas */}
      <div className="bg-muted/50 flex items-center gap-2 rounded-lg px-6 py-3">
        <span className="text-sm">
          <strong className="font-semibold">{artigos.length}</strong>{" "}
          {artigos.length === 1 ? "artigo disponível" : "artigos disponíveis"}
        </span>
      </div>

      {/* Lista de Artigos */}
      {artigos.length === 0 ? (
        <div className="py-12 text-center">
          <BookOpen className="text-muted-foreground mx-auto mb-4 h-12 w-12" aria-hidden="true" />
          <p className="text-muted-foreground">Artigos em breve. Volte em outro momento!</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {artigos.map((artigo) => (
            <CardArtigo key={artigo.metadata.slug} artigo={artigo.metadata} />
          ))}
        </div>
      )}
    </div>
  );
}
