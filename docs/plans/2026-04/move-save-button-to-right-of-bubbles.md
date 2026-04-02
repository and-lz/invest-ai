# Move Save Button to Right of User Message Bubbles

## Context

### Goal

Standardize the save button (bookmark) position across the UI. Currently, the save button appears to the left/right *outside* the bubble depending on message role. The goal is to move it to the **bottom-right corner of user message bubbles** for consistency with the saved messages list, where the button appears in the top-right of each saved item.

### Acceptance Criteria
- [ ] Save button on user messages appears at bottom-right of the bubble (not outside)
- [ ] Button positioning matches fullscreen and normal modes
- [ ] Button visibility behavior unchanged (hidden by default, shown on hover)
- [ ] Saved state visual (filled bookmark) still displays correctly
- [ ] Unsave functionality still works
- [ ] No regression on assistant messages (remain unchanged)
- [ ] Mobile layout remains responsive

### Out of Scope
- Changes to assistant message save behavior (remains `-right-8`, outside bubble)
- Save button styling, colors, or icon
- Changes to chat input or other components
- Saved messages list styling (separate feature)

### Edge Cases
- Very short user messages (single word) → button should still fit
- Messages near right edge of viewport → button should not overflow
- Mobile/responsive breakpoints → positioning should adapt

### Q&A Record
- Q: Should the button be inside the bubble or outside? → A: Inside, at bottom-right corner (visual consistency with saved messages list)
- Q: Should assistant messages change? → A: No, keep them as-is (left side, outside bubble)
- Q: What if button overlaps text? → A: Padding/positioning should prevent overlap; button is shown on hover only

### Decisions & Rationale
- **Decision**: Position button inside bubble at bottom-right (not outside)
- **Why**: Matches the saved messages list pattern where unsave button appears top-right inside the item container. Creates visual consistency across the app.
- **Alternative rejected**: Keep button outside bubble — breaks pattern consistency with SavedMessageItem

### Codebase Analysis

#### Existing Patterns to Follow

1. **Current save button positioning** — `src/components/chat/chat-message.tsx:175-195`
   - User messages (`ehUsuario`): button at `-left-8` (outside, left side)
   - Assistant messages: button at `-right-8` (outside, right side)
   - Absolute positioning with `top-0` anchor
   - Visibility: opacity-0 by default, opacity-100 on group hover
   - Uses Bookmark icon from lucide-react

2. **SavedMessageItem pattern** — `src/components/chat/saved-messages-list.tsx:156-170`
   - Button at `top-2 right-2` (inside container, top-right)
   - Bookmark filled on saved state (`fill-current`)
   - Opacity toggle on group hover
   - Uses `stopPropagation()` to prevent parent click handler

3. **Responsive sizing**:
   - Button: `h-6 w-6` (normal), `h-7 w-7` (fullscreen)
   - Icon: `h-3.5 w-3.5` (normal), `h-4 w-4` (fullscreen)

#### Reusable Code Found
- None. The save button implementation is specific to MensagemChatBolha; SavedMessageItem is in a different component.

#### Affected Files
- `src/components/chat/chat-message.tsx` (modify) — Move save button from `-left-8/-right-8` to inside user bubble at `bottom-X right-Y`

#### Risks
- **Overlapping text** (Low) → Mitigation: Add padding-bottom to the inner div or position button absolutely at bottom-right with appropriate margins
- **Responsive adjustment** (Low) → Mitigation: Ensure positioning works in both fullscreen and normal modes (already has `fs` variable)

### Domain References
- Not applicable (web frontend, no platform-specific concerns)

### Dependencies
- None. Uses existing lucide-react Bookmark icon and Tailwind CSS positioning.

### Concurrent Work
- No recent changes to `chat-message.tsx` (last commit: e633958, chat page header work)
- No in-flight branches touching this file

## Plan

### Steps

#### Step 1: Update save button positioning in MensagemChatBolha for user messages
**Files**: `src/components/chat/chat-message.tsx` (modify)
**Pattern**: Reuse existing Bookmark icon and button structure; mirror the SavedMessageItem positioning pattern from `src/components/chat/saved-messages-list.tsx:156-170`
**Changes**:
- Modify the button's className from `absolute top-0 ... ehUsuario ? "-left-8" : "-right-8"` to position it inside the bubble at bottom-right
- For user messages only: change positioning to `absolute bottom-2 right-2` (inside bubble)
- Keep assistant messages unchanged (remain at `-right-8`)
- Ensure both fullscreen and normal modes are supported (adjust spacing as needed)
- Verify the button doesn't overlap message content by using appropriate padding
**Verify**: 
- Visual check in browser: user message bubbles show save button at bottom-right on hover
- Visual check: assistant messages unchanged (button still outside at right)
- Build succeeds: `npm run build`
- No Tailwind/TypeScript errors: `tsc --noEmit && npm run lint`

### New Files
- None

### Cross-Cutting Concerns
| Concern | Applies? | Action |
|---------|----------|--------|
| Security | N/A | No user input or data exposure changes |
| Performance | N/A | Pure CSS positioning change, no performance impact |
| Accessibility | Yes | Step 1 — Ensure ARIA label remains and focus visibility maintained |
| Observability | N/A | No new logging or metrics needed |
| Testing | N/A | Existing manual tests (chat smoke tests) cover save functionality |
| Concurrency | N/A | No async or state changes |
| Memory | N/A | No new references or closures |
| API contracts | N/A | No API changes |
| CI/CD | N/A | No build config changes |
| Documentation | N/A | No new user-facing strings |
| Cross-platform | N/A | Web frontend only |
| i18n | N/A | No user-facing text changes |

### Verification Plan
- **Build**: `npm run build` → succeeds without errors
- **Lint**: `tsc --noEmit && npm run lint` → no errors or warnings
- **Manual**: 
  1. Open chat in development mode (`npm run dev`)
  2. Send a message as user
  3. Hover over user message bubble → save button appears at bottom-right corner
  4. Click save button → icon fills (filled bookmark state)
  5. Verify message now appears in saved messages sidebar
  6. Hover over assistant message → save button remains outside bubble at right (unchanged)
  7. Test both normal and fullscreen chat modes

### Risks
- **Button overlaps text** (Low) — Mitigation: Add padding-bottom to message content or position button with appropriate margins to ensure no overlap
- **Responsive issues** (Low) — Mitigation: Test on mobile/tablet viewports to ensure button doesn't overflow or become inaccessible

## Status
Ready for Phase 2 Planning.
