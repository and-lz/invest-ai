# Electron Dev Mode: Start Proxy Alongside Next Dev

## Context
In dev mode, `startDevServer()` only spawns `npx next dev --turbopack`.
The proxy (`scripts/claude-proxy.ts`) is never started — it's left as "started separately or via npm run dev".
This means Claude API calls fail unless the user manually runs `npm run dev` or the proxy separately.

`npm run dev:raw` (what `npm run dev` calls) runs both:
- `next dev --turbopack`
- `npx tsx scripts/claude-proxy.ts`

**Affected file:** `electron/main.ts`

## Plan
1. Add `startDevProxy()` — spawns `npx tsx scripts/claude-proxy.ts` with `PROXY_PORT` env var
2. In `app.whenReady()` dev branch, call `startDevProxy()` after `startDevServer()`

## Verification
- `npm run desktop:build-main` compiles clean
- Running `npm run desktop` starts both next dev AND the proxy
