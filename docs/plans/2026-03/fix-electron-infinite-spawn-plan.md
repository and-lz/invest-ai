# Fix Electron Infinite Spawn (Fork Bomb)

## Context
When running the packaged Electron app, it spawns infinite instances of itself until the machine freezes.

**Root cause:** `electron/main.ts` lines 214 and 244 use `process.execPath` to spawn child processes (Next.js server + proxy). When packaged, `process.execPath` points to the Electron binary, not Node.js. Each spawned process runs `main.js` again → infinite recursion.

**Affected file:** `electron/main.ts`

## Plan
1. Add `ELECTRON_RUN_AS_NODE=1` to the env of all `spawn()` calls in production — this makes the Electron binary behave as a plain Node.js runtime
2. Add `app.requestSingleInstanceLock()` at app startup as a safety net — if a second instance launches, it quits immediately

## Verification
- `npm run desktop:build-main` compiles without errors
- Open packaged app → only one instance appears, server starts normally
