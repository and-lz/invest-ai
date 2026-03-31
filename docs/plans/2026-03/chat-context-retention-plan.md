# Fix: Chat Loses Conversation Context

## Root Cause

The Claude proxy (scripts/claude-proxy.ts lines 174-194) converts structured multi-turn messages into a single flat text prompt for the claude -p CLI using weak plain-text labels like [Previous conversation] / Human: / Assistant:. The model receives conversation history as unstructured text within one big user prompt, not as proper multi-turn messages. This makes it easy for the model to "forget" earlier turns, especially when the system prompt + page context (up to 15K chars) dominates.

Compounding factor with reasoning mode: two separate API calls are made per user message, each linearizing the history independently. The second call also has a much longer system prompt (original + reasoning analysis).

## Affected Files

1. `scripts/claude-proxy.ts` — buildPrompt() function (lines 174-194)
2. `src/lib/build-chat-system-prompt.ts` — system instruction (lines 22-83)

## Plan

### Step 1: Improve prompt linearization format in proxy

Change `buildPrompt()` to use XML tags that Claude parses much more reliably:

Before:
  [Previous conversation]
  Human: first message
  Assistant: response
  [Current message]
  new message

After:
  <conversation_history>
  <turn role="user">first message</turn>
  <turn role="assistant">response</turn>
  </conversation_history>

  new message

**Verify**: Proxy still compiles with `npx tsx --parse-only scripts/claude-proxy.ts`

### Step 2: Add conversation-awareness instruction to system prompt

Add a short instruction in the system prompt telling the model to never repeat questions or topics already covered in conversation history.

**Verify**: `tsc --noEmit` passes, chat still works

## Verification

1. TypeScript compiles: `npx tsc --noEmit`
2. Lint passes: `npm run lint`
3. Existing tests pass: `npm run test`
4. Manual: open chat, have a 3-4 message conversation, confirm AI references previous turns correctly
