# Plan: Split Home into Overview + Collapsible Details

## Context
The dashboard home page currently renders all cards in a single long scroll. This change splits it into two sections: a prominent **Overview** (always visible) and a **Details** section (collapsible, collapsed by default). This reduces cognitive overload for casual users while keeping full analysis accessible.

## Card Grouping

### Overview (always visible)
1. DashboardHeadline
2. SummaryCards (same 4 cards, bigger styling via increased padding/font)
3. WealthEvolutionChart (the single most important trend)

### Details (collapsible, collapsed by default)
Everything under current "Análise" and "Destaques" sections:
- RiskConsistencyCard + AssetAllocationChart (2-col grid)
- BenchmarkComparisonChart
- MonthlyReturnsHeatmap
- AllocationEvolutionChart + CategoryPerformanceChart (2-col grid)
- PeriodComparisonDetail + LiquidityLadder (2-col grid)
- TopPerformersTable (best) + TopPerformersTable (worst) (2-col grid)
- StrategyGainsTable + FinancialEventsList (2-col grid)
- Action buttons (Ver posições, Ver movimentações)

**Rationale:** Overview = "how much do I have and how is it trending?" Details = "deep analysis and breakdowns."

## Implementation Steps

### Step 1: Add collapsible details section to dashboard page
**File:** `src/app/(dashboard)/page.tsx`

- Import `Collapsible`, `CollapsibleTrigger`, `CollapsibleContent` from `@/components/ui/collapsible`
- Import `ChevronDown` from lucide-react
- Add `useState` for `detailsOpen` initialized from `localStorage.getItem("dashboard-details-open") === "true"` (default `false`)
- Add `useEffect` to persist state to `localStorage` on change
- Create a new `CollapsibleSectionLabel` component (inline in same file) that combines `SectionLabel` visual with `CollapsibleTrigger`:
  ```
  [line] Análise detalhada [chevron]
  ```
  - ChevronDown rotates 180° when open (reuse `[&[data-state=open]>svg]:rotate-180` pattern)
  - `cursor-pointer` on the trigger
- Wrap all cards after WealthEvolutionChart in `<Collapsible open={detailsOpen} onOpenChange={setDetailsOpen}>`
- Remove the separate "Análise" and "Destaques" SectionLabels (merged into single collapsible trigger)
- Keep "Resumo" SectionLabel as-is for the overview

### Step 2: Make summary cards more prominent
**File:** `src/app/(dashboard)/page.tsx`

- Add a wrapper `div` around `SummaryCards` with slightly larger scale or just rely on the visual separation (the overview being the only visible content makes them naturally prominent)
- Actually: keep SummaryCards as-is. The visual prominence comes from them being the main content when details are collapsed. No style changes needed — the collapsible section handles the hierarchy.

### Step 3: Update chat highlight to auto-expand details
**File:** `src/lib/chat-highlight.ts`

- Before querying the element, check if it exists in DOM
- If not found or inside a `[data-state="closed"]` Collapsible, dispatch a custom event `dashboard-expand-details`
- In `page.tsx`, listen for this event and set `detailsOpen(true)`
- After expanding, use `requestAnimationFrame` or small timeout to re-query and highlight

Updated `destacarElemento()`:
```typescript
export function destacarElemento(seletor: string, duracao: number = 3000): void {
  if (typeof window === "undefined") return;

  const elemento = document.querySelector(`[data-chat-highlight="${seletor}"]`);

  if (!elemento) {
    // Element might be inside collapsed section — request expand
    window.dispatchEvent(new CustomEvent("dashboard-expand-details"));
    // Retry after expansion animation
    setTimeout(() => {
      const retryElemento = document.querySelector(`[data-chat-highlight="${seletor}"]`);
      if (!retryElemento) {
        console.warn(`[Chat Highlight] Elemento nao encontrado: ${seletor}`);
        return;
      }
      retryElemento.classList.add("chat-highlight-active");
      retryElemento.scrollIntoView({ behavior: "smooth", block: "center" });
      setTimeout(() => retryElemento.classList.remove("chat-highlight-active"), duracao);
    }, 300);
    return;
  }

  elemento.classList.add("chat-highlight-active");
  elemento.scrollIntoView({ behavior: "smooth", block: "center" });
  setTimeout(() => elemento.classList.remove("chat-highlight-active"), duracao);
}
```

### Step 4: Update loading skeleton
**File:** `src/app/(dashboard)/page.tsx`

- `DashboardSkeleton` should only show overview skeleton (4 summary cards + 1 chart skeleton)
- Remove the 2-col chart skeleton rows from the skeleton (they'll be hidden anyway)

## Files Changed
| File | Change |
|------|--------|
| `src/app/(dashboard)/page.tsx` | Main restructure: collapsible wrapper, localStorage persistence, CollapsibleSectionLabel, simplified skeleton |
| `src/lib/chat-highlight.ts` | Auto-expand collapsed section before highlighting |

## Verification
1. `npx tsc --noEmit` — no type errors
2. `npm run lint` — no lint errors
3. Visual check: page loads with overview only, details collapsed
4. Click "Análise detalhada" chevron → details expand, chevron rotates
5. Refresh page → collapse state persisted from localStorage
6. Test chat highlight on a detail card (e.g., benchmark) → details auto-expand + card highlights
7. Empty state and loading skeleton render correctly
