# Context: Electron Menubar App

## Requirements

### Goal
Create a macOS Electron app that lives in the menubar/tray. When clicked, it spawns `npm run dev` (Next.js + proxy), and the user can open the app in their browser. No visible window — just a tray icon for starting/stopping the dev server.

### Acceptance Criteria
- [ ] Electron app with a macOS tray icon (menubar)
- [ ] Clicking tray icon shows dropdown: "Start Server", "Stop Server", "Open in Browser", "Quit"
- [ ] "Start Server" runs `npm run dev` as a child process
- [ ] "Stop Server" kills the child process tree
- [ ] "Open in Browser" opens `http://localhost:3000` in the default browser
- [ ] Tray icon changes state to indicate server running vs stopped
- [ ] App can be built as a `.app` bundle via `electron-builder`
- [ ] `npm run desktop` script to launch in development
- [ ] `npm run desktop:build` script to build the `.app`

### Key Design Decision: Decoupled Electron Shell
The Electron app is a thin shell — it only manages the tray icon and spawns `npm run dev`. All Next.js/TS/JS changes are handled by Next.js hot-reload as usual. The Electron app does NOT bundle or compile the web app. You only rebuild the Electron `.app` if you change the Electron main process code itself (i.e., files in `electron/`).

### Out of Scope
- Auto-launch on macOS login (user chose manual launch)
- Embedding the app in a native window (user chose menubar-only)
- Windows/Linux support
- Hot-reload of Electron main process
- Automatic port detection (hardcoded to 3000)
- Bundling the Next.js app inside Electron — web app runs as a separate dev server

### Edge Cases
- Server already running on port 3000 → Show warning in tray menu
- `npm run dev` crashes → Update tray icon to "stopped", show notification
- User quits app while server is running → Kill child process before exit
- Double-click "Start Server" while already starting → Ignore if already running

## Q&A Record
- Q: Approach? → A: Electron app
- Q: Auto-launch on login? → A: No, manual launch only
- Q: UI style? → A: Menubar/tray icon only, no visible window
- Q: Rebuild on every JS/TS change? → A: No. Electron is a thin shell that spawns `npm run dev`. Next.js HMR handles code changes. Only rebuild Electron `.app` when `electron/` files change.

## Codebase Analysis

### Existing Patterns to Follow
- `package.json` scripts use `concurrently` for multi-process dev — Electron dev script should follow same pattern
- `scripts/` directory holds utility scripts — Electron main process file goes here or in a new `electron/` directory
- Project uses TypeScript throughout — Electron main process should also be TypeScript

### Reusable Code Found
- `npm run dev` script already orchestrates Next.js + proxy via `concurrently` — the Electron app can simply spawn this existing script
- `package.json` has `concurrently` as a devDependency — can reuse for Electron dev workflow

### Affected Files
- `electron/main.ts` (create) — Electron main process with tray management
- `electron/tsconfig.json` (create) — TypeScript config for Electron main process
- `package.json` (modify) — Add Electron deps, scripts, and build config
- `.gitignore` (modify) — Add Electron build output directory
- `public/icon.png` (reuse) — App icon for tray (may need to generate a Template icon for macOS menubar)

### Risks
- Large dependency (Electron ~150MB) added to project (Low) — Only a devDependency, doesn't affect web deployment
- Child process cleanup on crash (Med) — Must handle SIGTERM/SIGINT properly to avoid orphaned Node processes
- macOS tray icon sizing (Low) — Need 16x16 or 22x22 "Template" image for proper menubar rendering
