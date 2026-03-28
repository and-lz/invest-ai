# Plan: Remove Manual AI Workflows (Copy-Paste Chat)

**Context**: [remove-manual-ai-workflows-context.md](./remove-manual-ai-workflows-context.md)

## Steps

### Step 1: Rename prompt file and clean exports
**Files**: `src/lib/manual-insights-prompt.ts` (rename → `insights-prompts.ts`), `src/infrastructure/services/ai-insights-service.ts` (modify)
**Changes**:
- Rename `manual-insights-prompt.ts` → `insights-prompts.ts`
- Remove manual-only exports: `gerarPromptInsightsManual()`, `gerarPromptInsightsConsolidadoManual()`
- Remove manual-only imports: `toJSONSchema`, `InsightsResponseSchema`, `serializarRelatorioMarkdown`, `serializarRelatoriosConsolidadoMarkdown` (only used by the removed functions)
- Remove `EXEMPLO_SAIDA_INSIGHTS` constant (only used by manual prompt functions)
- Keep shared exports: `SYSTEM_PROMPT_INSIGHTS`, `INSTRUCAO_USUARIO_INSIGHTS`, `SYSTEM_PROMPT_INSIGHTS_CONSOLIDADO`, `INSTRUCAO_USUARIO_INSIGHTS_CONSOLIDADO`
- Update import in `ai-insights-service.ts`: `from "@/lib/manual-insights-prompt"` → `from "@/lib/insights-prompts"`
- Update `vitest.config.mts` coverage exclusion path

**Verify**: `npm run build` succeeds

### Step 2: Delete manual insights files
**Files** (delete):
- `src/components/insights/manual-insights-stepper.tsx`
- `src/components/insights/copyable-insights-prompt.tsx`
- `src/components/insights/manual-insights-form.tsx`
- `src/app/api/insights/manual/route.ts`
- `src/application/use-cases/save-manual-insights.ts`
- `__tests__/unit/application/salvar-insights-manual.test.ts`

**Changes**:
- Delete all 6 files
- Remove from `src/lib/container.ts`: import of `SaveManualInsightsUseCase` and `obterSaveManualInsightsUseCase()` factory

**Verify**: `npm run build` succeeds, `npm run test` passes

### Step 3: Simplify insights page — remove "gerar" intermediate mode
**Files**: `src/app/insights/page.tsx` (modify)
**Changes**:
- Remove `ModoVisualizacao` "gerar" and "manual" variants → only `"lista" | "insights"`
- Remove `InsightsManualStepper` import
- Remove `handleInsightsManualSalvos`, `handleCancelarManual` callbacks
- Remove `entrarModoGerar` callback
- Remove entire "GENERATE MODE" card (lines 619-656) and "MANUAL MODE" block (lines 658-673)
- The "Gerar novas análises" button in list mode calls `gerarInsightsViaApi()` directly instead of `entrarModoGerar`
- Period selector moves to list mode header (was only shown in "gerar"/"manual" modes)
- When no period is selected, auto-select most recent before generating
- Remove `MessageSquare`, `Layers` icon imports if no longer used

**Verify**: `npm run build` succeeds. Manual check: /insights page shows list with single generate button.

### Step 4: Delete manual report files
**Files** (delete):
- `src/components/upload/manual-import-stepper.tsx`
- `src/components/upload/copyable-extraction-prompt.tsx`
- `src/components/upload/manual-json-form.tsx`
- `src/components/upload/step-indicator.tsx`
- `src/hooks/use-manual-import.ts`
- `src/app/api/reports/manual/route.ts`
- `src/application/use-cases/save-manual-report.ts`
- `__tests__/unit/application/salvar-relatorio-manual.test.ts`

**Changes**:
- Delete all 8 files
- Remove from `src/lib/container.ts`: import of `SaveManualReportUseCase` and `obterSaveManualReportUseCase()` factory

**Verify**: `npm run build` succeeds, `npm run test` passes

### Step 5: Simplify reports page — remove manual upload method
**Files**: `src/app/reports/page.tsx` (modify)
**Changes**:
- Remove `ImportacaoManualStepper` import
- Remove `metodoUploadSelecionado` state and toggle buttons ("Upload Direto" / "Via Chat")
- Remove `handleImportacaoManualSucesso` callback
- Always show `PdfUploadDropzone` directly in the dialog (no method selector)
- Remove `MessageSquare` icon import (no longer used)
- Remove `isAiEnabled` import and `aiEnabled` variable (the dialog content is now always just the dropzone — if AI is not enabled, the dropzone itself handles that)

**Verify**: `npm run build` succeeds. Manual check: /reports dialog shows upload dropzone directly.

## New Files
None.

## Verification Plan
- Build: `npm run build` → succeeds
- Tests: `npm run test` → all pass
- Lint: `npm run lint` → passes
- Manual: Open /insights → list shows with single "Gerar novas análises" button → clicking generates via API
- Manual: Open /reports → "Importar" dialog shows only upload dropzone, no "Via Chat" option
- Grep: `grep -r "manual-insights-stepper\|manual-import-stepper\|InsightsManualStepper\|ImportacaoManualStepper\|gerar-prompt\|colar-json\|manual-insights-prompt" src/` returns no results

## Risks
- **Medium** — Reports page: removing `isAiEnabled` check means the dropzone is always shown in the dialog. If AI is disabled, the upload will fail at the API level (which already returns a proper error). This is acceptable — the upload button is already unconditionally visible.
- **Low** — Renamed file: single consumer, straightforward path update.
