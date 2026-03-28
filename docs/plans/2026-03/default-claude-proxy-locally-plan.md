# Default Claude Proxy Locally
## Context
`DEFAULT_AI_PROVIDER` in `model-tiers.ts` is hardcoded to `"gemini"`. `.env.local` already has `AI_PROVIDER="gemini"` but the code ignores it.
## Plan
1. Update `DEFAULT_AI_PROVIDER` in `model-tiers.ts` to read from `process.env.AI_PROVIDER`, falling back to `"gemini"`
2. Change `.env.local` to `AI_PROVIDER="claude-proxy"`
3. Update test to cover env-driven default
## Verification
- `npm run test -- model-tiers` passes
- `DEFAULT_AI_PROVIDER` resolves to `"claude-proxy"` when env var is set
