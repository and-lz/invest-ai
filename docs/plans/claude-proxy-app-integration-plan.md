# Plan: Claude Proxy App Integration

**Context**: [claude-proxy-app-integration-context.md](./claude-proxy-app-integration-context.md)

## Steps

### Step 1: Proxy model selection
**Files**: `scripts/claude-proxy.ts` (modify)
**Pattern**: Existing `AnthropicRequest` type already has `model?: string` field
**Changes**:
- Read `model` from request body in the `/v1/messages` handler
- Map model string to CLI `--model` flag: `claude-haiku-4-5` → `haiku`, `claude-sonnet-4-5` → `sonnet`, `claude-opus-4-6` → `opus`
- Default to `opus` when model is omitted
- Update `GET /v1/models` to return all three models
**Verify**: Start proxy, send `POST /v1/messages` with `"model": "claude-sonnet-4-5"` → response shows `"model": "claude-sonnet-4-5"`

### Step 2: Schemas + model tiers
**Files**: `src/lib/model-tiers.ts` (modify), `src/schemas/user-settings.schema.ts` (modify)
**Pattern**: Follows existing `ModelTier`/`MODEL_TIER_OPTIONS`/`resolveModelId` in `model-tiers.ts`
**Changes**:
- `model-tiers.ts`: Add `ClaudeModelTier = "haiku" | "sonnet" | "opus"`, `CLAUDE_MODEL_TIER_OPTIONS` (label/description array), `resolveClaudeModelId(tier)` → maps to `claude-haiku-4-5` / `claude-sonnet-4-5` / `claude-opus-4-6`
- `model-tiers.ts`: Add `AiProvider = "gemini" | "claude-proxy"`, `AI_PROVIDER_OPTIONS`, `DEFAULT_AI_PROVIDER = "gemini"`, `DEFAULT_CLAUDE_MODEL_TIER = "sonnet"`
- `user-settings.schema.ts`: Add `AiProviderSchema = z.enum(["gemini", "claude-proxy"])`, `ClaudeModelTierSchema = z.enum(["haiku", "sonnet", "opus"])`
- `user-settings.schema.ts`: Add `aiProvider` and `claudeModelTier` to `UpdateUserSettingsSchema` and `UserSettingsResponseSchema`
**Verify**: `npm run build` passes

### Step 3: DB migration
**Files**: `src/lib/schema.ts` (modify), `drizzle/0005_add_ai_provider_settings.sql` (create)
**Pattern**: Follows `drizzle/0004_add_model_tier.sql` for column addition
**Changes**:
- `schema.ts`: Add `provedorAi: text("provedor_ai").default("gemini")` and `modeloTierClaude: text("modelo_tier_claude").default("sonnet")` to `configuracoesUsuario` table
- Migration: `ALTER TABLE configuracoes_usuario ADD COLUMN provedor_ai text DEFAULT 'gemini'; ALTER TABLE configuracoes_usuario ADD COLUMN modelo_tier_claude text DEFAULT 'sonnet';`
**Verify**: `npx drizzle-kit push` succeeds; build passes

### Step 4: Repository layer
**Files**: `src/domain/interfaces/user-settings-repository.ts` (modify), `src/infrastructure/repositories/user-settings-repository.ts` (modify)
**Pattern**: Follows existing `updateModelTier` method pattern
**Changes**:
- Interface: Add `updateAiProvider(userId: string, provider: string, claudeModelTier: string): Promise<void>`
- Interface: Add `aiProvider?: string` and `claudeModelTier?: string` to `getUserSettings` return type
- Implementation: Implement `updateAiProvider` (upsert both columns)
- Implementation: Include new columns in `getUserSettings` select/return
**Verify**: `npm run build` passes

### Step 5: AnthropicProvedorAi
**Files**: `src/infrastructure/ai/anthropic-ai-provider.ts` (create)
**Pattern**: Follows `src/infrastructure/ai/gemini-ai-provider.ts` structure
**Changes**:
- Implements `ProvedorAi` interface (`gerar` + `transmitir`)
- Constructor: `(proxyBaseUrl: string, model: string)`
- `gerar()`: POST to `{baseUrl}/v1/messages` with `{ model, system, messages, max_tokens }`, parse response, extract `content[0].text`, handle JSON response (strip markdown fences if present), return `RespostaAi` with usage
- `transmitir()`: Calls `gerar()` internally, yields full text as single chunk (no real streaming from proxy)
- Error handling: Catch fetch errors → throw `AiApiTransientError` (proxy down), catch HTTP 4xx → throw `AiApiError`
- Proxy URL from `process.env.CLAUDE_PROXY_URL ?? "http://localhost:3099"`
- Convert `ConfiguracaoGeracao` message format to Anthropic format: `partes[].tipo === "texto"` → `content: string`
**Verify**: `npm run build` passes

