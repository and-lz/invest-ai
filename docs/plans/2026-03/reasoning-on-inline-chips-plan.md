# Reasoning Default On + Inline Suggestion Chips

## Context
- Reasoning toggle defaults to `false` in `chat-widget.tsx` and `chat/[id]/page.tsx`
- Quick-reply chips render as a vertical stack above the input field, outside the input area
- User wants: reasoning on by default (keep toggle visible), chips inline inside the input area

## Plan

### Step 1 — Reasoning default on
- Change `useState(false)` → `useState(true)` in:
  - `src/components/chat/chat-widget.tsx:39`
  - `src/app/chat/[id]/page.tsx:31`

### Step 2 — Inline suggestion chips
- Move quick-reply `SuggestionChips` from `chat-body.tsx` footer into `CampoEntradaChat`
- Render chips as a horizontal flex-wrap row above the textarea, inside the input container
- Chips disappear when user starts typing (already filtered by `filterText`)
- Pass suggestion props through to `CampoEntradaChat`

## Verification
- Reasoning toggle shows as active (highlighted) by default
- Quick-reply chips appear inline above the textarea
- Chips filter/hide as user types
- Empty-state chips in center remain unchanged
