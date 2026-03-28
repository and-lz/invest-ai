# Context: Claude Proxy App Integration

## Requirements

### Goal
Allow users to switch all AI features (chat, insights, asset analysis, PDF extraction) from
Gemini to the local Claude Code proxy. The proxy exposes an Anthropic-compatible HTTP API at
`http://localhost:3099` backed by the `claude` CLI, using the user's Claude Code subscription.
Users pick their provider and Claude model tier from the Settings page.

### Acceptance Criteria
- [ ] Settings page shows an AI provider toggle: **Gemini** vs **Claude (local proxy)**
- [ ] When Claude proxy is selected, a model tier dropdown appears: Haiku / Sonnet / Opus
- [ ] Selection persists in the DB and is used for all subsequent AI requests
- [ ] Chat feature uses the selected provider (streaming shows full response at once for proxy)
- [ ] Insights generation uses the selected provider
- [ ] Asset performance analysis uses the selected provider
- [ ] Explain-takeaway endpoint uses the selected provider
- [ ] Action plan generation uses the selected provider
- [ ] PDF extraction uses the selected provider (see PDF constraint below)
- [ ] When Claude proxy is selected and `localhost:3099` is unreachable, a clear error is shown
- [ ] Gemini-specific health check badge only appears when Gemini is selected
- [ ] Proxy model tier selection updates the `--model` flag passed to the `claude` CLI

### Out of Scope
- Streaming support from the proxy (proxy returns full response; chat shows it all at once)
- Per-feature provider selection (one provider for the whole account)
- Production deployment of the proxy (local dev only)
- Automatic proxy startup from the app

### Edge Cases
- Claude proxy unreachable (not running) → HTTP 502 with actionable message ("Start proxy with `npm run proxy`")
- Claude CLI not authenticated → proxy exits; app shows same 502 error
- User switches from Gemini to Claude mid-session → next request uses Claude immediately
- User has no Gemini key configured but switches to Claude proxy → Gemini features disabled, Claude works
- PDF with complex tables sent to Claude text-based extraction → quality may be lower than Gemini

## Q&A Record
- Q: Which features should use the Claude proxy? → A: All AI features
- Q: How should the proxy relate to API key config? → A: User-selectable (toggle in Settings)
- Q: What model should the proxy use? → A: User-selectable tier (Haiku / Sonnet / Opus)

## Codebase Analysis

### Existing Patterns to Follow
- **ProvedorAi interface** at `src/domain/interfaces/ai-provider.ts` — implement `gerar()` and `transmitir()` to add new AI provider
- **GeminiProvedorAi** at `src/infrastructure/ai/gemini-ai-provider.ts` — full reference implementation to follow structure
- **Container factory** at `src/lib/container.ts:71-95` — `criarProvedorAi(modelo?)` + `resolverModeloDoUsuario(userId)` is the injection point
- **Model tier abstraction** at `src/lib/model-tiers.ts` — enum + resolveModelId() + MODEL_TIER_OPTIONS; extend same pattern for Claude tiers
- **DB settings pattern** at `src/lib/schema.ts` + `src/infrastructure/repositories/user-settings-repository.ts` — encrypted text fields, Drizzle ORM, upsert pattern
- **Use case pattern** at `src/application/use-cases/update-model-tier.ts` — thin orchestration, validates input, calls repo
- **Settings form pattern** at `src/components/settings/gemini-api-key-form.tsx` — form with sonner toasts, follows DS tokens
- **Migration pattern**: `drizzle/0004_add_model_tier.sql` (most recent) — next is `0005_...`

### Reusable Code Found
- `encryptData` / `decryptData` at `src/lib/encryption.ts` — used for Gemini key; no reuse needed for provider/tier (not sensitive)
- `resolverModeloDoUsuario` at `src/lib/container.ts:87` — replace with `resolverConfiguracaoAiDoUsuario` returning `{ provider, modelId }`
- Error classes `AiApiError`, `AiApiTransientError`, `AiApiQuotaError` at `src/infrastructure/ai/gemini-ai-provider.ts` — reuse in AnthropicProvedorAi
- `obterUserSettingsRepository` at `src/lib/container.ts:208` — already exported for reuse

### ⚠️ Critical Constraint: PDF Extraction

The Claude CLI (`claude -p`) only accepts text prompts. It **cannot process base64-encoded PDFs** like Gemini's multimodal API. Two options:

**Option A (Recommended) — Keep Gemini for extraction:**
- PDF upload (`POST /api/reports`) always uses Gemini regardless of provider setting
- Simplest, no quality trade-off (Gemini vision handles tables/formatting in broker PDFs)
- User needs a valid Gemini API key (env var) for PDF upload even if Claude is selected
- Add UI note in Settings: "Claude proxy is used for chat and insights. PDF extraction requires Gemini."

