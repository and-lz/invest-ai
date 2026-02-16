/**
 * Design System Constants
 *
 * Fonte única de verdade para padrões visuais do app.
 * Usar estas constantes em vez de classes Tailwind hardcoded garante
 * consistência visual e facilita alterações globais.
 *
 * Uso: import { ds } from "@/lib/design-system";
 *      <h1 className={ds.tipografia.h1}>Título</h1>
 *      <Icon className={ds.icone.tituloCard} />
 */

// ─── Tipografia ──────────────────────────────────────────────────
// Regras: headings usam Inter (font-heading), body usa Geist Sans (default)
// NUNCA usar font-bold em text-sm ou menor
// NUNCA usar font-medium em text-xs (helper text)

export const tipografia = {
  /** H1 — Títulos de página. Ex: "Dashboard", "Insights" */
  h1: "font-heading text-2xl font-bold tracking-tight",

  /** H1 grande — Títulos de artigo (3xl) */
  h1Grande: "font-heading text-3xl font-bold tracking-tight",

  /** H2 — Títulos de seção, headers de página. Ex: "Relatórios", "Importar" */
  h2: "font-heading text-xl font-semibold tracking-tight",

  /** H3 — Títulos de card (CardTitle). Ex: "Patrimônio Total" */
  h3: "text-lg font-semibold",

  /** Rótulo — Labels, nav links, botões, table headers */
  rotulo: "text-sm font-medium",

  /** Corpo — Descrições de card, parágrafos, conteúdo de tabela */
  corpo: "text-sm",

  /** Auxiliar — Tooltips, timestamps, hints, footnotes */
  auxiliar: "text-xs text-muted-foreground",

  /** Mono — Código, mensagens de erro técnicas, JSON */
  mono: "text-xs font-mono",

  /** Mono médio — Blocos de código maiores */
  monoMedio: "text-sm font-mono",
} as const;

// ─── Ícones ──────────────────────────────────────────────────────
// Padronizar tamanhos por contexto evita inconsistências visuais

export const icone = {
  /** Ícone em título de card (CardHeader). Ex: DollarSign, TrendingUp */
  tituloCard: "h-5 w-5",

  /** Ícone de cabeçalho de página. Ex: FileText, BookMarked */
  tituloPagina: "h-6 w-6",

  /** Ícone inline em botão, input, badge */
  botao: "h-4 w-4",

  /** Ícone micro — indicadores pequenos, badges */
  micro: "h-3.5 w-3.5",

  /** Ícone de estado vazio — centralizado, grande */
  estadoVazio: "h-12 w-12 text-muted-foreground",

  /** Ícone de loading pequeno — inline em botões */
  carregandoPequeno: "h-4 w-4 animate-spin",

  /** Ícone de loading grande — estados de carregamento de página */
  carregandoGrande: "h-8 w-8 animate-spin",
} as const;

// ─── Dialog ──────────────────────────────────────────────────────
// Todos os dialogs nativos devem usar estas classes de backdrop

export const dialog = {
  /** Backdrop padrão com blur. Aplicar no elemento <dialog> */
  backdrop: "backdrop:bg-background/80 backdrop:backdrop-blur-sm",
} as const;

// ─── Layout ──────────────────────────────────────────────────────
// Padrões de espaçamento e grid recorrentes

export const layout = {
  /** Espaçamento vertical entre seções de página */
  espacamentoPagina: "space-y-6",

  /** Espaçamento vertical dentro de seções */
  espacamentoSecao: "space-y-4",

  /** Grid de summary cards — 1 col → 2 col → 4 col */
  gridCards: "grid gap-4 md:grid-cols-2 lg:grid-cols-4",

  /** Grid de conteúdo — 1 col → 2 col → 3 col */
  gridConteudo: "grid gap-4 md:grid-cols-2 lg:grid-cols-3",

  /** Grid de charts — 1 col → 2 col (layouts largos) */
  gridCharts: "grid gap-6 lg:grid-cols-2",

  /** Layout de estado vazio — flex centralizado */
  estadoVazio: "flex flex-col items-center justify-center gap-3 p-6",

  /** Layout de estado vazio em card — com mais padding */
  estadoVazioCard: "flex flex-col items-center gap-4 py-12",

  /** Header de página — flex com ícone + título */
  headerPagina: "flex items-center gap-3",
} as const;

// ─── Utilitários de cor semântica ────────────────────────────────
// Funções helper para evitar ternários repetidos em todo o codebase

/**
 * Retorna a classe de cor semântica baseada em valor positivo/negativo.
 * Uso: <span className={corValor(rentabilidade)}>
 */
export function corValor(valor: number | null): string {
  if (valor === null) return "";
  return valor >= 0 ? "text-success" : "text-destructive";
}

/**
 * Retorna a classe de cor para ícone de tendência.
 * Uso: <TrendingUp className={cn(ds.icone.tituloCard, corIconeTendencia(valor))} />
 */
export function corIconeTendencia(valor: number | null): string {
  if (valor === null) return "text-muted-foreground";
  return valor >= 0 ? "text-success" : "text-destructive";
}

/**
 * Retorna classes de badge semântico (bg + text + border).
 * Uso: <Badge className={corBadge("success")}>
 */
export function corBadge(tipo: "success" | "destructive" | "warning"): string {
  const mapa = {
    success: "bg-success/10 text-success border-success/30",
    destructive: "bg-destructive/10 text-destructive border-destructive/30",
    warning: "bg-warning/10 text-warning border-warning/30",
  } as const;
  return mapa[tipo];
}

// ─── Objeto agregado (atalho) ────────────────────────────────────
// import { ds } from "@/lib/design-system";
// <h1 className={ds.tipografia.h1}>

export const ds = {
  tipografia,
  icone,
  dialog,
  layout,
  corValor,
  corIconeTendencia,
  corBadge,
} as const;
