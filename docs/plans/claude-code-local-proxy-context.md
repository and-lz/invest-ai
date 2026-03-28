# Context: Claude Code Local Proxy

## Requirements

### Goal
Create a standalone local HTTP server (`scripts/claude-proxy.ts`) that accepts Anthropic-compatible `POST /v1/messages` requests and routes them to the `claude` CLI, allowing the user's own scripts to call Claude through their Claude Code subscription without needing a separate Anthropic API key.

### Acceptance Criteria
- [ ] `npm run proxy` starts the server on `http://localhost:3099`
- [ ] `POST /v1/messages` accepts a valid Anthropic messages payload
- [ ] Server extracts the message array, constructs a prompt, and invokes `claude --print`
- [ ] Response is returned in Anthropic `Message` format (`id`, `type`, `role`, `content`, `model`, `stop_reason`, `usage`)
- [ ] Multi-turn conversations are handled (messages array with alternating roles)
- [ ] System prompt is forwarded via `claude --system-prompt` (or equivalent)
- [ ] Server handles `claude` CLI not being installed with a clear error on startup
- [ ] `GET /v1/models` returns a minimal model list for SDK compatibility
- [ ] Port is configurable via `PROXY_PORT` env var (default: 3099)
- [ ] `Ctrl+C` shuts the server down cleanly

### Out of Scope
- Streaming (`text/event-stream` SSE) — CLI does not support it cleanly
- Tool use / function calling
- Real token counts (usage will be estimated as `0`)
- Multi-user access or any form of authentication
- HTTPS / TLS
- Integration with invest-ai's Next.js app or any existing API routes

### Edge Cases
- `claude` CLI not found on PATH → print clear message and exit with code 1
- `claude` subprocess exits with non-zero code → return HTTP 502 with error body
- Request body is not valid JSON → return HTTP 400
- `max_tokens` field is ignored (the CLI controls this)
- Model field in request is ignored (subscription determines the actual model)
- Empty messages array → return HTTP 400
- Very large prompts may hit Claude's context limit → CLI error propagated as 502

## Q&A Record
- Q: Standalone or part of invest-ai? → A: Inside invest-ai (in `scripts/`)
- Q: What to call from the proxy? → A: User's own scripts
- Q: API format? → A: Anthropic-compatible (`/v1/messages`)
- Q: Is this legal? → A: Personal use only, gray-area ToS; user acknowledged the risk

## Codebase Analysis

### Existing Patterns to Follow

| Pattern | Location | How to apply |
|---------|----------|--------------|
| TypeScript script with `tsx` runner | `scripts/migrate-blob-to-db.ts` | Use `.ts` extension, run via `tsx scripts/claude-proxy.ts` |
| ESM `.mjs` script | `scripts/generate-pwa-icons.mjs` | Secondary option — prefer `.ts` for type safety |
| `npm run <script>` | `package.json` scripts section | Add `"proxy": "tsx scripts/claude-proxy.ts"` |
| Colorized console logging | `scripts/migrate-blob-to-db.ts` (ANSI codes) | Use same inline ANSI pattern for startup/request logs |

### Reusable Code Found
- None applicable. This is a self-contained script using only Node.js built-ins (`node:http`, `node:child_process`).

### Affected Files

| File | Action | Purpose |
|------|--------|---------|
| `scripts/claude-proxy.ts` | **Create** | The proxy server script |
| `package.json` | **Modify** | Add `"proxy": "tsx scripts/claude-proxy.ts"` script |

Only 2 files total — this is a narrow, self-contained change.

### Implementation Notes

**Prompt construction strategy** (messages array → CLI input):
- System prompt: passed via `claude --system` flag if present
- Messages: linearize alternating turns with role prefixes, joined by newlines:
  ```
  Human: <user message>

  Assistant: <assistant message>

  Human: <last user message>
  ```
  Then pipe the full prompt to `claude --print` via stdin.

**CLI invocation:**
```bash
echo "<prompt>" | claude --print --no-markdown
```
Or using `-p` flag: `claude -p "<prompt>" --no-markdown`

**Response construction:**
```json
{
  "id": "msg_<uuid>",
  "type": "message",
  "role": "assistant",
  "content": [{ "type": "text", "text": "<claude output>" }],
  "model": "claude-code-proxy",
  "stop_reason": "end_turn",
  "stop_sequence": null,
  "usage": { "input_tokens": 0, "output_tokens": 0 }
}
```

**Startup check**: Run `claude --version` on boot; if it fails, exit immediately with a helpful message.

### Risks

| Risk | Severity | Mitigation |
|------|----------|------------|
| `claude` CLI flag interface may differ across versions | Medium | Run `claude --help` at startup to validate `--print` is available |
| Long prompts slow to respond (30–60s possible) | Low | No timeout on the proxy — user's calling code can set its own timeout |
| ToS violation if shared with others | Low | User acknowledged; proxy binds to `127.0.0.1` only, not `0.0.0.0` |
| `noUncheckedIndexedAccess: true` in tsconfig | Low | Script runs via `tsx` outside Next.js compiler; tsconfig paths still apply, just need careful array access |
