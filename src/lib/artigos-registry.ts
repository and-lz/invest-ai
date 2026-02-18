import type { ArtigoEducacional, CategoriaArtigo } from "@/schemas/educational-article.schema";

// ============================================================
// Registry centralizado de todos os artigos educacionais.
// Contém helpers para busca, navegação e estatísticas.
// ============================================================

// ---- Imports dos Artigos ----

import PrimeirosPassos, {
  metadata as PrimeirosPassosMetadata,
} from "@/components/aprender/artigos/fundamentos/primeiros-passos";
import TesouroDireto, {
  metadata as TesouroDiretoMetadata,
} from "@/components/aprender/artigos/renda-fixa/tesouro-direto";
import AcoesBasico, {
  metadata as AcoesBasicoMetadata,
} from "@/components/aprender/artigos/renda-variavel/acoes-basico";
import FundosImobiliarios, {
  metadata as FundosImobiliariosMetadata,
} from "@/components/aprender/artigos/fundos/fundos-imobiliarios";
import LerRelatorio, {
  metadata as LerRelatorioMetadata,
} from "@/components/aprender/artigos/analise-carteira/ler-relatorio";
import BuyAndHold, {
  metadata as BuyAndHoldMetadata,
} from "@/components/aprender/artigos/estrategias/buy-and-hold";
import IRRendaFixa, {
  metadata as IRRendaFixaMetadata,
} from "@/components/aprender/artigos/impostos/ir-renda-fixa";
import ReservaEmergencia, {
  metadata as ReservaEmergenciaMetadata,
} from "@/components/aprender/artigos/planejamento/reserva-emergencia";

// ---- Registry de Artigos ----

/**
 * Array central de todos os artigos educacionais.
 * Cada artigo exporta metadata + Component.
 */
export const TODOS_ARTIGOS: ArtigoEducacional[] = [
  { metadata: PrimeirosPassosMetadata, Component: PrimeirosPassos },
  { metadata: TesouroDiretoMetadata, Component: TesouroDireto },
  { metadata: AcoesBasicoMetadata, Component: AcoesBasico },
  { metadata: FundosImobiliariosMetadata, Component: FundosImobiliarios },
  { metadata: LerRelatorioMetadata, Component: LerRelatorio },
  { metadata: BuyAndHoldMetadata, Component: BuyAndHold },
  { metadata: IRRendaFixaMetadata, Component: IRRendaFixa },
  { metadata: ReservaEmergenciaMetadata, Component: ReservaEmergencia },
];

// ---- Busca de Artigos ----

/**
 * Busca um artigo específico por categoria e slug.
 * Retorna undefined se não encontrado.
 */
export function obterArtigoPorSlug(
  categoria: CategoriaArtigo,
  slug: string,
): ArtigoEducacional | undefined {
  return TODOS_ARTIGOS.find(
    (artigo) => artigo.metadata.categoria === categoria && artigo.metadata.slug === slug,
  );
}

/**
 * Retorna todos os artigos de uma categoria, ordenados por `ordem`.
 */
export function obterArtigosPorCategoria(categoria: CategoriaArtigo): ArtigoEducacional[] {
  return TODOS_ARTIGOS.filter((artigo) => artigo.metadata.categoria === categoria).sort(
    (a, b) => a.metadata.ordem - b.metadata.ordem,
  );
}

/**
 * Retorna artigos filtrados por tag.
 */
export function obterArtigosPorTag(tag: string): ArtigoEducacional[] {
  return TODOS_ARTIGOS.filter((artigo) => artigo.metadata.tags.includes(tag));
}

/**
 * Retorna artigos filtrados por nível de dificuldade.
 */
export function obterArtigosPorNivel(
  nivel: "iniciante" | "intermediario" | "avancado",
): ArtigoEducacional[] {
  return TODOS_ARTIGOS.filter((artigo) => artigo.metadata.nivelDificuldade === nivel);
}

// ---- Navegação Sequencial ----

