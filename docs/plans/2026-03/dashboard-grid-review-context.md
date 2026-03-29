# Context: Dashboard Grid Layout Review

## Requirements

### Goal
The masonry grid layout (`grid-lanes`) was added but makes the dashboard look bad. Review every grid section and adjust the layout so each card gets the right amount of space for its content type. Remove masonry where it hurts visual alignment.

### Acceptance Criteria
- [ ] Each grid section uses column sizes appropriate for its content
- [ ] Paired cards (same row) have visually consistent heights — no awkward gaps
- [ ] Charts get enough width to be readable; tables get enough width for their columns
- [ ] The 3-col Análise grid is fixed (currently the worst offender)
- [ ] Design system tokens (`layout.*`) match what the page actually uses
- [ ] Skeleton loading state matches the real layout structure

### Out of Scope
- Changing card internal content or styling
- Adding/removing dashboard cards
- Changing the section order (Resumo → Análise → Destaques)
- Responsive mobile layout (only reviewing md+ breakpoints)

### Edge Cases
- Cards with 0 data items (empty states) should still look OK in the grid
- Variable-height tables (TopPerformers can have 5-10 rows) should not break alignment

## Q&A Record
- Q: What specifically looks bad? → A: All of the above — uneven heights, wrong column distribution, overall flow
- Q: Is this only for the user? → A: Yes, single user — experimental CSS is OK

## Codebase Analysis

### Existing Patterns to Follow
- Design system tokens in `src/lib/design-system.ts:108-115` — `gridCards`, `gridContent`, `gridCharts`
- `SectionLabel` component at `page.tsx:130` for section dividers
- Chart components use responsive fixed heights: `h-52 sm:h-64 lg:h-75`
- Table components have no fixed height — they grow with data

### Current Layout (what's wrong)

```
Headline (full width)
─── Resumo ───
[SummaryCards] 4-col grid                    ← OK
[WealthEvolution] full width                 ← OK

─── Análise ───
[Risk] [Allocation] [Benchmark] 3-col grid   ← BAD: pie chart cramped at 1/3 width,
                                                risk card height doesn't match charts
[Heatmap] full width                         ← OK
[AllocEvolution] [CatPerformance] 2-col      ← OK (both charts, similar height)
[PeriodComparison] [LiquidityLadder] 2-col   ← MEDIOCRE: table vs chart, height mismatch

─── Destaques ───
[TopPerformers ↑] [TopPerformers ↓] 2-col   ← OK (same component, same height)
[StrategyGains] [FinancialEvents] 2-col      ← OK (both tables, similar height)
```

### Card Height Analysis

| Component | Type | Height Behavior | Notes |
|-----------|------|-----------------|-------|
| SummaryCards | Numbers | ~130px fixed | 4 small metric cards |
| WealthEvolution | Area chart | h-52/h-64/h-75 fixed | + header + takeaway |
| RiskConsistency | Mixed | Variable (~350-450px) | Circle chart + progress + stats + takeaway |
| AssetAllocation | Pie chart | aspect-square max-h-75 | + legend grid below |
| BenchmarkComparison | Bar chart | h-52/h-64/h-75 fixed | + legend + takeaway |
| MonthlyReturnsHeatmap | Table | Variable (rows × years) | Full width needed (14 cols) |
| AllocationEvolution | Stacked area | h-52/h-64/h-75 fixed | + legend |
| CategoryPerformance | Horiz bar | h-48/h-64 fixed | + takeaway |
| PeriodComparison | Table | Variable (~300-400px) | 5 columns, 5-7 rows |
| LiquidityLadder | Horiz bar | h-48/h-64 fixed | + takeaway |
| TopPerformers | Table | Variable | 5 cols, 5-10 rows |
| StrategyGains | Table | Variable | 5 cols, 6-7 rows |
| FinancialEvents | Table | Variable | 4 cols, 0-N rows |

### Why Masonry Hurts This Dashboard
Masonry (`grid-template-rows: masonry` / `display: grid-lanes`) removes row alignment — each card takes its natural height. This is great for Pinterest-style layouts with many small cards, but **bad for a dashboard** where:
1. Paired charts should visually match heights (side-by-side comparison)
2. Tables in the same row should align for scanability
3. The 3-col grid has 3 fundamentally different content types with different heights

### Reusable Code Found
- `layout.gridCards` — 4-col summary grid (already used by SummaryCards component)
- `layout.gridCharts` — 2-col chart grid
- `layout.gridContent` — 3-col content grid
- All currently include `grid-lanes` class which should be removed

### Affected Files
- `src/app/(dashboard)/page.tsx` (modify) — Grid class changes, possible card regrouping
- `src/lib/design-system.ts` (modify) — Remove `grid-lanes` from layout tokens
- `src/app/globals.css` (modify) — Remove masonry CSS rules

### Risks
- (Low) Changing grid columns could affect mobile layout — but mobile is single column anyway
- (Low) Design system token changes could affect other pages using `layout.gridCharts` etc — need to grep for usage
