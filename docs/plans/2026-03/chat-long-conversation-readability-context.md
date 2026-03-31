# Context: Improve Long Conversation Readability in /chat

## Requirements

### Goal
Make long chat conversations easier to read and navigate. Currently, long threads feel like a wall of text with no visual anchors, and auto-scroll disrupts reading when reviewing earlier messages during streaming.

### Acceptance Criteria
- [ ] Messages show timestamps (relative or absolute) as visual anchors
- [ ] Date separators appear between messages from different days
- [ ] Visual spacing/dividers between user-assistant message pairs improve scanability
- [ ] Auto-scroll only triggers when user is already near the bottom of the scroll area
- [ ] A floating "scroll to bottom" button appears when user scrolls up, with unread indicator
- [ ] All changes work in both widget mode (420px dialog) and fullscreen (`/chat/[id]`)
- [ ] No regressions: streaming, thinking indicator, reasoning collapsible, bookmarks, TTS still work

### Out of Scope
- Collapsible/expandable messages (deferred — separate feature)
- Message search/filter
- Jump-to-message by ID
- Changes to markdown rendering or typography scale

### Edge Cases
- Empty conversation → no scroll button, no timestamps
- Single message → timestamp shown, no date separator needed
- Streaming in progress + user scrolled up → no forced scroll; "scroll to bottom" button shows "new message" badge
- All messages from same day → no date separator, just timestamps
- Widget mode (small viewport) → scroll button and timestamps must fit without clutter

## Q&A Record
- Q: What pain points? → A: Wall of text, Lost in scroll
- Q: What solutions? → A: Better typography, Smart auto-scroll, Scroll-to-top + anchors

## Codebase Analysis

### Existing Patterns to Follow
- **Design system tokens** — `src/lib/design-system.ts` — all sizing/spacing must use DS tokens (`typography.*`, `icon.*`, `layout.*`)
- **Message bubble structure** — `src/components/chat/chat-message.tsx` — each message is a `<div>` with thinking/reasoning/content sections, `group/msg` for hover effects
- **Scroll container** — `src/components/chat/chat-body.tsx:80-84` — `areaScrollRef` div with `overflow-y-auto`, auto-scroll via `useEffect` on `mensagens`
- **Fullscreen flag** — `fs` boolean passed through all chat components controls sizing (`text-base` vs `text-sm`, padding, max-width)
- **CSS animations** — `src/app/globals.css:458+` — chat animations use `@apply` + `@keyframes` in globals

### Reusable Code Found
- `cn()` at `src/lib/utils.ts` — class merging utility (used everywhere)
- `typography.helper` at `src/lib/design-system.ts` — `text-xs text-muted-foreground` (ideal for timestamps)
- `icon.micro` at `src/lib/design-system.ts` — `h-3.5 w-3.5` (for small indicators)
- `MensagemChat.criadaEm` field already exists in schema (`src/schemas/chat.schema.ts`) — ISO datetime string, just never displayed

### Affected Files
- `src/components/chat/chat-body.tsx` (modify) — Smart auto-scroll logic, scroll-to-bottom FAB, date separators between messages
- `src/components/chat/chat-message.tsx` (modify) — Add timestamp display below each message
- `src/app/globals.css` (modify) — Scroll-to-bottom button animation (fade in/out)

### Risks
- **Smart scroll edge case** (Med) — Must correctly detect "near bottom" threshold; too small = misses, too large = still scrolls when unwanted. Mitigation: use ~100px threshold, test with streaming.
- **Performance with many messages** (Low) — Date separator computation runs on every render. Mitigation: memoize or compute inline (trivial string comparison).
