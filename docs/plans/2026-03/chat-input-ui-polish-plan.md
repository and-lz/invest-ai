# Plan: Chat Input UI Polish

**Context**: [chat-input-ui-polish-context.md](./chat-input-ui-polish-context.md)

## Steps

### Step 1: Pensar button → icon-only toggle
**Files**: `src/components/chat/chat-input-field.tsx` (modify)
**Pattern**: Following TTS toggle in `src/app/chat/[id]/page.tsx:276-298`
**Changes**:
- Replace `Button` with text label → `Button variant="ghost" size="icon"` with Brain icon only
- Active state: `text-primary` (colored), inactive: `text-muted-foreground` (ghost)
- Add `title` attribute for accessibility (already exists)
- Remove `<span>Pensar</span>` entirely (no conditional mobile/desktop text)
**Verify**: Visual check — Pensar is now a small icon button matching Send/Stop style

### Step 2: Floating follow-up suggestions
**Files**: `src/components/chat/chat-body.tsx` (modify), `src/components/chat/suggestion-chips.tsx` (modify)
**Changes in `chat-body.tsx`**:
- Move follow-up `SuggestionChips` from between error banner and input field → inside the scroll area `div`, positioned absolutely at bottom-right
- Wrap messages area in `relative` container to anchor the floating suggestions
- Keep empty-state suggestions unchanged (centered)

**Changes in `suggestion-chips.tsx`**:
- Add `variant="floating"` support alongside existing "empty-state" and "follow-up"
- Floating variant: `absolute bottom-4 right-4`, vertical `flex-col` layout, `gap-1.5`
- Semi-transparent background: `bg-background/80 backdrop-blur-sm rounded-xl p-2`
- Entrance animation: `animate-in fade-in slide-in-from-bottom-2` (Tailwind animate)
- Chips: right-aligned, max-width constrained, text truncation
- Rename "follow-up" variant usage to "floating" in chat-body
- Add chevron toggle button to collapse/expand the suggestions panel
  - Small `ChevronRight`/`ChevronLeft` icon button at top of floating container
  - Collapsed state: only chevron visible (pointing left to expand)
  - Expanded state: chevron (pointing right to collapse) + suggestion chips
  - State resets to expanded on each new assistant response

**Verify**: Visual check — suggestions float bottom-right over messages, don't push content

### Step 3: Mobile responsiveness
**Files**: `src/components/chat/suggestion-chips.tsx` (modify)
**Changes**:
- On non-fullscreen (modal chat), floating suggestions use smaller padding/font
- Ensure suggestions don't overflow on narrow viewports (max-width constraint)
**Verify**: Test in mobile viewport — suggestions visible and tappable

## New Files
None — all changes modify existing files.

## Verification Plan
- Build: `tsc --noEmit` → succeeds
- Lint: `npm run lint` → passes
- Manual:
  1. Open chat modal → empty state suggestions centered ✓
  2. Send a message → follow-up suggestions appear floating bottom-right ✓
  3. Pensar button is icon-only, toggles color on click ✓
  4. Open `/chat/[id]` fullscreen → same behavior ✓
  5. Test on mobile viewport → suggestions usable ✓

## Risks
- Floating suggestions could overlap last message (Low) — bottom padding on messages area compensates
- `animate-in` class may not be available (Low) — Tailwind CSS v4 supports it via `@tailwindcss/animate` or custom keyframes in globals.css
