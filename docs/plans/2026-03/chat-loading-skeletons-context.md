# Context: Chat Page — Missing Loading States & Skeletons

## Requirements

### Goal
Improve perceived performance and user feedback on the `/chat` page by adding proper loading states, skeletons, and visual feedback during async actions that currently have no indication of progress.

### Acceptance Criteria
- [ ] **Conversation loading skeleton**: When navigating to `/chat/[id]`, show message skeleton placeholders while `carregarConversa` fetches the conversation (currently shows empty state briefly)
- [ ] **Conversation delete feedback**: Show inline loading spinner on the conversation item being deleted (currently disappears instantly via optimistic update — but if it fails, it snaps back with no context)
- [ ] **Sidebar skeleton**: Conversations list shows skeleton rows instead of a single centered spinner during initial load
- [ ] **Saved messages skeleton**: Saved messages list shows skeleton rows instead of a single centered spinner
- [ ] **New conversation transition**: When clicking "Nova Conversa", the main chat area should show a clean transition rather than abruptly clearing

### Out of Scope
- Chat streaming indicators (bouncing dots already exist and work well)
- Error banners (already implemented)
- AI suggestion loading spinner (already exists in `suggestion-chips.tsx`)
- Retry button states (already exist)
- TTS loading states

### Edge Cases
- Conversation load fails → should show error state, not perpetual skeleton
- Delete rollback on failure → optimistic update already handles this via SWR
- Very fast loads (<100ms) → skeletons should not flash; use `min-h` approach rather than delayed show
- Empty conversation list after loading → should transition smoothly from skeleton to empty state

## Q&A Record
- (To be filled after user review)

## Codebase Analysis

### Existing Patterns to Follow
- **Dashboard skeleton pattern** — `src/app/(dashboard)/page.tsx:156-167` — `DashboardSkeleton` component using `Array.from({ length: N })` with `<Skeleton className="h-XX" />`
- **Skeleton component** — `src/components/ui/skeleton.tsx` — simple `bg-accent animate-pulse rounded-md` div
- **Design system loading tokens** — `src/lib/design-system.ts` — `icon.loadingSmall`, `icon.loadingMedium`, `icon.loadingLarge`
- **SWR loading pattern** — hooks return `estaCarregando` boolean, components conditionally render skeleton/content
- **Loader2 spinner** — used in conversations-list and saved-messages-list for current (basic) loading state

### Reusable Code Found
- `Skeleton` component at `src/components/ui/skeleton.tsx` — ready to use, currently NOT used in chat
- `cn()` utility at `src/lib/utils.ts` — for conditional class merging
- `icon.loadingSmall` at `src/lib/design-system.ts` — for inline loading spinners
- `groupByDate` at `src/lib/date-grouping.ts` — already used in both lists

### Affected Files
- `src/components/chat/conversations-list.tsx` (modify) — Replace Loader2 spinner with skeleton rows
- `src/components/chat/saved-messages-list.tsx` (modify) — Replace Loader2 spinner with skeleton rows
- `src/components/chat/chat-body.tsx` (modify) — Add conversation loading skeleton state
- `src/hooks/use-chat-assistant.ts` (modify) — Expose `estaCarregando` separately from `estaTransmitindo`
- `src/app/chat/[id]/page.tsx` (modify) — Pass loading state to ChatBody

### Risks
- **Skeleton flash on fast loads** (Low) — Mitigate by keeping skeletons minimal height, no delayed show logic needed
- **Breaking `estaTransmitindo` consumers** (Med) — Currently `estaTransmitindo` includes loading state. Need to separate without breaking existing behavior in chat-widget.tsx

## Key Findings

### Problem 1: `estaTransmitindo` conflates two states
In `use-chat-assistant.ts:421`, the hook returns `estaTransmitindo: estaTransmitindo || estaCarregando`. This means:
- ChatBody can't distinguish "loading a conversation" from "streaming a response"
- The bouncing dots show during conversation load (wrong visual)
- No way to show a different skeleton for conversation loading

### Problem 2: Sidebar uses single spinner instead of skeletons
Both `conversations-list.tsx:32-38` and `saved-messages-list.tsx:30-36` show a single centered `Loader2` spinner. This causes layout shift when content loads — skeleton rows would maintain layout stability.

### Problem 3: No loading state when navigating between conversations
When clicking a conversation in the sidebar, the chat area shows the previous conversation until the new one loads, then abruptly swaps. There's no visual indication that a new conversation is loading.
