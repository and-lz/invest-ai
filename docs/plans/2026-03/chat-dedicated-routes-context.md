# Context: Chat Dedicated Routes

## Requirements

### Goal
Each chat conversation gets its own URL (`/chat/[id]`) as a dedicated fullscreen page. Users can bookmark, share, and reopen conversations directly via URL. The current modal-based chat widget (FAB) is replaced by navigation to this page.

### Acceptance Criteria
- [ ] `/chat` auto-creates a new conversation and redirects to `/chat/[newId]`
- [ ] `/chat/[id]` renders a fullscreen chat page with the conversation loaded
- [ ] Desktop: persistent sidebar (collapsible) showing conversation history — like ChatGPT
- [ ] Mobile: sidebar as drawer overlay, toggle via button
- [ ] Back navigation returns to the previous page (browser back button works)
- [ ] The FAB and modal chat widget remain fully functional (no breaking changes)
- [ ] Header navigation includes a link to `/chat` (or last conversation)
- [ ] FAB is hidden on `/chat/*` pages (since the user is already in fullscreen chat)
- [ ] Chat page uses the same `useChatAssistant` hook for messaging
- [ ] Chat page is auth-protected (middleware already handles this)
- [ ] "Explain chart" buttons (`BotaoExplicarIA`) navigate to `/chat` with the question as a query param
- [ ] Page metadata: "Fortuna | Investimentos"

### Out of Scope
- Removing or modifying the existing chat widget (FAB + modal) — it must keep working as-is
- Real-time collaboration / sharing conversations with other users
- Changing the conversation API routes or repository
- Changing the chat streaming/messaging logic
- Chat highlight system changes (highlighting only works on dashboard, not from the chat page)

### Edge Cases
- `/chat/[id]` with invalid/nonexistent ID → redirect to `/chat` (new conversation)
- `/chat/[id]` with another user's conversation → 404/redirect (already handled by API: queries filter by userId)
- Browser back from `/chat/[id]` → returns to previous page normally
- Deep link to `/chat/[id]` when not authenticated → middleware redirects to login → after login, user lands on the chat page

## Q&A Record
- Q: Dedicated page or modal? → A: Dedicated page (`/chat/[id]`) as addition; keep modal widget intact
- Q: `/chat` empty state? → A: Redirect to new conversation
- Q: Sidebar visible? → A: Always on desktop (collapsible), drawer on mobile

## Codebase Analysis

### Existing Patterns to Follow
- **Page structure** — see `src/app/insights/page.tsx`, `src/app/trends/page.tsx` — Client component, hooks for data, chat context registration, loading/error/empty states
- **Layout metadata** — see `src/app/insights/layout.tsx` — Simple layout.tsx that only exports `metadata` object
- **Native dialog for drawers** — see `src/components/layout/header-navigation.tsx:80-98` — Uses `useNativeDialog` hook + `dialog.drawerLeft` for mobile drawer pattern
- **Header nav items** — see `src/components/layout/header-navigation.tsx:38-51` — Primary and secondary nav arrays with `{ href, label, icone }` shape
- **Chat widget fullscreen mode** — see `src/components/chat/chat-widget.tsx:242` — Already has fullscreen styling (`chat-fullscreen`, `max-w-[80ch]`, `text-2xl` in bubbles)
- **Conversation loading** — see `src/hooks/use-chat-assistant.ts:262-280` — `carregarConversa(id)` fetches full conversation from API

### Reusable Code Found
- `useChatAssistant` at `src/hooks/use-chat-assistant.ts` — Core chat hook, reuse as-is
- `useConversas` at `src/hooks/use-conversations.ts` — SWR hook for conversation list
- `ListaConversas` at `src/components/chat/conversations-list.tsx` — Sidebar component (already supports `fullscreen` prop)
- `MensagemChatBolha` at `src/components/chat/chat-message.tsx` — Message bubble (already supports `fullscreen` prop)
- `CampoEntradaChat` at `src/components/chat/chat-input-field.tsx` — Input field (already supports `fullscreen` prop)
- `SuggestionChips` at `src/components/chat/suggestion-chips.tsx` — Suggestion chips (already supports `fullscreen` prop)
- `useChatSuggestions` at `src/hooks/use-chat-suggestions.ts` — AI type-ahead suggestions
- `useSpeechSynthesis` at `src/hooks/use-speech-synthesis.ts` — TTS support
- `INITIAL_SUGGESTIONS` at `src/lib/chat-suggestions.ts` — Initial suggestion chips per page
- `ChatPageProvider` at `src/contexts/chat-page-context.tsx` — Page context for chat (already in root layout)
- `isAiEnabled()` at `src/lib/ai-features.ts` — Feature flag check

### Affected Files
- `src/app/chat/layout.tsx` (create) — Metadata for chat pages
- `src/app/chat/page.tsx` (create) — Redirect to new conversation
- `src/app/chat/[id]/page.tsx` (create) — Main fullscreen chat page
- `src/app/layout.tsx` (modify) — Conditionally hide FAB on `/chat/*` routes (or keep as-is if handled in widget)
- `src/components/layout/header-navigation.tsx` (modify) — Add chat link to nav
- `src/components/chat/chat-widget.tsx` (modify) — Hide FAB when on `/chat/*` routes
- `src/components/ui/ai-explain-button.tsx` (no change) — Keeps dispatching event for the widget; chat page is a separate entry point
- `src/components/chat/conversations-list.tsx` (modify) — Use `Link` for conversation items instead of callback (enables URL-based navigation)

### Risks
- **Losing chat context per page** (Low) — Current widget uses `useChatPageContext` which knows which page the user is on. On the dedicated chat page, `identificadorPagina` will default to "dashboard" unless we pass the origin page. Mitigation: accept that the chat page context is generic ("dashboard" default), or pass origin as query param.
- **Component duplication** (Low) — Risk of duplicating the chat widget UI into the page. Mitigation: extract the chat "body" (messages + input + suggestions) into a shared component reused by both the widget and the dedicated page.
