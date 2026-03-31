# Implementation: Claude Proxy — Real Streaming, Performance & Security

**Context**: [claude-proxy-streaming-perf-context.md](./claude-proxy-streaming-perf-context.md)
**Plan**: [claude-proxy-streaming-perf-plan.md](./claude-proxy-streaming-perf-plan.md)
**Status**: Complete

## Deviations
- Steps 1 and 2 were combined into a single commit since both modify only `scripts/claude-proxy.ts` and are tightly coupled

## Verification Results
- Build: Pass (`tsc --noEmit` clean)
- Lint: Pass (`eslint scripts/claude-proxy.ts` clean)
- Tests: Pass (714/714 tests pass)
- Manual: Pending user validation with `npm run proxy` + `npm run dev`

## Acceptance Criteria
- [x] Proxy streams real token-by-token chunks from CLI stdout directly to SSE events — verified by `--output-format stream-json --include-partial-messages` piped via `readline`
- [x] CLI spawned with `--no-session-persistence --tools ""` — verified in `SHARED_CLI_FLAGS` constant
- [x] Non-streaming requests still work — `invokeClaudeCli()` preserved with `--output-format json`
- [x] Request body size limited to 100KB — `BodyTooLargeError` in `readBody()` returns 413
- [x] Concurrent request limit of 3 — `activeRequests` counter returns 429 with `Retry-After`
- [x] CORS restricted to localhost — `isLocalhostOrigin()` check, 403 for non-localhost
- [x] Provider SSE parser compatible — same `event: {type}\ndata: {json}\n\n` format, no changes needed
- [x] Client disconnect kills CLI process — `res.on('close', () => child.kill('SIGTERM'))`
