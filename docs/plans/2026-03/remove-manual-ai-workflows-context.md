# Context: Remove Manual AI Workflows (Copy-Paste Chat)

## Requirements

### Goal
With the Claude proxy now providing reliable AI generation, remove all manual "copy prompt → paste JSON" workflows from both `/insights` and `/reports`. Everything should be AI-driven automatically — no human-in-the-loop copy-paste steps.

### Acceptance Criteria
- [ ] `/insights` "Gerar via Chat" button and manual stepper are removed
- [ ] `/insights` "gerar" intermediate mode is eliminated — single "Gerar análise" button triggers API generation directly
- [ ] `/reports` "Via Chat" button and manual import stepper are removed — only "Upload Direto" remains
- [ ] `manual-insights-prompt.ts` renamed to `insights-prompts.ts`, manual-only exports removed, shared prompts kept
- [ ] All deleted files have no remaining imports/references
- [ ] `container.ts` cleaned of manual use case factories
- [ ] Tests for deleted use cases removed
- [ ] `vitest.config.mts` coverage exclusion updated for renamed file
- [ ] Build passes (`npm run build`)
- [ ] Existing tests pass (`npm run test`)

### Out of Scope
- Changing the automatic AI generation flow (background tasks, retry logic)
- Modifying the `isAiEnabled()` guard (it still gates AI features)
- Removing the `"importacao-manual"` enum from DB schema (backward compat)
- Changing the chat widget or streaming chat functionality
- Adding new features

### Edge Cases
- Reports page when `isAiEnabled()` is false → no upload method selector shown at all (already handled — manual was the default fallback, now just show the upload dropzone only when AI enabled)
- Reports page when `isAiEnabled()` is true → show only the upload dropzone directly, no method selector toggle needed

## Q&A Record
- Q: Remove manual workflow from /reports too? → A: Yes, remove both /insights and /reports manual workflows
- Q: Single button or keep intermediate mode in /insights? → A: Single "Gerar análise" button, no intermediate "gerar" screen with two options
- Q: Rename `manual-insights-prompt.ts`? → A: Yes, rename to `insights-prompts.ts`

## Codebase Analysis

### Existing Patterns to Follow
- Background task pattern for AI generation — see `src/app/api/insights/route.ts` POST handler
- `gerarInsightsViaApi()` callback in insights page — see `src/app/insights/page.tsx:414`
- Upload dropzone pattern — see `src/components/upload/pdf-upload-dropzone.tsx`

### Reusable Code Found
- `PdfUploadDropzone` at `src/components/upload/pdf-upload-dropzone.tsx` — already exists, just needs to be the only upload method
- `gerarInsightsViaApi()` at `src/app/insights/page.tsx:414` — already handles automatic generation, just needs to be triggered directly

### Affected Files

#### DELETE (6 insight files)
- `src/components/insights/manual-insights-stepper.tsx` — Manual stepper component
- `src/components/insights/copyable-insights-prompt.tsx` — Copyable prompt component
- `src/components/insights/manual-insights-form.tsx` — Manual JSON form
- `src/app/api/insights/manual/route.ts` — Manual insights API route
- `src/application/use-cases/save-manual-insights.ts` — Manual save use case
- `__tests__/unit/application/salvar-insights-manual.test.ts` — Tests for above

#### DELETE (4 report files)
- `src/components/upload/manual-import-stepper.tsx` — Manual import stepper
- `src/components/upload/copyable-extraction-prompt.tsx` — Copyable extraction prompt
- `src/components/upload/manual-json-form.tsx` — Manual JSON form for reports
- `src/hooks/use-manual-import.ts` — Hook for manual import

#### DELETE (possible, needs verification)
- `src/application/use-cases/save-manual-report.ts` — Manual report save use case
- `src/app/api/reports/manual/route.ts` — Manual reports API route

#### RENAME
- `src/lib/manual-insights-prompt.ts` → `src/lib/insights-prompts.ts` (remove manual-only exports: `gerarPromptInsightsManual`, `gerarPromptInsightsConsolidadoManual`)

#### MODIFY
- `src/app/insights/page.tsx` — Remove "manual" mode, "gerar" intermediate screen; single button triggers `gerarInsightsViaApi()` directly
- `src/app/reports/page.tsx` — Remove manual upload method, method selector; show only dropzone
- `src/lib/container.ts` — Remove `obterSaveManualInsightsUseCase`, `obterSaveManualReportUseCase` and imports
- `src/infrastructure/services/ai-insights-service.ts` — Update import path from `manual-insights-prompt` to `insights-prompts`
- `vitest.config.mts` — Update coverage exclusion path

### Risks
- **Medium** — Reports page UX simplification: removing the method selector means `aiEnabled` branch goes straight to dropzone. Need to verify the non-AI fallback still works.
- **Low** — Renamed file import path: only 1 consumer (`ai-insights-service.ts`), straightforward.
