# Implementation: Per-Message Model & Reasoning Selection

**Context**: [per-message-model-reasoning-context.md](./per-message-model-reasoning-context.md)
**Plan**: [per-message-model-reasoning-plan.md](./per-message-model-reasoning-plan.md)
**Status**: Complete

## Deviations
- None

## Verification Results
- Build: Pass (`tsc --noEmit` clean)
- Lint: Pass
- Tests: Pass (714/714)
- Manual: Pending user review

## Acceptance Criteria
- [x] Model tier selector visible in chat input row — Popover with Haiku/Sonnet/Opus
- [x] Reasoning toggle in chat input row — "Estendido" text button
- [x] Each message includes chosen model tier in API request — `modelTier` field in fetch body
- [x] API route uses per-request model tier — `resolveClaudeModelId(modelTier)` bypasses DB lookup
- [x] Defaults persist via localStorage — keys `chatModelTier` and `chatReasoningEnabled`
- [x] Settings page model selector unchanged — still controls non-chat AI features
- [x] Backward compatible — `modelTier` is optional, falls back to DB settings
