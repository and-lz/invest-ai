# Plan: Chat UI — Claude Code Web Style

**Context**: [chat-claude-code-ui-context.md](./chat-claude-code-ui-context.md)

## Steps

### Step 1: Create date grouping utility
**Files**: `src/lib/date-grouping.ts` (create)
**Changes**:
- Export `groupConversationsByDate(conversations)` — takes array with `atualizadaEm` ISO string, returns `{ label: string, items: T[] }[]` with groups: "Hoje", "Ontem", "Últimos 7 dias", "Mais antigas"
- Pure function, no dependencies beyond date comparison
**Verify**: `tsc --noEmit` passes

### Step 2: Redesign message component — remove bubbles
**Files**: `src/components/chat/chat-message.tsx` (modify)
**Pattern**: Claude Code web style — full-width, role label above content
**Changes**:
- Remove bubble container (`rounded-2xl`, `bg-primary`/`bg-secondary`, `max-w-[80%]`)
- Remove `flex-row-reverse` for user messages — all messages left-aligned
- Add role label row: avatar (small) + name ("Você" / "Fortuna") above message content
- Assistant messages: wrap content in `bg-muted` full-width block with `py-4 px-5` padding
- User messages: no background, just content with same padding
- Keep avatar sizes responsive via `fs` prop (widget: `h-6 w-6`, page: `h-8 w-8`)
- Keep streaming dots, error display, retry button — just remove bubble wrapper
**Verify**: `tsc --noEmit`, visual check on both widget and `/chat/` page

### Step 3: Update chat body — separators and spacing
**Files**: `src/components/chat/chat-body.tsx` (modify)
**Changes**:
- Replace `space-y-4` between messages with `divide-y divide-border/50` or `border-t` per message (skip first)
- Remove `mx-auto max-w-4xl` wrapper per message — messages are full-width within the `max-w-[80ch]` container
- Keep empty state, suggestion chips, error banner, input field as-is
**Verify**: `tsc --noEmit`, visual check — messages separated by subtle lines

### Step 4: Redesign sidebar — date grouping + compact items
**Files**: `src/components/chat/conversations-list.tsx` (modify), `src/components/chat/conversation-item.tsx` (modify)
**Pattern**: Claude Code project sidebar — grouped headers, compact single-line items
**Changes in `conversations-list.tsx`**:
- Import `groupConversationsByDate` from `src/lib/date-grouping.ts`
- Group conversations before rendering
- Render group headers as small uppercase labels (`text-xs font-medium text-muted-foreground uppercase tracking-wider`)
- Each group separated by spacing, header acts as section divider

**Changes in `conversation-item.tsx`**:
- Remove preview text (`previewMensagem`, `line-clamp-2`)
- Remove message count + MessageSquare icon footer
- Compact layout: title (single line, `line-clamp-1`) + relative timestamp on the right
- Reduce padding: `p-2` (widget) / `p-2.5` (fullscreen)
- Keep active state, hover, delete button
**Verify**: `tsc --noEmit`, visual check — sidebar shows grouped, compact list

## New Files
- `src/lib/date-grouping.ts` — Date grouping utility for conversation sidebar

## Verification Plan
- Build: `npx tsc --noEmit` → succeeds
- Lint: `npm run lint` → passes
- Tests: `npm run test` → all pass (no chat tests exist, but ensures no regressions)
- Manual — Widget: Open FAB on dashboard → messages full-width, no bubbles, assistant has bg-muted
- Manual — Page: Navigate to `/chat/` → same message style, sidebar shows date groups
- Manual — Mobile: Resize to mobile → sidebar drawer works, messages readable
- Manual — Streaming: Send a message → loading dots display correctly without bubble
- Manual — Empty state: New conversation → Fortuna icon + suggestions still centered

## Risks
- **Widget compactness** (Medium) — 420px wide widget with full-width messages + role labels. Mitigated by smaller avatars and tighter padding in widget mode via `fs` prop.
- **No existing tests for chat UI** (Low) — Changes are purely visual. Existing unit tests for domain/utils unaffected.
