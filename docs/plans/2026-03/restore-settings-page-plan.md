# Restore Settings Page (Claude Model Tier Only)

## Context
The `/settings` page was deleted in commits `3968a73` and `66500ac` during a Gemini removal.
The nav link still exists in `user-profile-menu.tsx` but points to a dead route.
The DB table `configuracoes_usuario` still has `provedorAi` and `modeloTierClaude` columns.

**Goal:** Restore a minimal settings page with only the Claude model tier selector (haiku/sonnet/opus).

## What to restore (adapted from git history)
1. `src/schemas/user-settings.schema.ts` — Only `ClaudeModelTierSchema`, `UpdateUserSettingsSchema`, `UserSettingsResponseSchema`
2. `src/domain/interfaces/user-settings-repository.ts` — Only `getUserSettings` and `updateModelTier` (Claude tier)
3. `src/infrastructure/repositories/user-settings-repository.ts` — DB implementation (strip Gemini key methods)
4. `src/application/use-cases/get-user-settings.ts` — Return claudeModelTier only
5. `src/application/use-cases/update-claude-model-tier.ts` — Replace update-gemini-api-key
6. `src/app/api/settings/route.ts` — GET + PATCH (model tier only)
7. `src/components/settings/model-tier-selector.tsx` — Adapted from old version
8. `src/components/settings/settings-content.tsx` — Simplified wrapper
9. `src/app/settings/page.tsx` — Server component loading settings
10. `src/app/settings/layout.tsx` — Metadata
11. `src/lib/container.ts` — Add settings use case factories

## What NOT to restore
- Gemini API key form, test-gemini-key route, check-key-health route
- AI provider form (only claude-proxy exists now)
- api-key-info component
- key-health-status component
- Any `@google/generative-ai` imports

## Plan
1. Create schema, interface, repository
2. Create use cases
3. Create API route
4. Create UI components
5. Create page + layout
6. Wire up container.ts
7. Verify: `tsc --noEmit` + lint + test

## Verification
- `tsc --noEmit` passes
- `npm run lint` passes
- `/settings` page renders with model tier selector
- PATCH /api/settings updates claudeModelTier in DB
