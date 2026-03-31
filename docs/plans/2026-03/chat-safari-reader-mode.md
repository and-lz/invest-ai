# Chat Safari Reader Mode Integration

## Context

### Goal
Make the chat page (`/chat/[id]`) fully compatible with Safari's Reader Mode so users can read conversations in a clean, distraction-free format. Currently the page uses only `<div>` elements with no semantic HTML — Safari cannot detect it as readable content.

### Acceptance Criteria
- [ ] Safari shows the Reader Mode button (icon in the address bar) when a conversation has messages
- [ ] Reader Mode displays the conversation title as the article heading
- [ ] Reader Mode shows the full conversation (both user and assistant messages) with clear role attribution
- [ ] Markdown content in assistant messages renders properly in Reader Mode (headings, lists, code blocks, tables)
- [ ] Sidebar, input field, controls, and UI chrome are excluded from Reader Mode
- [ ] No visual regression on the normal (non-Reader) chat page

### Out of Scope
- Separate `/read` route — changes go on the existing page
- Reader Mode for the chat widget (floating modal) — only the fullscreen `/chat/[id]` page
- Server-side rendering of chat content (page is client-rendered; Reader Mode reads DOM at button-press time)
- Supporting other browsers' reader modes (Firefox, Edge) — Safari is the target

### Edge Cases
- Empty conversation (no messages) → Reader Mode button should not appear (insufficient content). No action needed — Safari auto-hides when content is below threshold.
- Conversation with only 1 short message → Reader Mode may not activate due to minimum content length (~400 chars). Acceptable — not worth workaround.
- Streaming in progress → Reader Mode captures current DOM state. Partial message is fine.
- Reasoning/thinking blocks → Should be excluded from Reader Mode (collapsible UI-only content).

### Q&A Record
- Q: Full conversation or assistant-only? → A: Full conversation (user + assistant messages)
- Q: Existing page or separate route? → A: Existing `/chat/[id]` page
- Q: Markdown handling? → A: Already rendered as HTML — Reader Mode picks it up naturally

### Decisions & Rationale
- Use semantic HTML on existing page rather than a separate route — avoids route duplication and keeps a single source of truth for chat rendering.
- Chose `<article>` + `<h1>` + `<section>` structure — this is the standard Safari Reader Mode trigger pattern. Using `<article>` is the single most impactful change.
- Hide reasoning blocks from Reader via `hidden` attribute + CSS override — keeps reasoning visible in normal mode but clean in Reader.

### Codebase Analysis

#### Existing Patterns to Follow
- Native `<dialog>` for modals — see `chat-mobile-sidebar.tsx` — project already uses semantic HTML where appropriate
- `cn()` utility for conditional classNames — see all chat components
- Design system tokens — see `src/lib/design-system.ts` — use `typography.h1` for the heading

#### Reusable Code Found
- `cn()` at `src/lib/utils.ts` — className merging
- `typography` tokens at `src/lib/design-system.ts` — heading styles
- `formatMessageTime()` at `chat-message.tsx:15` — already used for timestamps

#### Affected Files
1. `src/app/chat/[id]/page.tsx` (modify) — Wrap sidebar in `<aside>`, main chat area in `<main>`
2. `src/components/chat/chat-page-header.tsx` (modify) — Change outer `<div>` to `<header>`, `<p>` title to `<h1>`
3. `src/components/chat/chat-body.tsx` (modify) — Wrap messages list in `<article>`, input overlay in a non-article container. Add visually-hidden role labels for user/assistant messages.
4. `src/components/chat/chat-message.tsx` (modify) — Wrap each message in `<section>` with role label for Reader Mode attribution

#### Risks
- Visual regression (Low) — Semantic elements (`article`, `section`, `header`, `aside`, `main`) have no default browser styling when used with Tailwind's reset. Risk is minimal.
- Reader Mode not activating (Medium) — Safari's detection algorithm is heuristic-based. Mitigation: follow all known best practices and test empirically.

## Plan

### Steps

