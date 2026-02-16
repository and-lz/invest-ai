import type { EntradaGlossario } from "./glossario-financeiro";
import * as Glossario from "./glossario-financeiro";

// ============================================================
// Glossário navegável: parser automático do glossário existente
// com funcionalidades de busca, agrupamento e categorização.
// ============================================================

export interface TermoGlossarioNavegavel extends EntradaGlossario {
  readonly slug: string;
  readonly categoria: string;
}

// ---- Parser Automático de Termos ----

function chaveParaSlug(chave: string): string {
  return chave
    .replace("GLOSSARIO_", "")
    .toLowerCase()
    .replace(/_/g, "-")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, ""); // Remove acentos
}

function extrairCategoria(chave: string): string {
  // Categorização baseada em padrões no nome da chave
  if (chave.includes("ESTRATEGIA")) return "estrategias";
  if (chave.includes("EVENTO")) return "eventos-financeiros";
  if (
    chave.includes("BENCHMARK") ||
    chave.includes("CDI") ||
    chave.includes("IBOVESPA") ||
    chave.includes("IPCA")
  ) {
    return "benchmarks";
  }
  if (chave.includes("RENTABILIDADE") || chave.includes("GANHOS")) return "rentabilidade";
  if (chave.includes("PATRIMONIO") || chave.includes("VARIACAO")) return "patrimonio";
  if (chave.includes("ALOCACAO")) return "alocacao";
  if (chave.includes("RISCO") || chave.includes("VOLATILIDADE")) return "risco";
  if (chave.includes("LIQUIDEZ")) return "liquidez";
  if (chave.includes("PERIODO")) return "periodos";
  if (
    chave.includes("SELIC") ||
    chave.includes("DOLAR") ||
    chave.includes("IGPM") ||
    chave.includes("VOLUME")
  ) {
    return "mercado";
  }
  return "geral";
}

function isEntradaGlossario(valor: unknown): valor is EntradaGlossario {
  return (
    typeof valor === "object" &&
    valor !== null &&
    "termo" in valor &&
    "explicacao" in valor &&
    typeof (valor as EntradaGlossario).termo === "string" &&
    typeof (valor as EntradaGlossario).explicacao === "string"
  );
}

function isRecordDeEntradas(valor: unknown): valor is Record<string, EntradaGlossario> {
  if (typeof valor !== "object" || valor === null) return false;
  return Object.values(valor).every(isEntradaGlossario);
}

/**
 * Parse automático de todas as exportações do glossário financeiro.
 * Converte tanto entradas individuais quanto Records em array navegável.
 */
export const TODOS_TERMOS: TermoGlossarioNavegavel[] = Object.entries(Glossario)
  .filter(([chave]) => chave.startsWith("GLOSSARIO_"))
  .flatMap(([chave, valor]): TermoGlossarioNavegavel[] => {
    // Se for uma entrada individual
    if (isEntradaGlossario(valor)) {
      return [
        {
          ...valor,
          slug: chaveParaSlug(chave),
          categoria: extrairCategoria(chave),
        },
      ];
    }

    // Se for Record<string, EntradaGlossario> (estratégias, eventos)
    if (isRecordDeEntradas(valor)) {
      return Object.entries(valor).map(([subchave, entrada]) => ({
        ...entrada,
        slug: chaveParaSlug(`${chave}_${subchave}`),
        categoria: extrairCategoria(chave),
      }));
    }

    return [];
  })
  .sort((a, b) => a.termo.localeCompare(b.termo, "pt-BR"));

// ---- Busca de Termos ----

/**
 * Busca termos por query em termo ou explicação.
 * Retorna todos os termos se query estiver vazia.
 */
export function buscarTermos(query: string): TermoGlossarioNavegavel[] {
  const queryNormalizada = query
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, ""); // Remove acentos

  if (!queryNormalizada) return TODOS_TERMOS;

  return TODOS_TERMOS.filter((termo) => {
    const termoNormalizado = termo.termo
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");

    const explicacaoNormalizada = termo.explicacao
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");

    return (
      termoNormalizado.includes(queryNormalizada) ||
      explicacaoNormalizada.includes(queryNormalizada)
    );
  });
}

// ---- Agrupamento Alfabético ----

/**
 * Agrupa termos pela letra inicial (A-Z).
 * Útil para navegação alfabética no glossário.
 */
export function agruparPorLetra(): Map<string, TermoGlossarioNavegavel[]> {
  const mapa = new Map<string, TermoGlossarioNavegavel[]>();

  TODOS_TERMOS.forEach((termo) => {
    const letraInicial = termo.termo[0]?.toUpperCase() ?? "?";
    const grupo = mapa.get(letraInicial) ?? [];
    grupo.push(termo);
    mapa.set(letraInicial, grupo);
  });

  return mapa;
}

// ---- Agrupamento por Categoria ----

/**
 * Agrupa termos por categoria semântica.
 */
export function agruparPorCategoria(): Map<string, TermoGlossarioNavegavel[]> {
  const mapa = new Map<string, TermoGlossarioNavegavel[]>();

  TODOS_TERMOS.forEach((termo) => {
    const grupo = mapa.get(termo.categoria) ?? [];
    grupo.push(termo);
    mapa.set(termo.categoria, grupo);
  });

  // Ordenar categorias por relevância
  const categoriasOrdenadas = [
    "patrimonio",
    "rentabilidade",
    "alocacao",
    "benchmarks",
    "estrategias",
    "eventos-financeiros",
    "risco",
    "liquidez",
    "mercado",
    "periodos",
    "geral",
  ];

  const mapaOrdenado = new Map<string, TermoGlossarioNavegavel[]>();
  categoriasOrdenadas.forEach((categoria) => {
    const termos = mapa.get(categoria);
    if (termos) {
      mapaOrdenado.set(categoria, termos);
    }
  });

  return mapaOrdenado;
}

// ---- Busca por Slug ----

/**
 * Busca um termo específico pelo slug.
 * Útil para deep linking: /aprender/glossario#slug
 */
export function buscarTermoPorSlug(slug: string): TermoGlossarioNavegavel | undefined {
  return TODOS_TERMOS.find((termo) => termo.slug === slug);
}

// ---- Estatísticas ----

export const ESTATISTICAS_GLOSSARIO = {
  totalTermos: TODOS_TERMOS.length,
  totalCategorias: new Set(TODOS_TERMOS.map((t) => t.categoria)).size,
  totalLetras: new Set(TODOS_TERMOS.map((t) => t.termo[0]?.toUpperCase())).size,
} as const;

// ---- Nomes Amigáveis de Categorias ----

export const NOMES_CATEGORIAS: Record<string, string> = {
  patrimonio: "Patrimônio e Saldo",
  rentabilidade: "Rentabilidade e Ganhos",
  alocacao: "Alocação de Ativos",
  benchmarks: "Benchmarks e Índices",
  estrategias: "Estratégias de Investimento",
  "eventos-financeiros": "Eventos Financeiros",
  risco: "Risco e Volatilidade",
  liquidez: "Liquidez",
  mercado: "Mercado e Tendências",
  periodos: "Períodos de Análise",
  geral: "Geral",
};
