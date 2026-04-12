# Hide Header on New Conversation

## Context
On `/chat/[id]`, the `ChatPageHeader` is always rendered via `headerSlot`. When opening a new conversation (no messages, no saved conversation), the header is unnecessary visual noise.

Affected files:
- `src/app/chat/[id]/page.tsx` — pass `headerSlot` conditionally

## Plan
1. In `ChatPage`, compute `isNewConversation = mensagens.length === 0 && !conversaAtual`
2. Pass `headerSlot` to `ChatBody` only when `!isNewConversation`

## Verification
- Visit `/chat` (redirects to `/chat/<uuid>`) — no header shown
- Send a message — header appears
- Navigate to an existing conversation — header appears
