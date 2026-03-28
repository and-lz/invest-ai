# Resilient `npm run dev` — Auto-Restart on Crash

## Context
Current `dev` script uses `concurrently` to run Next.js + proxy. If either crashes, dev stops. User wants automatic restart on crash.

**Current script:**
```
concurrently --kill-others -n next,proxy -c blue,magenta "next dev --turbopack" "npx tsx scripts/claude-proxy.ts"
```

**Affected file:** `package.json` (scripts section only)

## Plan
1. Create a `scripts/dev-resilient.sh` script that wraps `npm run dev` in a loop with restart on crash
2. Add `dev:resilient` script to `package.json`

The shell script approach is the simplest — no new dependencies, works everywhere, and `concurrently` already handles the coordination between next and proxy.

**Script behavior:**
- Runs `npm run dev` in a loop
- On crash (non-zero exit), waits 2s and restarts
- On manual kill (Ctrl+C / SIGINT), exits cleanly without restart
- Prints clear "Restarting..." message on crash

## Verification
- `npm run dev:resilient` starts Next.js + proxy
- Kill the process with an error → it auto-restarts
- Ctrl+C → it stops cleanly
