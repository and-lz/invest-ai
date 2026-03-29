# Plan: Dashboard Grid Layout Review

**Context**: [dashboard-grid-review-context.md](./dashboard-grid-review-context.md)

## Proposed Layout

```
Headline (full width)
─── Resumo ───
[SummaryCards] 4-col grid                          ← unchanged
[WealthEvolution] full width                       ← unchanged

─── Análise ───
[RiskConsistency]  [AssetAllocation]  2-col         ← was 3-col, now paired (similar height)
[BenchmarkComparison] full width                    ← was crammed in 3-col, now full width
[Heatmap] full width                                ← unchanged
[AllocEvolution] [CatPerformance] 2-col             ← unchanged
[PeriodComparison] [LiquidityLadder] 2-col          ← unchanged

─── Destaques ───
[TopPerformers ↑] [TopPerformers ↓] 2-col          ← unchanged
[StrategyGains] [FinancialEvents] 2-col             ← unchanged
```

**Key change**: The 3-col Análise grid becomes 2-col (Risk + Allocation) + full-width Benchmark. This gives:
- Pie chart (AssetAllocation) gets 50% width instead of 33% — aspect-square renders properly
- Risk card pairs with Allocation — both are ~350-450px height, visually balanced
- Bar chart (Benchmark) gets full width — 4-series comparison is much more readable
- Masonry removed entirely — all grids use standard CSS grid with row alignment

## Steps

### Step 1: Remove masonry CSS and update design system tokens
**Files**: `src/app/globals.css` (modify), `src/lib/design-system.ts` (modify)
**Changes**:
- Remove the `/* ─── Masonry Grid ─── */` block from globals.css (lines 600-612)
- Remove `grid-lanes` from all layout tokens in design-system.ts (gridCards, gridContent, gridCharts)
**Verify**: `tsc --noEmit` passes, no CSS errors

### Step 2: Fix dashboard page grid layout
**Files**: `src/app/(dashboard)/page.tsx` (modify)
**Changes**:
- Remove `grid-lanes` from all hardcoded grid classes
- Break the 3-col Análise grid into: 2-col (Risk + Allocation) + full-width Benchmark
- Update skeleton to match new structure
**Verify**: `tsc --noEmit` passes, visual check in browser

## New Files
None.

## Verification Plan
- Build: `./node_modules/.bin/tsc --noEmit` → succeeds
- Tests: `npm run test` → all pass
- Lint: `npm run lint` → passes
- Manual: Open dashboard in browser → Análise section shows Risk+Allocation side by side, Benchmark full width below. No masonry gaps anywhere.

## Risks
- (Low) Other components using `layout.gridCards/gridContent/gridCharts` will lose `grid-lanes` — but masonry was never visually active in those either (summary-cards, asset-summary-cards, glossary-content)
