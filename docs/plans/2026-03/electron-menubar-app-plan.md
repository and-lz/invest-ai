# Plan: Electron Menubar App

**Context**: [electron-menubar-app-context.md](./electron-menubar-app-context.md)

## Steps

### Step 1: Install Electron dependencies
**Files**: `package.json` (modify)
**Changes**:
- Add `electron` and `electron-builder` as devDependencies
- Add `tsx` usage for running TS main process in dev (already installed)
**Verify**: `npm install` succeeds

### Step 2: Create tray icon assets
**Files**: `electron/icons/trayTemplate.png` (create), `electron/icons/trayTemplate@2x.png` (create)
**Changes**:
- Generate 16x16 and 32x32 (2x) monochrome "Template" PNG icons for macOS menubar
- macOS requires `Template` suffix for proper dark/light mode handling
- Use a simple server/circle icon derived from existing `public/icon.svg`
**Verify**: Icons exist at correct paths and sizes

### Step 3: Create Electron main process
**Files**: `electron/main.ts` (create)
**Changes**:
- Import `app`, `Tray`, `Menu`, `nativeImage`, `shell`, `Notification` from electron
- `app.dock.hide()` — no dock icon, menubar only
- Create `Tray` with template icon on `app.whenReady()`
- Build context menu with:
  - "Start Server" — spawns `npm run dev` via `child_process.spawn` with shell, pipes stdio
  - "Stop Server" — kills process tree (`process.kill(-pid)` for group kill)
  - "Open in Browser" — `shell.openExternal('http://localhost:3000')`
  - Separator
  - "Quit" — kills server if running, then `app.quit()`
- Track server state: `idle` | `starting` | `running` | `stopped`
- Update tray icon title/tooltip based on state
- Listen for child process `exit` event to detect crashes → show `Notification`
- Handle `before-quit` to cleanup child process
- Check port 3000 before starting (via quick `net.connect` check)
**Verify**: File compiles with `npx tsc --noEmit -p electron/tsconfig.json`

### Step 4: Create Electron tsconfig
**Files**: `electron/tsconfig.json` (create)
**Changes**:
- Target: ES2020, module: commonjs (Electron main process)
- Include only `electron/**/*.ts`
- Separate from the Next.js tsconfig
**Verify**: `npx tsc --noEmit -p electron/tsconfig.json` passes

### Step 5: Add npm scripts and electron-builder config
**Files**: `package.json` (modify)
**Changes**:
- `"desktop"`: `"npx tsx electron/main.ts"` — runs Electron main process in dev (tsx handles TS)
  - Actually need: `"electron ."` with a way to run TS. Use `"npx electron --require tsx/cjs electron/main.ts"` or compile first
  - Simplest: `"tsc -p electron/tsconfig.json && electron electron/dist/main.js"` — compile then run
  - Even simpler: Use `tsx` to pre-compile to a temp file, or use `ts-node`
  - **Best approach**: `"npx tsx electron/main.ts"` won't work because Electron has its own runtime. Instead: add a small build step `"desktop:build-main": "npx tsc -p electron/tsconfig.json"` and `"desktop": "npm run desktop:build-main && npx electron electron/dist/main.js"`
- `"desktop:package"`: `"npm run desktop:build-main && electron-builder --mac"` — builds .app
- Add `"build"` config for electron-builder in package.json:
  ```json
  "build": {
    "appId": "com.investimentos.dev",
    "productName": "Investimentos Dev",
    "mac": {
      "target": "dir",
      "icon": "public/icon-512.png"
    },
    "files": ["electron/dist/**/*", "electron/icons/**/*"],
    "directories": { "output": "electron-dist" }
  }
  ```
**Verify**: `npm run desktop` launches the tray app

### Step 6: Update .gitignore
**Files**: `.gitignore` (modify)
**Changes**:
- Add `/electron/dist/` (compiled JS output)
- Add `/electron-dist/` (electron-builder output)
**Verify**: `git status` shows no compiled files

## New Files
- `electron/main.ts` — Electron main process (tray + child process management)
- `electron/tsconfig.json` — TypeScript config for Electron
- `electron/icons/trayTemplate.png` — 16x16 menubar icon
- `electron/icons/trayTemplate@2x.png` — 32x32 menubar icon (Retina)

## Verification Plan
- Build: `npm run desktop:build-main` → compiles without errors
- Manual: `npm run desktop` → tray icon appears in macOS menubar
- Manual: Click "Start Server" → `npm run dev` starts, icon updates
- Manual: Click "Open in Browser" → browser opens localhost:3000
- Manual: Click "Stop Server" → dev server stops, icon updates
- Manual: Click "Quit" → app exits cleanly, no orphaned processes
- Package: `npm run desktop:package` → `.app` bundle created in `electron-dist/`
- Existing: `npm run build` → still works (Electron doesn't affect web build)
- Existing: `npm run test` → still passes

## Risks
- Child process tree kill on macOS (Med) — Use `process.kill(-pid)` with process group. Fallback: `kill -9` the specific PID
- Electron + tsx dev workflow (Low) — Pre-compile with tsc is reliable, no runtime TS needed in Electron
- electron-builder config conflicts with existing `build` script (Low) — electron-builder uses `"build"` key in package.json which is separate from `"scripts.build"`
