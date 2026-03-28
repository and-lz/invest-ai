# Implementation: Claude Proxy Only — Remove Gemini, Dev-Only AI

**Context**: [claude-proxy-only-ai-context.md](./claude-proxy-only-ai-context.md)
**Plan**: [claude-proxy-only-ai-plan.md](./claude-proxy-only-ai-plan.md)
**Status**: Complete

## Deviations
- Steps 2-8 were combined into a single commit because they are tightly coupled (deleting files + updating all references must happen atomically)
- Additional files discovered and removed beyond the plan:
  - `src/lib/format-grounding-sources.ts` (Gemini-only grounding metadata formatter)
  - `src/domain/interfaces/user-settings-repository.ts` (no longer imported)
  - `src/infrastructure/repositories/user-settings-repository.ts` (no longer imported)
  - `src/schemas/user-settings.schema.ts` (no longer imported)
  - 7 test files for deleted modules
- Additional API routes simplified beyond the plan:
  - `src/app/api/action-plan/route.ts`
  - `src/app/api/explain-takeaway/route.ts`
  - `src/app/api/chat/suggestions/route.ts`
  - `src/lib/dispatch-task.ts`

## Verification Results
- TypeScript: Pass (`tsc --noEmit` — zero errors)
- Lint: Pass (`npm run lint` — zero errors)
- Tests: Pass (41 test files, 694 tests)
- Push: Pass (pre-push hook ran all tests)

## Acceptance Criteria
- [x] `@google/generative-ai` package removed — verified in package.json diff
- [x] All Gemini-specific code removed — 28+ files deleted
- [x] `isAiEnabled()` returns `true` only in development — `NODE_ENV === "development"` check in next.config.ts
- [x] `NEXT_PUBLIC_AI_ENABLED` derived from `NODE_ENV` — verified in next.config.ts
- [x] `GOOGLE_API_KEY` env var no longer referenced — grep confirms zero hits in src/
- [x] In prod: chat widget hidden, AI buttons hidden, settings removed — all gated by `isAiEnabled()` which returns false in prod
- [x] In prod: existing insights/reports/conversations viewable — read paths unchanged
- [x] In dev: AI features work via Claude proxy — `obterAiConfig()` returns Claude proxy config
- [x] Settings page removed — `src/app/settings/` deleted
- [x] Settings link removed from profile menu — gated by `isAiEnabled()` which is false in prod
- [x] Container simplified — always `AnthropicProvedorAi`, no fallback
- [x] App builds and tests pass — verified
