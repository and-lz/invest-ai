# Context: Chat Scroll Hide Header & Input

## Requirements

### Goal
When the user scrolls down in the chat message area, hide both the header and the floating input field using CSS `transform: translate` (no layout shift). When the user scrolls up, show them again. This maximizes reading area during long conversations.

### Acceptance Criteria
- [ ] Scrolling down hides header (`translateY(-100%)`) and input (`translateY(100%)`) — percentage is relative to the element's own height, not the viewport
- [ ] Scrolling up reveals both header and input (`translateY(0)`)
- [ ] Uses CSS `transform: translateY()` only — no layout reflow, no height/display changes
- [ ] Smooth 200ms transition on show/hide
- [ ] No layout shift — elements use transform only, keeping their space reserved or using absolute/sticky positioning
- [ ] Scroll-to-bottom FAB remains visible when input is hidden
- [ ] When at the very top of the scroll area, header is always visible
- [ ] When at the very bottom of the scroll area, input is always visible

### Out of Scope
- Widget/modal chat (only fullscreen `/chat/[id]` page)
- Sidebar hide behavior
- Changing scroll physics or overscroll behavior

### Edge Cases
- Empty conversation (no messages) → no scroll, nothing hides
- Short conversation (not scrollable) → nothing hides
- Streaming response (auto-scrolling to bottom) → input should stay visible since user is near bottom
- User is typing and scrolls → input should hide normally; when revealed, focus should be preserved

## Q&A Record
- Q: Which page? → A: `/chat/[id]` fullscreen chat page only
- Q: Translation direction? → A: Header slides up (`translateY(-100%)`), input slides down (`translateY(100%)`)

## Codebase Analysis

### Existing Patterns to Follow
- `useAutoHideOnScroll` hook at `src/hooks/use-auto-hide-on-scroll.ts` — DOM class toggling (no React state) to avoid re-renders. Currently supports a single `ref` target.
- `.chat-auto-header` CSS at `src/app/globals.css:448-455` — transform-based hide with 200ms transition. Currently unused ("kept for reference").

### Reusable Code Found
- `useAutoHideOnScroll` at `src/hooks/use-auto-hide-on-scroll.ts` — needs modification to support multiple targets (header ref + footer ref), throttled scroll handler. Scroll delta thresholds stay in px (50/25). Transform uses element-relative `translateY(-100%/100%)`
- `.chat-auto-header` CSS class — can be reused as-is for header; need a matching `.chat-auto-footer` class for input

### Affected Files
- `src/lib/throttle.ts` (create) — generic reusable throttle utility function
- `src/hooks/use-auto-hide-on-scroll.ts` (modify) — support multiple targets (header ref + footer ref), use throttle util for scroll handler
- `src/app/globals.css` (modify) — add `.chat-auto-footer` CSS class with `translateY(100%)`
- `src/components/chat/chat-body.tsx` (modify) — apply footer hidden class to the floating input container
- `src/components/chat/chat-page-header.tsx` (modify) — apply header hidden class, accept `ref` via `forwardRef`
- `src/app/chat/[id]/page.tsx` (modify) — wire up the hook, pass refs + onScroll to children

### Risks
- (Low) Scroll-to-bottom FAB positioning — currently uses `bottom-28` which accounts for the input. When input is hidden, FAB should still be visible. Since input is absolutely positioned and just translated off-screen, the FAB positioning shouldn't change.
- (Low) Auto-scroll during streaming — `isNearBottomRef` logic in ChatBody handles this. When near bottom, input should stay visible (hook won't trigger hide at bottom of scroll).
