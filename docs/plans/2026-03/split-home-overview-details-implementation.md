# Implementation: Split Home into Overview + Collapsible Details

**Context**: [split-home-overview-details-context.md](./split-home-overview-details-context.md)
**Plan**: [split-home-overview-details-plan.md](./split-home-overview-details-plan.md)
**Status**: Complete

## Deviations
- Step 2 (make summary cards bigger) was skipped as planned — visual prominence comes naturally from being the only visible content when details are collapsed.
- `CollapsibleSectionLabel` doesn't need `open` prop — removed after lint caught it as unused. The `[data-state]` attribute from Radix handles the chevron rotation automatically.

## Verification Results
- Build: Pass (tsc --noEmit clean)
- Lint: Pass (0 errors, 0 warnings)
- Tests: Pass (714/714)
- Manual: Pending user visual check

## Acceptance Criteria
- [x] Overview section shows: DashboardHeadline, SummaryCards, WealthEvolutionChart — verified by reading page.tsx
- [x] Details section shows all remaining cards — verified by reading page.tsx
- [x] Details section uses Radix Collapsible, starts collapsed by default — verified by useState default `false`
- [x] Collapsible trigger shows "Análise detalhada" with ChevronDown that rotates — verified by CollapsibleSectionLabel component
- [x] Collapse state persists via localStorage — verified by useDetailsOpen hook
- [x] Chat highlight auto-expands details if target is inside — verified by custom event dispatch in destacarElemento + listener in useDetailsOpen
- [x] Loading skeleton reflects overview-only layout — verified by simplified DashboardSkeleton
- [x] Empty state unchanged — no modifications to EstadoVazio
