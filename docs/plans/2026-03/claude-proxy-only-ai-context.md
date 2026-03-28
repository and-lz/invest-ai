# Context: Claude Proxy Only — Remove Gemini, Dev-Only AI

## Requirements

### Goal
Make all AI features (PDF extraction, insights generation, chat, asset analysis) work exclusively through the Claude local proxy (`localhost:3099`) in development. In production, completely hide all AI UI elements — users can only view previously generated content (insights, reports). Remove Google Gemini as an AI provider entirely.

### Acceptance Criteria
- [ ] `@google/generative-ai` package removed from dependencies
- [ ] All Gemini-specific code removed (GeminiProvedorAi, FallbackProvedorAi, test-gemini-key, check-key-health)
- [ ] `isAiEnabled()` returns `true` only in development (`NODE_ENV === "development"`)
- [ ] `NEXT_PUBLIC_AI_ENABLED` derived from `NODE_ENV` instead of `GOOGLE_API_KEY`
- [ ] `GOOGLE_API_KEY` env var no longer required or referenced
- [ ] In production: chat widget hidden, insights generation buttons hidden, upload PDF still works but extraction runs without AI (or is hidden), AI explain buttons hidden, settings page removed
- [ ] In production: already-generated insights, reports, and conversations are still viewable
- [ ] In development: all AI features work via Claude proxy on `localhost:3099`
- [ ] Settings page (`/settings`) removed entirely (no more API key management)
- [ ] Settings link removed from user profile menu
- [ ] Container/DI simplified — always uses AnthropicProvedorAi, no fallback
- [ ] App builds and runs successfully in both dev and prod
- [ ] All existing tests pass

### Out of Scope
- Building or modifying the Claude proxy itself (already exists)
- Changing the chat UI/UX beyond hiding it in prod
- Migrating existing Portuguese code to English
- Adding new tests for this change (existing tests should pass)

### Edge Cases
- User navigates directly to `/settings` in prod → Should get 404 or redirect
- User navigates to `/insights` in prod → Page loads, shows existing insights, but no "generate" button
- API routes for AI generation called in prod → Should return 403 or similar error
- `CLAUDE_PROXY_URL` env var not set → Defaults to `http://localhost:3099` (existing behavior)

## Q&A Record
- Q: What is the Claude proxy? → A: Existing local proxy at `scripts/claude-proxy.ts`, runs on port 3099, exposes Anthropic Messages API backed by `claude` CLI
- Q: Prod AI UX? → A: Completely hidden — no buttons, no chat, no generation triggers. Only previously generated content visible.
- Q: Settings page? → A: Remove entirely
- Q: Chat in prod? → A: Hidden. Works via proxy in dev only.

## Codebase Analysis

### Existing Patterns to Follow
- Feature gating via `isAiEnabled()` at `src/lib/ai-features.ts` — already used in 7+ files for conditional rendering
- `NEXT_PUBLIC_AI_ENABLED` build-time env var set in `next.config.ts:24` — controls client-side feature flag
- AI-only route filtering in `header-navigation.tsx:36-60` via `AI_ONLY_ROUTES` set

### Reusable Code Found
- `isAiEnabled()` at `src/lib/ai-features.ts` — change implementation to check `NODE_ENV` instead of `GOOGLE_API_KEY`
- `AI_ONLY_ROUTES` set at `src/components/layout/header-navigation.tsx:36` — already filters nav items
- Conditional chat rendering at `src/app/layout.tsx:70` — `{aiEnabled && <LazyChatWidget />}`
- Conditional settings link at `src/components/auth/user-profile-menu.tsx:79` — `{isAiEnabled() && ...}`
- Conditional AI button at `src/components/ui/ai-explain-button.tsx:49` — `if (!isAiEnabled()) return null`

### Affected Files

**Core changes (modify):**
- `src/lib/ai-features.ts` — Change to `NODE_ENV === "development"`
- `next.config.ts` — Derive `NEXT_PUBLIC_AI_ENABLED` from `NODE_ENV` instead of `GOOGLE_API_KEY`
- `src/lib/container.ts` — Remove Gemini imports, `isAiConfigured()`, fallback logic, Gemini-related use case factories
- `package.json` — Remove `@google/generative-ai` dependency

**Delete files:**
- `src/infrastructure/ai/gemini-ai-provider.ts` — Gemini provider
- `src/infrastructure/ai/fallback-ai-provider.ts` — Fallback decorator
- `src/application/use-cases/test-gemini-api-key.ts` — Test Gemini key
- `src/application/use-cases/check-key-health.ts` — Check key health
- `src/application/use-cases/update-gemini-api-key.ts` — Update Gemini key
- `src/application/use-cases/update-model-tier.ts` — Model tier (Gemini-specific)
- `src/application/use-cases/update-ai-provider.ts` — Provider selection (no longer needed, always Claude)
- `src/app/settings/page.tsx` — Settings page
- `src/app/settings/layout.tsx` — Settings layout
- `src/app/api/settings/test-gemini-key/route.ts` — Test key API
- `src/app/api/settings/check-key-health/route.ts` — Check health API
- `src/components/settings/gemini-api-key-form.tsx` — Gemini key form
- `src/components/settings/ai-provider-form.tsx` — Provider selector
- `src/components/settings/model-tier-selector.tsx` — Model tier selector
- `src/components/settings/settings-content.tsx` — Settings wrapper
- `src/components/settings/api-key-info.tsx` — API key info
- `src/components/settings/key-health-status.tsx` — Key health banner

**API routes (modify):**
- `src/app/api/settings/route.ts` — Remove Gemini key and model tier handling (keep if other settings exist, else delete)
- `src/app/api/chat/route.ts` — Simplify: always use Claude proxy, no user config resolution for provider
- `src/app/api/insights/route.ts` — Simplify: always use Claude proxy
- `src/app/api/reports/route.ts` — Simplify: always use Claude proxy for extraction

**UI files (already gated, no changes needed):**
- `src/app/layout.tsx` — Already gates chat widget via `isAiEnabled()`
- `src/components/layout/header-navigation.tsx` — Already gates AI routes
- `src/components/ui/ai-explain-button.tsx` — Already returns null when AI disabled
- `src/components/auth/user-profile-menu.tsx` — Already gates settings link
- `src/app/insights/page.tsx` — Already uses `isAiEnabled()` for generation buttons
- `src/app/desempenho/page.tsx` — Already uses `isAiEnabled()` for AI analysis

**Model/config files (modify):**
- `src/lib/model-tiers.ts` — Remove Gemini tiers, keep Claude tiers only
- `src/lib/env.ts` — Remove GOOGLE_API_KEY validation

**Domain interfaces (check):**
- `src/domain/interfaces/user-settings-repository.ts` — May need cleanup if Gemini fields removed
- `src/schemas/user-settings.schema.ts` — Remove Gemini-related fields

### Risks
- **Breaking existing insights/reports** (Low) — We only change generation, not reading. Existing data stored in DB/filesystem remains accessible.
- **Settings API route shared** (Med) — Need to check if `/api/settings` handles non-AI settings too. If only AI settings, delete entirely.
- **Database schema** (Low) — `configuracoes_usuario` table has Gemini key column. Leave table as-is (backward compat), just stop writing to it.
- **Missing dev guard on API routes** (Med) — AI API routes should reject requests in prod to prevent accidental calls.
