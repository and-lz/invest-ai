# Chat Widget: Fullscreen Button → Navigate to /chat/[id]

## Context
- File: `src/components/chat/chat-widget.tsx`
- The fullscreen button (line ~299–311) currently toggles `telaCheia` state
- `conversaAtualId` is already available from `useChatAssistant()` (line 63)
- Target route: `/chat/[id]` (exists at `src/app/chat/[id]/page.tsx`)

## Plan
1. Import `useRouter` from `next/navigation` in `chat-widget.tsx`
2. Replace the `onClick` of the fullscreen button: instead of toggling `telaCheia`, navigate to `/chat/${conversaAtualId}` (or `/chat` if no conversation yet)
3. Remove `Minimize2` from imports if it becomes unused (also remove `telaCheia` state if nothing else uses it)

## Verification
- Clicking the fullscreen button on the chat widget navigates to `/chat/[id]`
- If no conversation exists yet, navigates to `/chat`
- TypeScript compiles without errors (`tsc --noEmit`)
