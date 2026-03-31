# Implementation: Improve Long Conversation Readability in /chat

**Context**: [chat-long-conversation-readability-context.md](./chat-long-conversation-readability-context.md)
**Plan**: [chat-long-conversation-readability-plan.md](./chat-long-conversation-readability-plan.md)
**Status**: Complete

## Deviations
- None

## Verification Results
- Build: Pass (pre-commit hook runs tsc + lint)
- Tests: Pass — 714 tests, 42 files
- Lint: Pass
- Manual: Pending user verification

## Acceptance Criteria
- [x] Messages show timestamps — `formatMessageTime()` in `chat-message.tsx` shows "agora", "N min", or "HH:MM"
- [x] Date separators appear between messages from different days — `getDateLabel()` shows "Hoje", "Ontem", or "DD de month"
- [x] Smart auto-scroll only triggers when user is near bottom — `isNearBottomRef` + 100px threshold
- [x] Floating scroll-to-bottom button with new-message badge — `ChevronDown` FAB with primary dot indicator
- [x] All changes work in both widget and fullscreen — `fs` flag controls sizing throughout
- [x] No regressions — all 714 tests pass, streaming/thinking/bookmarks/TTS unchanged
