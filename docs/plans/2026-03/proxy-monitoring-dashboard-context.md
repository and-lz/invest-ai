# Context: Claude Proxy Monitoring Dashboard

## Requirements

### Goal
Add a monitoring dashboard for the Claude proxy that shows health status, request history (summary), and response metadata — all visible from within the app.

### Acceptance Criteria
- [ ] Proxy stores last N requests in an in-memory ring buffer (timestamp, method, endpoint, model, status, latency, token counts)
- [ ] New proxy endpoint `GET /stats` returns health + request history as JSON
- [ ] New Next.js page at `/admin/proxy` displays:
  - Health status (up/down with latency)
  - Uptime / start time
  - Total requests served
  - Request history table (most recent first) with: timestamp, model, status, latency, input/output tokens
- [ ] Page auto-refreshes data via polling (e.g. every 5s)
- [ ] Page requires authentication

### Out of Scope
- Full request/response body logging (user chose summary only)
- Persistent storage (resets on proxy restart — user chose in-memory)
- Admin role gating (any authenticated user can access)
- Real-time WebSocket streaming

### Edge Cases
- Proxy is down → page shows "proxy unreachable" state with clear message
- No requests yet → empty state with "no requests recorded yet"
- Ring buffer full → oldest entries dropped (FIFO)
- Proxy restarts → history resets, page handles gracefully

## Q&A Record
- Q: Where should the dashboard live? → A: Next.js page in the app (reuses auth, components, design system)
- Q: What detail level for request logs? → A: Summary only (timestamp, method, endpoint, model, status, latency, tokens — no message content)
- Q: How to store request history? → A: In-memory ring buffer in proxy process (resets on restart)

## Codebase Analysis

### Existing Patterns to Follow
- **Proxy server** — `scripts/claude-proxy.ts` — standalone Node.js HTTP server, all routes in single file, ANSI logging
- **Health check API** — `src/app/api/settings/test-proxy/route.ts` — fetches `proxyUrl/health` with timeout, returns JSON
- **Settings page** — `src/app/settings/page.tsx` — server component with `auth()`, passes initial data to client component
- **Navigation** — `src/components/layout/header-navigation.tsx` — primary/secondary nav items as array of `{href, label, icone}`
- **Design system** — `src/lib/design-system.ts` — `layout.pageSpacing`, `layout.pageHeader`, `typography.*`, `icon.*`

### Reusable Code Found
- `requireAuth()` at `src/lib/auth-utils.ts` — for API route auth
- `sendJson()` helper already in proxy — reuse for new `/stats` endpoint
- `CLAUDE_PROXY_URL` env var pattern from test-proxy route — reuse for fetching stats
- shadcn `Table`, `Card`, `Badge` components — for dashboard UI

### Affected Files
- `scripts/claude-proxy.ts` (modify) — Add ring buffer, record requests, expose `GET /stats`
- `src/app/admin/proxy/page.tsx` (create) — Monitoring dashboard page
- `src/app/admin/proxy/layout.tsx` (create) — Metadata layout
- `src/app/api/admin/proxy-stats/route.ts` (create) — API route that fetches `/stats` from proxy and forwards to client
- `src/components/layout/header-navigation.tsx` (modify) — Add admin link (secondary nav or user menu)

### Risks
- **Ring buffer size** (Low) — 200 entries should be sufficient, ~50KB memory max
- **Proxy URL mismatch** (Low) — Reuse same `CLAUDE_PROXY_URL` env var pattern as test-proxy
