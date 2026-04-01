# Move Quick Reply Chips to Their Own Space

## Context

### Goal

Quick reply chips (follow-up suggestions) are currently rendered as an overlay **inside** the textarea — using `pointer-events-none` absolute positioning to simulate placeholder behavior. This was a UX shortcut that caused issues (blocked input area, awkward interaction). The goal is to move them to a dedicated strip **above** the input field, visually separated from the textarea.

### Acceptance Criteria
- [ ] Quick reply chips render in a horizontal scrollable strip **above** the input container, not inside the textarea
- [ ] Chips are always tappable — no `pointer-events-none` hacks
- [ ] Clicking the chip label area sends the message immediately
- [ ] Each chip has a small edit icon — clicking it pre-fills the textarea (does not send)
- [ ] Textarea has a normal placeholder when chips are present
- [ ] Empty state chips (variant="empty-state") remain unchanged
- [ ] The chips area only appears when there are suggestions and no streaming is happening
- [ ] Works in both fullscreen (`/chat/[id]` page) and widget modal
- [ ] Loading spinner still appears while AI suggestions are fetching

### Out of Scope
- Empty state chip layout (they already render fine separately)
- Any changes to how suggestions are fetched or generated
- Widget-only behavior changes (widget uses same ChatBody, so it inherits the fix)

### Edge Cases
- Empty suggestions list → strip hidden (same as today)
- While streaming → strip hidden (same as today)
- Long chip labels → horizontal scroll, no wrapping to multiple lines
- Mobile fullscreen → same strip, touch targets respected (min 44px height)

### Q&A Record
- Q: Should the chips also appear when `mensagens.length === 0`? → A: No — empty state already handles that with the `empty-state` variant in the center of the screen
- Q: Where should chips appear? → A: Above the input box, in a horizontal scrollable row inside the floating footer gradient
- Q: Chip click behavior? → A: Clicking the chip label sends immediately (current behavior). Each chip also has a small edit icon button on the right — clicking that pre-fills the textarea instead of sending

### Decisions & Rationale
- **Horizontal scrollable row** over wrapping grid — keeps the input area compact; chips overflow out of view rather than pushing the input down
- **Render above the input box** (inside the floating footer gradient zone) — contextually close to input, not occupying message space
- **Remove the `pointer-events-none` overlay pattern entirely** — clean slate, chips are a normal DOM element
- **Keep "quick-reply" variant name** but restyle it for standalone use — avoids prop churn at call sites
- **Dual-action chip**: main area = send immediately; small edit icon on right = pre-fill textarea. Follows common pattern (e.g. ChatGPT suggestion chips with secondary action)

### Codebase Analysis

#### Existing Patterns to Follow
- `empty-state` variant in `suggestion-chips.tsx:37` — uses `flex flex-wrap gap-2`, standard chip buttons with `rounded-full border`
- Floating footer pattern in `chat-body.tsx:257` — `pointer-events-none absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t` wraps the input
- DS tokens: `typography.helper`, `interaction.*` — see `src/lib/design-system.ts`

#### Reusable Code Found
- `SuggestionChips` at `src/components/chat/suggestion-chips.tsx` — already exists, just needs variant restyled
- `cn()` from `@/lib/utils` — used everywhere for conditional classes

#### Affected Files
- `src/components/chat/suggestion-chips.tsx` (modify) — restyle `quick-reply` variant as standalone horizontal scroll row
- `src/components/chat/chat-input-field.tsx` (modify) — remove absolute overlay rendering of chips, remove related props (or keep props but stop rendering chips inline)
- `src/components/chat/chat-body.tsx` (modify) — render `SuggestionChips` above `CampoEntradaChat` inside the floating footer

#### Risks
- `chat-widget.tsx` also uses `ChatBody` — inherits fix automatically (Low risk, positive side effect)
- CSS gradient footer height may need adjustment to accommodate the extra chip row height (Low)

### Concurrent Work
- Solo project, no in-flight branches

---

## Plan

### Steps

#### Step 1: Restyle `quick-reply` variant in `SuggestionChips` + add dual-action chip
**Files**: `src/components/chat/suggestion-chips.tsx` (modify)
**Pattern**: Following `empty-state` variant chip button style in the same file
**Changes**:
- Add `onPrefill?: (text: string) => void` to `SuggestionChipsProps`
- Replace the `quick-reply` variant's `pointer-events-none` absolute overlay with a standalone horizontal scroll container: `overflow-x-auto flex items-center gap-1.5 pb-0.5 no-scrollbar`
- Each chip becomes a compound pill: `flex items-center rounded-full border border-border/40`
  - Left area (label): `<button onClick={() => onSelect(text)}>` — sends immediately
  - Divider: `w-px h-3 bg-border/40`
  - Right area (edit icon): `<button onClick={() => onPrefill?.(text)}>` — `<Pencil className="h-3 w-3" />`
