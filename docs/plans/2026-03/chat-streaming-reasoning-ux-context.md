# Chat Streaming & Reasoning UX — Context

## Goal
Improve the chat experience with:
1. Better visualization when AI is thinking (reasoning) — show an expandable section with streamed reasoning content
2. Stream the response in visible chunks with progressive rendering
3. Show clear loading/thinking states that distinguish between phases

## Current State

### Reasoning Flow (with `raciocinio: true`)
1. User sends message → bouncing dots `...` shown
2. **API makes 2 calls sequentially:**
   - Step 1: Non-streaming `gerar()` call for reasoning (~600 tokens) — **blocks entirely**
   - Step 2: Streaming `transmitir()` call for response text
3. Keepalive spaces sent every 5s during Step 1 to prevent timeout
4. Reasoning arrives as **single chunk** after Step 1 completes
5. Response text streams progressively in Step 2
6. After complete, reasoning shown as collapsible "Raciocínio" section

### Problem
- During Step 1 (reasoning), user sees **only bouncing dots** for 5-15 seconds — no indication that the AI is "thinking"
- Reasoning content appears **all at once** after the blocking call — no progressive reveal
- No visual distinction between "thinking" and "responding" phases
- The bouncing dots are the same whether reasoning is enabled or not

### Non-Reasoning Flow (without `raciocinio`)
1. User sends message → bouncing dots shown
2. Text streams progressively — works well
3. No issues here beyond the generic dots indicator

## Affected Files

### Backend (streaming protocol)
- `src/infrastructure/ai/anthropic-ai-provider.ts` — `transmitirComPensamento()` does blocking gerar() + streaming transmitir()
- `src/app/api/chat/route.ts` — Encodes chunks as `{"t":0,"c":"..."}` (thinking) or `{"t":1,"c":"..."}` (text)

### Frontend (parsing + rendering)
- `src/hooks/use-chat-assistant.ts` — `parseReasoningStream()` + message state updates
- `src/components/chat/chat-message.tsx` — `MensagemChatBolha` with collapsible reasoning block
- `src/components/chat/chat-body.tsx` — Message list rendering + auto-scroll

### Schemas
- `src/schemas/chat.schema.ts` — `MensagemChat` has `pensamento?: string` field

## Existing Patterns & Conventions

### Streaming Protocol
- Normal mode: raw text chunks
- Reasoning mode: newline-delimited JSON `{"t":0,"c":"..."}` (thinking=0) / `{"t":1,"c":"..."}` (text=1)
- `parseReasoningStream()` in hook splits accumulated raw into `{thinking, text}`

### UI Components
- `Collapsible` / `CollapsibleTrigger` / `CollapsibleContent` from shadcn/ui — already used for reasoning
- Design system tokens in `src/lib/design-system.ts`
- `cn()` utility for className merging

### Loading States
- `estaTransmitindo` — true during streaming
- `estaCarregandoConversa` — true during conversation load
- Bouncing dots shown when `estaTransmitindo && !content`

## Constraints

### Proxy Limitation
The Claude proxy (`localhost:3099`) buffers full responses for non-streaming calls and strips the native `thinking` API parameter. This is why `transmitirComPensamento()` uses the two-step workaround. **We cannot change the proxy behavior.**

### Backward Compatibility
- The `{"t":0/1,"c":"..."}` protocol is already established
- `MensagemChat.pensamento` field is already used in saved conversations
- Existing conversations with reasoning must still render correctly

## Key Insight
The main UX problem is that the reasoning step is a **blocking non-streaming call**. Since we can't make the proxy stream the native thinking parameter, we need to:
1. Add a new **streaming phase indicator** on the frontend to show "thinking in progress"
2. Optionally: make the reasoning call itself streaming (use `transmitir()` instead of `gerar()` for Step 1) so reasoning text appears progressively
3. Improve the collapsible reasoning UI to auto-open during streaming and show content as it arrives

## Out of Scope
- Changing the Claude proxy behavior
- Modifying the conversation persistence schema
- Adding new API endpoints
