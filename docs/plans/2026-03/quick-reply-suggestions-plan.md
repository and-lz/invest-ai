# Quick Reply Suggestions

## Context
Suggestions floated bottom-right (complex, ugly). Replace with a horizontal scroll row
directly above the input field — same width, same padding — like messaging app quick replies.

**Files**:
- `src/components/chat/suggestion-chips.tsx` — remove floating/chevron logic, add `quick-reply` variant
- `src/components/chat/chat-body.tsx` — move suggestions out of scroll area, place between error banner and input

## Plan
1. Simplify `SuggestionChips`: rename `"floating"` → `"quick-reply"`, replace vertical/chevron with horizontal scroll row
2. Move suggestions container back above `CampoEntradaChat`, matching its horizontal padding

## Verification
- Chips render as a scrollable horizontal row just above the input
- Same left/right alignment as the input field
- No chevron, no vertical stack
- Empty-state chips (centered) unchanged