- Loading spinner stays as-is at the start of the row
- Add `flex-shrink-0` to each chip to prevent wrapping
**Verify**: TypeScript compiles (`tsc --noEmit`), chips render as a scrollable row with two tap zones

#### Step 2: Strip suggestion props from `CampoEntradaChat`
**Files**: `src/components/chat/chat-input-field.tsx` (modify)
**Pattern**: Removing dead code, no new pattern needed
**Changes**:
- Remove props: `suggestions`, `suggestionsLoading`, `onSuggestionSelect`, `suggestionsFilterText`
- Remove `showInlineChips` and `chipsVisible` variables
- Remove the `{chipsVisible && <div className="pointer-events-none absolute inset-0...">...</div>}` block
- Remove `SuggestionChips` import
- Restore unconditional `placeholder="Pergunte algo sobre seus investimentos..."` on the textarea
- Remove `relative` wrapper div around textarea (no longer needed for absolute positioning)
**Verify**: `tsc --noEmit` passes; textarea shows placeholder normally

#### Step 3: Render chips above input in `ChatBody` floating footer
**Files**: `src/components/chat/chat-body.tsx` (modify)
**Pattern**: Following existing floating footer pattern at line 257
**Changes**:
- Add `onSuggestionPrefill?: (text: string) => void` to `ChatBodyProps`
- Inside `div.pointer-events-auto`, render `SuggestionChips` **before** `CampoEntradaChat`:
  ```tsx
  {(activeSuggestions.length > 0 || aiSuggestionsLoading) && mensagens.length > 0 && !estaTransmitindo && (
    <div className={cn("px-3 pb-1", fs && "mx-auto w-full max-w-4xl px-5")}>
      <SuggestionChips
        suggestions={activeSuggestions}
        onSelect={onSuggestionSelect}
        onPrefill={onSuggestionPrefill}
        variant="quick-reply"
        isLoading={aiSuggestionsLoading}
        fullscreen={fs}
      />
    </div>
  )}
  ```
- Remove `suggestions`, `suggestionsLoading`, `onSuggestionSelect` (quick-reply only), `suggestionsFilterText` props from `CampoEntradaChat` call (keep the input props)
- Increase gradient top padding from `pt-20` to `pt-28` to accommodate the chip row
**Verify**: Chips appear above the input box; gradient still fades messages behind

#### Step 4: Wire `onSuggestionPrefill` in callers
**Files**: `src/app/chat/[id]/page.tsx` (modify), `src/components/chat/chat-widget.tsx` (modify)
**Pattern**: Following existing `onSuggestionSelect` wiring in both files
**Changes**:
- In `chat/[id]/page.tsx`: add `onSuggestionPrefill={setInputValue}` to `<ChatBody>`
- In `chat-widget.tsx`: add `onSuggestionPrefill={setInputValue}` to `<ChatBody>`
**Verify**: `tsc --noEmit` passes; clicking edit icon on chip populates textarea without sending

### New Files
- None

### Cross-Cutting Concerns
| Concern | Applies? | Action |
|---------|----------|--------|
| Security | N/A | Pure UI change, no data handling |
| Performance | N/A | No hot paths changed |
| Accessibility | Yes | Edit icon needs `aria-label="Editar sugestão"`, send area needs `aria-label` on the chip; `role="group"` already present |
| Observability | N/A | No new code paths |
| Testing | N/A | No business logic changed; existing unit tests unaffected |
| Concurrency | N/A | No async state changes |
| Memory | N/A | No closures or long-lived objects added |
| API contracts | Yes | `CampoEntradaChat` props reduced — callers (`chat-body.tsx`) must stop passing removed props. Done in Step 3. |
| CI/CD | N/A | No build config changes |
| Documentation | N/A | Internal component only |
| Cross-platform | N/A | Widget and page both use `ChatBody` — both fixed in Step 4 |
| i18n | Yes | New aria-labels added in PT-BR in Step 1 |

### Verification Plan
- Build: `tsc --noEmit` → no type errors
- Lint: `npm run lint` → no errors
- Manual (fullscreen `/chat/[id]`): send a message → chips appear above input → click label sends → click pencil icon pre-fills textarea
- Manual (widget): same flow in the modal
- Manual: empty state (no messages) → no chips strip shown above input (empty-state chips in center unchanged)
- Manual: while streaming → chip strip hidden

### Risks
- `pb-20` → `pt-28` gradient height increase — if the chip row is absent, the extra padding adds whitespace. Mitigated by conditional rendering (chip row only shown when chips exist). (Low)
- No `no-scrollbar` utility exists in the project — use Tailwind v4 built-in `scrollbar-none` on the scroll container. (Low)

---

## Implementation

**Status**: In Progress

### Step Results
- Step 1: Restyle quick-reply variant + dual-action chip — In Progress

