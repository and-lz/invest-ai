# Plan: AI-First Architecture — Claude Primary with Gemini Fallback

**Context**: [ai-first-architecture-context.md](./ai-first-architecture-context.md)

## Architecture Decision: Fallback via Decorator Pattern

Create a `FallbackProvedorAi` that wraps a primary and fallback `ProvedorAi`. All call sites get automatic fallback without any changes — the decorator is transparent. This follows the existing `ProvedorAi` interface and keeps the fallback logic in one place.

```
FallbackProvedorAi(primary: Claude, fallback: Gemini)
  ├── gerar() → try primary.gerar() → catch → fallback.gerar()
  └── transmitir() → try primary.transmitir() → catch → fallback.transmitir()
```

## Steps

### Step 1: Change default provider to Claude
**Files**: `src/lib/model-tiers.ts` (modify), `src/lib/schema.ts` (modify)
**Changes**:
- `model-tiers.ts`: Change `DEFAULT_AI_PROVIDER` fallback from `"gemini"` to `"claude-proxy"` (when `AI_PROVIDER` env var is not set)
- `schema.ts`: Change `.default("gemini")` to `.default("claude-proxy")` on `provedorAi` column
- No DB migration needed — default only affects new inserts, existing rows keep their value
**Verify**: `npm run build` succeeds

### Step 2: Add streaming support to Claude proxy
**Files**: `scripts/claude-proxy.ts` (modify), `src/infrastructure/ai/anthropic-ai-provider.ts` (modify)
**Changes**:
- `claude-proxy.ts`: Add `stream: true` detection in POST `/v1/messages` handler. When `stream: true`, respond with `Content-Type: text/event-stream` and send SSE events (`message_start`, `content_block_delta`, `message_stop`) matching Anthropic's streaming format. Use the existing `invokeClaudeCli()` (still synchronous CLI call) but emit the response as SSE chunks.
- `anthropic-ai-provider.ts`: Implement real `transmitir()` that reads SSE stream from proxy instead of delegating to `gerar()`. Parse `content_block_delta` events and yield text deltas.
**Verify**: Start proxy, run chat — verify streaming works with real-time text output

### Step 3: Create FallbackProvedorAi decorator
**Files**: `src/infrastructure/ai/fallback-ai-provider.ts` (create), `src/lib/container.ts` (modify)
**Pattern**: Following `src/infrastructure/ai/anthropic-ai-provider.ts` (implements `ProvedorAi`)
**Changes**:
- Create `FallbackProvedorAi` class implementing `ProvedorAi`:
  - `gerar()`: try primary → catch non-quota error → log warning → try fallback → if both fail, throw last error
  - `transmitir()`: try primary → catch before first chunk → log warning → try fallback → if error after chunks sent, append error inline (existing pattern)
  - Constructor takes `primary: ProvedorAi` and `fallback: ProvedorAi | null`
  - If fallback is null, no fallback attempt (just re-throw)
- Update `container.ts`:
  - `criarProvedorAi()`: when user's provider is `claude-proxy` AND `GOOGLE_API_KEY` is available, wrap in `FallbackProvedorAi(claude, gemini)`. When user explicitly chose `gemini`, use Gemini directly (no fallback). When Claude-only (no Gemini key), use Claude directly.
  - Update `resolverConfiguracaoAiDoUsuario()` to also return whether Gemini key is available (for fallback decision)
**Verify**: `npm run build` succeeds. Test: stop proxy → verify Gemini fallback kicks in

### Step 4: Rename services to provider-agnostic names
**Files**:
- `src/infrastructure/services/gemini-insights-service.ts` → rename to `ai-insights-service.ts`, class `GeminiInsightsService` → `AiInsightsService`
- `src/infrastructure/services/gemini-asset-analysis-service.ts` → rename to `ai-asset-analysis-service.ts`, class `GeminiAssetAnalysisService` → `AiAssetAnalysisService`
- `src/infrastructure/services/gemini-pdf-extraction-service.ts` → rename to `ai-pdf-extraction-service.ts`, class `GeminiPdfExtractionService` → `AiPdfExtractionService`
- `src/infrastructure/services/claude-pdf-extraction-service.ts` → rename to `ai-text-pdf-extraction-service.ts`, class `ClaudePdfExtractionService` → `AiTextPdfExtractionService`
- `src/lib/container.ts` (modify) — update all import paths and class references
**Pattern**: Simple rename, no logic changes
**Changes**:
- Rename files (git mv)
- Update class names inside each file
- Update all imports in `container.ts`
- Grep for any other importers and update
**Verify**: `npm run build` succeeds, `npm run test` passes

### Step 5: Update settings UI to reflect Claude as default
**Files**: `src/components/settings/ai-provider-form.tsx` (modify), `src/app/settings/page.tsx` (modify)
**Changes**:
- `ai-provider-form.tsx`: Set initial provider state to `"claude-proxy"` instead of `"gemini"`. Reorder provider options to show Claude first. Update copy to indicate Claude is default and Gemini is optional/fallback.
- `settings/page.tsx`: When user has no settings saved, display Claude as the active provider
**Verify**: Open `/settings` — Claude shown as default, Gemini as optional

### Step 6: Update tests
**Files**: `__tests__/unit/lib/model-tiers.test.ts` (modify), new test file for fallback provider
**Changes**:
- `model-tiers.test.ts`: Update `DEFAULT_AI_PROVIDER` assertion — now expects `"claude-proxy"` when no env var set. Keep env var override tests.
- Create `__tests__/unit/infrastructure/fallback-ai-provider.test.ts`:
  - Given primary succeeds → returns primary result, fallback not called
  - Given primary fails with transient error AND fallback exists → returns fallback result
  - Given primary fails AND no fallback → throws original error
  - Given primary fails AND fallback also fails → throws fallback error
  - Given streaming: primary fails before chunks → falls back to fallback stream
  - Given quota error → does NOT fall back (quota is user-specific)
- Update any other tests that assert on Gemini-specific service names
**Verify**: `npm run test` — all pass

## New Files
- `src/infrastructure/ai/fallback-ai-provider.ts` — Decorator implementing `ProvedorAi` with automatic fallback — pattern from `anthropic-ai-provider.ts`
- `__tests__/unit/infrastructure/fallback-ai-provider.test.ts` — Unit tests for fallback logic

## Verification Plan
- Build: `npm run build` → succeeds
- Tests: `npm run test` → all pass
- Manual:
  1. Start claude proxy (`npx tsx scripts/claude-proxy.ts`), open app → chat works with streaming
  2. Stop claude proxy → chat still works via Gemini fallback (if API key configured)
  3. Open `/settings` → Claude shown as default provider
  4. Upload PDF → extraction works (via Claude text extraction or Gemini binary fallback)

## Risks
- **Streaming SSE format** (Med) — Must match Anthropic's exact SSE event format for the provider to parse correctly. Mitigation: test with real chat interaction
- **Service rename imports** (Low) — Missed import reference would break build. Mitigation: grep verification + `npm run build` after rename step
- **Fallback latency** (Low) — Failed Claude call adds latency before Gemini fallback. Mitigation: fast timeout on proxy connection errors (ECONNREFUSED is instant)
