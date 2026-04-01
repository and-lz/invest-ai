# Move Quick Replies Inside Textarea

## Context

### Goal
Move quick-reply suggestion chips from above the textarea container to **inside** the textarea area itself — overlaying where the placeholder text normally appears. This saves vertical space and makes the chips feel like native input suggestions.

### Acceptance Criteria
- [x] Chips render inside the textarea space (overlaying the placeholder area), not above the rounded container
- [x] Chips disappear when user starts typing (current behavior preserved)
- [x] Clicking a chip still sends the suggestion text (current behavior preserved)
- [x] Textarea is still focusable — clicking empty space around chips focuses the textarea
- [x] Empty-state suggestions in `chat-body.tsx` (centered, for empty conversations) remain unchanged
- [x] Works in both fullscreen chat page and widget modal

### Out of Scope
- Changing chip styling/colors beyond what's needed for the new position
- Changing empty-state variant behavior
- Changing AI suggestion generation logic

### Edge Cases
- Many chips wrapping to multiple lines → textarea area expands to fit (already handled by flex layout)
- Loading spinner for AI suggestions → renders inline with chips as before

### Q&A Record
- Q: Where exactly inside? → A: Overlay on the textarea area, replacing the placeholder. Chips disappear when typing starts.
- Q: Keep filter-on-type behavior? → A: No, hide on any input (current behavior).

### Decisions & Rationale
- Overlay approach: chips render in a `relative` container that sits on top of the textarea (using `absolute` positioning or conditional render). Simpler than trying to embed buttons inside a `<textarea>` element (which is impossible natively).

### Codebase Analysis

#### Existing Patterns to Follow
- `chat-input-field.tsx:124` — `showInlineChips` conditional already controls visibility based on `!valor.trim()`
- `suggestion-chips.tsx:64-91` — `quick-reply` variant with horizontal wrap layout

#### Reusable Code Found
- `SuggestionChips` component is already self-contained — just needs repositioning in the parent layout

#### Affected Files
- `src/components/chat/chat-input-field.tsx` (modify) — Move chips from before the rounded container to overlay inside the textarea area
- `src/components/chat/suggestion-chips.tsx` (modify) — Adjust quick-reply variant spacing/alignment for inside-textarea placement

#### Risks
- None significant — purely visual repositioning, no logic changes
