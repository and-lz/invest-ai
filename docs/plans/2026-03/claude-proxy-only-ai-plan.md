# Plan: Claude Proxy Only — Remove Gemini, Dev-Only AI

## Context
All AI features currently support two providers (Gemini + Claude proxy) with user-configurable settings. The goal is to simplify: remove Gemini entirely, make AI features dev-only via Claude proxy, and hide all AI UI in production. Previously generated content (insights, reports, conversations) remains viewable in prod.

## Step 1: Feature flag — dev-only AI
**Files:** `src/lib/ai-features.ts`, `next.config.ts`

- `next.config.ts`: Change `NEXT_PUBLIC_AI_ENABLED` from `process.env.GOOGLE_API_KEY ? "true" : "false"` to `process.env.NODE_ENV === "development" ? "true" : "false"`
- `src/lib/ai-features.ts`: Update comment to reflect new logic

This single change automatically hides chat widget, AI explain buttons, insights generation buttons, settings link, and AI nav items in prod (all already gated by `isAiEnabled()`).

**Verify:** `npm run build` sets `NEXT_PUBLIC_AI_ENABLED=false`, `npm run dev` sets it to `true`.

## Step 2: Delete Gemini-specific files (20 files)

Settings UI (6):
- `src/components/settings/gemini-api-key-form.tsx`
- `src/components/settings/ai-provider-form.tsx`
- `src/components/settings/model-tier-selector.tsx`
- `src/components/settings/settings-content.tsx`
- `src/components/settings/api-key-info.tsx`
- `src/components/settings/key-health-status.tsx`

Settings pages (2):
- `src/app/settings/page.tsx`
- `src/app/settings/layout.tsx`

Settings API routes (4):
- `src/app/api/settings/route.ts`
- `src/app/api/settings/test-gemini-key/route.ts`
- `src/app/api/settings/check-key-health/route.ts`
- `src/app/api/settings/test-proxy/route.ts`

AI providers (2):
- `src/infrastructure/ai/gemini-ai-provider.ts`
- `src/infrastructure/ai/fallback-ai-provider.ts`

Use cases (5):
- `src/application/use-cases/test-gemini-api-key.ts`
- `src/application/use-cases/check-key-health.ts`
- `src/application/use-cases/update-gemini-api-key.ts`
- `src/application/use-cases/update-model-tier.ts`
- `src/application/use-cases/update-ai-provider.ts`

Extraction service (1):
- `src/infrastructure/services/ai-pdf-extraction-service.ts` (Gemini multimodal PDF — Claude uses text-based extraction instead)

## Step 3: Simplify container (`src/lib/container.ts`)
- Remove Gemini/Fallback imports and factories
- Remove `isAiConfigured()`, `obterGoogleApiKey()`
- Replace `resolverConfiguracaoAiDoUsuario()` with simple Claude proxy config
- `criarProvedorAi()` → always `AnthropicProvedorAi`
- `criarServicoExtracao()` → always `AiTextPdfExtractionService`
- Remove use case factories for deleted use cases

## Step 4: Simplify model tiers (`src/lib/model-tiers.ts`)
- Remove Gemini tiers, `AiProvider` type, provider options
- Keep Claude tiers only

## Step 5: Simplify API routes
- `src/app/api/chat/route.ts` — Hardcode Claude config, remove web search
- `src/app/api/insights/route.ts` — Hardcode Claude config
- `src/app/api/reports/route.ts` — Hardcode Claude config
- `src/app/api/asset-performance/analyze/route.ts` — Hardcode Claude config

## Step 6: Clean up env, schemas, and deps
- `src/lib/env.ts` — Remove GOOGLE_API_KEY
- `src/schemas/user-settings.schema.ts` — Remove Gemini fields
- `src/domain/interfaces/user-settings-repository.ts` — Remove Gemini methods
- `src/infrastructure/repositories/user-settings-repository.ts` — Remove Gemini methods
- `package.json` — Remove `@google/generative-ai`
- `.env.example` — Remove GOOGLE_API_KEY
- `src/lib/schema.ts` — Leave DB table unchanged (backward compat)

## Step 7: Clean up remaining references
- Fix any dangling imports
- Remove `GetUserSettingsUseCase` if only used by deleted settings page

## Verification
1. `npx tsc --noEmit` — No type errors
2. `npm run lint` — No lint errors
3. `npm run test` — All tests pass
4. `npm run build` — Builds with AI disabled
