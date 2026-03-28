# Context: Chat Fullscreen Redesign

## Requirements

### Goal
Transform fullscreen chat from a "scaled-up widget" into a proper full-page app experience. Bigger fonts, wider layout, larger sidebar, better spacing — it should feel like a dedicated chat application, not a popover that grew.

### Acceptance Criteria
- [ ] Message text in fullscreen uses `text-base`/`text-lg` (not `text-sm`)
- [ ] Input area is taller, with `text-base` font and more padding
- [ ] Sidebar is wider (320px+ vs current 256px) with larger text
- [ ] Header is more prominent with larger title and icons
- [ ] Message bubbles have more generous padding and spacing
- [ ] Empty state scales up (larger icon, bigger text)
- [ ] Suggestion chips use `text-sm` (not `text-xs`)
- [ ] Markdown content (headings, lists, tables, code) scales up proportionally
- [ ] Avatar size increases (from 32px to 40px+)
- [ ] Message area has more breathing room between messages
- [ ] Non-fullscreen (widget) mode is completely unchanged
- [ ] Mobile layout (already full-viewport) is unchanged
- [ ] Chat remains functional — scroll, streaming, TTS, suggestions all work

### Out of Scope
- New features (no new buttons, panels, or functionality)
- Changing the non-fullscreen widget layout
- Changing mobile-specific behavior
- Changing chat logic/hooks/API

### Edge Cases
- Long messages → `max-w-[80ch]` already handles readability (keep)
- Tables in markdown → need larger font too
- Code blocks → scale up but keep monospace proportions
- Empty state with no messages → scale up proportionally
- Sidebar overlay on smaller desktop screens → wider sidebar must still fit

## Q&A Record
- Q: What does "more useful" mean? → A: Full redesign — bigger fonts, wider messages, larger input, bigger sidebar, better spacing. Proper full-page app feel.

## Codebase Analysis

### Existing Patterns to Follow
- **CSS class `chat-fullscreen`** — already applied to main area div when `telaCheia` is true (`chat-widget.tsx:237`). All fullscreen overrides use `.chat-fullscreen` descendant selectors in `globals.css:430-453`.
- **`data-chat-bubble` attribute** — on message bubbles (`chat-message.tsx:59`), used for fullscreen CSS targeting.
- **Design system tokens** — `typography.*`, `icon.*`, `layout.*` from `src/lib/design-system.ts`. Should use these where possible.

### Reusable Code Found
- `cn()` utility at `src/lib/utils` — already used everywhere for conditional classes
- `.chat-fullscreen` CSS pattern in `globals.css:430-453` — extend this approach
- Design system tokens — `typography.h2`, `typography.body`, `icon.cardTitle`, etc.

### Affected Files
- `src/app/globals.css` (modify) — Extend `.chat-fullscreen` CSS overrides for all elements
- `src/components/chat/chat-widget.tsx` (modify) — Fullscreen-specific layout: wider sidebar, larger header, more spacing
- `src/components/chat/chat-message.tsx` (modify) — Larger avatars in fullscreen
- `src/components/chat/chat-input-field.tsx` (modify) — Taller input with bigger font in fullscreen
- `src/components/chat/suggestion-chips.tsx` (modify) — Larger chips in fullscreen
- `src/components/chat/conversations-list.tsx` (modify) — Larger text/spacing in fullscreen sidebar
- `src/components/chat/chat-markdown-components.tsx` (modify) — Larger table cells, code in fullscreen

### Approach
Two strategies available:
1. **CSS-only via `.chat-fullscreen`** — extend existing descendant selectors in globals.css. Zero component changes needed for most elements. Pros: minimal blast radius, single file for most changes. Cons: some elements need structural changes (sidebar width, avatar size) that CSS alone can't elegantly handle.
2. **Hybrid: CSS + conditional classes** — use CSS for typography/spacing, pass `telaCheia` prop or use `.chat-fullscreen` parent detection for structural changes (sidebar width, avatar size).

**Recommendation: Strategy 2 (Hybrid)** — most scaling done via CSS in globals.css, but sidebar width and avatar sizing need component-level conditional classes. The `chat-fullscreen` class is already on the parent, so child components can use it without prop drilling (via CSS).

### Risks
- Visual regression in widget mode (Low) — all changes scoped under `.chat-fullscreen`, widget mode untouched
- Sidebar overflow on small desktops (Low) — fullscreen is viewport-wide, 320px sidebar is fine
- Streaming/scroll behavior (Low) — no logic changes, just visual scaling
