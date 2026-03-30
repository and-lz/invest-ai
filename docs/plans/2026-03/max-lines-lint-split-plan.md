# Plan: Max 300 Lines Per File — Lint Rule + Split Oversized Files

**Context**: [max-lines-lint-split-context.md](./max-lines-lint-split-context.md)

Use the maximum agents parallelism.

## Steps

### Step 0: Add ESLint `max-lines` rule
**Files**: `eslint.config.mjs` (modify)
**Changes**:
- Add `max-lines` rule set to `["warn", { max: 300, skipBlankLines: true, skipComments: true }]`
- Add override block exempting: `__tests__/**`, `src/lib/schema.ts`, `src/components/ui/chart.tsx`, `drizzle/**`
**Verify**: `npm run lint` — should show warnings for the 14 files to split (schema.ts and chart.tsx exempt)

---

### Step 1: Split `serialize-report-markdown.ts` (413 → ~200 + ~120 + ~100)
**Files**: `src/lib/serialize-report-markdown.ts` (modify), 2 new files (create)
**Changes**:
- Create `src/lib/report-formatters.ts` — extract `formatarDinheiro`, `formatarDinheiroCompacto`, `formatarPercent`, `MESES_ABREVIADOS`
- Create `src/lib/report-sections.ts` — extract section serializers (`serializarResumo` through `serializarMovimentacoesAgregadas`, ~14 functions)
- Keep orchestrators (`serializarRelatorioMarkdown`, `serializarRelatoriosConsolidadoMarkdown`) + `serializarMetadados` in original file, importing from the two new modules
**Verify**: `npm run test -- serializar-relatorio` passes; `npm run lint` — this file no longer warns

### Step 2: Split `serialize-chat-context.ts` (518 → ~200 + ~130 + ~100 + ~90)
**Files**: `src/lib/serialize-chat-context.ts` (modify), 3 new files (create)
**Changes**:
- Create `src/lib/serialize-insights-context.ts` — extract `serializarContextoInsights` (~45 lines)
- Create `src/lib/serialize-market-context.ts` — extract `serializarContextoTendencias` (~60 lines)
- Create `src/lib/serialize-asset-context.ts` — extract `serializarContextoDesempenho` (~65 lines)
- Keep `serializarContextoDashboard` + `serializarContextoCompletoUsuario` + `truncar` in original
**Verify**: `npm run test -- serialize-chat-context` passes

### Step 3: Split `financial-glossary.ts` (497 → ~170 + ~170 + ~170)
**Files**: `src/lib/financial-glossary.ts` (modify), 2 new files (create)
**Changes**:
- Create `src/lib/glossary-dashboard.ts` — summary cards, wealth evolution, asset allocation, benchmarks, top performers, strategy gains, financial events, monthly returns (~250 lines of entries → grouped into one file)
- Create `src/lib/glossary-features.ts` — risk/consistency, liquidity, all positions, category performance, movements, allocation evolution, period comparison, market trends (~250 lines)
- Keep `src/lib/financial-glossary.ts` as barrel re-export of both + `EntradaGlossario` type
**Verify**: `npm run test -- glossario` passes; all imports still resolve

### Step 4: Split `use-chat-assistant.ts` (449 → ~250 + ~100 + ~100)
**Files**: `src/hooks/use-chat-assistant.ts` (modify), 2 new files (create)
**Changes**:
- Create `src/lib/chat-stream-utils.ts` — extract `parseReasoningStream`, `processarHighlights`, `gerarTituloInteligente` (pure functions, ~80 lines)
- Create `src/lib/chat-persistence.ts` — extract `salvarConversaAutomaticamente` (~55 lines)
- Hook remains as orchestrator importing these utilities
**Verify**: `npm run build` succeeds; chat functionality works

### Step 5: Split `insights/page.tsx` (718 → ~250 + ~250 + ~120 + ~100)
**Files**: `src/app/insights/page.tsx` (modify), 3 new files (create)
**Changes**:
- Create `src/components/insights/insight-card.tsx` — extract `InsightCard` component + its handlers (~240 lines)
- Create `src/lib/insights-constants.ts` — extract `ICONES_CATEGORIA`, `CORES_PRIORIDADE`, `LABELS_CATEGORIA`, `INSIGHT_TO_CONCLUSAO`, `formatarMesReferenciaSeguro` (~50 lines)
- Create `src/hooks/use-insights-page.ts` — extract page state management + API calls (~150 lines)
- Page becomes thin shell importing these
**Verify**: `npm run build` succeeds; `npm run lint` — insights page no longer warns

