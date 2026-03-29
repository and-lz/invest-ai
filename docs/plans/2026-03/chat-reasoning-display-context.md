# Chat Reasoning Display — Context

## Goal

Show Claude's "thinking" (extended thinking / reasoning) in the chat UI as inline dimmed text above the response, streamed in real-time. User can toggle reasoning on/off via a button in the chat input area.

## User Decisions

| Decision | Choice |
|----------|--------|
| UI style | Inline dimmed text (always visible when enabled, no collapse) |
| Streaming | Real-time (thinking text streams as it generates) |
| Default | Toggle in chat input area, preference persisted |

## Current Architecture

### Streaming Pipeline

```
User Input → POST /api/chat → AnthropicProvedorAi.transmitir()
  → SSE from Claude proxy → AsyncGenerator<string> (text only)
  → ReadableStream (plain text) → Frontend reader → useState
```

### Key Files

| File | Role |
|------|------|
| `src/infrastructure/ai/anthropic-ai-provider.ts` | SSE parser, only handles `content_block_delta` + `text_delta` |
| `src/domain/interfaces/ai-provider.ts` | `transmitir()` returns `AsyncGenerator<string>` — text only |
| `src/app/api/chat/route.ts` | Streams plain text to frontend, no structured protocol |
| `src/hooks/use-chat-assistant.ts` | Reads stream, accumulates text, processes markers |
| `src/components/chat/chat-message.tsx` | Renders message bubble, no thinking support |
| `src/components/chat/chat-body.tsx` | Message list + input, no reasoning toggle |
| `src/components/chat/chat-input-field.tsx` | Input field, no toggle button |
| `src/schemas/chat.schema.ts` | `MensagemChat` has no thinking/reasoning field |

### Claude Extended Thinking — SSE Events

When `thinking.type = "enabled"` + `thinking.budget_tokens` is sent in the request, Claude returns:

```
data: {"type":"content_block_start","index":0,"content_block":{"type":"thinking","thinking":""}}
data: {"type":"content_block_delta","index":0,"delta":{"type":"thinking_delta","thinking":"..."}}
data: {"type":"content_block_stop","index":0}
data: {"type":"content_block_start","index":1,"content_block":{"type":"text","text":""}}
data: {"type":"content_block_delta","index":1,"delta":{"type":"text_delta","text":"..."}}
data: {"type":"content_block_stop","index":1}
```

Key: thinking blocks come BEFORE text blocks. The `type` field in `content_block_start` and `delta` distinguishes them.

### Current SSE Parser (provider line 184)

```typescript
if (parsed.type === "content_block_delta" && parsed.delta?.type === "text_delta" && parsed.delta.text) {
  yield parsed.delta.text;
}
```

Only yields `text_delta` — `thinking_delta` events are silently ignored.

## What Needs to Change

### 1. Provider: Enable thinking + yield typed chunks

- Add `thinking` config to request body when reasoning is enabled
- Yield typed chunks instead of plain strings: `{ type: "thinking" | "text", content: string }`
- New method or overload on `transmitir()` to support typed streaming

### 2. API Route: Structured stream protocol

Currently streams plain text. Need a way to distinguish thinking vs text chunks on the wire.

Options:
- **SSE protocol**: `event: thinking\ndata: ...\n\n` vs `event: text\ndata: ...\n\n`
- **JSON lines**: `{"type":"thinking","content":"..."}\n`
- **Prefix protocol**: `T:chunk` for thinking, `R:chunk` for response

### 3. Chat Schema: Add thinking field to MensagemChat

- `pensamento?: string` field on `MensagemChat` for persisted thinking content
- Schema backward compatible (optional field)

### 4. Hook: Track thinking + text separately

- Separate accumulators for thinking and text during streaming
- Parse structured stream protocol
- Set both fields on message state

### 5. UI: Inline dimmed text + toggle

- `MensagemChatBolha`: render thinking content above response in `text-muted-foreground`
- `CampoEntradaChat`: add reasoning toggle button
- Persist preference in `localStorage`

### 6. Request: Pass reasoning flag

- Add `raciocinio?: boolean` to `RequisicaoChatSchema`
- Frontend sends flag based on toggle state
- API route passes to provider

## Constraints

- Backward compatible: old messages without thinking still render fine
- Extended thinking requires `budget_tokens` (min 1024 for Claude)
- Thinking blocks are NOT included in `max_tokens` — separate budget
- Toggle preference persisted in `localStorage` (no DB change needed)
- The proxy at `CLAUDE_PROXY_URL` must support the `thinking` parameter (standard Claude API)

## Out of Scope

- Thinking for non-streaming (`gerar()`) method
- Thinking for autocomplete suggestions
- Cost/token display for thinking tokens
- Thinking content in conversation persistence (save thinking text but don't re-send it to API)