/**
 * Retorna o próximo artigo na sequência da categoria.
 * Retorna undefined se for o último artigo.
 */
export function obterProximoArtigo(
  categoriaAtual: CategoriaArtigo,
  slugAtual: string,
): ArtigoEducacional | undefined {
  const artigosCategoria = obterArtigosPorCategoria(categoriaAtual);
  const indiceAtual = artigosCategoria.findIndex((a) => a.metadata.slug === slugAtual);

  if (indiceAtual === -1 || indiceAtual === artigosCategoria.length - 1) {
    return undefined;
  }

  return artigosCategoria[indiceAtual + 1];
}

/**
 * Retorna o artigo anterior na sequência da categoria.
 * Retorna undefined se for o primeiro artigo.
 */
export function obterArtigoAnterior(
  categoriaAtual: CategoriaArtigo,
  slugAtual: string,
): ArtigoEducacional | undefined {
  const artigosCategoria = obterArtigosPorCategoria(categoriaAtual);
  const indiceAtual = artigosCategoria.findIndex((a) => a.metadata.slug === slugAtual);

  if (indiceAtual <= 0) {
    return undefined;
  }

  return artigosCategoria[indiceAtual - 1];
}

// ---- Estatísticas ----

/**
 * Estatísticas gerais sobre o acervo de artigos.
 * Usado na página inicial de /aprender.
 */
export const ESTATISTICAS_ARTIGOS = {
  get totalArtigos() {
    return TODOS_ARTIGOS.length;
  },

  get totalCategorias() {
    return new Set(TODOS_ARTIGOS.map((a) => a.metadata.categoria)).size;
  },

  get totalTags() {
    return new Set(TODOS_ARTIGOS.flatMap((a) => a.metadata.tags)).size;
  },

  get tempoLeituraTotal() {
    return TODOS_ARTIGOS.reduce((acc, a) => acc + a.metadata.tempoLeituraMinutos, 0);
  },

  get artigosMaisRecentes() {
    return TODOS_ARTIGOS.slice()
      .sort((a, b) => b.metadata.publicadoEm.localeCompare(a.metadata.publicadoEm))
      .slice(0, 5);
  },
} as const;

// ---- Contagem por Categoria ----

/**
 * Retorna um mapa com a contagem de artigos por categoria.
 * Útil para exibir badges nos cards de categoria.
 */
export function obterContagemPorCategoria(): Map<CategoriaArtigo, number> {
  const contagem = new Map<CategoriaArtigo, number>();

  TODOS_ARTIGOS.forEach((artigo) => {
    const categoria = artigo.metadata.categoria;
    contagem.set(categoria, (contagem.get(categoria) ?? 0) + 1);
  });

  return contagem;
}

// ---- Validação de Artigos ----

/**
 * Valida se todos os artigos têm metadata correto.
 * Útil para testes automatizados.
 */
export function validarArtigos(): {
  valido: boolean;
  erros: string[];
} {
  const erros: string[] = [];

  // Verificar duplicatas de slug dentro da mesma categoria
  const slugsPorCategoria = new Map<CategoriaArtigo, Set<string>>();

  TODOS_ARTIGOS.forEach((artigo) => {
    const categoria = artigo.metadata.categoria;
    const slug = artigo.metadata.slug;

    if (!slugsPorCategoria.has(categoria)) {
      slugsPorCategoria.set(categoria, new Set());
    }

    const slugsCategoria = slugsPorCategoria.get(categoria)!;

    if (slugsCategoria.has(slug)) {
      erros.push(`Slug duplicado encontrado: ${categoria}/${slug}`);
    }

    slugsCategoria.add(slug);
  });

  // Verificar se todos os artigos têm Component válido
  TODOS_ARTIGOS.forEach((artigo) => {
    if (typeof artigo.Component !== "function") {
      erros.push(
        `Artigo ${artigo.metadata.categoria}/${artigo.metadata.slug} não tem Component válido`,
      );
    }
  });

  return {
    valido: erros.length === 0,
    erros,
  };
}
