# Implementation: Chat Dedicated Routes

**Context**: [chat-dedicated-routes-context.md](./chat-dedicated-routes-context.md)
**Plan**: [chat-dedicated-routes-plan.md](./chat-dedicated-routes-plan.md)
**Status**: Complete

## Deviations
- Step 2: Instead of creating a conversation via API on `/chat`, the redirect page generates a UUID client-side and navigates to `/chat/[id]`. The conversation is auto-saved by `useChatAssistant` when the first message is sent. This avoids creating empty conversations in the database.

## Verification Results
- Build: Pass (`tsc --noEmit` clean)
- Tests: Pass (694/694)
- Manual: Pending user verification

## Acceptance Criteria
- [x] `/chat` auto-creates a new conversation and redirects to `/chat/[newId]`
- [x] `/chat/[id]` renders a fullscreen chat page with the conversation loaded
- [x] Desktop: persistent sidebar (collapsible) showing conversation history
- [x] Mobile: sidebar as drawer overlay, toggle via button
- [x] Back navigation returns to the previous page (ArrowLeft button calls `router.back()`)
- [x] The FAB and modal chat widget remain fully functional (no breaking changes)
- [x] Header navigation includes a "Fortuna" link to `/chat`
- [x] FAB is hidden on `/chat/*` pages
- [x] Chat page uses the same `useChatAssistant` hook for messaging
- [x] Chat page is auth-protected (middleware already handles this)
- [x] Page metadata: "Fortuna | Investimentos"