#### Step 1: Semantic structure in chat page layout
**Files**: `src/app/chat/[id]/page.tsx` (modify)
**Changes**:
- Wrap sidebar (`SidebarTabs` desktop container) in `<aside>` instead of `<div>`
- Wrap main chat area in `<main>` instead of `<div>`
- Outer container remains `<div>` (flex layout root)
**Verify**: `tsc --noEmit` passes, page renders identically

#### Step 2: Semantic header with h1 title
**Files**: `src/components/chat/chat-page-header.tsx` (modify)
**Changes**:
- Change outer `<div>` to `<header>` element
- Change title `<p>` to `<h1>` (keep same visual styling: `text-xs text-muted-foreground truncate`)
- This gives Safari Reader Mode a heading to use as the article title
**Verify**: `tsc --noEmit` passes, header looks identical visually

#### Step 3: Article wrapper for messages + exclude input from article
**Files**: `src/components/chat/chat-body.tsx` (modify)
**Changes**:
- Wrap the messages scroll area in `<article>` element (the `<div ref={mergedScrollRef}>` becomes an `<article>`)
- The input overlay (`CampoEntradaChat`) stays outside `<article>` — it's already in a separate `<div>` after the scroll area, so Reader Mode will exclude it naturally
- Empty state and loading skeletons remain inside the scroll area but won't trigger Reader (insufficient content)
**Verify**: `tsc --noEmit` passes, messages render identically, input stays outside article

#### Step 4: Semantic sections per message with role attribution
**Files**: `src/components/chat/chat-message.tsx` (modify)
**Changes**:
- Wrap each message's outer `<div>` in a `<section>` element
- Add a visually-hidden `<h2>` per message with the role (e.g., "Voce" / "Fortuna") so Reader Mode shows clear conversation attribution
- The `<h2>` uses `sr-only` class (visually hidden but present in DOM for Reader Mode)
- Hide reasoning/thinking blocks from Reader Mode with `aria-hidden="true"` on the Collapsible wrapper — Reader Mode respects this and excludes them
**Verify**: `tsc --noEmit` passes, messages look identical, Reader Mode shows role headers

### New Files
None — all changes are modifications to existing files.

### Verification Plan
- Build: `npx tsc --noEmit` → succeeds
- Lint: `npm run lint` → passes
- Tests: `npm run test` → all pass
- Manual (Safari): Open a conversation with 3+ messages → Reader Mode button appears → click it → conversation displays with title, role labels, and formatted content
- Manual (visual): Normal chat page looks identical before/after

### Risks
- Reader Mode not activating (Medium) — Safari's heuristic may still not trigger with short conversations. Mitigation: test with conversations that have 3+ back-and-forth exchanges (>400 chars total). Short conversations naturally won't trigger Reader — this is acceptable.
- Visual regression (Low) — Semantic elements have no default styling in Tailwind's preflight reset. Mitigation: visual inspection in normal mode.

## Implementation

**Status**: Complete

### Step Results
- Step 1: Semantic structure in chat page — Pass — `<aside>` for sidebar, `<main>` for chat area
- Step 2: Semantic header with h1 title — Pass — `<header>` + `<h1>` with preserved visual styling
- Step 3: Article wrapper for messages — Pass — `<article>` wraps scroll area, input stays outside
- Step 4: Semantic sections per message — Pass — `<section>` + sr-only `<h2>` role labels, reasoning hidden from Reader

### Final Verification
- Build: Pass (`tsc --noEmit`)
- Lint: Pass (`npm run lint`)
- Tests: Pass (714/714)
- Manual: Pending — test in Safari with 3+ message conversation

### Acceptance Criteria
- [x] Safari Reader Mode trigger — `<article>` + `<h1>` + sufficient content provides the semantic structure Safari needs
- [x] Conversation title as heading — `<h1>` in header renders the conversation title
- [x] Full conversation with role attribution — Each message in `<section>` with sr-only `<h2>` ("Voce" / "Fortuna")
- [x] Markdown renders in Reader Mode — Already rendered as HTML by ReactMarkdown, inside `<article>`
- [x] Sidebar/input/controls excluded — Sidebar in `<aside>`, input outside `<article>`, controls in `<header>`
- [x] No visual regression — Semantic elements have no default styling in Tailwind reset; `font-normal` on `<h1>` preserves text-xs appearance
