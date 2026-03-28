# Fix Insights PeriodSelector Crash

## Context
`PeriodSelector` crashes when `periodoSelecionado` is `""` because it calls `formatarMesAno("")` which throws.
The insights page initializes `periodoSelecionado` as `""` (line 341 of `src/app/insights/page.tsx`).

## Plan
1. In `PeriodSelector`, add a guard for empty/invalid `periodoSelecionado` — show "Selecionar período" as fallback label.

## Verification
- Visit `/insights` with reports available — no console error
- Period selector shows "Selecionar período" initially, updates after selection
