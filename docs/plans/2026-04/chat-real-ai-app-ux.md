# Make Chat Page Look Like a Real AI Chatbot App

## Context

### Goal

Transform the fullscreen chat page (`/chat/[id]`) from a functional but rough prototype into something that feels like a polished AI chatbot (ChatGPT, Claude.ai, Gemini). The focus is on UX gaps — not a visual redesign, but making interactions feel complete and professional.

### Acceptance Criteria

- [ ] **New chat button visible when sidebar is collapsed** — user can always start a new conversation without opening the sidebar
- [ ] **Regenerate per AI message** — each assistant message shows a regenerate action (not just the last one / empty responses)
- [ ] **Copy message action** — one-click copy of any message content (user or assistant)
- [ ] **Message action bar** — hover actions (copy, regenerate, bookmark) grouped in a clean row below each assistant message, instead of a floating bookmark icon
- [ ] **Declutter header** — remove the editorial newspaper-style header (large title, standfirst, eyebrow); use a clean, minimal chat header like real chat apps
- [ ] **Better empty state** — larger, more inviting welcome screen with greeting and clear CTAs
- [ ] **Input field polish** — subtle focus ring/glow on the input container for better affordance
- [ ] All changes work in both fullscreen page and widget modal contexts
- [ ] No regressions: streaming, reasoning, TTS, suggestions, bookmarks, print styles all still work

### Out of Scope

- Color palette changes (palette is final per project rules)
- Sidebar content redesign (conversation list, saved messages, tabs) — sidebar and header are separate concerns
- Chat API / streaming logic changes
- Mobile sidebar drawer behavior
- New features (reactions, edit user messages, message branching)
- Widget FAB or widget-specific changes (focus is fullscreen `/chat/[id]`)

### Edge Cases

- Regenerate on a message that's currently streaming → button should be hidden
- Regenerate on a message that's not the last assistant message → needs API support or graceful degradation (show only on last assistant message initially)
- Copy on a message with markdown → should copy raw markdown text
- Empty conversation (0 messages) → no action bar, just empty state
- Single message (user sent, no response yet) → no regenerate available

### Q&A Record

