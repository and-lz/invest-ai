# Plan: Chat Page — Missing Loading States & Skeletons

**Context**: [chat-loading-skeletons-context.md](./chat-loading-skeletons-context.md)

## Steps

### Step 1: Separate `estaCarregando` from `estaTransmitindo` in the hook
**Files**: `src/hooks/use-chat-assistant.ts` (modify)
**Changes**:
- Add `estaCarregandoConversa` to the return type (`UseChatAssistenteRetorno`)
- Return `estaCarregandoConversa: estaCarregando` as a separate boolean
- Keep `estaTransmitindo: estaTransmitindo || estaCarregando` for backward compatibility (widget still works unchanged)
**Verify**: `tsc --noEmit` passes; chat-widget.tsx still compiles without changes

### Step 2: Add conversation loading skeleton to ChatBody
**Files**: `src/components/chat/chat-body.tsx` (modify), `src/app/chat/[id]/page.tsx` (modify)
**Pattern**: Following dashboard skeleton pattern (`src/app/(dashboard)/page.tsx:156-167`)
**Changes**:
- Add `estaCarregandoConversa?: boolean` prop to `ChatBodyProps`
- When `estaCarregandoConversa` is true, render message-shaped skeletons (3 alternating bubbles: short user, long assistant, short user) instead of messages or empty state
- In `page.tsx`: destructure `estaCarregandoConversa` from hook, pass to `ChatBody`
- Skeletons use `<Skeleton>` from `src/components/ui/skeleton.tsx`
**Verify**: Navigate to `/chat/[id]` — see skeleton briefly while conversation loads; empty state no longer flashes

### Step 3: Replace sidebar spinners with skeleton rows
**Files**: `src/components/chat/conversations-list.tsx` (modify), `src/components/chat/saved-messages-list.tsx` (modify)
**Pattern**: Following dashboard skeleton pattern
**Changes**:
- `conversations-list.tsx`: Replace `Loader2` spinner with 5 skeleton rows (`<Skeleton className="h-8 rounded-md" />`) inside the same container structure (including the "Nova Conversa" button visible during loading)
- `saved-messages-list.tsx`: Replace `Loader2` spinner with 4 skeleton rows (`<Skeleton className="h-12 rounded-md" />`) — taller since saved messages show title + preview
- Remove `Loader2` import if no longer used in each file
**Verify**: Open sidebar — see skeleton rows that match the layout of real conversation items

### Step 4: Add delete-in-progress feedback to conversation item
**Files**: `src/components/chat/conversation-item.tsx` (modify), `src/components/chat/conversations-list.tsx` (modify)
**Changes**:
- `conversation-item.tsx`: Add optional `estaExcluindo?: boolean` prop. When true, show `Loader2` spinner replacing the `Trash2` icon and apply `opacity-50 pointer-events-none` to the item
- `conversations-list.tsx`: Track `deletingId` state. Pass to `ItemConversa` via `estaExcluindo={conversa.identificador === deletingId}`. Wrap `deletarConversa` to set/clear `deletingId`
**Verify**: Click delete on a conversation — see spinner + dimmed item before optimistic removal

## New Files
None — all changes are modifications to existing files.

## Verification Plan
- Build: `npx tsc --noEmit && npx next lint` → succeeds
- Tests: `npm run test` → all pass (no chat component tests to break)
- Manual:
  1. Navigate to `/chat` → new conversation, empty state shows immediately (no skeleton)
  2. Navigate to `/chat/[existing-id]` → message skeletons appear briefly, then conversation loads
  3. Open sidebar → skeleton rows appear, then conversations load
  4. Switch to "Salvos" tab → skeleton rows appear, then saved messages load
  5. Delete a conversation → spinner appears on item, then it disappears
  6. Open chat widget (non-chat page) → same sidebar skeletons work in widget mode
  7. Fast loads → skeletons don't flash annoyingly (just brief pulse)

## Risks
- **Breaking widget behavior** (Low) — `estaTransmitindo` still includes loading state for backward compat; widget code unchanged
- **Skeleton height mismatch** (Low) — Use heights matching real items; adjust if needed during implementation
