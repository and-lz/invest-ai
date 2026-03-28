# Implementation: Remove Manual AI Workflows (Copy-Paste Chat)

**Context**: [remove-manual-ai-workflows-context.md](./remove-manual-ai-workflows-context.md)
**Plan**: [remove-manual-ai-workflows-plan.md](./remove-manual-ai-workflows-plan.md)
**Status**: Complete

## Deviations
- Steps 1-2 were combined into a single pass (renaming + deleting insights files together) since deleting the manual route was needed for build to pass after the rename.
- Pre-existing lint issues in `header-navigation.tsx` (unused imports from a prior refactor) blocked the commit; resolved by restoring the file to its committed state.
- Commit was bundled with pre-staged Electron files due to prior `git add` state. User approved pushing as-is.

## Verification Results
- Build: Pass (`npm run build` compiled successfully)
- Tests: Pass (48 test files, 754 tests — all green)
- Lint: Pass (pre-commit hook succeeded)
- Grep: No remaining references to deleted manual workflow files in `src/`

## Acceptance Criteria
- [x] `/insights` "Gerar via Chat" button and manual stepper removed — verified by grep + build
- [x] `/insights` "gerar" intermediate mode eliminated — single "Gerar análise" button with period selector in list mode
- [x] `/reports` "Via Chat" button and manual import stepper removed — verified by grep + build
- [x] `manual-insights-prompt.ts` renamed to `insights-prompts.ts`, manual-only exports removed — verified by build
- [x] All deleted files have no remaining imports/references — verified by grep
- [x] `container.ts` cleaned of manual use case factories — verified by build
- [x] Tests for deleted use cases removed — verified by test run (754 pass)
- [x] `vitest.config.mts` coverage exclusion updated — verified by test run
- [x] Build passes — `npm run build` succeeded
- [x] Existing tests pass — 754/754 pass