**Option B — Text-based extraction via pdf-parse:**
- Add `pdf-parse` npm dependency
- `ClaudePdfExtractionService` decodes base64 PDF → extracts raw text → sends text + extraction prompt to Claude proxy
- Works without Gemini key, but **significantly lower quality** for complex financial PDFs (tables, multi-column layouts, special characters)
- Risk: extraction fails or produces wrong data → corrupt reports saved to DB

**Decision: Option B chosen** — add `pdf-parse`, create `ClaudePdfExtractionService` with text-based extraction. Risk of lower quality on complex PDFs is accepted.

### ⚠️ Streaming Limitation

The proxy calls `claude -p --output-format json` which **blocks until complete** — no incremental output.
`AnthropicProvedorAi.transmitir()` will yield the **full response as a single chunk**.
Chat will show the full message appearing at once (no typewriter effect). This is a known UX trade-off.

### Affected Files

**Proxy (1 file):**
- `scripts/claude-proxy.ts` (modify) — Read `model` field from request body (`AnthropicRequest.model`), map to `--model haiku|sonnet|opus`, remove hardcoded `"opus"` on line 147

**New Infrastructure (2 files):**
- `src/infrastructure/ai/anthropic-ai-provider.ts` (create) — Implements `ProvedorAi`; calls `http://localhost:3099/v1/messages` via `fetch`; `gerar()` and `transmitir()` (single-chunk)
- `src/infrastructure/services/claude-pdf-extraction-service.ts` (create) — Implements `ExtractionService`; uses `pdf-parse` to extract text from base64 PDF, sends text prompt to Claude proxy, validates JSON response against `RelatorioExtraidoSchema`

**Model Tiers (1 file):**
- `src/lib/model-tiers.ts` (modify) — Add `ClaudeModelTier = "haiku" | "sonnet" | "opus"`, `CLAUDE_MODEL_TIER_OPTIONS`, `resolveClaudeModelId(tier)` → maps to Anthropic model IDs

**Database (2 files):**
- `src/lib/schema.ts` (modify) — Add `aiProvider text` (default `"gemini"`) and `claudeModelTier text` (default `"opus"`) columns to `configuracoes_usuario`
- `drizzle/0005_add_ai_provider_settings.sql` (create) — Migration adding the two columns

**Domain (1 file):**
- `src/domain/interfaces/user-settings-repository.ts` (modify) — Add `updateAiProvider(userId, provider, claudeModelTier)` method

**Schemas (1 file):**
- `src/schemas/user-settings.schema.ts` (modify) — Add `AiProviderSchema = z.enum(["gemini", "claude-proxy"])`, `ClaudeModelTierSchema`, update `UpdateUserSettingsSchema` and `UserSettingsResponseSchema`

**Repository (1 file):**
- `src/infrastructure/repositories/user-settings-repository.ts` (modify) — Implement `updateAiProvider`, include new fields in `getUserSettings` return, handle defaults

**Application Use Cases (2 files):**
- `src/application/use-cases/update-ai-provider.ts` (create) — Validates provider + claudeModelTier, calls repo
- `src/application/use-cases/get-user-settings.ts` (modify) — Include `aiProvider` and `claudeModelTier` in returned object

**Container (1 file):**
- `src/lib/container.ts` (modify) — Replace `resolverModeloDoUsuario` with `resolverConfiguracaoAiDoUsuario(userId): Promise<{ provider, modelId }>`, update `criarProvedorAi` to accept provider, add `obterUpdateAiProviderUseCase()`

**API Routes (6 files modified):**
- `src/app/api/chat/route.ts` — use `resolverConfiguracaoAiDoUsuario`
- `src/app/api/insights/route.ts` — use `resolverConfiguracaoAiDoUsuario`
- `src/app/api/explain-takeaway/route.ts` — use `resolverConfiguracaoAiDoUsuario`
- `src/app/api/asset-performance/analyze/route.ts` — use `resolverConfiguracaoAiDoUsuario`
- `src/app/api/action-plan/route.ts` — use `resolverConfiguracaoAiDoUsuario`
- `src/app/api/settings/route.ts` — handle new `aiProvider` + `claudeModelTier` fields in PATCH

**Settings UI (2 files):**
- `src/components/settings/ai-provider-form.tsx` (create) — toggle Gemini/Claude, conditional model tier selector for Claude, test proxy connection button
- `src/app/settings/page.tsx` (modify) — render new `AiProviderForm`, pass new fields from settings fetch

### Risks
- **Proxy not running when user expects Claude** (High) — show clear error message pointing to `npm run proxy`; no silent fallback to Gemini (avoid hidden behavior)
- **PDF extraction quality with Option B** (High if Option B chosen) — financial PDFs with complex tables may extract incorrectly; corrupts stored data
- **Streaming UX degradation** (Low) — chat appears "all at once"; acceptable trade-off documented in UI
- **Hardcoded proxy URL** (Low) — `http://localhost:3099` from env var `CLAUDE_PROXY_URL` (default 3099); configurable if needed
- **DB migration gap** (Low) — new columns have server-side defaults so existing rows are valid without a code migration
