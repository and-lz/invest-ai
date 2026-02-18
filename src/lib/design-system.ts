/**
 * Design System Constants
 *
 * Single source of truth for visual patterns across the app.
 * Use these constants instead of hardcoded Tailwind classes to ensure
 * visual consistency and enable global changes.
 *
 * Usage: import { ds } from "@/lib/design-system";
 *        <h1 className={ds.typography.h1}>Title</h1>
 *        <Icon className={ds.icon.cardTitle} />
 */

// ─── Typography ─────────────────────────────────────────────────
// All text uses system-ui font stack for maximum performance
// NEVER use font-bold on text-sm or smaller
// NEVER use font-medium on text-xs (helper text)

export const typography = {
  /** H1 — Page titles. Ex: "Dashboard", "Insights" */
  h1: "text-2xl font-bold tracking-tight",

  /** H1 large — Article titles (3xl) */
  h1Large: "text-3xl font-bold tracking-tight",

  /** H2 — Section titles, page headers. Ex: "Reports", "Import" */
  h2: "text-xl font-semibold tracking-tight",

  /** H3 — Card titles (CardTitle). Ex: "Total Wealth" */
  h3: "text-lg font-semibold",

  /** Main value — Highlight numbers in summary cards. Ex: "R$ 42.000", "3.4%" */
  mainValue: "text-2xl font-bold",

  /** Label — Labels, nav links, buttons, table headers */
  label: "text-sm font-medium",

  /** Body — Card descriptions, paragraphs, table content */
  body: "text-sm",

  /** Helper — Tooltips, timestamps, hints, footnotes */
  helper: "text-xs text-muted-foreground",

  /** Mono — Code, technical error messages, JSON */
  mono: "text-xs font-mono",

  /** Mono medium — Larger code blocks */
  monoMedium: "text-sm font-mono",
} as const;

// ─── Icons ──────────────────────────────────────────────────────
// Standardize sizes by context to avoid visual inconsistencies

export const icon = {
  /** Icon in card title (CardHeader). Ex: DollarSign, TrendingUp */
  cardTitle: "h-5 w-5",

  /** Page header icon. Ex: FileText, BookMarked */
  pageTitle: "h-6 w-6",

  /** Inline icon in button, input, badge */
  button: "h-4 w-4",

  /** Micro icon — small indicators, badges, chart legends */
  micro: "h-3.5 w-3.5",

  /** Tiny icon — chart swatches, bullet points (non-interactive) */
  tiny: "h-3 w-3",

  /** Empty state icon — centered, large */
  emptyState: "h-12 w-12 text-muted-foreground",

  /** Small loading icon — inline in buttons */
  loadingSmall: "h-4 w-4 animate-spin",

  /** Medium loading icon — card/section loading states */
  loadingMedium: "h-8 w-8 animate-spin",

  /** Large loading icon — full page loading states */
  loadingLarge: "h-12 w-12 animate-spin",
} as const;

// ─── Dialog ─────────────────────────────────────────────────────
// All native dialogs must use these backdrop classes

export const dialog = {
  /** Backdrop for native <dialog>. Uses semantic --background at 40% opacity. */
  backdrop: "backdrop:bg-background/40",
  /** Centered modal animation (scale + fade). Use with translate(-50%,-50%) positioning. */
  centered: "dialog-centered",
  /** Right-side drawer animation (slide from right). */
  drawerRight: "dialog-drawer-right",
  /** Left-side drawer animation (slide from left). */
  drawerLeft: "dialog-drawer-left",
  /** Fullscreen dialog animation (fade). */
  fullscreen: "dialog-fullscreen",
} as const;

// ─── Layout ─────────────────────────────────────────────────────
// Recurring spacing and grid patterns

export const layout = {
  /** Vertical spacing between page sections */
  pageSpacing: "space-y-6",

  /** Vertical spacing within sections */
  sectionSpacing: "space-y-4",

  /** Summary cards grid — 1 col → 2 col → 4 col */
  gridCards: "grid gap-4 md:grid-cols-2 lg:grid-cols-4",

  /** Content grid — 1 col → 2 col → 3 col */
  gridContent: "grid gap-4 md:grid-cols-2 lg:grid-cols-3",

  /** Charts grid — 1 col → 2 col (wide layouts) */
  gridCharts: "grid gap-6 lg:grid-cols-2",

  /** Empty state layout — centered flex */
  emptyState: "flex flex-col items-center justify-center gap-3 p-6",

  /** Empty state in card — with extra padding */
  emptyStateCard: "flex flex-col items-center gap-4 py-12",

  /** Page header — flex with icon + title */
  pageHeader: "flex items-center gap-3",

  /** Default CardContent padding */
  cardContent: "space-y-4 p-6",

  /** Card title row — flex row with icon + title + tooltip */
  cardTitleRow: "flex items-center gap-1",
} as const;

// ─── Interaction ────────────────────────────────────────────────
// Reusable hover/focus/active state patterns

export const interaction = {
  /** Hoverable card — subtle border + shadow on hover */
  cardHover: "transition-all duration-200 hover:border-primary/30 hover:shadow-md",

  /** Hover reveal — hidden element that appears on group hover */
  hoverReveal: "opacity-0 transition-opacity group-hover:opacity-100",
} as const;

// ─── Semantic color utilities ───────────────────────────────────
// Helper functions to avoid repeated ternaries across the codebase

/**
 * Returns semantic color class based on positive/negative value.
 * Usage: <span className={valueColor(profitability)}>
 */
export function valueColor(value: number | null): string {
  if (value === null) return "";
  return value >= 0 ? "text-success" : "text-destructive";
}

/**
 * Returns color class for trend icon.
 * Usage: <TrendingUp className={cn(icon.cardTitle, trendIconColor(value))} />
 */
export function trendIconColor(value: number | null): string {
  if (value === null) return "text-muted-foreground";
  return value >= 0 ? "text-success" : "text-destructive";
}

/**
 * Returns semantic badge classes (bg + text + border).
 * Usage: <Badge className={badgeColor("success")}>
 */
export function badgeColor(
  type: "success" | "destructive" | "warning",
): string {
  const map = {
    success: "bg-success/10 text-success border-success/30",
    destructive: "bg-destructive/10 text-destructive border-destructive/30",
    warning: "bg-warning/10 text-warning border-warning/30",
  } as const;
  return map[type];
}

// ─── Aggregate object (shortcut) ────────────────────────────────
// import { ds } from "@/lib/design-system";
// <h1 className={ds.typography.h1}>

export const ds = {
  typography,
  icon,
  dialog,
  layout,
  interaction,
  valueColor,
  trendIconColor,
  badgeColor,
} as const;
