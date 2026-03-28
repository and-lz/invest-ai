# Context: Electron Production Build

## Requirements

### Goal
Make the packaged Electron `.app` work as a standalone production app. Currently the Electron main process only spawns `next dev` — useless in a packaged build where there's no source code or node_modules. The production build must bundle `next build` output + `next start` server + Claude API proxy so the app works out of the box.

### Acceptance Criteria
- [ ] `npm run desktop:package` produces a `.app` that opens and shows the full app
- [ ] The packaged app runs `next start` (production server) internally, not `next dev`
- [ ] The Claude API proxy (`scripts/claude-proxy.ts`) runs alongside the Next.js server
- [ ] All existing features work: auth, API routes, SSR, chat, file upload
- [ ] Dev mode (`npm run desktop`) still works as before (spawns `next dev` + proxy)
- [ ] App shows a loading screen while the internal server starts
- [ ] Clean shutdown: all child processes killed on app quit

### Out of Scope
- Offline support (online-only, requires internet for Google OAuth, Neon DB, Vercel Blob)
- Auto-update mechanism
- Windows/Linux support
- Code signing / notarization for distribution
- Bundling Node.js inside the app (Electron already includes Node)

### Edge Cases
- Port 3000 already in use → Use dynamic port detection for the internal server
- `next build` output missing → Show error message in window
- Claude CLI not installed → Proxy fails gracefully, chat features show error but app still works
- Server takes >60s to start → Show timeout error
- User quits while server is starting → Kill processes cleanly

## Q&A Record
- Q: Architecture? → A: Embedded Next.js server (bundle `next build` + `next start` inside the .app)
- Q: Connectivity? → A: Online-only, same as web deployment
- Q: Claude proxy? → A: Must be bundled and running alongside the Next.js server

## Codebase Analysis

### Existing Patterns to Follow
- `electron/main.ts` — Current dev-only main process. Has `startDevServer()`, `waitForPort()`, `createWindow()`, loading screen pattern, OAuth popup handling, clean shutdown via `killServerProcess()`. Production mode should follow the same structure.
- `package.json` scripts — `desktop:build-main` compiles TS, `desktop` runs dev, `desktop:package` uses electron-builder
- `next.config.ts` — Uses `outputFileTracingIncludes` for WASM files, custom headers, env vars from git/package.json
- `scripts/claude-proxy.ts` — Standalone HTTP server on port 3099, spawns `claude` CLI. Referenced by `CLAUDE_PROXY_URL` env var (defaults to `http://localhost:3099`)

### Reusable Code Found
- `electron/main.ts:27-57` — `waitForPort()` utility already handles port readiness checking with timeout
- `electron/main.ts:13-25` — `killServerProcess()` handles SIGTERM with detached process groups
- `electron/main.ts:82-147` — `createWindow()` with loading screen, OAuth popup handler, icon setup
- `src/lib/container.ts:73` — Proxy URL from `process.env.CLAUDE_PROXY_URL ?? "http://localhost:3099"`
- `src/app/api/admin/proxy-stats/route.ts:14` — Same proxy URL pattern

### Affected Files
- `electron/main.ts` (modify) — Add production mode: detect packaged state, run `next start` + proxy, use dynamic ports
- `package.json` (modify) — Update `desktop:package` script to run `next build` first, update electron-builder `files` to include `.next/` output + `scripts/claude-proxy.ts` + required deps
- `electron/tsconfig.json` (possibly modify) — May need to include proxy script compilation

### Key Technical Details
- **Detecting packaged vs dev**: `app.isPackaged` (Electron API) returns `true` in packaged builds
- **Next.js standalone output**: Setting `output: "standalone"` in `next.config.ts` produces a minimal Node.js server in `.next/standalone/` that can run without `node_modules`. This is the standard approach for containerized/embedded Next.js deployments.
- **Proxy URL**: Hardcoded fallback to `localhost:3099` — must ensure proxy starts on that port in production too
- **Electron includes Node.js**: The packaged app has a full Node.js runtime, so it can run `next start` and the proxy script directly via `child_process`

### Risks
- **Bundle size increase** (Med) — `.next/standalone/` adds the app + minimal node_modules (~100-200MB on top of Electron's ~400MB). Acceptable for desktop.
- **`output: "standalone"` side effects** (Low) — This Next.js config changes the build output. Need to verify Vercel deployment still works (Vercel ignores this setting).
- **WASM files** (Low) — `@neslinesli93/qpdf-wasm` needs `.wasm` files traced. `outputFileTracingIncludes` already handles this but need to verify paths in standalone mode.
- **env vars** (Med) — `.env.local` won't be bundled. Need to ensure required env vars (DB URL, OAuth secrets, etc.) are available at runtime. May need to bundle `.env.local` or set vars programmatically.
