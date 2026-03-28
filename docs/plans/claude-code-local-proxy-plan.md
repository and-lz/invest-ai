# Plan: Claude Code Local Proxy

**Context**: [claude-code-local-proxy-context.md](./claude-code-local-proxy-context.md)

## Steps

### Step 1: Create `scripts/claude-proxy.ts`
**Files**: `scripts/claude-proxy.ts` (create)
**Pattern**: Following `scripts/migrate-blob-to-db.ts` (TypeScript script, colorized logging, run via `tsx`)

**Changes**:

1. **Startup validation**
   - Run `claude --version` via `child_process.execSync`
   - If fails, print clear error ("claude CLI not found on PATH") and `process.exit(1)`

2. **HTTP server** (using `node:http`, zero dependencies)
   - Bind to `127.0.0.1` (localhost only, not `0.0.0.0`)
   - Port from `PROXY_PORT` env var, default `3099`
   - CORS headers for local dev (`Access-Control-Allow-Origin: *`)

3. **Routes**:
   - `POST /v1/messages` — main proxy endpoint
   - `GET /v1/models` — returns static model list (SDK compatibility)
   - `GET /health` — simple liveness check
   - `OPTIONS *` — CORS preflight
   - Everything else → 404

4. **POST /v1/messages handler**:
   - Parse JSON body from request stream
   - Validate: `messages` array exists and is non-empty → 400 if not
   - Extract `system` prompt (string or content blocks)
   - Extract last user message as the prompt for `claude -p`
   - Build CLI args:
     ```
     claude -p --output-format json --model opus
       [--system-prompt "<system>"]
       "<prompt>"
     ```
     Note: always `--model opus` (most capable); caller's `model` field is ignored
   - Spawn via `child_process.spawn`, collect stdout/stderr
   - On success: parse JSON output, transform to Anthropic `Message` response shape
   - On failure (non-zero exit): return 502 with error details

5. **Prompt construction** (multi-turn conversations):
   - If messages has >1 entry (multi-turn), prefix earlier turns with role labels:
     ```
     [Previous conversation]
     Human: ...
     Assistant: ...

     [Current message]
     <last user message>
     ```
   - Single message: pass directly as prompt

6. **Response mapping** (CLI JSON → Anthropic format):
   ```typescript
   {
     id: `msg_${crypto.randomUUID()}`,
     type: "message",
     role: "assistant",
     content: [{ type: "text", text: cliOutput.result }],
     model: cliOutput.model || "claude-code-proxy",
     stop_reason: "end_turn",
     stop_sequence: null,
     usage: {
       input_tokens: cliOutput.usage?.input_tokens ?? 0,
       output_tokens: cliOutput.usage?.output_tokens ?? 0,
     }
   }
   ```

7. **Graceful shutdown**: `SIGINT`/`SIGTERM` → close server, kill any running subprocess

8. **Logging**: Colorized ANSI output (same style as `migrate-blob-to-db.ts`)
   - Startup: version, port, PID
   - Each request: method, path, response time
   - Errors: red

**Verify**: `npm run proxy` starts, `curl -X POST http://localhost:3099/v1/messages -d '{"messages":[{"role":"user","content":"Say hello"}]}'` returns valid JSON

### Step 2: Add npm script to package.json
**Files**: `package.json` (modify)
**Changes**:
- Add `"proxy": "tsx scripts/claude-proxy.ts"` to scripts object

**Verify**: `npm run proxy` works

## New Files
- `scripts/claude-proxy.ts` — Local Anthropic-compatible proxy backed by `claude` CLI — pattern from `scripts/migrate-blob-to-db.ts`

## Verification Plan
- Build: `npx tsc --noEmit scripts/claude-proxy.ts` → no type errors (or run via tsx directly)
- Manual:
  1. `npm run proxy` → prints startup message with port
  2. `curl http://localhost:3099/health` → `{"status":"ok"}`
  3. `curl http://localhost:3099/v1/models` → model list JSON
  4. `curl -X POST http://localhost:3099/v1/messages -H "Content-Type: application/json" -d '{"messages":[{"role":"user","content":"Say hi in 5 words"}]}'` → Anthropic-format response
  5. Kill `claude` CLI not on PATH → proxy exits with clear error
  6. `Ctrl+C` → clean shutdown

## Risks
- `claude --output-format json` shape may change across CLI versions (Low) — parser handles missing fields gracefully
- Large prompts: CLI may take 30-60s (Low) — no timeout on proxy side; calling code controls its own timeout
- Always uses `--model opus` — caller's model field is silently ignored (intentional)
