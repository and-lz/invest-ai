# Plan: Claude Proxy Monitoring Dashboard

**Context**: [proxy-monitoring-dashboard-context.md](./proxy-monitoring-dashboard-context.md)

## Steps

### Step 1: Add in-memory ring buffer + `GET /stats` to proxy
**Files**: `scripts/claude-proxy.ts` (modify)
**Pattern**: Follows existing route handler style in same file (`handleMessages`, `sendJson`)
**Changes**:
- Add `RequestLogEntry` interface: `{ timestamp, method, url, model, statusCode, latencyMs, inputTokens, outputTokens }`
- Add ring buffer: fixed-size array (200 entries), push with overflow eviction
- Record `startedAt = Date.now()` at server startup for uptime
- Track `totalRequests` counter (persists even when ring buffer drops old entries)
- Instrument `handleMessages` to record each request into the buffer after response
- Add `GET /stats` route returning: `{ status, startedAt, uptimeMs, totalRequests, bufferSize, requests: [...] }`
**Verify**: `curl http://localhost:3099/stats` returns valid JSON with empty requests array; make a `/v1/messages` call, then `/stats` shows it

### Step 2: Add Next.js API route to proxy stats through to client
**Files**: `src/app/api/admin/proxy-stats/route.ts` (create)
**Pattern**: Following `src/app/api/settings/test-proxy/route.ts` (fetch from proxy, forward JSON)
**Changes**:
- `GET` handler with `requireAuth()`
- Fetch `${proxyUrl}/stats` with 5s timeout
- On success: forward the JSON
- On failure: return `{ reachable: false, error: message }`
**Verify**: `npm run dev`, hit `GET /api/admin/proxy-stats` → returns proxy stats or unreachable error

### Step 3: Create monitoring dashboard page
**Files**: `src/app/admin/proxy/layout.tsx` (create), `src/app/admin/proxy/page.tsx` (create)
**Pattern**: Following settings page structure (layout with metadata + client page component)
**Changes**:
- `layout.tsx`: metadata `{ title: "Proxy Monitor | Investimentos" }`
- `page.tsx` (`"use client"`):
  - SWR fetch to `/api/admin/proxy-stats` with 5s polling (`refreshInterval: 5000`)
  - **Health card**: status badge (green/red), uptime, total requests
  - **Request history table**: timestamp, model, status, latency, input/output tokens — most recent first
  - **Unreachable state**: card with warning when proxy is down
  - **Empty state**: message when no requests yet
  - Uses design system tokens (`layout.pageSpacing`, `typography.*`, `icon.*`)
  - Uses shadcn `Card`, `Table`, `Badge`
**Verify**: Open `/admin/proxy` in browser → shows health + table; make API calls → table updates on next poll

### Step 4: Add navigation link
**Files**: `src/components/layout/header-navigation.tsx` (modify)
**Pattern**: Secondary nav items array (`todosItensSecundarios`)
**Changes**:
- Add `{ href: "/admin/proxy", label: "Proxy", icone: Activity }` to secondary nav items
**Verify**: Nav "Mais" dropdown shows "Proxy" link, clicking navigates to dashboard

## New Files
- `src/app/admin/proxy/layout.tsx` — Metadata layout — pattern from `src/app/settings/layout.tsx`
- `src/app/admin/proxy/page.tsx` — Dashboard page (client component) — pattern from `src/app/settings/page.tsx`
- `src/app/api/admin/proxy-stats/route.ts` — API proxy route — pattern from `src/app/api/settings/test-proxy/route.ts`

## Verification Plan
- Build: `npm run build` → succeeds
- Tests: `npm run test` → all pass (no new tests needed — this is a dev-only monitoring page)
- Manual:
  1. `npm run dev` (starts both Next.js + proxy)
  2. Open `/admin/proxy` → shows health status (green), 0 requests
  3. Use the app (chat, insights, etc.) to generate proxy requests
  4. Return to `/admin/proxy` → table shows request history with correct data
  5. Stop proxy → page shows "unreachable" state within 5s
  6. Restart proxy → page recovers, history is empty (expected)

## Risks
- **Ring buffer memory** (Low) — 200 entries × ~200 bytes ≈ 40KB, negligible
- **Proxy URL env var** (Low) — Reuses same `CLAUDE_PROXY_URL` pattern as existing test-proxy route