- Q: When sidebar is collapsed, how to create new chat? → A: User confirmed this is a bug. Header and sidebar are separate concerns — add a "new chat" button in the header action row (like ChatGPT's pencil/compose icon) that works independently of sidebar state
- Q: Regenerate per message scope? → A: User wants per-AI-message regenerate. Start with last message only (current `reenviarUltimaMensagem` already exists), extend to any message later if needed
- Q: Editorial header removal — keep any metadata? → Decision: Show conversation title in the compact header row (already exists as `text-xs`). Drop the large editorial section entirely.

### Decisions & Rationale

- **Action bar below message vs. floating icons** — chose action bar (row of small icon buttons below the message) over individual floating icons because it's the standard pattern in ChatGPT/Claude.ai/Gemini, groups related actions, and is more discoverable. The current floating bookmark at `top-0 -right-8` is easy to miss.
- **Remove editorial header** — chose to remove the newspaper-style header (`text-4xl` headline, standfirst, eyebrow, decorative rule) because no real AI chatbot uses this pattern. It wastes vertical space and creates cognitive dissonance. The conversation title belongs in the compact action row.
- **Regenerate only on last assistant message initially** — the existing `reenviarUltimaMensagem` replays the last exchange. Supporting arbitrary message regeneration requires conversation branching, which is out of scope. Show the button on all assistant messages but only enable it on the last one.
- **Copy copies raw markdown** — simpler than rendering to plain text, and power users expect markdown. Use `navigator.clipboard.writeText()`.

### Codebase Analysis

#### Existing Patterns to Follow

- **Message bubble component** — `src/components/chat/chat-message.tsx:42-230` — already has `onRetry`, `onToggleSave`, `isSaved` props. Action bar will extend this pattern.
- **Design system tokens** — `src/lib/design-system.ts` — use `icon.button` (h-4 w-4), `icon.micro` (h-3.5 w-3.5), `interaction.hoverReveal` for action bar visibility.
- **Ghost icon buttons** — used throughout: `Button variant="ghost" size="icon"` with `h-7 w-7` or `h-9 w-9`.
- **Tooltip pattern** — used in header for TTS. Apply to action bar buttons.
- **`cn()` utility** — all conditional classes use `cn()` from `@/lib/utils`.

#### Reusable Code Found

- `reenviarUltimaMensagem()` at `use-chat-assistant.ts` — existing retry/regenerate function, reuse for regenerate button.
- `onToggleSave` / `savedMessageIds` — existing bookmark state, move into action bar.
- `ChatPageHeader` at `chat-page-header.tsx:37` — modify to add new-chat button and remove editorial section.
- `criarNovaConversa()` at `use-chat-assistant.ts` — existing new conversation function, wire to header button.

#### Affected Files

1. `src/components/chat/chat-message.tsx` (modify) — add action bar with copy, regenerate, bookmark; remove floating bookmark
2. `src/components/chat/chat-page-header.tsx` (modify) — remove editorial section, add new-chat button, make title more prominent
3. `src/components/chat/chat-body.tsx` (modify) — update empty state design, add focus ring to input wrapper, pass regenerate handler per message
4. `src/components/chat/chat-input-field.tsx` (modify) — add subtle focus glow/ring on container
5. `src/app/chat/[id]/page.tsx` (modify) — pass `onNovaConversa` to header, wire regenerate per message

#### Risks

- **Regression on widget mode** (Med) — `ChatBody` and `MensagemChatBolha` are shared between fullscreen and widget. All changes must respect the `fullscreen` prop. Mitigation: test both modes.
- **Print styles** (Low) — `globals.css` has print-specific chat styles. Action bar should be hidden in print. Mitigation: add `print:hidden` to action bar.
- **Bookmark migration** (Low) — moving bookmark from floating position to action bar changes the visual location. Users who learned the old pattern may be briefly confused. Mitigation: bookmark icon stays the same, just moves to a more visible spot.

## Plan

### Steps

#### Step 1: Message action bar — replace floating bookmark with grouped actions
**Files**: `src/components/chat/chat-message.tsx` (modify)
**Pattern**: Following existing `onRetry`/`onToggleSave` prop pattern
**Changes**:
- Remove the floating bookmark button (absolute positioned at `top-0 -right-8`)
- Add a horizontal action bar below each message (after timestamp), visible on hover via `group-hover` (same `group/msg` already exists)
- Action bar contains 3 icon buttons in a row: **Copy** (`Copy` icon), **Regenerate** (`RefreshCw` icon, assistant only), **Bookmark** (`Bookmark` icon)
- Copy: `navigator.clipboard.writeText(mensagem.conteudo)` with brief "Copied!" tooltip feedback
- Regenerate: new prop `onRegenerate?: () => void`, shown only on assistant messages, disabled/hidden when streaming
- Bookmark: reuse existing `onToggleSave`/`isSaved` logic, just moved into the bar
- Action bar hidden during streaming, hidden in print (`print:hidden`)
- Buttons: `h-7 w-7` ghost icon buttons with `icon.button` (h-4 w-4) icons, `text-muted-foreground hover:text-foreground`
- For user messages: only show Copy + Bookmark (no regenerate)
- `aria-label` on each button for accessibility
**Verify**: Hover over messages → action bar appears. Copy works. Bookmark toggles. Regenerate shows on assistant messages. Print view hides action bar.

#### Step 2: ChatPageHeader — new chat button + remove editorial section
**Files**: `src/components/chat/chat-page-header.tsx` (modify)
**Pattern**: Following existing header button pattern (`Button variant="ghost" size="icon"`)
**Changes**:
- Add new prop `onNovaConversa: () => void`
- Add a "new chat" icon button (`SquarePen` icon) in the header action row, always visible regardless of sidebar state
- Position: left side of header, after the sidebar menu toggle (or right side before the back button — matches ChatGPT where compose is top-right)
- Remove the entire `{hasEditorial && (...)}` block (editorial section with eyebrow, decorative rule, headline, standfirst)
- Remove `criadaEm`, `preview`, `paginaLabel` props (no longer needed)
- Make the title slightly more prominent: `text-sm font-medium` instead of `text-xs font-normal`
- Remove `showTitle` prop — title always shows in the compact row
- Clean up `formatDate` function (no longer needed)
**Verify**: New chat button visible and functional when sidebar is collapsed and open. Editorial section gone. Title readable.

#### Step 3: Wire new props through page.tsx and chat-body.tsx
**Files**: `src/app/chat/[id]/page.tsx` (modify), `src/components/chat/chat-body.tsx` (modify)
**Pattern**: Following existing prop-drilling pattern (page → ChatBody → MensagemChatBolha)
**Changes in page.tsx**:
- Pass `onNovaConversa={handleNovaConversa}` to `ChatPageHeader`
- Remove `criadaEm`, `preview`, `paginaLabel`, `showTitle` props from `ChatPageHeader`
- Remove `conversaAtual` lookups for `previewMensagem`, `criadaEm`, etc. that are no longer used
- Pass `onRegenerate` callback to ChatBody (wraps `reenviarUltimaMensagem`, only active for last assistant message)
**Changes in chat-body.tsx**:
- Add `onRegenerate?: () => void` prop
- Pass `onRegenerate` to the last assistant `MensagemChatBolha` only
- Remove old per-message `onRetry` logic that was specific to empty responses (regenerate replaces it)
**Verify**: `tsc --noEmit` passes. New chat navigates to `/chat`. Regenerate replays last assistant response.

#### Step 4: Empty state refresh + input focus glow
**Files**: `src/components/chat/chat-body.tsx` (modify), `src/components/chat/chat-input-field.tsx` (modify)
**Pattern**: Existing empty state layout, DS tokens
**Changes in chat-body.tsx (empty state)**:
- Increase Fortuna logo size: `h-16 w-16` (fullscreen), `h-12 w-12` (widget)
- Add a warm greeting: "Ola! Sou a Fortuna, sua assistente de investimentos." (larger, `text-lg font-medium` in fullscreen)
- Subtitle: "Pergunte sobre seus investimentos, e eu te ajudo a entender." (`text-muted-foreground`)
- Keep suggestion chips below, same behavior
**Changes in chat-input-field.tsx**:
- Add focus glow to the input container: `focus-within:ring-1 focus-within:ring-primary/30 focus-within:shadow-[0_0_12px_-3px] focus-within:shadow-primary/20` (subtle, not heavy)
- Transition: `transition-shadow` for smooth appearance
**Verify**: Empty state looks inviting with larger logo and text. Input glows subtly on focus. Both fullscreen and widget modes look correct.

#### Step 5: Cleanup and cross-mode verification
**Files**: `src/app/chat/[id]/page.tsx` (modify — cleanup unused imports/vars)
**Changes**:
- Remove unused variables: `PAGE_LABELS`, `paginaLabel`, any dead code from editorial removal
- Verify widget mode (`ChatWidget`) still works — it doesn't use `ChatPageHeader`, so changes should be isolated
- Verify print styles still work (action bar hidden, messages flow naturally)
**Verify**: `tsc --noEmit && npm run lint && npm test` all pass. Manual check: fullscreen page, widget modal, print preview.

### New Files
None — all changes modify existing files.

### Cross-Cutting Concerns

| Concern | Applies? | Action |
|---------|----------|--------|
| Security | N/A | Copy uses `navigator.clipboard` — no injection risk |
| Performance | N/A | No hot paths affected, action bar is CSS-only hover |
| Accessibility | Yes | `aria-label` on all action bar buttons (Step 1). Focus order: copy → regenerate → bookmark |
| Observability | N/A | No new code paths requiring logging |
| Testing | N/A | UI-only changes, no business logic. Manual verification preferred per project convention |
| Concurrency | N/A | No async state changes |
| Memory | N/A | No new subscriptions or closures |
| API contracts | Yes | `MensagemChatBolhaProps` gains optional `onRegenerate` prop — backward compatible (Step 1) |
| CI/CD | N/A | No build config changes |
| Documentation | Yes | Update `CLAUDE.md` chat section after completion if patterns change significantly |
| Cross-platform | N/A | Web only |
| i18n | Yes | New strings: "Copiar", "Regenerar", "Copiado!" — all Portuguese, consistent with existing UI |

### Verification Plan

- Build: `tsc --noEmit` → succeeds (no full build needed per project convention)
- Lint: `npm run lint` → passes
- Tests: `npm run test` → all 181 tests pass
- Manual:
  1. Open `/chat` → see inviting empty state with large logo and greeting
  2. Send a message → assistant responds → hover message → see action bar (copy, regenerate, bookmark)
  3. Click Copy → text in clipboard
  4. Click Regenerate on last assistant message → response regenerated
  5. Click Bookmark → message saved (same behavior as before)
  6. Collapse sidebar → "new chat" button visible in header → click → navigates to new conversation
  7. Open widget modal → verify no regressions (widget uses its own header, not ChatPageHeader)
  8. Print preview → action bars hidden, messages flow normally

### Risks

- **Widget regression** (Med) — ChatBody and MensagemChatBolha are shared. Mitigation: `fullscreen` prop controls sizing; action bar uses same `fullscreen` conditional. Test widget after changes.
- **Clipboard API** (Low) — `navigator.clipboard.writeText` requires HTTPS or localhost. Mitigation: already in dev on localhost, prod on HTTPS. No fallback needed.
- **Print styles** (Low) — Action bar must be hidden. Mitigation: `print:hidden` class on action bar container.

## Implementation

**Status**: Complete

### Step Results
- Step 1: Message action bar — Pass
- Step 2: Clean header + new chat button — Pass
- Step 3: Wire props through page — Pass
- Step 4: Empty state + input glow — Pass
- Step 5: Cleanup + verify — Pass (749 tests, lint clean, tsc clean)
- Scope expansion: Decouple sidebar from header — Pass
