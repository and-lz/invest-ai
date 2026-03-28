# Context: Model Setting Respected in All App Parts

## Requirements

### Goal
Ensure that when a user selects a Claude model tier (Haiku / Sonnet / Opus) on the `/settings` page, every AI call in the application uses that tier — not a hardcoded default.

### Acceptance Criteria
- [ ] All API routes that call AI use `obterAiConfigParaUsuario(userId)` instead of `obterAiConfig()`
- [ ] Retry dispatcher (`dispatch-task.ts`) also uses `obterAiConfigParaUsuario(userId)`
- [ ] `tsc --noEmit` passes with zero errors
- [ ] No remaining direct calls to `obterAiConfig()` outside `container.ts`

### Out of Scope
- UI indicator showing which model is active in chat
- Per-feature model overrides (each operation uses the same user tier)
- Adding new model tiers or providers

### Edge Cases
- DB unavailable → `obterAiConfigParaUsuario` falls back to default Sonnet tier
- User has no saved settings → same Sonnet fallback
- Retry tasks use the userId stored in the task record to resolve tier at retry time

---

## Q&A Record
- Q: Is there a plan file already for this work? → A: No existing plan file found.
- Q: Is there already in-progress work in the working tree? → A: Yes — all 7 API routes and `dispatch-task.ts` are already modified but uncommitted.

---

## Codebase Analysis

### Current State (working tree, uncommitted)

All changes are already implemented. The diff shows a consistent replacement:

**Before (all 7 routes + dispatch-task.ts):**
```typescript
const aiConfig = obterAiConfig();  // always returns Sonnet default
```

**After:**
```typescript
const aiConfig = await obterAiConfigParaUsuario(userId);  // reads from DB
```

### New function added (`container.ts:76`)
```typescript
export async function obterAiConfigParaUsuario(userId: string): Promise<AiConfig> {
  try {
    const settings = await obterGetUserSettingsUseCase().executar(userId);
    return { provider: "claude-proxy", modelId: resolveClaudeModelId(settings.claudeModelTier) };
  } catch (erro) {
    console.error("[AiConfig] Failed to load user settings, using default:", erro);
    return obterAiConfig();  // fallback
  }
}
```

### Existing Patterns
- `resolveClaudeModelId(tier)` in `src/lib/model-tiers.ts:35` — maps tier string to concrete model ID
- `DbUserSettingsRepository` in `src/infrastructure/repositories/user-settings-repository.ts` — reads `modelo_tier_claude` column
- `GetUserSettingsUseCase` returns `{ claudeModelTier: string | null, ... }`

### Affected Files (all already modified)
- `src/lib/container.ts` (modify) — add `obterAiConfigParaUsuario`, already done
- `src/app/api/chat/route.ts` (modify) — already done
- `src/app/api/insights/route.ts` (modify) — already done
- `src/app/api/reports/route.ts` (modify) — already done
- `src/app/api/action-plan/route.ts` (modify) — already done
- `src/app/api/explain-takeaway/route.ts` (modify) — already done
- `src/app/api/asset-performance/analyze/route.ts` (modify) — already done
- `src/app/api/chat/suggestions/route.ts` (modify) — already done
- `src/lib/dispatch-task.ts` (modify) — already done

### Verification grep result
`grep -r "obterAiConfig\b" src/` returns only `container.ts` (the function definition itself).
No external callers use the old hardcoded default.

### Remaining Work
1. Run `tsc --noEmit` to confirm no type errors introduced
2. Commit all changes with an appropriate message

### Risks
- DB call on every AI request (Low) — `GetUserSettingsUseCase` hits DB; acceptable since AI operations are much slower than a DB read
- Stale setting if user changes tier mid-session (Low) — setting is read per-request, so next request picks up the new value immediately
