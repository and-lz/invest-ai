# Context: Chat Input UI Polish

## Requirements

### Goal
Improve the chat input area UX by:
1. Replacing the "Pensar" button with a clean icon-only toggle
2. Moving follow-up suggestions from a horizontal strip above the input to a floating vertical stack in the bottom-right corner of the messages area

### Acceptance Criteria
- [ ] Pensar button is icon-only (Brain icon), no text label
- [ ] Active state: filled/colored (like TTS button), inactive: ghost with muted color
- [ ] Follow-up suggestions float as a vertical stack in bottom-right of messages area
- [ ] Suggestions overlay messages (position absolute), don't push content down
- [ ] Semi-transparent background on suggestion container
- [ ] Subtle entrance animation (fade-in or slide-up)
- [ ] Empty-state suggestions remain centered (unchanged)
- [ ] Both chat-widget (modal) and chat page (/chat/[id]) work correctly
- [ ] Mobile: suggestions still usable (may need full-width on small screens)

### Out of Scope
- Changing empty-state suggestion placement
- Changing suggestion content/logic
- Changing AI type-ahead suggestion behavior
- Redesigning the overall chat layout

### Edge Cases
- Many suggestions (5+) → vertical stack should scroll or limit visible count
- Long suggestion text → truncate with ellipsis
- Mobile viewport → suggestions may need different positioning (full-width above input)

## Q&A Record
- Q: Pensar button style? → A: Icon-only toggle, colored when active, ghost when inactive
- Q: Suggestion placement? → A: Floating vertical stack, bottom-right of messages area
- Q: Empty state? → A: Keep centered as-is
- Q: Hide/dismiss for floating suggestions? → A: Chevron toggle button that collapses/expands. Resets to expanded on each new assistant response.

## Codebase Analysis

### Existing Patterns to Follow
- TTS toggle button in `src/app/chat/[id]/page.tsx:276-298` — same ghost icon toggle pattern for Pensar
- `interaction.cardHover` in design-system.ts — transition patterns
- `cn()` utility for conditional classes

### Reusable Code Found
- `Button` component with `variant="ghost"` and `size="icon"` — exact pattern for new Pensar toggle
- `SuggestionChips` component already supports `variant` prop — can add new variant or modify "follow-up"

### Affected Files
- `src/components/chat/chat-input-field.tsx` (modify) — Pensar button: remove text, use icon-only toggle
- `src/components/chat/chat-body.tsx` (modify) — Move follow-up suggestions to floating position inside scroll area
- `src/components/chat/suggestion-chips.tsx` (modify) — Add floating vertical variant styling

### Risks
- Floating suggestions could overlap message content (Low) — use pointer-events-none on container, pointer-events-auto on chips
- Mobile usability with vertical floating stack (Low) — test on small viewports, fallback to horizontal if needed
