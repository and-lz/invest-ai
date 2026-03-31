# Plan: Improve Long Conversation Readability in /chat

**Context**: [chat-long-conversation-readability-context.md](./chat-long-conversation-readability-context.md)

## Steps

### Step 1: Smart auto-scroll + scroll-to-bottom FAB
**Files**: `src/components/chat/chat-body.tsx` (modify), `src/app/globals.css` (modify)
**Pattern**: Existing `areaScrollRef` + `useEffect` at `chat-body.tsx:68-75`
**Changes**:
- Replace unconditional auto-scroll with smart scroll: track `isNearBottom` via `onScroll` handler (threshold ~100px)
- Only auto-scroll when `isNearBottom` is true (or on first load / new conversation)
- Track `hasNewMessages` state: set `true` when new messages arrive while scrolled up, reset on scroll-to-bottom
- Add floating "scroll to bottom" button (ChevronDown icon) inside the scroll container, positioned `absolute bottom-4 right-4`
  - Show only when `!isNearBottom`
  - Show dot badge when `hasNewMessages` is true
  - `onClick`: smooth-scroll to bottom + reset `hasNewMessages`
  - Widget: smaller button (`h-8 w-8`), fullscreen: `h-9 w-9`
- Add CSS fade-in/fade-out animation for the button in `globals.css`

**Verify**: Open chat, send multiple messages to create scroll. Scroll up — button appears. New streaming message arrives — no forced scroll, badge appears on button. Click button — scrolls to bottom smoothly.

### Step 2: Timestamps on messages
**Files**: `src/components/chat/chat-message.tsx` (modify)
**Pattern**: Existing `typography.helper` token (`text-xs text-muted-foreground`)
**Changes**:
- Add timestamp below each message bubble using `criadaEm` field
- Format: relative for recent messages (e.g. "2 min ago"), short time for older (e.g. "14:32")
  - Use `Intl.RelativeTimeFormat` + simple helper (inline, no new file) — if <1h show relative, otherwise show HH:MM
- Position: below the message div, aligned to the message side (right for user, left for assistant)
- Style: `typography.helper` classes, visible by default (not hover-gated — serves as visual anchor)
- During streaming: hide timestamp on the currently streaming message (no `criadaEm` yet meaningful)

**Verify**: Messages show timestamps. Recent messages show "agora", "1 min", older show "14:32". No timestamp on streaming message.

### Step 3: Date separators between message groups
**Files**: `src/components/chat/chat-body.tsx` (modify)
**Pattern**: Existing message list loop at `chat-body.tsx:117-143`
**Changes**:
- Before rendering each message, compare its `criadaEm` date with the previous message's date
- If different day (or first message): insert a date separator row
- Separator design: centered text with horizontal lines on each side (e.g. `── 28 de marco ──`)
  - Text: `typography.helper` style
  - Lines: `border-t border-border/30` extending to edges via flex
- Compute day string using `Intl.DateTimeFormat("pt-BR", { day: "numeric", month: "long" })` — inline, no new utility
- Today's date shows "Hoje", yesterday shows "Ontem"

**Verify**: Load conversation spanning multiple days — date separators appear. Same-day conversation — no separators. Widget and fullscreen both render correctly.

## New Files
None — all changes modify existing files.

## Verification Plan
- Build: `npm run build` → succeeds (no type errors)
- Lint: `npm run lint` → passes
- Tests: `npm run test` → all pass (no chat unit tests affected)
- Manual (widget): Open widget, long conversation → timestamps visible, scroll up → FAB appears, send message while scrolled up → no forced scroll + badge on FAB
- Manual (fullscreen): Open `/chat/[id]` with long history → date separators between days, smart scroll works

## Risks
- **Smart scroll threshold** (Med) — 100px threshold may need tuning. Mitigation: test with both short and long messages, adjust if needed.
- **Timestamp format locale** (Low) — `Intl.RelativeTimeFormat` with "pt-BR" should work in all target browsers. Mitigation: fallback to HH:MM if relative format fails.
