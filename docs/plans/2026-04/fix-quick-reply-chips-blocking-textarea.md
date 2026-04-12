# Fix: Quick Reply Chips Blocking Textarea Input

## Context
Quick reply chips overlay the textarea in `/chat`. The chips container in `SuggestionChips` (quick-reply variant) sets `pointer-events-auto` on its wrapper div, which re-enables pointer events for the entire overlay area — including transparent space between/around chips — blocking clicks and focus on the textarea beneath.

**Affected files:**
- `src/components/chat/suggestion-chips.tsx` — wrapper div has `pointer-events-auto` (line 67)

## Plan
1. Remove `pointer-events-auto` from the quick-reply wrapper div in `SuggestionChips`
2. Add `pointer-events-auto` to each individual `<button>` chip so they remain clickable
3. The outer `pointer-events-none` container in `chat-input-field.tsx:155` already handles the rest correctly — no change needed there

**Verify:** After fix, clicking the textarea when chips are visible should focus it and allow typing.

## Verification
- Chips still respond to clicks (onSelect fires)
- Textarea receives focus when clicked anywhere outside a chip
- Typing works normally while chips are visible
