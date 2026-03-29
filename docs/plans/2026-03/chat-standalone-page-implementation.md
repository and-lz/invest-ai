# Implementation: Chat Standalone Page

**Context**: [chat-standalone-page-context.md](./chat-standalone-page-context.md)
**Plan**: [chat-standalone-page-plan.md](./chat-standalone-page-plan.md)
**Status**: Complete

## Deviations
- Step 3 — added `scale-[1.35]` + `overflow-hidden` on Fortuna avatar to crop internal image whitespace (user-approved: yes, requested mid-implementation)

## Verification Results
- Build: Pass (tsc --noEmit clean)
- Tests: Pass (714 tests, 42 files)
- Lint: Pass (pre-commit hook)
- Manual: Pending user confirmation

## Acceptance Criteria
- [x] No app HeaderNavigation on `/chat` — verified by CSS `.app-shell:has(.chat-fullbleed) > :first-child { display: none }`
- [x] No `max-w-7xl` constraint on chat — verified by `.app-shell:has(.chat-fullbleed) > main { max-width: none }`
- [x] Chat FAB not visible on `/chat` — already handled by `isOnChatPage` in chat-widget.tsx
- [x] Other routes render normally — CSS only activates when `.chat-fullbleed` is present
- [x] Back button navigates to last non-chat page — sessionStorage tracking in HeaderNavigation + ref in chat page
- [x] Existing chat header unchanged — no modifications to header controls
- [x] 100dvh viewport constraint — `.app-shell:has(.chat-fullbleed) { height: 100dvh; min-height: auto }`
- [x] Messages scroll independently — ChatBody already uses `overflow-y-auto` on messages div
- [x] Input always visible — flex layout with `min-h-0 flex-1` on messages, input pinned at bottom
- [x] Avatars h-11 w-11 (44px) in fullscreen — both user and Fortuna avatars updated
