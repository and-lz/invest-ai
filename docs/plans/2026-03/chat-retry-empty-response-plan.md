# Chat Retry Button for Empty Responses

## Context
When the Claude proxy returns an empty response, the assistant bubble shows "Fortuna" header with no content and no way to retry. The retry button only appears for `[ERRO]:` stream errors.

## Root Cause
In `chat-message.tsx` lines 132-145, when `cleanContent` is empty and `estaTransmitindo` is false, nothing renders — no error, no retry button.

## Plan
1. In `chat-message.tsx`: add an empty-response state that shows a subtle message + retry button when:
   - `!ehUsuario && !cleanContent && !estaTransmitindo && !streamError && onRetry`

## Verification
- Send a message that triggers an empty proxy response → retry button appears
- Normal messages with content → no change
- Stream errors → existing error UI unchanged
- During streaming (dots) → no retry button shown
