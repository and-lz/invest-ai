# Context: Chat Error Handling

## Requirements

### Goal
Add user-visible error feedback to all silent failure points in the chat flows. Currently, errors like delete failure, auto-save failure, and title generation failure are only logged to console — the user has no idea something went wrong.

### Acceptance Criteria
- [ ] Delete conversation failure shows error toast via `notificar.error()` + SWR optimistic rollback (already works)
- [ ] Auto-save failure is silent on first fail, shows warning toast after 3 consecutive failures
- [ ] Title generation failure shows subtle info toast (non-blocking)
- [ ] Load conversation failure shows error toast (currently only sets inline error state)
- [ ] No new error UI components — reuse existing `notificar` wrapper

### Out of Scope
- Retry logic / automatic retries with backoff
- Changes to API route error responses
- Changes to the streaming chat error handling (already has inline error + retry button)
- Error boundary changes

### Edge Cases
- Auto-save: counter resets on success → intermittent failures don't trigger toast
- Auto-save: counter resets when conversation changes (new conversation or load different one)
- Delete: user deletes a conversation that was already deleted → 404/500 → toast shown, list revalidates
- Title generation: API down → subtle toast, placeholder title stays (existing behavior preserved)

## Q&A Record
- Q: Which errors get feedback? → A: All silent failures
- Q: Delete failure UX? → A: Toast + rollback (SWR already rolls back optimistically)
- Q: Auto-save failure? → A: Subtle toast after 2-3 consecutive failures (chose 3)

## Codebase Analysis

### Existing Patterns to Follow
- `notificar.error()` / `notificar.warning()` at `src/lib/notifier.ts` — toast + persistent notification, already used across the app
- SWR optimistic update with `rollbackOnError: true` at `src/hooks/use-conversations.ts:49` — delete already rolls back on error
- Silent fail pattern at `src/hooks/use-chat-assistant.ts:173-176` — current auto-save approach

### Reusable Code Found
- `notificar` wrapper at `src/lib/notifier.ts` — all error toasts should use this
- No new utilities needed

### Affected Files
- `src/components/chat/conversations-list.tsx` (modify) — Add `notificar.error()` in `handleDeletar` catch block
- `src/hooks/use-chat-assistant.ts` (modify) — Add failure counter ref for auto-save, toast after 3 fails; add toast for title gen failure; add toast for load conversation failure
- `src/hooks/use-conversations.ts` (modify) — Stop re-throwing error (let caller handle via return value or keep throw but caller now catches properly)

### Risks
- Auto-save toast spam (Low) — Mitigated by 3-failure threshold + counter reset on success
- Title gen toast annoyance (Low) — Use `notificar.warning()` with subtle copy, non-blocking