### Step 6: Claude PDF extraction service
**Files**: `src/infrastructure/services/claude-pdf-extraction-service.ts` (create), `package.json` (modify via npm install)
**Pattern**: Follows `src/infrastructure/services/gemini-pdf-extraction-service.ts`
**Changes**:
- `npm install pdf-parse && npm install -D @types/pdf-parse`
- Implements `ExtractionService` interface
- Constructor: `(private provedor: ProvedorAi)`
- `extrairDadosDoRelatorio(pdfBase64)`: Decode base64 → Buffer → `pdf(buffer)` → get `.text` → send to `provedor.gerar()` with extraction system prompt + text content → parse JSON → validate against `RelatorioExtraidoSchema`
- Reuses `SYSTEM_PROMPT_EXTRACAO` from `src/lib/manual-extraction-prompt.ts`
**Verify**: `npm run build` passes

### Step 7: Use cases + container
**Files**: `src/application/use-cases/update-ai-provider.ts` (create), `src/application/use-cases/get-user-settings.ts` (modify), `src/lib/container.ts` (modify)
**Pattern**: `update-ai-provider.ts` follows `src/application/use-cases/update-model-tier.ts`; container follows existing factory pattern
**Changes**:
- `update-ai-provider.ts`: Validates provider + claudeModelTier, calls `repo.updateAiProvider()`
- `get-user-settings.ts`: Include `aiProvider` and `claudeModelTier` in returned settings object
- `container.ts`:
  - Import `AnthropicProvedorAi` and `ClaudePdfExtractionService`
  - Import `resolveClaudeModelId` from `model-tiers`
  - New `resolverConfiguracaoAiDoUsuario(userId)` → returns `{ provider, modelId }` by reading user settings from DB
  - Update `criarProvedorAi(config)` to accept `{ provider, modelId }` → switch on provider to create `GeminiProvedorAi` or `AnthropicProvedorAi`
  - Update `criarServicoExtracao(config)` → switch on provider for `GeminiPdfExtractionService` vs `ClaudePdfExtractionService`
  - Update use case factories (`obterUploadReportUseCase`, `obterGenerateInsightsUseCase`, `obterGenerateConsolidatedInsightsUseCase`, `obterAnalyzeAssetPerformanceUseCase`) to accept config instead of modelo string
  - Keep old `resolverModeloDoUsuario` as deprecated alias (backward compat during migration)
  - Add `obterUpdateAiProviderUseCase()`
**Verify**: `npm run build` passes

### Step 8: Settings API + test proxy endpoint
**Files**: `src/app/api/settings/route.ts` (modify), `src/app/api/settings/test-proxy/route.ts` (create)
**Pattern**: Follows existing PATCH handler pattern for settings; test endpoint follows `test-gemini-key/route.ts`
**Changes**:
- `route.ts` PATCH: Accept `aiProvider` and `claudeModelTier` in request body (via updated `UpdateUserSettingsSchema`), call `obterUpdateAiProviderUseCase()` when present
- `route.ts` GET: Return `aiProvider` and `claudeModelTier` in response
- `test-proxy/route.ts`: POST → fetch `GET {proxyUrl}/health` → return `{ reachable: boolean, message: string }`
**Verify**: `npm run build` passes; PATCH with `{ "aiProvider": "claude-proxy", "claudeModelTier": "sonnet" }` → 200

