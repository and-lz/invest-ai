# Context: Claude Proxy — Real Streaming, Performance & Security

## Requirements

### Goal
Transform the Claude proxy from fake streaming (wait for full response, then split into chunks) to real token-by-token streaming using the CLI's `--output-format stream-json --include-partial-messages`. Add CLI flag optimizations and basic security hardening.

### Acceptance Criteria
- [ ] Proxy streams real token-by-token chunks from CLI stdout directly to SSE events (no buffering full response)
- [ ] First token arrives at the client within ~1-2s of request (not after full generation)
- [ ] CLI spawned with `--no-session-persistence --tools ""` to reduce overhead and token count
- [ ] Non-streaming (`stream: false`) requests still work (can buffer full response)
- [ ] Reasoning two-step mode still works but defaults to OFF — both steps stream where possible
- [ ] Request body size limited to 100KB
- [ ] Concurrent request limit of 3 (queue or reject excess)
- [ ] CORS restricted to localhost origins only
- [ ] Provider (`AnthropicProvedorAi`) SSE parser handles both old fake-chunk and new real-chunk formats gracefully
- [ ] All existing chat functionality works: regular streaming, reasoning streaming, model selection, error handling
- [ ] Frontend hook (`use-chat-assistant.ts`) requires no changes (it already reads `ReadableStream` chunks)

### Out of Scope
- Native extended thinking via CLI (confirmed not available — CLI strips `thinking` parameter)
- Replacing the `claude` CLI with direct API calls
- Production deployment (proxy is dev-only, localhost)
- Changes to the chat UI components
- Changes to the frontend streaming consumption logic (already works with chunked streams)

### Edge Cases
- CLI process crashes mid-stream → proxy sends error SSE event, closes connection cleanly
- CLI authentication expires → proxy returns 502 with clear error message
- Request arrives while 3 concurrent requests active → return 429 with retry-after header
- Request body > 100KB → return 413 immediately
- Empty messages array → return 400 (already handled)
- Client disconnects mid-stream → CLI process killed, resources cleaned up

## Q&A Record
- Q: Should we use `--bare` flag? → A: No — it skips keychain auth, breaks authentication
- Q: Does `--include-partial-messages` give real token streaming? → A: Yes — tested: 200-word response arrives in ~15 chunks of 46-116 chars each, in real-time
- Q: Is extended thinking available via CLI? → A: No — no `thinking_delta` events appear in stream-json output
- Q: Keep reasoning feature? → A: Yes, as optional toggle (default OFF). Keep two-step approach, stream both steps where possible
- Q: CLI flags for performance? → A: `--no-session-persistence` (skip disk writes) + `--tools ""` (smaller system prompt = fewer input tokens)

## Codebase Analysis

### Existing Patterns to Follow
- SSE event format: `event: {type}\ndata: {json}\n\n` — see `scripts/claude-proxy.ts:303-309`
- CLI invocation via `spawn()` — see `scripts/claude-proxy.ts:203-241`
- Request logging ring buffer — see `scripts/claude-proxy.ts:44-55`
- Provider SSE parsing — see `src/infrastructure/ai/anthropic-ai-provider.ts:156-192`
- Two-step reasoning (now streams both steps) — see `src/infrastructure/ai/anthropic-ai-provider.ts:195-235`
- Chat API route streaming (no more keepalive) — see `src/app/api/chat/route.ts:80-120`
- Frontend streaming phases (idle/thinking/responding) — see `src/hooks/use-chat-assistant.ts:26`
- Extracted stream parsing — see `src/lib/chat-stream-utils.ts`
- Extracted auto-save — see `src/lib/chat-persistence.ts`

### Reusable Code Found
- `sendSseEvent()` at `scripts/claude-proxy.ts:303` — reuse for emitting SSE events
- `buildPrompt()` at `scripts/claude-proxy.ts:138` — reuse for prompt construction
- `extractSystemPrompt()` at `scripts/claude-proxy.ts:160` — reuse as-is
- `resolveCliModel()` at `scripts/claude-proxy.ts:176` — reuse as-is
- `recordRequest()` at `scripts/claude-proxy.ts:49` — reuse for logging

### Affected Files
- `scripts/claude-proxy.ts` (modify) — Replace `invokeClaudeCli` with real streaming via `stream-json`, add security middleware, add CLI flags
- `src/infrastructure/ai/anthropic-ai-provider.ts` (modify) — SSE parser may need adjustments if proxy event format changes (verify compatibility)
- No other files should need changes — the API route, frontend hook, and stream utils already handle chunked streams correctly

### Recent Changes (chat-streaming-reasoning-ux)
These commits landed between initial analysis and now:
- **Provider**: Reasoning step 1 now streams progressively (yields per-chunk `thinking` instead of one blob after full generation)
- **Chat route**: Keepalive interval removed (reasoning streams continuously, no idle gap)
- **Hook**: New `StreamingPhase` type ("idle" | "thinking" | "responding") with phase transitions
- **Extracted modules**: `chat-stream-utils.ts` (parseReasoningStream, processHighlights, buildMessagesForApi) and `chat-persistence.ts` (autoSaveConversation, loadConversation)
- **300-line lint rule**: Files split into smaller modules (max-lines-lint-split)

### CLI Stream-JSON Format (from testing)
When using `--output-format stream-json --verbose --include-partial-messages`, the CLI outputs NDJSON:
```jsonl
{"type":"system","subtype":"init",...}                          // init metadata
{"type":"stream_event","event":{"type":"message_start",...}}    // message start
{"type":"stream_event","event":{"type":"content_block_start",...}} // block start
{"type":"stream_event","event":{"type":"content_block_delta","delta":{"type":"text_delta","text":"chunk"}}} // REAL chunks
{"type":"stream_event","event":{"type":"content_block_stop",...}}  // block stop
{"type":"stream_event","event":{"type":"message_delta",...}}    // final usage
{"type":"stream_event","event":{"type":"message_stop"}}         // done
{"type":"result","subtype":"success",...}                       // final stats
```

The `stream_event.event` objects are **exactly the Anthropic SSE format**. We can extract them and forward directly.

### Risks
- CLI `stream-json` format could change in future CLI updates (Low) — format is documented and stable
- `--tools ""` might cause issues if Claude Code requires tools in system prompt (Low) — tested, works fine
- Concurrent request limit might frustrate users with multiple tabs (Low) — 3 is generous for single-user dev proxy
- Client disconnect detection requires active monitoring of the response stream (Med) — use `res.on('close')` to kill CLI process