### Step 6: Split `activity-center.tsx` (431 → ~200 + ~70 + ~100 + ~60)
**Files**: `src/components/layout/activity-center.tsx` (modify), 3 new files (create)
**Changes**:
- Create `src/components/layout/activity-center-task-card.tsx` — extract `TaskCard` component (~60 lines)
- Create `src/components/layout/activity-center-notification-item.tsx` — extract `ItemNotificacao` component (~90 lines)
- Create `src/components/layout/activity-center-constants.ts` — extract `ICONES_TIPO`, `CORES_TIPO`, `ehAcaoDeRetry` (~20 lines)
- Main file keeps `CentralAtividades` importing sub-components
**Verify**: `npm run build` succeeds

### Step 7: Split `takeaway-box.tsx` (427 → ~200 + ~70 + ~100 + ~60)
**Files**: `src/components/ui/takeaway-box.tsx` (modify), 3 new files (create)
**Changes**:
- Create `src/components/ui/takeaway-box-types.ts` — extract types (`Conclusao`, `TipoConclusao`, `ExplanationState`, `TakeawayBoxProps`) + constants (`INDICATOR_ICONS`, `ICON_COLORS`, etc.) (~50 lines)
- Create `src/components/ui/takeaway-box-fetch.ts` — extract `fetchExplanations` async utility (~60 lines)
- Create `src/components/ui/takeaway-box-explanation.tsx` — extract the explanation expansion UI sub-component (~100 lines)
- Main component imports from these; re-exports `Conclusao` and `TipoConclusao` types
**Verify**: `npm run build` succeeds; components importing `Conclusao` type still work

### Step 8: Split `portfolio-assets-grid.tsx` (404 → ~200 + ~100 + ~100)
**Files**: `src/components/desempenho/portfolio-assets-grid.tsx` (modify), 2 new files (create)
**Changes**:
- Create `src/components/desempenho/portfolio-assets-utils.ts` — extract `calcularMediaRentabilidade`, `agruparAtivosPorPerformance`, type definitions (~100 lines)
- Create `src/components/desempenho/portfolio-assets-group.tsx` — extract collapsible asset group rendering sub-component (~100 lines)
- Main component keeps grid layout + dialog logic
**Verify**: `npm run build` succeeds

### Step 9: Split `chat-widget.tsx` (397 → ~200 + ~100 + ~100)
**Files**: `src/components/chat/chat-widget.tsx` (modify), 2 new files (create)
**Changes**:
- Create `src/components/chat/chat-header.tsx` — extract header bar sub-component (sidebar toggle, TTS, fullscreen, close buttons) (~100 lines)
- Create `src/hooks/use-chat-widget-state.ts` — extract state management (fullscreen, sidebar, TTS, localStorage persistence) (~80 lines)
- Main component imports both
**Verify**: `npm run build` succeeds

### Step 10: Split `asset-ai-analysis.tsx` (367 → ~150 + ~120 + ~100)
**Files**: `src/components/desempenho/asset-ai-analysis.tsx` (modify), 2 new files (create)
**Changes**:
- Create `src/components/desempenho/asset-ai-analysis-constants.ts` — extract `ROTULOS_RECOMENDACAO`, `CORES_RECOMENDACAO`, `ROTULOS_SEVERIDADE`, `CORES_SEVERIDADE` (~35 lines)
- Create `src/components/desempenho/asset-ai-analysis-sections.tsx` — extract bottom-half section components (fundamentals, risk factors, macro+timing) (~130 lines)
- Main component keeps header, summary, performance sections
**Verify**: `npm run build` succeeds

### Step 11: Split `(dashboard)/page.tsx` (367 → ~200 + ~100 + ~70)
**Files**: `src/app/(dashboard)/page.tsx` (modify), 2 new files (create)
**Changes**:
- Create `src/components/dashboard/dashboard-sub-components.tsx` — extract `DashboardHeadline`, `SectionLabel`, `CollapsibleSectionLabel`, `DashboardSkeleton`, `EstadoVazio` (~120 lines)
- Create `src/hooks/use-details-open.ts` — extract `useDetailsOpen` hook + `DETAILS_STORAGE_KEY` (~35 lines)
- Page imports these
**Verify**: `npm run build` succeeds

### Step 12: Split `plano-acao/page.tsx` (333 → ~180 + ~100 + ~50)
**Files**: `src/app/plano-acao/page.tsx` (modify), 2 new files (create)
**Changes**:
- Create `src/components/action-plan/action-item-card.tsx` — extract `ActionItemCard` component (~130 lines)
- Create `src/lib/action-plan-constants.ts` — extract `CONCLUSION_ICONS`, `CONCLUSION_COLORS`, `CONCLUSION_BADGE_STYLES`, `CONCLUSION_LABELS`, `ORIGIN_LABELS` (~30 lines)
- Page becomes thin shell
**Verify**: `npm run build` succeeds

