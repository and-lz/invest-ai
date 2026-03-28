# Fix: Chat 404 Redirect Loop

## Context
`/chat` generates a random UUID and redirects to `/chat/{uuid}`. That page tries to load the conversation, gets a 404 (it doesn't exist yet), and redirects back to `/chat` — creating an infinite loop.

## Plan
1. In `src/app/chat/[id]/page.tsx`, remove the `router.replace("/chat")` redirect when conversation is not found. A 404 simply means the conversation is new and will be created on first message send.

## Verification
- Navigate to `/chat` — should generate UUID, redirect to `/chat/{uuid}`, and show empty chat (no loop)
- Navigate to `/chat/{existing-id}` — should load the conversation normally