### Step 9: AI-consuming API routes
**Files**: 7 routes (modify)
- `src/app/api/chat/route.ts`
- `src/app/api/chat/suggestions/route.ts`
- `src/app/api/insights/route.ts`
- `src/app/api/explain-takeaway/route.ts`
- `src/app/api/asset-performance/analyze/route.ts`
- `src/app/api/reports/route.ts`
- `src/app/api/action-plan/route.ts`
**Pattern**: Mechanical replacement — same 2-line pattern in each
**Changes**:
- Replace `const modelo = await resolverModeloDoUsuario(userId)` + `criarProvedorAi(modelo)` with `const aiConfig = await resolverConfiguracaoAiDoUsuario(userId)` + `criarProvedorAi(aiConfig)`
- For routes using use case factories: pass `aiConfig` instead of `modelo`
- For `chat/suggestions/route.ts`: Add `resolverConfiguracaoAiDoUsuario` import and resolve from auth user
- For `chat/route.ts`: When provider is `claude-proxy`, set `pesquisaWeb: false` (proxy doesn't support tools)
**Verify**: `npm run build` passes

### Step 10: Settings UI
**Files**: `src/components/settings/ai-provider-form.tsx` (create), `src/app/settings/page.tsx` (modify)
**Pattern**: Follows `src/components/settings/gemini-api-key-form.tsx` for form structure; DS tokens from `src/lib/design-system.ts`
**Changes**:
- `ai-provider-form.tsx`:
  - Radio group: Gemini / Claude (local proxy)
  - When Claude selected: Dropdown for model tier (Haiku / Sonnet / Opus) with label/description from `CLAUDE_MODEL_TIER_OPTIONS`
  - "Test proxy connection" button → calls `POST /api/settings/test-proxy`
  - Save button → calls `PATCH /api/settings` with `{ aiProvider, claudeModelTier }`
  - Info box: "Claude proxy must be running locally (`npm run proxy`). No streaming — responses appear all at once."
  - When Gemini selected: hide Claude model tier selector
- `page.tsx`:
  - Fetch `aiProvider` and `claudeModelTier` from settings
  - Render `AiProviderForm` above the existing Gemini API key form
  - Conditionally show Gemini key form only when Gemini is selected
**Verify**: Manual — Settings page shows provider toggle; switching to Claude shows model tier; test proxy button works

### Step 11: Tests
**Files**: `__tests__/unit/lib/model-tiers.test.ts` (create)
**Pattern**: Follows `__tests__/unit/lib/format-date.test.ts` for structure
**Changes**:
- Test `resolveClaudeModelId` → maps each tier to correct model ID
- Test `resolveClaudeModelId` → defaults to sonnet for undefined/invalid input
- Test `resolveModelId` → still works unchanged for Gemini tiers (regression)
**Verify**: `npm run test` passes

## New Files
- `src/infrastructure/ai/anthropic-ai-provider.ts` — ProvedorAi for Claude proxy — pattern from `gemini-ai-provider.ts`
- `src/infrastructure/services/claude-pdf-extraction-service.ts` — Text-based PDF extraction — pattern from `gemini-pdf-extraction-service.ts`
- `src/application/use-cases/update-ai-provider.ts` — Validation + repo call — pattern from `update-model-tier.ts`
- `src/app/api/settings/test-proxy/route.ts` — Proxy health check endpoint — pattern from `test-gemini-key/route.ts`
- `src/components/settings/ai-provider-form.tsx` — Provider/tier selector form — pattern from `gemini-api-key-form.tsx`
- `drizzle/0005_add_ai_provider_settings.sql` — DB migration for new columns
- `__tests__/unit/lib/model-tiers.test.ts` — Model tier resolution tests

## Verification Plan
- Build: `npm run build` → succeeds
- Tests: `npm run test` → all pass (including new model-tiers tests)
- Lint: `npm run lint` → passes
- Manual:
  1. Start proxy: `npm run proxy`
  2. Open Settings → select "Claude (local proxy)" → pick Sonnet → "Test connection" → success
  3. Save settings → reload page → settings persist
  4. Open Chat → send message → response appears (no streaming, full text at once)
  5. Upload PDF → extracted data saved correctly (via pdf-parse + Claude)
  6. Generate insights → insights generated via Claude proxy
  7. Switch back to Gemini → all features resume with Gemini + streaming

## Risks
- **PDF extraction quality** (Med) — Text-based extraction via pdf-parse may lose table formatting from financial PDFs. Mitigation: users can switch back to Gemini for upload; extraction prompt already handles text input
- **Proxy not running** (High) — Clear error message + test proxy button in Settings. No silent fallback
- **Chat streaming UX** (Low) — Documented in Settings info box; responses appear all at once
- **Web search unavailable** (Low) — Claude proxy doesn't support Google Search tool; chat route disables `pesquisaWeb` when using proxy; system prompt web search instructions become irrelevant but harmless
