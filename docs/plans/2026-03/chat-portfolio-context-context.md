# Context: Inject User Portfolio Data into Chat AI Context

## Requirements

### Goal
When the user opens the dedicated chat page (`/chat/[id]`), the AI (Fortuna) currently has **no portfolio data** — only page descriptions. The dashboard page serializes context via `serializarContextoDashboard()`, but that only works when the chat widget is opened *from* the dashboard.

We need the chat to always have access to the user's full portfolio data regardless of which page they opened it from, so the AI can give personalized, data-driven answers about the user's investments.

### Acceptance Criteria
- [ ] When a user opens `/chat/[id]` or `/chat`, the AI has access to their dashboard summary (patrimonio, benchmarks, allocation, performers, strategies, events)
- [ ] When a user opens chat from any page (not just dashboard), portfolio data is still available
- [ ] All available months of data are accessible to the AI
- [ ] Existing page-specific context (e.g., from dashboard, insights, trends) is preserved and takes priority when available
- [ ] No regression: chat from dashboard page with `contextoPagina` already set continues working as before
- [ ] Token usage stays reasonable (< 50KB context limit already enforced by schema)

### Out of Scope
- Tool/function calling for on-demand data fetching (adds complexity to streaming architecture)
- Insights data injection (can be a follow-up)
- Action plan items injection
- Changes to the AI provider or streaming logic

### Edge Cases
- User has no reports → AI should still work, just without portfolio data (current "no context" behavior)
- User has many months (20+) → serialization must stay within 50KB limit; truncate oldest months first
- API fails to load dashboard data → chat should still work without portfolio context (graceful degradation)
- Concurrent requests → dashboard data loading should not block chat message sending

## Q&A Record
- Q: Upfront injection vs on-demand tools? → A: **Upfront injection in system prompt.** Portfolio data is bounded (personal dashboard), and tool calling adds significant complexity to the existing streaming architecture. The AI needs most of this data for any portfolio question anyway.
- Q: Format? → A: **Markdown (current pattern).** All existing serializers use markdown format. Consistent, readable, and token-efficient. Claude handles structured markdown well.
- Q: How many months? → A: **All available months.** User explicitly requested this. The 50KB context limit and truncation function already provide safety bounds.

## Codebase Analysis

### Existing Patterns to Follow

1. **Page context serialization** — see `src/lib/serialize-chat-context.ts` — Each page serializes its data to markdown via `serializarContextoXxx()` functions and calls `definirContexto(pageId, serializedData)`. The chat API receives this as `contextoPagina` and appends to system prompt.

2. **Dashboard data fetching** — see `src/application/use-cases/get-dashboard-data.ts` — `GetDashboardDataUseCase.executar(mesAno?)` returns full `DashboardData` including all positions, benchmarks, allocation, etc. Used by dashboard page via `/api/dashboard` endpoint.

3. **System prompt builder** — see `src/lib/build-chat-system-prompt.ts:76-79` — Already handles optional `contextoPagina`: appends to system prompt if present, shows fallback message if absent.

4. **Chat API route** — see `src/app/api/chat/route.ts:40-42` — Receives `contextoPagina` from frontend and passes to system prompt builder.

5. **Chat page context** — see `src/contexts/chat-page-context.tsx` — React context with `definirContexto(pageId, data?)`. Default is `"dashboard"` with no data.

### Reusable Code Found
- `serializarContextoDashboard(dados)` at `src/lib/serialize-chat-context.ts:19` — Already serializes DashboardData to markdown. Can be reused directly.
- `GetDashboardDataUseCase` at `src/application/use-cases/get-dashboard-data.ts` — Already calculates all dashboard aggregations.
- `obterDashboardDataUseCase()` at `src/lib/container.ts` — DI factory for the use case.
- `truncar()` at `src/lib/serialize-chat-context.ts:10` — Already truncates to 15K chars.

### Approach: Server-side injection in chat API

**Why server-side (in `/api/chat`) instead of client-side (in chat page)?**
- Avoids sending large payload from client → server in every chat request
- Works regardless of which page the user opened the chat from
- Single point of data loading — no need to coordinate across pages
- Dashboard data is already cached server-side (60s in-memory cache)

**How:** When the chat API receives a request without `contextoPagina`, it loads dashboard data server-side and serializes it before building the system prompt.

### Affected Files
- `src/app/api/chat/route.ts` (modify) — Add server-side portfolio data loading when `contextoPagina` is absent
- `src/lib/serialize-chat-context.ts` (modify) — Add `serializarContextoCompletoUsuario()` that includes all positions + historical evolution (not just current month summary)
- `src/lib/build-chat-system-prompt.ts` (modify) — Minor: ensure system prompt clearly labels portfolio data section

### Risks
- **Token bloat** (Medium) — Full portfolio data with all months could be large. Mitigation: truncation at 15K chars already exists; serialize compact markdown; prioritize most recent data.
- **Latency** (Low) — Dashboard data loading adds ~100-200ms to first chat message. Mitigation: data is cached in-memory (60s); loading happens in parallel with other processing.
- **Stale data** (Low) — If user uploads new report during chat session, context won't update. Mitigation: acceptable for MVP; 60s cache means data is fairly fresh.
