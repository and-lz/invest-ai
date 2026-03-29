# Context: Saved/Bookmarked Chat Messages

## Requirements

### Goal
Allow users to bookmark/star individual chat messages and access them later via a dedicated "Saved" tab in the chat sidebar. This helps users retain important AI insights without having to scroll through entire conversations.

### Acceptance Criteria
- [ ] Each chat message (user or assistant) has a bookmark/star icon that toggles saved state
- [ ] Saved state persists server-side (PostgreSQL) across sessions/devices
- [ ] Chat sidebar has a "Saved" tab/section alongside the conversation list
- [ ] Saved messages view shows: message content, source conversation title, date saved
- [ ] Clicking a saved message navigates to (or opens) the source conversation
- [ ] Users can unsave messages from both the message bubble and the saved messages list
- [ ] Saved messages are isolated per user (same security model as conversations)

### Out of Scope
- Tagging/categorizing saved messages
- Search within saved messages
- Sharing saved messages
- Export functionality
- Saved messages limit (no FIFO — keep all until manually removed)

### Edge Cases
- Message saved from a conversation that is later deleted → show saved message with "Conversation deleted" indicator, no link
- Same message bookmarked twice → idempotent, no duplicate
- Message content updated after save (unlikely with current append-only model) → saved snapshot preserves original content
- Empty content message → don't show save icon on streaming/empty messages

## Q&A Record
- Q: What does "save a message" mean? → A: Bookmark/star individual messages within conversations
- Q: Where to access saved messages? → A: Tab/section inside chat sidebar
- Q: Persistence model? → A: Server-side (PostgreSQL)

## Codebase Analysis

### Existing Patterns to Follow

**DB table pattern** — see `src/lib/schema.ts:141-156` (conversas table)
- UUID text primary key, `usuario_id` indexed, timestamps with timezone
- Index naming: `idx_{table}_{columns}`

**Repository pattern** — see `src/domain/interfaces/conversation-repository.ts`
- Interface in `domain/interfaces/`, implementation in `infrastructure/repositories/`
- Factory function in `src/lib/container.ts`
- All methods receive `usuarioId` for isolation

**API route pattern** — see `src/app/api/conversations/route.ts`
- `requireAuth()` guard, `cabecalhosSemCache()` headers
- Zod validation with `safeParse`, 400 on failure
- Consistent JSON response shape

**Zod schema pattern** — see `src/schemas/conversation.schema.ts`
- Schemas are source of truth for TypeScript types
- Inferred types exported alongside schemas

**Chat message component** — see `src/components/chat/chat-message.tsx`
- `MensagemChatBolha` renders each message with avatar + content
- Props interface with readonly fields
- No existing action buttons on messages (only retry on error)

**Sidebar pattern** — see `src/components/chat/conversations-list.tsx`
- `ListaConversas` component with new conversation button + grouped items
- Uses `useConversas()` SWR hook for data

### Reusable Code Found
- `requireAuth()` at `src/lib/auth-utils.ts` — auth guard for API routes
- `cabecalhosSemCache()` at `src/lib/api-utils.ts` — cache headers
- `MensagemChat` schema at `src/schemas/chat.schema.ts` — message type
- `cn()` at `src/lib/utils.ts` — class merging utility
- `ds` / design system tokens at `src/lib/design-system.ts` — consistent styling
- `Bookmark` icon from `lucide-react` — star/bookmark icon

### Affected Files

**Create:**
- `src/lib/schema.ts` (modify) — Add `mensagensSalvas` table
- `drizzle/0007_add_saved_messages.sql` (create) — Migration
- `src/schemas/saved-message.schema.ts` (create) — Zod schemas
- `src/domain/interfaces/saved-message-repository.ts` (create) — Repository interface
- `src/infrastructure/repositories/db-saved-message-repository.ts` (create) — DB implementation
- `src/app/api/saved-messages/route.ts` (create) — GET (list) + POST (save)
- `src/app/api/saved-messages/[id]/route.ts` (create) — DELETE (unsave)
- `src/hooks/use-saved-messages.ts` (create) — SWR hook
- `src/components/chat/saved-messages-list.tsx` (create) — Saved tab UI

**Modify:**
- `src/lib/container.ts` — Add saved message repository factory
- `src/components/chat/chat-message.tsx` — Add bookmark icon button
- `src/components/chat/chat-widget.tsx` — Add tab switching (Conversations / Saved)
- `src/app/chat/[id]/page.tsx` — Add tab switching in sidebar
- `src/components/chat/chat-body.tsx` — Pass save handler to message bubbles

### Risks
- **Schema migration** (Low) — New table only, no existing data affected
- **Sidebar complexity** (Low) — Adding tabs is straightforward with existing patterns
- **Message identity** (Med) — Messages are stored as JSONB inside conversations, identified by `identificador` UUID. Saved messages table references both `conversaId` and `mensagemId` to enable navigation back to source. If conversation is deleted, saved message remains orphaned but still viewable.
