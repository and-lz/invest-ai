# Plan: Chat Streaming & Reasoning UX

**Context**: [chat-streaming-reasoning-ux-context.md](./chat-streaming-reasoning-ux-context.md)

## Steps

### Step 1: Stream reasoning content progressively (backend)
**Files**: `src/infrastructure/ai/anthropic-ai-provider.ts` (modify)
**Changes**:
- Change `transmitirComPensamento()` Step 1 from non-streaming `gerar()` to streaming `transmitir()` for reasoning
- Accumulate reasoning text from stream chunks, yield each chunk as `{type: "thinking", content: chunk}` progressively
- This makes reasoning content appear incrementally on the frontend instead of as a single block
- Step 2 (response streaming) remains unchanged
**Verify**: Send a chat message with reasoning enabled → reasoning chunks arrive progressively before text chunks

### Step 2: Add streaming phase tracking to the hook
**Files**: `src/hooks/use-chat-assistant.ts` (modify)
**Changes**:
- Add new state `streamingPhase: "idle" | "thinking" | "responding"` to track which phase the AI is in
- During reasoning mode: set `"thinking"` when stream starts, switch to `"responding"` when first `t:1` chunk arrives
- During normal mode: set `"responding"` immediately when stream starts
- Reset to `"idle"` when stream ends
- Export `streamingPhase` in the hook return type
**Verify**: `tsc --noEmit` passes; hook returns new field

### Step 3: Thread `streamingPhase` through ChatBody to MensagemChatBolha
**Files**: `src/components/chat/chat-body.tsx` (modify), `src/components/chat/chat-widget.tsx` (modify)
**Changes**:
- Add `streamingPhase` prop to `ChatBodyProps` and pass it down
- Pass from `useChatAssistant` return → `ChatWidget` → `ChatBody` → `MensagemChatBolha`
- Add `streamingPhase` prop to `MensagemChatBolhaProps`
**Verify**: `tsc --noEmit` passes

### Step 4: Redesign reasoning display in MensagemChatBolha
**Files**: `src/components/chat/chat-message.tsx` (modify)
**Changes**:
- **Thinking indicator**: When `streamingPhase === "thinking"` and message is the last assistant message:
  - Show a pulsing "Pensando..." label with a brain/sparkle icon instead of bouncing dots
  - Auto-open the collapsible reasoning section to show content arriving progressively
- **Streaming reasoning**: When `streamingPhase === "thinking"` and `mensagem.pensamento` has content:
  - Show reasoning text streaming in the collapsible section (already open)
  - Add a subtle blinking cursor at the end of reasoning text
- **Transition to responding**: When `streamingPhase === "responding"`:
  - Auto-collapse the reasoning section (user can reopen manually)
  - Show bouncing dots or progressive text as before
- **Completed reasoning**: When not streaming and `mensagem.pensamento` exists:
  - Keep current collapsible "Raciocínio" behavior (collapsed by default, user can expand)
- Replace bouncing dots with a more descriptive indicator based on phase
**Verify**: Manual test — reasoning streams visibly, auto-opens during thinking, auto-collapses when response starts

### Step 5: Add thinking phase animation styles
**Files**: `src/app/globals.css` (modify)
**Changes**:
- Add `@keyframes thinking-pulse` — subtle opacity pulse for the thinking indicator
- Add `.chat-thinking-cursor` — blinking cursor effect for streaming reasoning text
**Verify**: Animations render correctly in browser

## New Files
None — all changes modify existing files.

## Verification Plan
- Build: `npx tsc --noEmit` → succeeds
- Lint: `npm run lint` → passes
- Tests: `npm run test` → all pass
- Manual:
  1. Open chat, enable "Estendido" (reasoning), send a question
  2. See "Pensando..." indicator immediately (not bouncing dots)
  3. See reasoning text stream progressively in auto-opened collapsible section
  4. When response starts: reasoning collapses, response streams as before
  5. After complete: reasoning is collapsed but expandable
  6. Send a normal message (reasoning off) → bouncing dots, then streaming text (unchanged behavior)
  7. Load an old conversation with reasoning → reasoning still renders correctly in collapsible

## Risks
- Reasoning streaming may produce partial markdown that renders oddly mid-stream (Low) — reasoning is short bullet points, unlikely to break
- Auto-collapse transition may feel jarring (Low) — smooth CSS transition mitigates this
