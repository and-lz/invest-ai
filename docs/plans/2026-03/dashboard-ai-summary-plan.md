# Plan: Dashboard AI Summary (Hero Card)

## Context
The dashboard currently shows raw data (charts, tables, metrics) but no AI-generated executive summary. With the Claude proxy already integrated, we can add a hero card at the top that auto-generates a concise highlight summary when the page loads — making it instantly clear what matters this month.

## Approach: Reuse `/api/chat` with a dedicated summary prompt

Instead of creating a new API route, we send a single-message chat request to the existing `/api/chat` endpoint with:
- A user message containing the serialized dashboard context + a prompt asking for highlights
- `identificadorPagina: "dashboard"` for proper system prompt context

This minimizes backend changes and reuses the proven streaming infrastructure.

## Implementation Steps

### Step 1: Create `src/hooks/use-dashboard-ai-summary.ts`

New hook that manages streaming summary generation with client-side caching.

**Key behavior:**
- Accepts `DashboardData | null` and `periodoSelecionado: string`
- On data change: checks in-memory cache (`Map<string, string>`) keyed by period
- Cache hit → return cached text immediately, no API call
- Cache miss → fetch `/api/chat` with streaming, accumulate text, store in cache on completion
- Uses `AbortController` to cancel in-flight requests on period change or unmount
- Returns `{ resumo: string | null, estaGerando: boolean, erro: string | null }`
- Uses `serializarContextoDashboard()` to build the context
- The user message prompt: concise instruction asking for 3-5 bullet highlights (biggest gain, biggest loss, total variation, notable allocation changes)
- Strips `[HIGHLIGHT:...]` and `[SUGGESTIONS:...]` markers from response (not needed here)

**Reuses:**
- Streaming reader pattern from `src/hooks/use-chat-assistant.ts` (fetch + getReader + TextDecoder loop)
- `serializarContextoDashboard()` from `src/lib/serialize-chat-context.ts`
- `isAiEnabled()` from `src/lib/ai-features.ts`

### Step 2: Create `src/components/dashboard/ai-summary-card.tsx`

New component for the hero card UI.

**Props:** `{ dadosDashboard: DashboardData; periodoSelecionado: string }`

**Visual design:**
- Full-width Card with subtle Fortuna branding (fortuna-minimal.png icon, 20px)
- Title: "Resumo Fortuna" with `typography.h3`
- Body: markdown-rendered streaming text (or simple paragraphs with line breaks)
- Loading: pulsing skeleton lines (3 lines, staggered width)
- Error: hidden (card not shown) — non-blocking
- Uses `interaction.cardHover` for subtle hover effect
- `text-muted-foreground` for body text (80/20 color rule)

**Gated by:** `isAiEnabled()` — component returns `null` if AI disabled.

### Step 3: Modify `src/app/(dashboard)/page.tsx`

Add `AiSummaryCard` between the header section and `SummaryCards`.

**Changes:**
- Import `AiSummaryCard` (dynamic import with `ssr: false` like other heavy components)
- Import `isAiEnabled`
- Render conditionally: only when `isAiEnabled() && dadosDashboard` is truthy
- Pass `dadosDashboard` and `periodoSelecionado ?? dadosDashboard.mesAtual`

## Files Changed
| File | Action | What |
|------|--------|------|
| `src/hooks/use-dashboard-ai-summary.ts` | create | Streaming hook with cache |
| `src/components/dashboard/ai-summary-card.tsx` | create | Hero card UI component |
| `src/app/(dashboard)/page.tsx` | modify | Wire up AiSummaryCard |

## Verification
1. `npx tsc --noEmit` — no type errors
2. `npm run lint` — no lint errors
3. Manual test: load dashboard with proxy running → summary streams in progressively
4. Switch period → new summary generates, switch back → cached summary shown instantly
5. Stop proxy → dashboard loads normally, summary card hidden or shows no error
6. `isAiEnabled() === false` → card not rendered at all
