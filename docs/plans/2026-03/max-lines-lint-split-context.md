# Context: Max 300 Lines Per File — Lint Rule + Split Oversized Files

## Requirements

### Goal
Enforce a 300-line maximum per source file via ESLint, and refactor all existing files that exceed the limit into smaller, well-scoped modules.

### Acceptance Criteria
- [ ] ESLint `max-lines` rule configured at 300 (warning or error) in `eslint.config.mjs`
- [ ] Generated/config files exempt (migrations, lock files, `chart.tsx` from shadcn)
- [ ] Test files (`__tests__/**`) exempt from the rule
- [ ] All 16 source files currently over 300 lines refactored to ≤300 lines each
- [ ] `npm run lint` passes with no max-lines violations
- [ ] `npm run build` passes
- [ ] All existing tests pass (`npm run test`)
- [ ] No behavioral changes — pure refactor

### Out of Scope
- Splitting test files (exempt from rule)
- Changing any business logic or UI behavior
- Adding new tests for the split modules (existing tests must still pass)
- Changing the color palette or design system

### Edge Cases
- `src/components/ui/chart.tsx` — likely a shadcn/ui generated file → exempt
- `src/lib/schema.ts` — Drizzle DB schema, single-file by convention → exempt
- `src/lib/financial-glossary.ts` — large data constant → may need structural split (group by category)

## Q&A Record
- Q: Should generated/config files be exempt? → A: Yes
- Q: Split now or flag only? → A: Split now
- Q: ESLint only or + pre-commit hook? → A: ESLint only
- Q: Test files exempt? → A: Yes (test files are naturally long with data factories)

## Codebase Analysis

### Existing Patterns to Follow
- ESLint flat config format in `eslint.config.mjs`
- Component extraction pattern: smaller components in same directory (e.g., `src/components/chat/` has `chat-widget.tsx`, `lista-conversas.tsx`, `item-conversa.tsx`)
- Utility extraction: `src/lib/` for pure functions, `src/hooks/` for React hooks
- Design system imports from `@/lib/design-system`

### Reusable Code Found
- No existing max-lines config or file-splitting utilities

### Affected Files (16 source files to split)

**Pages (3 files):**
- `src/app/insights/page.tsx` (718 lines) — largest file, needs major split
- `src/app/(dashboard)/page.tsx` (367 lines) — dashboard page
- `src/app/plano-acao/page.tsx` (333 lines) — action plan page

**Components (6 files):**
- `src/components/layout/activity-center.tsx` (431 lines)
- `src/components/ui/takeaway-box.tsx` (427 lines)
- `src/components/desempenho/portfolio-assets-grid.tsx` (404 lines)
- `src/components/chat/chat-widget.tsx` (397 lines)
- `src/components/desempenho/asset-ai-analysis.tsx` (367 lines)
- `src/components/layout/header-navigation.tsx` (329 lines)
- `src/components/dashboard/all-positions-table.tsx` (309 lines)

**Libs/Hooks (3 files):**
- `src/lib/serialize-chat-context.ts` (518 lines)
- `src/lib/financial-glossary.ts` (497 lines)
- `src/hooks/use-chat-assistant.ts` (449 lines)
- `src/lib/serialize-report-markdown.ts` (413 lines)

**Config (exempt, no action):**
- `src/lib/schema.ts` (335 lines) — DB schema, exempt
- `src/components/ui/chart.tsx` (326 lines) — shadcn generated, exempt

### Risks
- Import path changes could break existing code (Low) — IDE refactoring + grep for imports
- Circular dependencies when splitting (Low) — extract shared types to separate files
- Component splitting could affect React rendering (Low) — maintain same props interface

## ESLint Config Change
Add `max-lines` rule to `eslint.config.mjs` with exemptions for `__tests__/**`, `src/lib/schema.ts`, `src/components/ui/chart.tsx`, `drizzle/**`.
