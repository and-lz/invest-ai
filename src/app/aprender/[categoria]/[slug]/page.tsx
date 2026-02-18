import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { LayoutArtigo } from "@/components/aprender/article-layout";
import {
  TODOS_ARTIGOS,
  obterArtigoPorSlug,
  obterProximoArtigo,
  obterArtigoAnterior,
} from "@/lib/artigos-registry";
import { CategoriaArtigoEnum } from "@/schemas/educational-article.schema";
import type { CategoriaArtigo } from "@/schemas/educational-article.schema";

interface ArtigoPageProps {
  params: Promise<{
    categoria: string;
    slug: string;
  }>;
}

export async function generateStaticParams() {
  return TODOS_ARTIGOS.map((artigo) => ({
    categoria: artigo.metadata.categoria,
    slug: artigo.metadata.slug,
  }));
}

export async function generateMetadata({ params }: ArtigoPageProps): Promise<Metadata> {
  const { categoria: categoriaSlug, slug } = await params;

  const parseResultado = CategoriaArtigoEnum.safeParse(categoriaSlug);

  if (!parseResultado.success) {
    return {};
  }

  const categoria = parseResultado.data as CategoriaArtigo;
  const artigo = obterArtigoPorSlug(categoria, slug);

  if (!artigo) {
    return {};
  }

  return {
    title: `${artigo.metadata.titulo} | Investimentos`,
    description: artigo.metadata.descricao,
    keywords: artigo.metadata.tags.join(", "),
    openGraph: {
      title: artigo.metadata.titulo,
      description: artigo.metadata.descricao,
      type: "article",
      publishedTime: artigo.metadata.publicadoEm,
      modifiedTime: artigo.metadata.atualizadoEm,
    },
  };
}

export default async function ArtigoPage({ params }: ArtigoPageProps) {
  const { categoria: categoriaSlug, slug } = await params;

  const parseResultado = CategoriaArtigoEnum.safeParse(categoriaSlug);

  if (!parseResultado.success) {
    notFound();
  }

  const categoria = parseResultado.data as CategoriaArtigo;
  const artigo = obterArtigoPorSlug(categoria, slug);

  if (!artigo) {
    notFound();
  }

  const proximoArtigo = obterProximoArtigo(categoria, slug);
  const artigoAnterior = obterArtigoAnterior(categoria, slug);

  const { Component } = artigo;

  return (
    <LayoutArtigo
      metadata={artigo.metadata}
      proximoArtigo={
        proximoArtigo
          ? {
              titulo: proximoArtigo.metadata.titulo,
              slug: proximoArtigo.metadata.slug,
              categoria: proximoArtigo.metadata.categoria,
            }
          : undefined
      }
      artigoAnterior={
        artigoAnterior
          ? {
              titulo: artigoAnterior.metadata.titulo,
              slug: artigoAnterior.metadata.slug,
              categoria: artigoAnterior.metadata.categoria,
            }
          : undefined
      }
    >
      <Component />
    </LayoutArtigo>
  );
}
