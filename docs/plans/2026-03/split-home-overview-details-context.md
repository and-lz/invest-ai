# Context: Split Home into Overview + Collapsible Details

## Requirements

### Goal
Split the dashboard home page into two visual sections:
1. **Overview** — Summary cards styled bigger/more prominent, with the most important at-a-glance info
2. **Details** — All analytical and granular cards, wrapped in a collapsible section (collapsed by default)

This reduces cognitive overload for casual users (Camila persona) while keeping full analysis accessible for power users (Marcos persona).

### Acceptance Criteria
- [ ] Overview section shows: DashboardHeadline, SummaryCards (bigger styling), WealthEvolutionChart
- [ ] Details section shows: all remaining cards (RiskConsistency, AssetAllocation, Benchmark, Heatmap, AllocationEvolution, CategoryPerformance, PeriodComparison, LiquidityLadder, TopPerformers, StrategyGains, FinancialEvents)
- [ ] Details section uses Radix Collapsible, starts **collapsed** by default
- [ ] Collapsible trigger shows a clear label (e.g., "Análise detalhada") with ChevronDown that rotates on open
- [ ] Collapse state persists across page navigations (localStorage)
- [ ] Existing `data-chat-highlight` attributes continue to work (highlights auto-expand the details section if target is inside it)
- [ ] Loading skeleton reflects the new two-section layout
- [ ] Empty state unchanged

### Out of Scope
- Changing the summary cards' internal layout or data
- Adding new cards or removing existing ones
- Changing the order of cards within the details section
- Mobile-specific layout changes beyond what responsive grid already handles

### Edge Cases
- Chat highlight targets a card inside collapsed details → auto-expand details section first, then scroll+highlight
- User has localStorage disabled → default to collapsed, no error
- First-time visitor → collapsed by default (overview-first experience)

## Q&A Record
- Q: What does "big overview" mean? → A: Same 4 summary cards but styled larger/more prominent, then separate section for detail cards
- Q: Hidden by default? → A: Collapsible section, starts collapsed
- Q: Card grouping? → A: Use best judgment based on information density

## Codebase Analysis

### Existing Patterns to Follow

**Collapsible component** — `src/components/ui/collapsible.tsx` — Radix UI wrapper, already used in:
- `src/components/ui/takeaway-box.tsx` — individual item collapsible with lazy loading
- `src/components/desempenho/portfolio-assets-grid.tsx:~L180` — group-level collapsible with ChevronDown rotation via `[&[data-state=open]>svg]:rotate-180`

**SectionLabel pattern** — `src/app/(dashboard)/page.tsx:130-139` — existing divider component used for "Resumo", "Análise", "Destaques" sections. The collapsible trigger should integrate with or replace SectionLabel.

**Design system tokens** — `src/lib/design-system.ts` — must use `typography.*`, `icon.*`, `layout.*` constants

**Chat highlight system** — `src/lib/chat-highlight.ts` — uses `data-chat-highlight` attributes + `destacarElemento()` function. Cards inside details section have these attributes.

### Reusable Code Found
- `Collapsible`, `CollapsibleTrigger`, `CollapsibleContent` at `src/components/ui/collapsible.tsx` — direct reuse
- `SectionLabel` at `src/app/(dashboard)/page.tsx:130` — extend or compose with collapsible trigger
- ChevronDown rotation pattern at `src/components/desempenho/portfolio-assets-grid.tsx` — reuse CSS pattern `[&[data-state=open]>svg]:rotate-180`

### Affected Files
- `src/app/(dashboard)/page.tsx` (modify) — Main restructure: wrap details section in Collapsible, adjust SectionLabel for trigger, update skeleton
- `src/lib/chat-highlight.ts` (modify) — `destacarElemento()` must auto-expand collapsible if target is inside collapsed content

### Risks
- Chat highlight breaking (Med) — Mitigation: auto-expand logic + test with highlight identifiers
- Layout shift on expand/collapse (Low) — Mitigation: CSS transition on CollapsibleContent
