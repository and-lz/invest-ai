# Context: AI-First Architecture — Claude Primary with Gemini Fallback

## Requirements

### Goal
Make Claude (via local proxy) the default AI provider across the entire app, with Gemini as an automatic fallback when Claude is unavailable. This is the foundational layer that enables the broader "AI-heavy" vision (AI insights on every card, proactive recommendations, chat-as-primary-UX).

### Acceptance Criteria
- [ ] Claude proxy is the default provider for all new users and when no user setting exists
- [ ] When Claude fails (proxy down, error), the system automatically falls back to Gemini (if API key available)
- [ ] Fallback is transparent to the user — they see a result, not an error (unless both providers fail)
- [ ] Services are provider-agnostic in naming and implementation (no "Gemini" in service names)
- [ ] Streaming works with Claude proxy (currently delegates to single-chunk `gerar()`)
- [ ] PDF extraction works with Claude (currently text-only via pdf-parse)
- [ ] All existing tests pass after migration
- [ ] Settings page reflects Claude as default, Gemini as optional/fallback
- [ ] Environment defaults updated: `AI_PROVIDER=claude-proxy` as default

### Out of Scope
- Adding new AI features (insights on dashboard cards, proactive recommendations) — those come in later batches
- Changing the chat UX or adding new chat capabilities
- Direct Anthropic SDK integration (we keep using the local proxy)
- Removing Gemini support entirely — it stays as fallback
- Production deployment changes (proxy is local-only for now)

### Edge Cases
- Claude proxy not running → fall back to Gemini silently
- Gemini API key not configured AND Claude proxy down → show clear error to user
- Claude returns malformed JSON → retry with Claude, then fall back to Gemini
- Mid-stream failure in chat → append error message inline (existing pattern)
- PDF too large for text extraction → try Gemini's native PDF support as fallback
- User explicitly selected Gemini in settings → respect their choice, no Claude override

## Q&A Record
- Q: Should we migrate all AI calls from Gemini to Claude? → A: Claude primary, Gemini fallback
- Q: On-demand or pre-computed AI insights? → A: On-demand (later batch)
- Q: What proactive recommendations? → A: Rebalancing, risk alerts, market context, learning nudges (later batch)
- Q: First batch priority? → A: Claude migration + fallback architecture
- Q: Incremental or big bang? → A: Incremental — ship this foundation first

## Codebase Analysis

### Existing Patterns to Follow
- **Provider abstraction**: `ProvedorAi` interface in `src/domain/interfaces/ai-provider.ts` — already abstracts both providers with `gerar()` and `transmitir()` methods
- **Factory pattern**: `criarProvedorAi(config)` in `src/lib/container.ts` — switches between Gemini and Claude based on config
- **Error classification**: `src/lib/classify-ai-error.ts` — distinguishes transient (retry) vs permanent (fail) errors
- **Retry with backoff**: `src/lib/background-task-executor.ts` — exponential backoff for background tasks
- **Chat fallback**: `src/app/api/chat/route.ts` — already falls back from web-search to non-web-search on error

### Reusable Code Found
- `ProvedorAi` interface — already provider-agnostic, no changes needed
- `classify-ai-error.ts` — error classification works for both providers
- `background-task-executor.ts` — retry logic is provider-agnostic
- `encryption.ts` — API key encryption (stays for Gemini keys)
- `user-settings-repository.ts` — already supports `provedorAi` and `modeloTierClaude` fields

### Affected Files

**Provider Layer (modify)**
- `src/lib/model-tiers.ts` — Change default provider from `gemini` to `claude-proxy`
- `src/lib/container.ts` — Add fallback logic: try Claude → catch → try Gemini; rename service factory functions
- `src/infrastructure/ai/anthropic-ai-provider.ts` — Add true streaming support (SSE from proxy)

**Service Layer (rename + modify)**
- `src/infrastructure/services/gemini-insights-service.ts` → rename to `ai-insights-service.ts` (provider-agnostic)
- `src/infrastructure/services/gemini-asset-analysis-service.ts` → rename to `ai-asset-analysis-service.ts`
- `src/infrastructure/services/gemini-pdf-extraction-service.ts` → rename to `ai-pdf-extraction-service.ts`
- `src/infrastructure/services/claude-pdf-extraction-service.ts` — merge into unified extraction service

**API Routes (modify)**
- `src/app/api/chat/route.ts` — Use fallback-aware provider
- `src/app/api/insights/route.ts` — Use fallback-aware provider
- `src/app/api/asset-performance/analyze/route.ts` — Use fallback-aware provider
- `src/app/api/reports/route.ts` — Use fallback-aware provider
- `src/app/api/settings/route.ts` — Update defaults display
- `src/app/api/settings/test-proxy/route.ts` — Already exists for proxy testing

**Settings UI (modify)**
- `src/components/settings/ai-provider-form.tsx` — Update default selection to Claude
- `src/app/settings/page.tsx` — Reflect new defaults

**Proxy (modify)**
- `scripts/claude-proxy.ts` — Add SSE streaming support for `/v1/messages`

**Schema/DB (modify)**
- `src/lib/schema.ts` — Change default value for `provedorAi` from `"gemini"` to `"claude-proxy"`
- New migration: `drizzle/0006_default_claude_provider.sql`

**Tests (modify)**
- `__tests__/unit/lib/model-tiers.test.ts` — Update expected defaults
- `__tests__/unit/application/*.test.ts` — Update any provider-specific assertions
- New tests for fallback logic

**Dispatch (modify)**
- `src/lib/dispatch-task.ts` — Use fallback-aware provider creation

### Risks
- **Proxy reliability** (Med) — Local proxy is a single point of failure. Mitigation: automatic Gemini fallback
- **Streaming gap** (Med) — Claude proxy currently doesn't support streaming. Mitigation: implement SSE in proxy script
- **PDF extraction quality** (Low) — Claude via text extraction may produce different results than Gemini's native PDF. Mitigation: keep Gemini PDF as fallback option
- **Migration for existing users** (Low) — Users with explicit Gemini selection keep their choice. Only new users and users with no settings get Claude default
- **Service rename ripple** (Low) — Renaming service files requires updating all imports. Mitigation: do it in one atomic step with grep verification
