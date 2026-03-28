# Context: Dashboard AI Summary (Hero Card)

## Requirements

### Goal
Add an AI-powered summary card at the top of the dashboard (before SummaryCards) that auto-generates key highlights when the page loads. Uses the existing Claude proxy integration to produce a concise, opinionated executive summary of the user's portfolio for the selected period.

### Acceptance Criteria
- [ ] Hero card renders at the top of the dashboard, before the 4 summary metric cards
- [ ] Summary auto-generates on page load when `isAiEnabled()` is true and dashboard data is available
- [ ] Uses the serialized dashboard context (`serializarContextoDashboard`) as input to Claude
- [ ] Streaming response displayed progressively (same pattern as chat)
- [ ] Cached per period — switching periods triggers new generation, but returning to a previous period reuses cache
- [ ] Loading state shows skeleton while streaming
- [ ] Error state is non-blocking (card hidden or shows subtle error, dashboard still usable)
- [ ] Card is not rendered at all when `isAiEnabled()` is false
- [ ] Card is not rendered when dashboard is empty (no reports)

### Out of Scope
- Persisting summary to server/database (client-side cache only, per session)
- Regenerate/refresh button (auto only for now)
- Summary for non-dashboard pages

### Edge Cases
- AI disabled (`isAiEnabled() === false`) → card not rendered
- No dashboard data (empty state) → card not rendered
- Proxy unavailable/error → card shows brief error or hides, dashboard remains functional
- Period change mid-stream → abort current stream, start new one for new period
- Very fast period switching → debounce or abort previous request

## Q&A Record
- Q: What data should be summarized? → A: Key highlights only — biggest gain, biggest loss, total variation for the month
- Q: Which AI model? → A: Claude via existing proxy (`claude-proxy` provider in container.ts)
- Q: Where on the page? → A: Hero card at top, before everything else (after header/period selector)
- Q: When generated? → A: Auto on page load with client-side cache per period

## Codebase Analysis

### Existing Patterns to Follow

1. **Streaming from API** — `src/hooks/use-chat-assistant.ts` uses `fetch().body.getReader()` with progressive text accumulation. The summary hook should follow this exact pattern but simplified (no conversation history, no highlights, no suggestions).

2. **AI Provider + Chat API** — `src/app/api/chat/route.ts:49-76` creates a `ReadableStream` piping `provedor.transmitir()` chunks. The summary can reuse this exact API route by sending a single user message with the serialized context.

3. **Dashboard context serialization** — `src/lib/serialize-chat-context.ts:19-118` (`serializarContextoDashboard`) already converts `DashboardData` to compact markdown. This is the input for the summary prompt.

4. **Feature gating** — `src/lib/ai-features.ts` exports `isAiEnabled()` which checks `NEXT_PUBLIC_AI_ENABLED`. All AI UI components gate on this.

5. **Design system tokens** — `src/lib/design-system.ts` provides `typography.*`, `icon.*`, `layout.*` for consistent styling.

6. **TakeawayBox pattern** — `src/components/ui/takeaway-box.tsx` is the existing pattern for data-driven conclusions in cards. The AI summary card should have a similar visual weight but with streaming text.

### Reusable Code Found
- `serializarContextoDashboard()` at `src/lib/serialize-chat-context.ts:19` — provides the markdown context to send to AI
- `isAiEnabled()` at `src/lib/ai-features.ts:7` — feature gate
- `/api/chat` route at `src/app/api/chat/route.ts` — can be reused directly (send a single message asking for summary)
- `RequisicaoChatSchema` at `src/schemas/chat.schema.ts` — validates chat request body
- Streaming reader pattern from `src/hooks/use-chat-assistant.ts`
- `obterAiConfig()` + `criarProvedorAi()` at `src/lib/container.ts:65-74`

### Affected Files
- `src/app/(dashboard)/page.tsx` (modify) — Add AI summary card before SummaryCards
- `src/components/dashboard/ai-summary-card.tsx` (create) — New component for the AI summary hero card
- `src/hooks/use-dashboard-ai-summary.ts` (create) — New hook for streaming summary generation with caching

### Risks
- **API cost per page load** (Med) — Every dashboard load triggers an AI call. Mitigated by client-side caching per period per session.
- **Slow first load** (Low) — Streaming shows progressive text, so perceived latency is low.
- **Proxy down** (Low) — Error handling ensures dashboard remains fully functional.
