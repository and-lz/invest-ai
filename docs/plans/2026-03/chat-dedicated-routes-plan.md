# Plan: Chat Dedicated Routes

**Context**: [chat-dedicated-routes-context.md](./chat-dedicated-routes-context.md)

## Steps

### Step 1: Extract shared chat body into reusable component
**Files**: `src/components/chat/chat-body.tsx` (create), `src/components/chat/chat-widget.tsx` (modify)
**Pattern**: Following `src/components/chat/chat-widget.tsx:242-410` (the inner chat area)
**Changes**:
- Extract the chat area (messages, error banner, suggestion chips, input field) from `ChatWidget` into a new `ChatBody` component
- Props: all the state/handlers from `useChatAssistant`, plus `fullscreen`, `userImageUrl`, `userInitials`, `activeSuggestions`, `aiSuggestionsLoading`, `inputValue`, `onInputValueChange`, `onSuggestionSelect`
- Refactor `ChatWidget` to use `ChatBody` internally — behavior must remain identical
**Verify**: Widget works exactly as before (open FAB, send message, load conversation, sidebar, fullscreen toggle)

### Step 2: Create chat layout and redirect page
**Files**: `src/app/chat/layout.tsx` (create), `src/app/chat/page.tsx` (create)
**Pattern**: Following `src/app/insights/layout.tsx` for metadata layout
**Changes**:
- `layout.tsx`: Export metadata `{ title: "Fortuna | Investimentos" }`, pass through children
- `page.tsx`: Client component that calls `POST /api/conversations` to create a new empty conversation, then `router.replace('/chat/[newId]')`. Show a loading spinner during redirect.
  - The POST creates a conversation with a default title "Nova conversa", `identificadorPagina: "dashboard"`, and empty messages array
**Verify**: Visiting `/chat` creates a new conversation and redirects to `/chat/[uuid]`

### Step 3: Create the fullscreen chat page `/chat/[id]`
**Files**: `src/app/chat/[id]/page.tsx` (create)
**Pattern**: Following `ChatWidget` fullscreen mode (always `fs = true`)
**Changes**:
- Client component that reads `params.id` from the URL
- Uses `useChatAssistant` hook — calls `carregarConversa(id)` on mount
- Desktop layout: persistent sidebar on the left (using `ListaConversas` with `fullscreen={true}`), chat body on the right (using `ChatBody`)
- Mobile layout: sidebar as overlay drawer (using `useNativeDialog` + `dialog.drawerLeft` pattern from header-navigation)
- Header bar with: sidebar toggle, "Fortuna" title, TTS toggle, clear history, close (navigates back via `router.back()`)
- On sidebar conversation select: `router.push('/chat/[selectedId]')` instead of just loading in-memory
- On "Nova Conversa" click: `router.push('/chat')` (triggers the redirect page from Step 2)
- Handle invalid conversation ID: if `carregarConversa` fails, redirect to `/chat`
**Verify**: Navigate to `/chat/[id]`, conversation loads, sidebar shows history, can switch conversations via URL, can create new conversations

### Step 4: Hide FAB on chat pages + add nav link
**Files**: `src/components/chat/chat-widget.tsx` (modify), `src/components/layout/header-navigation.tsx` (modify)
**Changes**:
- `ChatWidget`: Use `usePathname()` to detect `/chat` routes, hide FAB when `pathname.startsWith('/chat')`
- `HeaderNavigation`: Add `{ href: "/chat", label: "Fortuna", icone: Bot }` to `todosItensPrincipais` array (guarded by `AI_ONLY_ROUTES` pattern so it only shows when AI is enabled)
**Verify**: FAB hidden on `/chat/*`, visible elsewhere. "Fortuna" link in header nav, active state when on `/chat/*`

### Step 5: URL-based conversation switching in sidebar
**Files**: `src/components/chat/conversations-list.tsx` (modify), `src/components/chat/conversation-item.tsx` (modify)
**Changes**:
- `ItemConversa`: Accept optional `href` prop. When provided, render as a `Link` instead of a plain `button`. Keep the `onSelecionar` callback for the widget use case.
- `ListaConversas`: Accept optional `useLinks?: boolean` prop. When true, pass `href={/chat/${id}}` to each `ItemConversa`.
- The chat page passes `useLinks={true}`, the widget continues using callbacks.
**Verify**: In the dedicated page, clicking a conversation navigates via URL. In the widget, clicking still calls the callback.

## New Files
- `src/components/chat/chat-body.tsx` — Shared chat UI (messages + input + suggestions) — extracted from `chat-widget.tsx`
- `src/app/chat/layout.tsx` — Metadata layout — pattern from `insights/layout.tsx`
- `src/app/chat/page.tsx` — Redirect to new conversation
- `src/app/chat/[id]/page.tsx` — Fullscreen chat page

## Verification Plan
- Build: `npx tsc --noEmit && npx next lint` → succeeds
- Tests: `npm run test` → all pass (no new tests needed — existing hooks/components unchanged)
- Manual:
  1. Click FAB on dashboard → widget opens (unchanged behavior)
  2. Navigate to `/chat` → redirects to `/chat/[uuid]` with new conversation
  3. Send messages on `/chat/[uuid]` → streaming works, auto-save works
  4. Click conversation in sidebar → URL changes to `/chat/[otherId]`, conversation loads
  5. Click "Nova Conversa" in sidebar → redirects to `/chat` → new conversation created
  6. Browser back → returns to previous page
  7. Invalid `/chat/[badId]` → redirects to `/chat`
  8. FAB hidden on `/chat/*` pages, visible on all other pages
  9. "Fortuna" link visible in header nav, active state correct
  10. Mobile: sidebar opens as drawer overlay

## Risks
- **Component duplication** (Low) — Mitigated by Step 1: extracting `ChatBody` as shared component
- **Chat page context** (Low) — Chat page defaults to `identificadorPagina: "dashboard"` since it's not tied to a specific page. Acceptable tradeoff.