### Step 13: Split `header-navigation.tsx` (329 → ~170 + ~100 + ~60)
**Files**: `src/components/layout/header-navigation.tsx` (modify), 2 new files (create)
**Changes**:
- Create `src/components/layout/header-nav-mobile.tsx` — extract mobile drawer component (~100 lines)
- Create `src/components/layout/header-nav-constants.ts` — extract nav items arrays, `AI_ONLY_ROUTES`, `TIER_ICONS`, `TIER_LABELS` (~50 lines)
- Main component keeps desktop nav + orchestration
**Verify**: `npm run build` succeeds

### Step 14: Split `all-positions-table.tsx` (309 → ~180 + ~70 + ~60)
**Files**: `src/components/dashboard/all-positions-table.tsx` (modify), 2 new files (create)
**Changes**:
- Create `src/components/dashboard/all-positions-utils.ts` — extract `obterValorColuna`, `gerarConclusaoTodasPosicoes`, types (`ColunaPosicoes`, `CabecalhoOrdenaveProps`) (~90 lines)
- Create `src/components/dashboard/all-positions-sortable-header.tsx` — extract `CabecalhoOrdenavel` component (~30 lines)
- Main component imports these
**Verify**: `npm run build` succeeds

### Step 15: Final lint + build verification
**Files**: none (verify only)
**Verify**:
- `npm run lint` — zero max-lines warnings
- `npm run build` — succeeds
- `npm run test` — all tests pass
- Spot-check: no file in `src/` exceeds 300 lines (except exempt files)

## New Files (summary)
- `src/lib/report-formatters.ts` — formatting helpers for reports
- `src/lib/report-sections.ts` — report section serializers
- `src/lib/serialize-insights-context.ts` — insights chat context
- `src/lib/serialize-market-context.ts` — market trends chat context
- `src/lib/serialize-asset-context.ts` — asset performance chat context
- `src/lib/glossary-dashboard.ts` — dashboard glossary entries
- `src/lib/glossary-features.ts` — feature-specific glossary entries
- `src/lib/chat-stream-utils.ts` — chat streaming utilities
- `src/lib/chat-persistence.ts` — chat auto-save logic
- `src/lib/insights-constants.ts` — insights page constants
- `src/lib/action-plan-constants.ts` — action plan page constants
- `src/hooks/use-insights-page.ts` — insights page state hook
- `src/hooks/use-details-open.ts` — collapsible details persistence hook
- `src/hooks/use-chat-widget-state.ts` — chat widget state hook
- `src/components/insights/insight-card.tsx` — insight card component
- `src/components/layout/activity-center-task-card.tsx` — task card
- `src/components/layout/activity-center-notification-item.tsx` — notification item
- `src/components/layout/activity-center-constants.ts` — activity center constants
- `src/components/layout/header-nav-mobile.tsx` — mobile nav drawer
- `src/components/layout/header-nav-constants.ts` — nav constants
- `src/components/ui/takeaway-box-types.ts` — takeaway box types/constants
- `src/components/ui/takeaway-box-fetch.ts` — takeaway box fetch logic
- `src/components/ui/takeaway-box-explanation.tsx` — takeaway explanation UI
- `src/components/desempenho/portfolio-assets-utils.ts` — portfolio utils
- `src/components/desempenho/portfolio-assets-group.tsx` — asset group component
- `src/components/desempenho/asset-ai-analysis-constants.ts` — AI analysis constants
- `src/components/desempenho/asset-ai-analysis-sections.tsx` — AI analysis sections
- `src/components/chat/chat-header.tsx` — chat header component
- `src/components/dashboard/dashboard-sub-components.tsx` — dashboard helpers
- `src/components/dashboard/all-positions-utils.ts` — positions utils
- `src/components/dashboard/all-positions-sortable-header.tsx` — sortable header
- `src/components/action-plan/action-item-card.tsx` — action item card

## Verification Plan
- Build: `npm run build` → succeeds
- Lint: `npm run lint` → zero max-lines warnings
- Tests: `npm run test` → all 181+ tests pass
- Manual: `wc -l src/**/*.ts src/**/*.tsx | sort -rn | head -20` → no non-exempt file >300

## Risks
- Import breakage during extraction (Low) — grep all importers after each step, update paths
- Re-export breakage for types like `Conclusao` (Med) — keep barrel re-exports in original files
- Test file imports of moved functions (Low) — update test imports as needed
