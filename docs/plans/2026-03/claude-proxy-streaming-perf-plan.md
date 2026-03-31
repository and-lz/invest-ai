# Plan: Claude Proxy — Real Streaming, Performance & Security

**Context**: [claude-proxy-streaming-perf-context.md](./claude-proxy-streaming-perf-context.md)

## Steps

### Step 1: Real streaming in proxy — replace `invokeClaudeCli` with `invokeClaudeCliStream`
**Files**: `scripts/claude-proxy.ts` (modify)
**Pattern**: Existing `spawn()` pattern at line 203, existing `sendSseEvent()` at line 303
**Changes**:
- Add new `invokeClaudeCliStream()` that spawns `claude -p --output-format stream-json --verbose --include-partial-messages --no-session-persistence --tools ""` with `--model` and `--system-prompt`
- Parse NDJSON stdout line-by-line: for each `{"type":"stream_event","event":{...}}` line, extract `event` and forward it as an SSE event using `sendSseEvent(res, event.type, event)`
- Extract usage/model from `{"type":"result",...}` line for logging
- Rewrite `handleMessagesStream()` to use the new streaming function — start SSE response immediately, pipe CLI chunks as they arrive
- Keep `invokeClaudeCli()` for non-streaming requests (`stream: false`) — change its flags to also use `--no-session-persistence --tools ""`
- Remove `splitIntoChunks()` (no longer needed — real streaming replaces fake chunking)
- Handle CLI process cleanup on client disconnect via `res.on('close', () => child.kill())`
**Verify**: `npm run proxy` starts, send a streaming request via curl — see real SSE events arriving incrementally (not all at once)

### Step 2: Security hardening in proxy
**Files**: `scripts/claude-proxy.ts` (modify)
**Changes**:
- Add `MAX_BODY_SIZE = 100 * 1024` constant. In `readBody()`, accumulate length and reject with 413 if exceeded
- Add `activeRequests` counter. In `handleMessages()`, check if >= 3 and return 429 with `Retry-After: 5` header. Increment on entry, decrement in finally block
- Restrict CORS: replace `"*"` with a function that checks `Origin` header against `localhost`/`127.0.0.1` patterns. Apply to all CORS headers (preflight + response)
**Verify**: Test with curl: oversized body → 413, 4th concurrent request → 429, non-localhost origin → no CORS headers

### Step 3: Verify provider compatibility
**Files**: `src/infrastructure/ai/anthropic-ai-provider.ts` (modify — if needed)
**Changes**:
- The provider's `transmitir()` SSE parser (lines 156-192) already parses `event: {type}\ndata: {json}\n\n` format and extracts `content_block_delta` events. Since the proxy now forwards **real** Anthropic SSE events (same format), the parser should work without changes
- Verify by reading through the parser logic against the new proxy output format
- If any mismatch found, adjust the parser. Expected: **no changes needed**
- `transmitirComPensamento()` (lines 195-235) uses `transmitir()` internally for both steps — already streams progressively, no changes needed
- `gerar()` (lines 38-106) uses non-streaming path — no changes needed
**Verify**: `tsc --noEmit` passes, `npm run lint` passes

### Step 4: End-to-end verification
**Files**: None (testing only)
**Changes**:
- Start proxy with `npm run proxy`
- Start app with `npm run dev`
- Send a chat message without reasoning → verify tokens stream incrementally to the UI
- Send a chat message with reasoning → verify thinking phase streams, then response phase streams
- Test model selection (haiku/sonnet/opus) → verify correct model used
- Test error handling: stop proxy mid-stream → verify error appears in chat
**Verify**: All scenarios above pass

## New Files
None — this is a refactor of existing code.

## Verification Plan
- Build: `tsc --noEmit && npm run lint` → succeeds
- Tests: `npm run test` → all pass (proxy is not unit-tested, but provider/route tests should still pass)
- Manual: Start proxy + dev server, send chat messages with and without reasoning, verify real-time streaming behavior

## Risks
- CLI `stream-json` output format changes in future updates (Low) — format mirrors Anthropic API, unlikely to break
- `--tools ""` changes CLI behavior unexpectedly (Low) — tested and confirmed working
- Provider SSE parser mismatch with new event format (Low) — same Anthropic SSE format, parser already handles it
