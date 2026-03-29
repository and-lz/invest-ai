# Plan: Saved/Bookmarked Chat Messages

**Context**: [saved-messages-context.md](./saved-messages-context.md)

## Steps

### Step 1: Database table + migration
**Files**: `src/lib/schema.ts` (modify), `drizzle/0007_add_saved_messages.sql` (create)
**Pattern**: Following `conversas` table in `schema.ts:141-156`
**Changes**:
- Add `mensagensSalvas` table to `schema.ts`:
  - `identificador` (text, PK, UUID)
  - `usuarioId` (text, not null, indexed)
  - `conversaId` (text, not null) — source conversation (no FK, survives deletion)
  - `tituloConversa` (text, not null) — snapshot of conversation title at save time
  - `mensagemId` (text, not null) — UUID of the original message in JSONB
  - `papel` (text, not null) — "usuario" | "assistente"
  - `conteudo` (text, not null) — message content snapshot
  - `salvadaEm` (timestamp with timezone, default now)
  - Unique index on `(usuarioId, mensagemId)` — prevents duplicates
  - Index on `(usuarioId, salvadaEm)` — for listing
- Create migration `drizzle/0007_add_saved_messages.sql` with CREATE TABLE
**Verify**: `npx drizzle-kit generate` succeeds, migration file valid SQL

### Step 2: Zod schema + repository interface + DB implementation
**Files**: `src/schemas/saved-message.schema.ts` (create), `src/domain/interfaces/saved-message-repository.ts` (create), `src/infrastructure/repositories/db-saved-message-repository.ts` (create)
**Pattern**: Following `conversation.schema.ts`, `conversation-repository.ts`, `db-conversation-repository.ts`
**Changes**:
- `saved-message.schema.ts`: Zod schemas for `SavedMessage`, `CreateSavedMessage` (omit auto fields)
- Repository interface with 4 methods:
  - `save(data: CreateSavedMessage): Promise<SavedMessage>` — upsert (idempotent)
  - `remove(usuarioId: string, mensagemId: string): Promise<void>` — delete by message ID
  - `list(usuarioId: string): Promise<SavedMessage[]>` — all saved, ordered by `salvadaEm DESC`
  - `isSaved(usuarioId: string, mensagemIds: string[]): Promise<Set<string>>` — batch check
- DB implementation using Drizzle with `db` from `src/lib/db.ts`
**Verify**: `tsc --noEmit` passes

### Step 3: API routes + container wiring
**Files**: `src/app/api/saved-messages/route.ts` (create), `src/app/api/saved-messages/[id]/route.ts` (create), `src/lib/container.ts` (modify)
**Pattern**: Following `src/app/api/conversations/route.ts`
**Changes**:
- `GET /api/saved-messages` — list saved messages for authenticated user
- `POST /api/saved-messages` — save a message (validate with `CreateSavedMessageSchema`)
- `DELETE /api/saved-messages/[id]` — unsave by message ID (not saved-message ID)
- Add `obterSavedMessageRepository()` factory in container
**Verify**: `tsc --noEmit` passes

### Step 4: SWR hook
**Files**: `src/hooks/use-saved-messages.ts` (create)
**Pattern**: Following `src/hooks/use-conversations.ts`
**Changes**:
- `useSavedMessages()` hook with SWR:
  - `savedMessages` — list of saved messages
  - `savedMessageIds` — `Set<string>` of message IDs for quick lookup
  - `isLoading` — loading state
  - `saveMessage(data)` — POST + optimistic add
  - `unsaveMessage(messageId)` — DELETE + optimistic remove
  - `isSaved(messageId)` — check Set
**Verify**: `tsc --noEmit` passes

### Step 5: Bookmark button on chat messages
**Files**: `src/components/chat/chat-message.tsx` (modify), `src/components/chat/chat-body.tsx` (modify)
**Pattern**: Following existing retry button pattern in `chat-message.tsx:102-110`
**Changes**:
- Add `onSave`, `onUnsave`, `isSaved` props to `MensagemChatBolha`
- Add bookmark icon button in the role label row (right-aligned), visible on hover (desktop) or always (mobile)
  - Filled `Bookmark` when saved, outline when not
  - `group` + `opacity-0 group-hover:opacity-100` for hover reveal (except when saved — always visible)
