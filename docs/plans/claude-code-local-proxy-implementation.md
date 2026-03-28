# Implementation: Claude Code Local Proxy

**Context**: [claude-code-local-proxy-context.md](./claude-code-local-proxy-context.md)
**Plan**: [claude-code-local-proxy-plan.md](./claude-code-local-proxy-plan.md)
**Status**: Complete

## Deviations
- Used `npx tsx` instead of bare `tsx` in the npm script — tsx is not in devDependencies, so `npx tsx` ensures it works without global install
- Omitted `--bare` flag (was in the original plan draft but correctly removed in Phase 2): `--bare` requires `ANTHROPIC_API_KEY` and breaks OAuth-based Claude Code auth
- Added `anthropic-version` to CORS allowed headers for broader SDK compatibility

## Verification Results
- Build: Pass — `npx tsx` compiles and starts without errors
- Tests: N/A — no unit tests for standalone script (consistent with other scripts)
- Manual: Pass

## Acceptance Criteria
- [x] `npm run proxy` starts server on `http://localhost:3099` — verified
- [x] `POST /v1/messages` accepts Anthropic payload — verified: `"proxy works"` returned
- [x] Response is in Anthropic `Message` format — verified: all fields present (`id`, `type`, `role`, `content`, `model`, `stop_reason`, `usage`)
- [x] Always uses `--model opus` (most capable) — verified: `model: "claude-opus-4-6"` in response
- [x] System prompt forwarded — implemented via `--system-prompt` flag
- [x] Multi-turn conversations handled — linearized with role labels
- [x] `GET /v1/models` returns model list — verified: `{"object":"list","data":[...]}`
- [x] `GET /health` returns `{"status":"ok"}` — verified
- [x] Invalid messages (empty array) → HTTP 400 — verified
- [x] Unknown routes → HTTP 404 — verified
- [x] `claude` CLI not found → process exits with clear error — implemented via `process.exit(1)` in `checkClaudeCli()`
- [x] Binds to `127.0.0.1` only — implemented
- [x] Port configurable via `PROXY_PORT` env var — implemented
- [x] CORS headers set for local dev — implemented