- `ChatBody`: accept `savedMessageIds: Set<string>`, `onToggleSave(message)` props
  - Pass through to each `MensagemChatBolha`
  - Don't show on streaming messages or empty content
**Verify**: `tsc --noEmit` passes, visual check in browser

### Step 6: Saved messages list component
**Files**: `src/components/chat/saved-messages-list.tsx` (create)
**Pattern**: Following `src/components/chat/conversations-list.tsx`
**Changes**:
- `SavedMessagesList` component:
  - Uses `useSavedMessages()` hook
  - Each item shows: truncated content (2-3 lines), conversation title, date saved
  - Unsave button (bookmark filled icon) on each item
  - Click navigates to source conversation (calls `onSelecionarConversa(conversaId)`)
  - If conversation was deleted: show "Conversa removida" muted text, no click action
  - Empty state: "Nenhuma mensagem salva" with Bookmark icon
  - Loading state: spinner
  - Grouped by date using existing `groupByDate` utility
**Verify**: `tsc --noEmit` passes

### Step 7: Tab switching in sidebar (widget + fullscreen)
**Files**: `src/components/chat/chat-widget.tsx` (modify), `src/app/chat/[id]/page.tsx` (modify), `src/components/chat/conversations-list.tsx` (modify)
**Changes**:
- Add a simple 2-tab header above the sidebar content:
  - "Conversas" tab (default) — shows `ListaConversas`
  - "Salvos" tab — shows `SavedMessagesList`
  - Simple underline active indicator using `border-b-2 border-primary`
- Tab state managed at the sidebar level (shared between widget/fullscreen)
- Both `chat-widget.tsx` and `chat/[id]/page.tsx` render tab header + conditional content
- Wire `onSelecionarConversa` from `SavedMessagesList` to existing conversation loading logic
- Wire `useSavedMessages` at the widget/page level, pass `savedMessageIds` and toggle handler down to `ChatBody`
**Verify**: Full visual check — toggle tabs, save/unsave messages, see them in saved list, click to navigate

## New Files
- `drizzle/0007_add_saved_messages.sql` — DB migration for `mensagens_salvas` table
- `src/schemas/saved-message.schema.ts` — Zod schemas — pattern from `conversation.schema.ts`
- `src/domain/interfaces/saved-message-repository.ts` — Repository interface — pattern from `conversation-repository.ts`
- `src/infrastructure/repositories/db-saved-message-repository.ts` — Drizzle implementation — pattern from `db-conversation-repository.ts`
- `src/app/api/saved-messages/route.ts` — GET + POST routes — pattern from `api/conversations/route.ts`
- `src/app/api/saved-messages/[id]/route.ts` — DELETE route — pattern from `api/conversations/[id]/route.ts`
- `src/hooks/use-saved-messages.ts` — SWR hook — pattern from `use-conversations.ts`
- `src/components/chat/saved-messages-list.tsx` — UI component — pattern from `conversations-list.tsx`

## Verification Plan
- Build: `tsc --noEmit && npm run lint` → succeeds after each step
- Tests: `npm run test` → all existing tests pass
- Manual:
  1. Open chat, send a message, hover over it → bookmark icon appears
  2. Click bookmark → icon fills, message saved
  3. Open sidebar "Salvos" tab → message appears with conversation title
  4. Click saved message → navigates to source conversation
  5. Click bookmark again (from message or saved list) → unsaved, removed from list
  6. Delete the source conversation → saved message still shows, but with "Conversa removida"
  7. Widget (small) + fullscreen page both work correctly
  8. Refresh page → saved state persists

## Risks
- **Schema migration** (Low) — New table only, no existing data affected. Run migration before deploy.
- **Message identity** (Med) — Messages use UUID from client-side generation. If a message is re-sent (retry), it gets a new UUID. Mitigation: this is expected behavior — the retry creates a new message.
- **Orphaned saves** (Low) — When a conversation is deleted, saved messages become orphaned. Mitigation: UI handles gracefully with "Conversa removida" indicator.
